'use client'

import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { useStore } from '@/store/useStore'
import { Muxer, ArrayBufferTarget } from 'webm-muxer'
import * as THREE from 'three'
import gsap from 'gsap'
import { ffmpegService } from '@/lib/ffmpeg'
import { useToast } from '@/contexts/ToastContext'
import { errorHandler } from '@/lib/errorHandler'
import { ErrorType } from '@/types/errors'
import { calculateExportCost } from '@/constants/export-costs'

interface Props {
    controlsRef: React.MutableRefObject<any>
}

export default function Renderer({ controlsRef }: Props) {
    const gl = useThree(state => state.gl)
    const scene = useThree(state => state.scene)
    const camera = useThree(state => state.camera)
    const clock = useThree(state => state.clock)

    const isRendering = useStore(s => s.isRendering)
    const setIsRendering = useStore(s => s.setIsRendering)
    const exportSettings = useStore(s => s.exportSettings)
    const keyframes = useStore(s => s.keyframes)
    const deductCredits = useStore(s => s.deductCredits)

    // Conversion state from store
    const setIsConverting = useStore(s => s.setIsConverting)
    const setConversionStage = useStore(s => s.setConversionStage)
    const setConversionProgress = useStore(s => s.setConversionProgress)
    const { showToast } = useToast()

    useEffect(() => {
        if (!isRendering) return
        if (keyframes.length === 0) {
            errorHandler.warning('No keyframes to render!', 'Please add at least one keyframe first.')
            setIsRendering(false)
            return
        }

        const renderVideo = async () => {
            console.log('Starting Independent Render...')

            // 1. Config Resolution with Aspect Ratio
            let ratio: number
            switch (exportSettings.aspectRatio) {
                case '1:1':
                    ratio = 1
                    break
                case '9:16':
                    ratio = 9 / 16
                    break
                case '16:9':
                default:
                    ratio = 16 / 9
                    break
            }

            let targetHeight = 1080
            if (exportSettings.quality === '720p') targetHeight = 720
            if (exportSettings.quality === '4k') targetHeight = 2160

            let width, height
            if (ratio >= 1) {
                // Landscape or Square
                height = targetHeight
                width = Math.round(height * ratio)
            } else {
                // Portrait
                width = targetHeight
                height = Math.round(width / ratio)
            }

            if (width % 2 !== 0) width++
            if (height % 2 !== 0) height++

            const fps = 30

            // --- 關鍵修改：在此處獨立建立 Timeline ---
            const tl = gsap.timeline({ paused: true })
            const validKeyframes = keyframes.filter(k => k.cameraState)

            if (validKeyframes.length > 0) {
                // Step A: Init Position
                const first = validKeyframes[0]

                // 暫存原始狀態
                const originalPos = camera.position.clone()
                const originalTarget = controlsRef.current ? controlsRef.current.target.clone() : new THREE.Vector3()

                // 設定初始點
                tl.set(camera.position, {
                    x: first.cameraState!.position[0],
                    y: first.cameraState!.position[1],
                    z: first.cameraState!.position[2]
                })
                if (controlsRef.current) {
                    tl.set(controlsRef.current.target, {
                        x: first.cameraState!.target[0],
                        y: first.cameraState!.target[1],
                        z: first.cameraState!.target[2]
                    })
                }

                // Step B: Build Sequence
                tl.to({}, { duration: first.duration }) // Wait 1

                // Set Initial Text
                tl.call(() => {
                    if (first.textConfig) {
                        useStore.getState().setTextConfig(first.textConfig)
                    } else {
                        useStore.getState().setTextConfig({ visible: false })
                    }
                }, undefined, 0) // Execute at time 0

                // [NEW] Set Initial Image
                tl.call(() => {
                    if (first.imageConfig?.visible) {
                        useStore.getState().setImageConfig(first.imageConfig)
                    } else {
                        useStore.getState().setImageConfig(null)
                    }
                }, undefined, 0) // Execute at time 0

                for (let i = 1; i < validKeyframes.length; i++) {
                    const k = validKeyframes[i]

                    // Move
                    tl.to(camera.position, {
                        x: k.cameraState!.position[0],
                        y: k.cameraState!.position[1],
                        z: k.cameraState!.position[2],
                        duration: 1.5,
                        ease: "power2.inOut"
                    }, `shot-${i}`)

                    if (controlsRef.current) {
                        tl.to(controlsRef.current.target, {
                            x: k.cameraState!.target[0],
                            y: k.cameraState!.target[1],
                            z: k.cameraState!.target[2],
                            duration: 1.5,
                            ease: "power2.inOut"
                        }, `shot-${i}`)
                    }

                    // Update Text when camera arrives at keyframe
                    tl.call(() => {
                        if (k.textConfig) {
                            useStore.getState().setTextConfig(k.textConfig)
                        } else {
                            useStore.getState().setTextConfig({ visible: false })
                        }
                    })

                    // [NEW] Update Image when camera arrives at keyframe
                    tl.call(() => {
                        if (k.imageConfig?.visible) {
                            useStore.getState().setImageConfig(k.imageConfig)
                        } else {
                            useStore.getState().setImageConfig(null)
                        }
                    })

                    // Wait
                    tl.to({}, { duration: k.duration })
                }
            }

            const duration = tl.duration() || 1
            const totalFrames = Math.ceil(duration * fps)

            console.log(`Rendering ${width}x${height} @ ${fps}fps for ${duration.toFixed(2)}s (${totalFrames} frames)`)

            // 2. Setup Renderer
            const originalSize = new THREE.Vector2()
            gl.getSize(originalSize)
            const originalPixelRatio = gl.getPixelRatio()
            const originalAutoClear = gl.autoClear

            gl.setPixelRatio(1)
            gl.setSize(width, height, false)

            // Enable autoClear to let Three.js handle clearing properly
            // This preserves the environment background
            gl.autoClear = true

            // 3. Init Video Encoder
            let encoder: VideoEncoder
            const videoChunks: EncodedVideoChunk[] = []

            // Note: Always render opaque WebM due to browser limitations
            // Alpha channel will be handled by FFmpeg post-processing
            const encoderConfig: VideoEncoderConfig = {
                codec: 'vp09.00.10.08',
                width,
                height,
                bitrate: exportSettings.quality === '4k' ? 20_000_000 : exportSettings.quality === '1080p' ? 8_000_000 : 4_000_000,
                framerate: fps
            }

            encoder = new VideoEncoder({
                output: (chunk) => videoChunks.push(chunk),
                error: (e) => console.error('Encoder error:', e)
            })

            encoder.configure(encoderConfig)

            // 4. Init Muxer
            const muxer = new Muxer({
                target: new ArrayBufferTarget(),
                video: {
                    codec: 'V_VP9',
                    width,
                    height,
                    frameRate: fps
                }
            })

            // 5. Frame Loop
            const originalTime = clock.elapsedTime
            const originalAutoStart = clock.autoStart
            clock.autoStart = false
            clock.stop()

            // Disable controls during render to prevent interference
            if (controlsRef.current) controlsRef.current.enabled = false

            for (let i = 0; i < totalFrames; i++) {
                const currentTime = i / fps

                // Sync Animation
                tl.seek(currentTime)
                clock.elapsedTime = currentTime // Sync materials/float

                // Force controls update to apply the GSAP target changes
                if (controlsRef.current) controlsRef.current.update()

                // Update Camera Matrix
                if (camera instanceof THREE.PerspectiveCamera) {
                    camera.aspect = width / height
                    camera.updateProjectionMatrix()
                }

                // Render scene - autoClear will handle background properly
                gl.render(scene, camera)

                // Draw watermark on canvas for FREE tier users
                const subscription = useStore.getState().subscription
                if (subscription.userTier === 'FREE') {
                    // Create a temporary 2D canvas for watermark
                    const tempCanvas = document.createElement('canvas')
                    tempCanvas.width = width
                    tempCanvas.height = height
                    const tempCtx = tempCanvas.getContext('2d')

                    if (tempCtx) {
                        // First, draw the WebGL canvas content
                        tempCtx.drawImage(gl.domElement, 0, 0, width, height)

                        // Calculate responsive sizing based on aspect ratio
                        const scale = Math.min(width / 1920, 1)

                        // Different size multipliers for different aspect ratios
                        let sizeMultiplier = 2.5 // Default for 16:9
                        if (exportSettings.aspectRatio === '9:16') {
                            sizeMultiplier = 6.5
                        } else if (exportSettings.aspectRatio === '1:1') {
                            sizeMultiplier = 4.5
                        }

                        const padding = 12 * scale
                        const fontSize = 14 * scale * sizeMultiplier
                        const smallFontSize = 12 * scale * sizeMultiplier

                        // Measure text
                        tempCtx.font = `600 ${fontSize}px Inter, system-ui, sans-serif`
                        const text1 = 'ReadyRender'
                        const text1Width = tempCtx.measureText(text1).width

                        tempCtx.font = `400 ${smallFontSize}px Inter, system-ui, sans-serif`
                        const text2 = 'Free Trial'
                        const text2Width = tempCtx.measureText(text2).width

                        const maxTextWidth = Math.max(text1Width, text2Width)
                        const boxWidth = maxTextWidth + padding * 2
                        const boxHeight = fontSize + smallFontSize + padding * 1.5
                        const boxX = width - boxWidth - padding
                        const boxY = height - boxHeight - padding

                        // Draw background box
                        tempCtx.fillStyle = 'rgba(0, 0, 0, 0.6)'
                        tempCtx.beginPath()
                        tempCtx.roundRect(boxX, boxY, boxWidth, boxHeight, 8 * scale)
                        tempCtx.fill()

                        // Draw border
                        tempCtx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
                        tempCtx.lineWidth = 1
                        tempCtx.beginPath()
                        tempCtx.roundRect(boxX, boxY, boxWidth, boxHeight, 8 * scale)
                        tempCtx.stroke()

                        // Draw main text
                        tempCtx.font = `600 ${fontSize}px Inter, system-ui, sans-serif`
                        tempCtx.fillStyle = 'white'
                        tempCtx.textAlign = 'right'
                        tempCtx.textBaseline = 'bottom'
                        tempCtx.fillText(text1, width - padding * 2, height - padding - smallFontSize - padding * 0.5)

                        // Draw subtitle
                        tempCtx.font = `400 ${smallFontSize}px Inter, system-ui, sans-serif`
                        tempCtx.fillStyle = '#a1a1aa'
                        tempCtx.fillText(text2, width - padding * 2, height - padding * 1.5)

                        // Copy the composited image back to WebGL canvas
                        const webglCtx = gl.domElement.getContext('webgl2') || gl.domElement.getContext('webgl')
                        if (webglCtx) {
                            // Use WebGL to draw the 2D canvas with watermark
                            gl.autoClear = false
                            const texture = new THREE.CanvasTexture(tempCanvas)
                            const material = new THREE.MeshBasicMaterial({ map: texture, transparent: false })
                            const geometry = new THREE.PlaneGeometry(2, 2)
                            const mesh = new THREE.Mesh(geometry, material)

                            // Temporarily add to scene and render
                            const tempScene = new THREE.Scene()
                            const tempCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
                            tempScene.add(mesh)
                            gl.render(tempScene, tempCamera)
                            gl.autoClear = true

                            // Cleanup
                            texture.dispose()
                            material.dispose()
                            geometry.dispose()
                        }
                    }
                }

                // Note: Always create opaque frames
                // Transparency will be handled in FFmpeg conversion
                const videoFrame = new VideoFrame(gl.domElement, {
                    timestamp: i * (1000000 / fps) // microseconds
                })

                encoder.encode(videoFrame, { keyFrame: i % 30 === 0 })
                videoFrame.close()

                // Progress log every 30 frames
                if (i % 30 === 0) {
                    console.log(`Progress: ${Math.round((i / totalFrames) * 100)}%`)
                }

                await new Promise(r => requestAnimationFrame(r))
            }

            // 6. Finalize Encoding
            await encoder.flush()
            encoder.close()

            // 7. Mux Encoded Chunks
            for (const chunk of videoChunks) {
                muxer.addVideoChunk(chunk)
            }

            // 8. Finalize WebM
            muxer.finalize()
            const { buffer } = muxer.target as ArrayBufferTarget
            const webmBlob = new Blob([buffer], { type: 'video/webm' })

            console.log('WebM generation complete')

            // 9. Convert to MP4 using FFmpeg
            try {
                setIsConverting(true)
                setConversionStage('loading')
                setConversionProgress(0)

                // Load FFmpeg (first time only)
                await ffmpegService.load((progress) => {
                    setConversionProgress(progress)
                })

                setConversionStage('converting')
                setConversionProgress(0)

                // Convert based on format setting
                console.log(`Converting to ${exportSettings.format.toUpperCase()}...`)
                const convertedBlob = exportSettings.format === 'hevc'
                    ? await ffmpegService.convertToHEVC(webmBlob, (progress) => {
                        setConversionProgress(progress)
                    })
                    : await ffmpegService.convertToMP4(webmBlob, (progress) => {
                        setConversionProgress(progress)
                    })

                const extension = exportSettings.format === 'hevc' ? 'mov' : 'mp4'
                const filename = `render_${exportSettings.quality}.${extension}`

                // Download final video
                const url = URL.createObjectURL(convertedBlob)
                const a = document.createElement('a')
                a.href = url
                a.download = filename
                a.click()
                URL.revokeObjectURL(url)

                console.log('Conversion complete!')

                // Deduct credits after successful export
                const totalDuration = keyframes.reduce((sum, kf) => sum + kf.duration, 0)
                const creditsRequired = calculateExportCost(totalDuration, exportSettings.quality)
                const success = deductCredits(creditsRequired)

                if (success) {
                    showToast({
                        type: 'success',
                        message: `Video exported successfully! ${creditsRequired} credits deducted.`,
                        duration: 5000
                    })
                } else {
                    // This shouldn't happen as we check before export, but just in case
                    console.error('Failed to deduct credits after export')
                }

            } catch (error) {
                console.error('Conversion failed:', error)

                const errorMessage = error instanceof Error ? error.message : String(error)

                // Check if it's a network/loading error
                if (errorMessage.includes('fetch') || errorMessage.includes('load') || errorMessage.includes('network')) {
                    errorHandler.warning(
                        'FFmpeg loading failed, downloading WebM format instead.',
                        'This may be due to network connectivity issues. WebM format plays in most modern browsers, or you can use online tools to convert to MP4.'
                    )
                } else {
                    errorHandler.warning(
                        'Video conversion failed, downloading WebM format instead.',
                        'You can use online tools to convert WebM to MP4.'
                    )
                }

                // Fallback: Download WebM
                const url = URL.createObjectURL(webmBlob)
                const a = document.createElement('a')
                a.href = url
                a.download = `render_${exportSettings.quality}.webm`
                a.click()
                URL.revokeObjectURL(url)

                // Still deduct credits for WebM export
                const totalDuration = keyframes.reduce((sum, kf) => sum + kf.duration, 0)
                const creditsRequired = calculateExportCost(totalDuration, exportSettings.quality)
                const success = deductCredits(creditsRequired)

                if (success) {
                    showToast({
                        type: 'info',
                        message: `WebM exported successfully! ${creditsRequired} credits deducted.`,
                        duration: 5000
                    })
                }
            } finally {
                setIsConverting(false)
            }

            console.log('Render Complete!')

            // 10. Cleanup
            gl.setSize(originalSize.width, originalSize.height, false)
            gl.setPixelRatio(originalPixelRatio)
            gl.autoClear = originalAutoClear
            clock.autoStart = originalAutoStart
            clock.elapsedTime = originalTime
            clock.start()

            if (controlsRef.current) controlsRef.current.enabled = true

            // Kill the local timeline
            tl.kill()

            setIsRendering(false)
        }

        renderVideo().catch((error) => {
            console.error('Render failed:', error)
            errorHandler.exportFailed(() => {
                // Retry logic
                setIsRendering(true)
            })
            setIsRendering(false)
            setIsConverting(false)
        })

    }, [isRendering, keyframes, exportSettings, gl, scene, camera, clock, controlsRef, setIsRendering, setIsConverting, setConversionStage, setConversionProgress])

    return null
}

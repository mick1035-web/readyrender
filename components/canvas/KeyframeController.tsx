'use client'

import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { useStore, Keyframe, CameraState } from '@/store/useStore'
import gsap from 'gsap'
import * as THREE from 'three' // [FIXED] 確保引入 THREE

interface Props {
    controlsRef: React.MutableRefObject<any>
}

export default function KeyframeController({ controlsRef }: Props) {
    const { camera } = useThree()
    const keyframes = useStore(s => s.keyframes)
    const addKeyframe = useStore(s => s.addKeyframe)
    const captureSignal = useStore(s => s.captureSignal)
    const setCaptureSignal = useStore(s => s.setCaptureSignal)
    const isPlaying = useStore(s => s.isPlaying)
    const setIsPlaying = useStore(s => s.setIsPlaying)
    const selectedKeyframeId = useStore(s => s.selectedKeyframeId)
    const updateSignal = useStore(s => s.updateSignal)
    const setUpdateSignal = useStore(s => s.setUpdateSignal)
    const updateKeyframeCamera = useStore(s => s.updateKeyframeCamera)

    // Timeline reference to kill animation if stopped
    const timelineRef = useRef<gsap.core.Timeline | null>(null)

    // 1. Capture Logic
    useEffect(() => {
        if (captureSignal === 'start' && controlsRef.current) {
            addKeyframe()
            setCaptureSignal(null)
        } else if (captureSignal === 'end') {
            setCaptureSignal(null)
        }
    }, [captureSignal, addKeyframe, setCaptureSignal, controlsRef])

    // 2. Update Logic
    useEffect(() => {
        if (updateSignal && controlsRef.current) {
            const currentPos = new THREE.Vector3()
            camera.getWorldPosition(currentPos)
            const currentTarget = controlsRef.current.target.clone()

            updateKeyframeCamera(updateSignal, {
                position: [currentPos.x, currentPos.y, currentPos.z],
                target: [currentTarget.x, currentTarget.y, currentTarget.z]
            })
            setUpdateSignal(null)
        }
    }, [updateSignal, camera, updateKeyframeCamera, setUpdateSignal, controlsRef])

    // 3. Playback Logic
    useEffect(() => {
        if (isPlaying && keyframes.length > 0 && controlsRef.current) {

            if (timelineRef.current) timelineRef.current.kill()

            const tl = gsap.timeline({
                onComplete: () => setIsPlaying(false)
            })
            timelineRef.current = tl

            // Reset to first keyframe immediately
            const firstKeyframe = keyframes[0]
            if (firstKeyframe.cameraState) {
                camera.position.set(...firstKeyframe.cameraState.position)
                controlsRef.current.target.set(...firstKeyframe.cameraState.target)
                controlsRef.current.update()
            }

            // Set Initial Text
            if (firstKeyframe.textConfig?.visible) {
                useStore.getState().setTextConfig(firstKeyframe.textConfig)
            } else {
                useStore.getState().setTextConfig({ visible: false } as any)
            }

            // [NEW] Set Initial Image
            if (firstKeyframe.imageConfig?.visible) {
                useStore.getState().setImageConfig(firstKeyframe.imageConfig)
            } else {
                useStore.getState().setImageConfig({ visible: false } as any)
            }

            // Build Timeline Sequence
            for (let i = 0; i < keyframes.length; i++) {
                const k = keyframes[i]
                const nextK = keyframes[i + 1]

                // Move Camera to NEXT keyframe
                if (nextK && nextK.cameraState) {
                    tl.to(camera.position, {
                        x: nextK.cameraState.position[0],
                        y: nextK.cameraState.position[1],
                        z: nextK.cameraState.position[2],
                        duration: k.duration,
                        ease: "power2.inOut"
                    }, "<")

                    tl.to(controlsRef.current.target, {
                        x: nextK.cameraState.target[0],
                        y: nextK.cameraState.target[1],
                        z: nextK.cameraState.target[2],
                        duration: k.duration,
                        ease: "power2.inOut",
                        onUpdate: () => { if (controlsRef.current) controlsRef.current.update() }
                    }, "<")
                }

                // Schedule Text & Image Updates for the NEXT keyframe (Cut transition)
                tl.call(() => {
                    // Update Text
                    if (nextK && nextK.textConfig?.visible) {
                        useStore.getState().setTextConfig(nextK.textConfig)
                    } else if (nextK) {
                        useStore.getState().setTextConfig({ visible: false } as any)
                    }

                    // [NEW] Update Image
                    if (nextK && nextK.imageConfig?.visible) {
                        useStore.getState().setImageConfig(nextK.imageConfig)
                    } else if (nextK) {
                        useStore.getState().setImageConfig({ visible: false } as any)
                    }
                })

                tl.to({}, { duration: k.duration })
            }

        } else if (!isPlaying) {
            timelineRef.current?.kill()
            if (controlsRef.current) controlsRef.current.enabled = true
        }

        return () => {
            timelineRef.current?.kill()
        }
    }, [isPlaying, keyframes, camera, controlsRef, setIsPlaying])

    // 4. Selection Preview
    useEffect(() => {
        if (selectedKeyframeId && !isPlaying && controlsRef.current) {
            const k = keyframes.find(k => k.id === selectedKeyframeId)

            // Sync Camera
            if (k && k.cameraState) {
                gsap.to(camera.position, {
                    x: k.cameraState.position[0],
                    y: k.cameraState.position[1],
                    z: k.cameraState.position[2],
                    duration: 0.5
                })
                gsap.to(controlsRef.current.target, {
                    x: k.cameraState.target[0],
                    y: k.cameraState.target[1],
                    z: k.cameraState.target[2],
                    duration: 0.5,
                    onUpdate: () => { if (controlsRef.current) controlsRef.current.update() }
                })
            }

            // Sync Text
            if (k && k.textConfig?.visible) {
                useStore.getState().setTextConfig(k.textConfig)
            } else {
                useStore.getState().setTextConfig({ visible: false } as any)
            }

            // [NEW] Sync Image
            if (k && k.imageConfig?.visible) {
                useStore.getState().setImageConfig(k.imageConfig)
            } else {
                useStore.getState().setImageConfig({ visible: false } as any)
            }
        }
    }, [selectedKeyframeId, isPlaying, keyframes, camera, controlsRef])

    return null
}
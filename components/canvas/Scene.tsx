'use client'

import React, { Suspense, useRef, useEffect, useState, useMemo } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, Grid, GizmoHelper, GizmoViewport, Html } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '@/store/useStore'
import ModelRenderer from './ModelRenderer' // CHANGED: Use isolated component
import CameraManager from './CameraManager'
import KeyframeController from './KeyframeController'
import Viewfinder from './Viewfinder'
import Renderer from './Renderer'
import Title3D from './Title3D'
import SceneImage from './SceneImage'
import AutoGenPopup from '../AutoGenPopup'
import WebGLContextRecovery from './WebGLContextRecovery'

function CustomEnvironment({
    envUrl,
    showEnvironmentBackground,
    isRendering,
    envOpacity,
    envBlur
}: {
    envUrl: string
    showEnvironmentBackground: boolean
    isRendering: boolean
    envOpacity: number
    envBlur: number
}) {
    const [texture, setTexture] = useState<THREE.Texture | null>(null)

    useEffect(() => {
        if (!envUrl) return

        let isMounted = true
        let loadedTextureInstance: THREE.Texture | null = null

        const loadTexture = async () => {
            try {
                let loader: any
                const lowerUrl = envUrl.toLowerCase()

                if (lowerUrl.includes('.exr')) {
                    const { EXRLoader } = await import('three/examples/jsm/loaders/EXRLoader.js')
                    loader = new EXRLoader()
                } else if (lowerUrl.includes('.hdr')) {
                    const { RGBELoader } = await import('three/examples/jsm/loaders/RGBELoader.js')
                    loader = new RGBELoader()
                } else {
                    loader = new THREE.TextureLoader()
                }

                // Crucial for loading from external URLs (like Replicate/Firebase)
                loader.setCrossOrigin('anonymous')

                loader.load(
                    envUrl,
                    (loadedTexture: THREE.Texture) => {
                        if (!isMounted) {
                            loadedTexture.dispose()
                            return
                        }
                        loadedTexture.minFilter = THREE.LinearFilter
                        loadedTexture.magFilter = THREE.LinearFilter
                        loadedTexture.anisotropy = 16
                        loadedTexture.generateMipmaps = false

                        // Fix Seam: Allow wrapping for smooth interpolation at edges
                        loadedTexture.mapping = THREE.EquirectangularReflectionMapping
                        loadedTexture.wrapS = THREE.RepeatWrapping
                        loadedTexture.wrapT = THREE.ClampToEdgeWrapping

                        loadedTextureInstance = loadedTexture
                        setTexture(loadedTexture)
                        console.log('Successfully loaded environment texture:', envUrl)
                    },
                    undefined,
                    (error: any) => {
                        if (!isMounted) return
                        console.error('Failed to load texture:', {
                            url: envUrl,
                            error: error?.message || 'Unknown error (CORS or Network failure)',
                            info: error
                        })
                    }
                )
            } catch (error: any) {
                if (!isMounted) return
                console.error('Failed to initialize loader:', error)
            }
        }

        loadTexture()

        return () => {
            isMounted = false
            if (loadedTextureInstance) {
                loadedTextureInstance.dispose()
                console.log('Disposed environment texture instance')
            }
            setTexture(null)
        }
    }, [envUrl])

    if (!texture) return null

    return (
        <>
            {showEnvironmentBackground && (
                <mesh>
                    <sphereGeometry args={[500, 32, 16]} />
                    <meshBasicMaterial
                        map={texture}
                        side={THREE.BackSide}
                        toneMapped={false}
                        opacity={isRendering ? 1.0 : envOpacity}
                        transparent={envOpacity < 1.0}
                    />
                </mesh>
            )}
            <Environment
                key={envUrl}
                background={false}
                blur={envBlur}
                resolution={4096}
            >
                <mesh>
                    <sphereGeometry args={[500, 64, 32]} />
                    <meshBasicMaterial
                        map={texture}
                        side={THREE.BackSide}
                        toneMapped={false}
                    />
                </mesh>
            </Environment>
        </>
    )
}

function CanvasRefController() {
    const { gl } = useThree()
    const setCanvasRef = useStore((state) => state.setCanvasRef)

    useEffect(() => {
        setCanvasRef(gl.domElement)
        return () => setCanvasRef(null)
    }, [gl.domElement, setCanvasRef])

    return null
}

export default function Scene() {
    // Removed model-related subscriptions - now handled by ModelRenderer
    const stylePreset = useStore((state) => state.stylePreset)
    const envBlur = useStore((state) => state.envBlur)
    const envOpacity = useStore((state) => state.envOpacity)
    const isRendering = useStore((state) => state.isRendering)
    const exportSettings = useStore((state) => state.exportSettings)
    const hdriMode = useStore((state) => state.hdriMode)
    const activeHdriId = useStore((state) => state.activeHdriId)
    const customHdris = useStore((state) => state.customHdris)
    const setActiveObjectId = useStore(s => s.setActiveObjectId)
    const showEnvBackground = useStore(s => s.showEnvBackground)

    const controlsRef = useRef<any>(null)

    const showSolidBackground = !showEnvBackground && !(isRendering && exportSettings.transparent)
    const showEnvironmentBackground = isRendering ? !exportSettings.transparent : showEnvBackground

    const getStyleIntensity = () => {
        switch (stylePreset) {
            case 'vivid': return 1.5
            case 'cinematic': return 0.6
            case 'natural': default: return 1.0
        }
    }

    const envIntensity = getStyleIntensity()

    // Check if using default preset (which accesses a local file)
    const isDefaultPreset = hdriMode === 'preset' && activeHdriId === 'default'

    const envUrl = hdriMode === 'custom'
        ? customHdris.find(h => h.id === activeHdriId)?.url
        : isDefaultPreset ? '/default-hdri.exr' : null

    const envPreset = hdriMode === 'preset' && activeHdriId && activeHdriId !== 'default' ? activeHdriId : 'none'



    return (
        <div className="relative w-full h-full">
            <Canvas
                shadows
                camera={{ position: [0, 8, 0], fov: 50 }}
                gl={{
                    preserveDrawingBuffer: true,
                    alpha: false,  // Disable alpha to save memory
                    premultipliedAlpha: false,
                    powerPreference: 'high-performance',
                    antialias: false,  // Disable antialiasing to save memory
                    failIfMajorPerformanceCaveat: false,
                    precision: 'lowp',  // Use low precision
                    stencil: false  // Disable stencil buffer
                }}
                onPointerMissed={(e) => {
                    if (e.type === 'click') setActiveObjectId(null)
                }}
            >
                <CanvasRefController />
                <WebGLContextRecovery />
                <Renderer controlsRef={controlsRef} />
                <CameraManager controlsRef={controlsRef} />
                <KeyframeController controlsRef={controlsRef} />
                <Viewfinder />
                <Html fullscreen style={{ pointerEvents: 'none', zIndex: 100 }}>
                    <div className="w-full h-full">
                        <AutoGenPopup />

                    </div>
                </Html>
                <Title3D />
                <SceneImage />
                {showSolidBackground && <color attach="background" args={['#191920']} />}
                <ambientLight intensity={0.5 * envIntensity} />
                <directionalLight
                    position={[5, 5, 5]}
                    intensity={1 * envIntensity}
                    castShadow
                    shadow-mapSize-width={2048}
                    shadow-mapSize-height={2048}
                    shadow-bias={-0.0005}
                    shadow-normalBias={0.04}
                />
                <Suspense fallback={null}>
                    {envUrl ? (
                        <CustomEnvironment
                            envUrl={envUrl}
                            showEnvironmentBackground={showEnvironmentBackground}
                            isRendering={isRendering}
                            envOpacity={envOpacity}
                            envBlur={envBlur}
                        />
                    ) : envPreset && envPreset !== 'none' ? (
                        <Environment
                            key={envPreset}
                            preset={envPreset as any}
                            environmentIntensity={envIntensity}
                            background={showEnvironmentBackground}
                            backgroundIntensity={isRendering ? 1.0 : envOpacity}
                            blur={envBlur}
                            resolution={4096}
                        />
                    ) : null}
                </Suspense>
                {!isRendering && (
                    <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 4]}>
                        <planeGeometry args={[0.5, 0.5]} />
                        <meshBasicMaterial color="#6b7280" transparent opacity={0.7} />
                    </mesh>
                )}
                {!isRendering && (
                    <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
                        <GizmoViewport axisColors={['#ef4444', '#22c55e', '#3b82f6']} labelColor="white" />
                    </GizmoHelper>
                )}
                <OrbitControls
                    ref={controlsRef}
                    makeDefault
                    enableDamping
                    dampingFactor={0.05}
                    minDistance={1}
                    maxDistance={100}
                />
                {!isRendering && (
                    <Grid
                        args={[20, 20]}
                        cellSize={1}
                        cellThickness={0.5}
                        cellColor="#6b7280"
                        sectionSize={5}
                        sectionThickness={1}
                        sectionColor="#9ca3af"
                        fadeDistance={50}
                        fadeStrength={1}
                        followCamera={false}
                        infiniteGrid
                    />
                )}
                {/* Removed Suspense wrapper - it was causing unnecessary remounts */}
                <ModelRenderer />
            </Canvas>
        </div>
    )
}

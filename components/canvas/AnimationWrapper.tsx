'use client'

import React, { useMemo, useEffect, useState, useRef } from 'react'
import { useLoader } from '@react-three/fiber'
import { useGLTF, Float, Center, Resize, Html } from '@react-three/drei'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import * as THREE from 'three'
import { useStore } from '@/store/useStore'
import Draggable from './Draggable'
import { AlertTriangle } from 'lucide-react'

// Enable Three.js caching for better performance
THREE.Cache.enabled = true

// Helper: Count polygons in a model
function countPolygons(object: THREE.Object3D): number {
    let count = 0
    object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
            const geometry = child.geometry
            if (geometry.index) {
                count += geometry.index.count / 3
            } else if (geometry.attributes.position) {
                count += geometry.attributes.position.count / 3
            }
        }
    })
    return Math.floor(count)
}

// Warning component for complex models
function ModelComplexityWarning({ polygonCount }: { polygonCount: number }) {
    return (
        <Html center>
            <div className="bg-yellow-500/90 text-black px-4 py-2 rounded-lg shadow-lg max-w-xs">
                <div className="flex items-center gap-2">
                    <AlertTriangle size={20} />
                    <div>
                        <p className="font-bold text-sm">Complex Model</p>
                        <p className="text-xs">{polygonCount.toLocaleString()} polygons</p>
                        <p className="text-xs">May cause performance issues</p>
                    </div>
                </div>
            </div>
        </Html>
    )
}

// OBJ Loader Component with Memory Cleanup
function ObjModel({ url }: { url: string }) {
    const obj = useLoader(OBJLoader, url)
    const [polyCount, setPolyCount] = useState(0)

    useEffect(() => {
        // Count polygons after load
        const count = countPolygons(obj)
        setPolyCount(count)
        console.log(`Model loaded: ${count.toLocaleString()} polygons`)

        // Cleanup function
        return () => {
            console.log('Disposing model resources...')
            obj.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    if (child.geometry) child.geometry.dispose()
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(m => disposeMaterial(m))
                        } else {
                            disposeMaterial(child.material)
                        }
                    }
                }
            })
            console.log('Model disposed')
        }
    }, [obj])

    useMemo(() => {
        obj.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true
                child.receiveShadow = true
                if (!child.material) {
                    child.material = new THREE.MeshStandardMaterial({ color: 0xcccccc })
                }
            }
        })
    }, [obj])

    return <primitive object={obj} userData={{ polygonCount: polyCount }} />
}

// GLTF Loader Component with Memory Cleanup
function GltfModel({ url }: { url: string }) {
    const { scene } = useGLTF(url)
    const [polyCount, setPolyCount] = useState(0)

    useEffect(() => {
        // Count polygons after load
        const count = countPolygons(scene)
        setPolyCount(count)
        console.log(`📊 GLTF Model loaded: ${count.toLocaleString()} polygons`)

        // Cleanup resources when the model component unmounts
        return () => {
            console.log('Disposing GLTF model resources...')
            scene.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    if (child.geometry) {
                        child.geometry.dispose()
                    }
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(material => {
                                disposeMaterial(material)
                            })
                        } else {
                            disposeMaterial(child.material)
                        }
                    }
                }
            })
            console.log('GLTF model disposed (cache preserved for reuse)')
        }
    }, [scene])

    useMemo(() => {
        scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true
                child.receiveShadow = true
            }
        })
    }, [scene])

    return <primitive object={scene} userData={{ polygonCount: polyCount }} />
}

// Helper function to dispose materials and their textures
function disposeMaterial(material: THREE.Material) {
    // Dispose all textures in the material
    Object.keys(material).forEach(key => {
        const value = (material as any)[key]
        if (value && value instanceof THREE.Texture) {
            value.dispose()
        }
    })
    material.dispose()
}

// FBX Loader Component with Memory Cleanup
function FbxModel({ url }: { url: string }) {
    const fbx = useLoader(FBXLoader, url)
    const [polyCount, setPolyCount] = useState(0)

    useEffect(() => {
        // Count polygons after load
        const count = countPolygons(fbx)
        setPolyCount(count)
        console.log(`📊 FBX Model loaded: ${count.toLocaleString()} polygons`)

        // Cleanup function
        return () => {
            console.log('🧹 Disposing FBX model resources...')
            fbx.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    if (child.geometry) child.geometry.dispose()
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(m => disposeMaterial(m))
                        } else {
                            disposeMaterial(child.material)
                        }
                    }
                }
            })
            console.log('✅ FBX model disposed')
        }
    }, [fbx])

    useMemo(() => {
        fbx.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true
                child.receiveShadow = true
                if (!child.material) {
                    child.material = new THREE.MeshStandardMaterial({ color: 0xcccccc })
                }
            }
        })
    }, [fbx])

    return <primitive object={fbx} userData={{ polygonCount: polyCount }} />
}

interface AnimationWrapperProps {
    url: string
    animation: string
    modelType: 'gltf' | 'obj' | 'fbx' | null
    scale?: number
}

export default React.memo(function AnimationWrapper({ url, animation, modelType, scale = 1 }: AnimationWrapperProps) {
    const modelPosition = useStore(s => s.modelPosition)
    const setModelPosition = useStore(s => s.setModelPosition)
    const modelRotation = useStore(s => s.modelRotation)
    const setModelRotation = useStore(s => s.setModelRotation)
    const setActiveObjectId = useStore(s => s.setActiveObjectId)

    // Track polygon count from model userData
    const [showWarning, setShowWarning] = useState(false)
    const modelRef = useRef<any>(null)

    // DEBUGGING: Track renders
    useEffect(() => {
        console.log('🎬 AnimationWrapper rendered for:', url)
    }, [url])

    // Check polygon count periodically
    useEffect(() => {
        const checkPolygonCount = () => {
            if (modelRef.current?.userData?.polygonCount) {
                const count = modelRef.current.userData.polygonCount
                if (count > 100000 && !showWarning) {
                    setShowWarning(true)
                    console.warn(`Model has ${count.toLocaleString()} polygons. May cause performance issues.`)
                }
            }
        }

        const timer = setTimeout(checkPolygonCount, 1000)
        return () => clearTimeout(timer)
    }, [showWarning])

    // Auto-select model when loaded for better UX
    useEffect(() => {
        setActiveObjectId('model')
    }, [url, setActiveObjectId])

    // 1. Load the model content based on type
    let content
    if (modelType === 'obj') content = <ObjModel url={url} />
    else if (modelType === 'fbx') content = <FbxModel url={url} />
    else content = <GltfModel url={url} />

    // 2. Pre-Rotate OBJ files
    const OrientedModel = modelType === 'obj' ? (
        <group rotation={[-Math.PI / 2, 0, 0]}>
            {content}
        </group>
    ) : content

    // 3. Resize, Scale & Center
    const ProcessedModel = (
        <Center position={[0, 0, 0]}>
            <group scale={scale * 2}>
                <Resize>
                    {OrientedModel}
                </Resize>
            </group>
        </Center>
    )

    // 4. Apply Animation
    const AnimatedModel = animation === 'float' ? (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1} floatingRange={[0.2, 0.8]}>
            <group name="product-model">{ProcessedModel}</group>
        </Float>
    ) : (
        <group name="product-model">{ProcessedModel}</group>
    )

    // 5. Wrap in Draggable with optional warning
    return (
        <>
            <Draggable
                id="model"
                position={modelPosition}
                rotation={modelRotation}
                onDrag={setModelPosition}
                onRotate={setModelRotation}
            >
                <group ref={modelRef}>
                    {AnimatedModel}
                </group>
            </Draggable>
            {showWarning && modelRef.current?.userData?.polygonCount && (
                <ModelComplexityWarning polygonCount={modelRef.current.userData.polygonCount} />
            )}
        </>
    )
})
'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

interface Product {
    name: string
    modelPath: string
    scale: number
}

const products: Product[] = [
    { name: 'Premium Footwear', modelPath: '/models/Shoe.glb', scale: 2.5 },
    { name: 'Smart Toaster', modelPath: '/models/Toaster.glb', scale: 1.875 },
    { name: 'Gaming Monitor', modelPath: '/models/Gaming Moniter.glb', scale: 1.875 },
    { name: 'Mercedes G-Class', modelPath: '/models/Mercedes-benz_g-class.glb', scale: 1.25 },
]

// Easing function for bounce effect (outside component to avoid re-creation)
const easeOutBack = (x: number): number => {
    const c1 = 1.70158
    const c3 = c1 + 1
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2)
}

export default function Interactive3DShowcase() {
    const containerRef = useRef<HTMLDivElement>(null)
    const sceneRef = useRef<THREE.Scene | null>(null)
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
    const modelGroupRef = useRef<THREE.Group | null>(null)
    const mouseRef = useRef({ x: 0, y: 0 })
    const targetRotationRef = useRef({ x: 0, y: 0 })
    const isLoadingRef = useRef(false) // Prevent concurrent loads
    const [currentProductIndex, setCurrentProductIndex] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [loadError, setLoadError] = useState(false)

    // Load model function
    const loadModel = useCallback((product: Product) => {
        if (!sceneRef.current) return

        // Prevent concurrent loads
        if (isLoadingRef.current) {
            console.log(`Skipping load of ${product.name} - already loading`)
            return
        }

        isLoadingRef.current = true
        console.log(`Loading model: ${product.name}`)
        setIsLoading(true)
        setLoadError(false)

        // Remove old model completely
        if (modelGroupRef.current) {
            console.log('Removing old model from scene')
            sceneRef.current.remove(modelGroupRef.current)

            // Dispose of all geometries and materials
            modelGroupRef.current.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    if (child.geometry) child.geometry.dispose()
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach((m: THREE.Material) => m.dispose())
                        } else {
                            child.material.dispose()
                        }
                    }
                }
            })

            modelGroupRef.current = null
        }

        // Load new model with comprehensive texture handling
        const loadingManager = new THREE.LoadingManager()

        // Track loading progress
        loadingManager.onProgress = (url, loaded, total) => {
            console.log(`Loading: ${url} (${loaded}/${total})`)
        }

        // Handle texture loading errors gracefully
        loadingManager.onError = (url) => {
            console.warn(`Failed to load resource: ${url}`)
        }

        const loader = new GLTFLoader(loadingManager)

        loader.load(
            product.modelPath,
            (gltf) => {
                const model = gltf.scene

                // Comprehensive material and texture processing
                model.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        // Enable shadows
                        child.castShadow = true
                        child.receiveShadow = true

                        // Process materials
                        if (child.material) {
                            const materials = Array.isArray(child.material) ? child.material : [child.material]

                            materials.forEach((mat) => {
                                if (mat instanceof THREE.MeshStandardMaterial) {
                                    // Ensure proper texture settings
                                    if (mat.map) {
                                        mat.map.needsUpdate = true
                                    }

                                    // Fix metalness and roughness
                                    mat.metalness = mat.metalness || 0.1
                                    mat.roughness = mat.roughness || 0.8
                                    mat.needsUpdate = true
                                } else {
                                    // Convert to MeshStandardMaterial if needed
                                    const newMat = new THREE.MeshStandardMaterial({
                                        color: mat.color || new THREE.Color(0xcccccc),
                                        map: mat.map || null,
                                        metalness: 0.1,
                                        roughness: 0.8
                                    })

                                    if (Array.isArray(child.material)) {
                                        const index = child.material.indexOf(mat)
                                        child.material[index] = newMat
                                    } else {
                                        child.material = newMat
                                    }
                                }
                            })
                        } else {
                            // No material - create default
                            child.material = new THREE.MeshStandardMaterial({
                                color: 0xcccccc,
                                metalness: 0.1,
                                roughness: 0.8
                            })
                        }
                    }
                })

                // Create a group for the model
                const group = new THREE.Group()

                // Calculate bounding box
                const box = new THREE.Box3().setFromObject(model)
                const center = box.getCenter(new THREE.Vector3())
                const size = box.getSize(new THREE.Vector3())

                // Center the model at origin
                model.position.x = -center.x
                model.position.y = -center.y
                model.position.z = -center.z

                // Add model to group
                group.add(model)

                // Scale the group to fit in view
                const maxDim = Math.max(size.x, size.y, size.z)
                const targetSize = 3
                const scale = targetSize / maxDim

                // Position group at origin
                group.position.set(0, 0, 0)

                // Start from zero scale for animation
                group.scale.set(0, 0, 0)

                // Add to scene
                sceneRef.current!.add(group)
                modelGroupRef.current = group

                console.log(`Model ${product.name} loaded successfully`)

                // Animate scale in
                const startTime = Date.now()
                const animateScale = () => {
                    if (!group.parent) return

                    const elapsed = Date.now() - startTime
                    const progress = Math.min(elapsed / 600, 1)
                    const scaleValue = easeOutBack(progress) * scale
                    group.scale.set(scaleValue, scaleValue, scaleValue)

                    if (progress < 1) {
                        requestAnimationFrame(animateScale)
                    } else {
                        setIsLoading(false)
                        isLoadingRef.current = false // Reset loading flag
                    }
                }
                animateScale()
            },
            undefined,
            (error) => {
                console.error('Error loading model:', error)
                setLoadError(true)
                setIsLoading(false)
                isLoadingRef.current = false // Reset loading flag
            }
        )
    }, []) // Empty dependencies - function is stable

    // Initialize Three.js scene
    useEffect(() => {
        if (!containerRef.current) return

        // Scene setup
        const scene = new THREE.Scene()
        sceneRef.current = scene

        // Camera setup
        const camera = new THREE.PerspectiveCamera(
            50,
            containerRef.current.clientWidth / containerRef.current.clientHeight,
            0.1,
            1000
        )
        camera.position.set(0, 0, 8)
        camera.lookAt(0, 0, 0)
        cameraRef.current = camera

        // Renderer setup with enhanced settings
        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance'
        })
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        renderer.toneMapping = THREE.ACESFilmicToneMapping
        renderer.toneMappingExposure = 1

        // Add CSS to keep canvas in place
        renderer.domElement.style.position = 'absolute'
        renderer.domElement.style.top = '0'
        renderer.domElement.style.left = '0'
        renderer.domElement.style.width = '100%'
        renderer.domElement.style.height = '100%'

        containerRef.current.appendChild(renderer.domElement)
        rendererRef.current = renderer

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
        scene.add(ambientLight)

        const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1)
        directionalLight1.position.set(5, 5, 5)
        scene.add(directionalLight1)

        const directionalLight2 = new THREE.DirectionalLight(0x3b82f6, 0.4)
        directionalLight2.position.set(-5, -5, -5)
        scene.add(directionalLight2)

        const pointLight1 = new THREE.PointLight(0x8b5cf6, 1.5, 10)
        pointLight1.position.set(3, 3, 3)
        scene.add(pointLight1)

        const pointLight2 = new THREE.PointLight(0x06b6d4, 1.5, 10)
        pointLight2.position.set(-3, -3, 3)
        scene.add(pointLight2)

        // Mouse move handler
        const handleMouseMove = (e: MouseEvent) => {
            const rect = containerRef.current?.getBoundingClientRect()
            if (rect) {
                mouseRef.current = {
                    x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
                    y: -((e.clientY - rect.top) / rect.height) * 2 + 1
                }
            }
        }
        window.addEventListener('mousemove', handleMouseMove)

        // Resize handler
        const handleResize = () => {
            if (!containerRef.current || !camera || !renderer) return
            camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight
            camera.updateProjectionMatrix()
            renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
        }
        window.addEventListener('resize', handleResize)

        // Animation loop
        let animationId: number
        const animate = () => {
            if (modelGroupRef.current) {
                // Smooth rotation based on mouse position
                targetRotationRef.current = {
                    x: mouseRef.current.y * 0.3,
                    y: mouseRef.current.x * 0.5
                }

                // Lerp rotation for smooth movement
                modelGroupRef.current.rotation.x += (targetRotationRef.current.x - modelGroupRef.current.rotation.x) * 0.05
                modelGroupRef.current.rotation.y += (targetRotationRef.current.y - modelGroupRef.current.rotation.y) * 0.05

                // Auto-rotation
                modelGroupRef.current.rotation.y += 0.003

                // Floating animation
                modelGroupRef.current.position.y = Math.sin(Date.now() * 0.001) * 0.15
            }

            renderer.render(scene, camera)
            animationId = requestAnimationFrame(animate)
        }
        animate()

        // Auto-switch products every 10 seconds
        const switchInterval = setInterval(() => {
            setCurrentProductIndex((prev) => (prev + 1) % products.length)
        }, 10000)

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('resize', handleResize)
            cancelAnimationFrame(animationId)
            clearInterval(switchInterval)
            renderer.dispose()
            if (containerRef.current?.contains(renderer.domElement)) {
                containerRef.current.removeChild(renderer.domElement)
            }
        }
    }, [])

    // Load model when index changes
    useEffect(() => {
        if (sceneRef.current) {
            loadModel(products[currentProductIndex])
        }
    }, [currentProductIndex, loadModel])

    return (
        <div className="relative w-full h-full">
            <div ref={containerRef} className="w-full h-full" />

            {/* Loading indicator */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                        <p className="text-white/80 text-sm">Loading 3D Model...</p>
                    </div>
                </div>
            )}

            {/* Error message */}
            {loadError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="text-center px-6 py-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <p className="text-red-400 font-semibold mb-2">Failed to load model</p>
                        <p className="text-red-300/70 text-sm">Please check if the model file exists</p>
                    </div>
                </div>
            )}

            {/* Product name label */}
            {!isLoading && !loadError && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-black/50 backdrop-blur-md rounded-full border border-white/10 animate-fade-in">
                    <p className="text-white font-semibold text-lg">
                        {products[currentProductIndex].name}
                    </p>
                </div>
            )}
        </div>
    )
}

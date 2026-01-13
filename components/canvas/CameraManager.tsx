'use client'

import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useStore } from '@/store/useStore'
import * as THREE from 'three'

interface CameraManagerProps {
    controlsRef: React.RefObject<any>
}

/**
 * CameraManager - Handles all camera-based animations
 * Turntable: Camera orbits around model
 * Zoom: Camera dollies in
 * Static/Float: User has manual control
 */
export default function CameraManager({ controlsRef }: CameraManagerProps) {
    const animationPreset = useStore((state) => state.animationPreset)
    const isTimelineOpen = useStore((state) => state.isTimelineOpen)
    const { camera } = useThree()

    // Configure OrbitControls based on animation preset
    useEffect(() => {
        if (!controlsRef.current) return

        const controls = controlsRef.current

        switch (animationPreset) {
            case 'turntable':
                // Only enable auto-rotate if timeline is closed
                // When timeline is open, user needs manual control for keyframing
                controls.autoRotate = !isTimelineOpen
                controls.autoRotateSpeed = 2.0
                controls.enabled = true
                break

            case 'zoom-in':
                // Disable auto-rotate, allow manual control during zoom
                controls.autoRotate = false
                controls.enabled = false // Disable manual control during zoom
                break

            case 'static':
            case 'float':
            default:
                // Disable auto-rotate, enable manual control
                controls.autoRotate = false
                controls.enabled = true
                break
        }
    }, [animationPreset, controlsRef, isTimelineOpen])

    // Handle camera movements in animation loop
    useFrame((state, delta) => {
        // Only actively control camera in zoom-in mode
        // In static/float modes, give user full freedom
        if (animationPreset === 'zoom-in') {
            // Smooth dolly in (camera moves forward)
            const targetZ = 2 // Stop point
            if (camera.position.z > targetZ) {
                // Smooth interpolation
                camera.position.z = THREE.MathUtils.lerp(
                    camera.position.z,
                    targetZ,
                    delta * 0.5
                )
            }
        }
        // Removed static/float reset logic - let users position camera freely
    })

    return null
}

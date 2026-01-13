'use client'

import { useRef, useEffect, useState } from 'react'
import { TransformControls } from '@react-three/drei'
import { useStore } from '@/store/useStore'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

interface DraggableProps {
    id: 'model' | 'text' | 'image'
    position: [number, number, number]
    rotation?: [number, number, number]
    onDrag: (newPos: [number, number, number]) => void
    onRotate?: (newRot: [number, number, number]) => void
    children: React.ReactNode
}

export default function Draggable({ id, position, rotation, onDrag, onRotate, children }: DraggableProps) {
    const activeObjectId = useStore(s => s.activeObjectId)
    const setActiveObjectId = useStore(s => s.setActiveObjectId)
    const isRendering = useStore(s => s.isRendering)
    const transformMode = useStore(s => s.transformMode)
    const isSelected = activeObjectId === id

    const groupRef = useRef<THREE.Group>(null)
    const transformRef = useRef<any>(null)
    const [isDragging, setIsDragging] = useState(false)

    const { controls } = useThree()

    // Sync position & rotation when not dragging
    useEffect(() => {
        if (groupRef.current && !isDragging) {
            groupRef.current.position.set(position[0], position[1], position[2])
            // [FIX] Ensure rotation is synced
            if (rotation) {
                groupRef.current.rotation.set(rotation[0], rotation[1], rotation[2])
            }
        }
    }, [position, rotation, isDragging])

    // Disable OrbitControls while using TransformControls
    useEffect(() => {
        const transform = transformRef.current
        if (!transform || !controls) return

        const onDragStart = () => {
            setIsDragging(true)
            if (controls) (controls as any).enabled = false
        }

        const onDragEnd = () => {
            setIsDragging(false)
            if (controls) (controls as any).enabled = true
        }

        transform.addEventListener('dragging-changed', (event: any) => {
            if (event.value) onDragStart()
            else onDragEnd()
        })

        return () => {
            if (transform) {
                transform.removeEventListener('dragging-changed', onDragStart)
                transform.removeEventListener('dragging-changed', onDragEnd)
            }
        }
    }, [controls])

    // Determine current mode: Only allow rotation if onRotate handler is provided
    const currentMode = (transformMode === 'rotate' && onRotate) ? 'rotate' : 'translate'

    return (
        <>
            <group
                ref={groupRef}
                onClick={(e) => {
                    e.stopPropagation()
                    setActiveObjectId(id)
                }}
            >
                {children}
            </group>

            {isSelected && !isRendering && groupRef.current && (
                <TransformControls
                    ref={transformRef}
                    object={groupRef.current}
                    mode={currentMode}
                    size={0.7}
                    onObjectChange={() => {
                        if (groupRef.current) {
                            if (currentMode === 'translate') {
                                const { x, y, z } = groupRef.current.position
                                onDrag([x, y, z])
                            } else if (currentMode === 'rotate' && onRotate) {
                                // [FIX] Capture rotation changes
                                const { x, y, z } = groupRef.current.rotation
                                onRotate([x, y, z])
                            }
                        }
                    }}
                />
            )}
        </>
    )
}
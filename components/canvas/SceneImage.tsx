'use client'

import { Image, Center, Resize, useTexture } from '@react-three/drei'
import { useStore } from '@/store/useStore'
import Draggable from './Draggable'
import * as THREE from 'three'
import { Suspense } from 'react'

// [NEW] 自動計算比例的圖片元件
function AutoSizedImage({ url, scale }: { url: string, scale: number }) {
    // 讀取貼圖以獲取原始尺寸
    const texture = useTexture(url)
    const image = texture.image as HTMLImageElement
    const aspect = image.width / image.height

    return (
        // 邏輯：
        // 1. group scale: 使用者的縮放倍率 (基礎 2 單位)
        // 2. Resize: 強制將內容物限制在 1x1x1 的盒子內 (Fit)
        // 3. Image scale: 設定正確的長寬比，避免圖片變形
        <group scale={scale * 2}>
            <Resize>
                <mesh scale={[aspect, 1, 1]}>
                    <planeGeometry args={[1, 1]} />
                    <meshBasicMaterial
                        map={texture}
                        transparent
                        side={THREE.DoubleSide}
                        toneMapped={false}
                    />
                </mesh>
            </Resize>
        </group>
    )
}

export default function SceneImage() {
    const imageConfig = useStore(s => s.imageConfig)
    const setImageConfig = useStore(s => s.setImageConfig)

    const editingImageId = useStore(s => s.editingImageId)
    const updateKeyframeImage = useStore(s => s.updateKeyframeImage)
    const keyframes = useStore(s => s.keyframes)

    const handleDrag = (newPos: [number, number, number]) => {
        if (!imageConfig) return
        setImageConfig({ position: newPos })
        if (editingImageId) {
            const keyframe = keyframes.find(k => k.id === editingImageId)
            if (keyframe && keyframe.imageConfig) {
                updateKeyframeImage(editingImageId, { ...keyframe.imageConfig, position: newPos })
            }
        }
    }

    const handleRotate = (newRot: [number, number, number]) => {
        if (!imageConfig) return
        setImageConfig({ rotation: newRot })
        if (editingImageId) {
            const keyframe = keyframes.find(k => k.id === editingImageId)
            if (keyframe && keyframe.imageConfig) {
                updateKeyframeImage(editingImageId, { ...keyframe.imageConfig, rotation: newRot })
            }
        }
    }

    if (!imageConfig || !imageConfig.visible || !imageConfig.url) return null

    return (
        <Draggable
            id="image"
            position={imageConfig.position}
            rotation={imageConfig.rotation}
            onDrag={handleDrag}
            onRotate={handleRotate}
        >
            <Center>
                <Suspense fallback={null}>
                    <AutoSizedImage url={imageConfig.url} scale={imageConfig.scale} />
                </Suspense>
            </Center>
        </Draggable>
    )
}
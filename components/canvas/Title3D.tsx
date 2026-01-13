'use client'

import { Text, Resize } from '@react-three/drei'
import { useStore } from '@/store/useStore'
import Draggable from './Draggable'

export default function Title3D() {
    const { content, visible, color, size, position, rotation } = useStore(s => s.textConfig)
    const setTextConfig = useStore(s => s.setTextConfig)

    const editingTextId = useStore(s => s.editingTextId)
    const updateKeyframeText = useStore(s => s.updateKeyframeText)
    const keyframes = useStore(s => s.keyframes)

    const handleDrag = (newPos: [number, number, number]) => {
        setTextConfig({ position: newPos })
        if (editingTextId) {
            const keyframe = keyframes.find(k => k.id === editingTextId)
            if (keyframe && keyframe.textConfig) {
                updateKeyframeText(editingTextId, { ...keyframe.textConfig, position: newPos })
            }
        }
    }

    const handleRotate = (newRot: [number, number, number]) => {
        setTextConfig({ rotation: newRot })
        if (editingTextId) {
            const keyframe = keyframes.find(k => k.id === editingTextId)
            if (keyframe && keyframe.textConfig) {
                updateKeyframeText(editingTextId, { ...keyframe.textConfig, rotation: newRot })
            }
        }
    }

    if (!visible || !content) return null

    return (
        <Draggable
            id="text"
            position={position}
            rotation={rotation || [0, 0, 0]}
            onDrag={handleDrag}
            onRotate={handleRotate}
        >
            {/* [MODIFIED] Removed <Center> wrapper to fix Gizmo positioning
               The Text component with anchorX="center" and anchorY="middle" 
               already centers the text correctly. Removing <Center> ensures 
               the Gizmo appears at the text's visual center.
            */}
            <group scale={size / 2}>
                <Resize>
                    <Text
                        fontSize={0.5}
                        maxWidth={5} // 維持自動換行的比例
                        lineHeight={1.2}
                        textAlign="center"
                        anchorX="center"
                        anchorY="middle"
                        color={color}
                        outlineWidth={0.02}
                        outlineColor="#000000"
                        whiteSpace="normal"
                        overflowWrap="break-word"
                        characters="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{};':,./<?ÇŞĞÜÖİçşğüöı你好世界"
                    >
                        {content}
                    </Text>
                </Resize>
            </group>
        </Draggable>
    )
}
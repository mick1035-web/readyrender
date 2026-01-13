'use client'

import { useGLTF, Center } from '@react-three/drei'
import { useEffect } from 'react'

interface ModelProps {
    url: string
    onLoad?: () => void
}

export default function Model({ url, onLoad }: ModelProps) {
    // Enable Draco compression support with default CDN decoder
    const { scene } = useGLTF(url, true)

    useEffect(() => {
        // Notify parent when model is loaded and ready
        if (scene && onLoad) {
            // Small delay to ensure model is fully rendered
            const timer = setTimeout(() => {
                onLoad()
            }, 100)
            return () => clearTimeout(timer)
        }
    }, [scene, onLoad])

    return (
        <Center>
            <primitive object={scene} />
        </Center>
    )
}

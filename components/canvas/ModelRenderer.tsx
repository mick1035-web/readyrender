'use client'

import React from 'react'
import { useStore } from '@/store/useStore'
import AnimationWrapper from './AnimationWrapper'

// Isolated component that only re-renders when model-related state changes
const ModelRenderer = React.memo(function ModelRenderer() {
    const modelUrl = useStore((state) => state.modelUrl)
    const modelType = useStore((state) => state.modelType)
    const animationPreset = useStore((state) => state.animationPreset)
    const modelScale = useStore((state) => state.modelScale)

    console.log('ModelRenderer re-rendered')

    if (!modelUrl) return null

    return (
        <AnimationWrapper
            key={modelUrl}
            url={modelUrl}
            animation={animationPreset}
            modelType={modelType}
            scale={modelScale}
        />
    )
})

export default ModelRenderer

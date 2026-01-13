'use client'

import { useStore } from '@/store/useStore'
import { useEffect, useState } from 'react'

export default function SafeFrameOverlay() {
    const exportSettings = useStore(s => s.exportSettings)
    const isTimelineOpen = useStore(s => s.isTimelineOpen)
    const [maskDimensions, setMaskDimensions] = useState({
        width: 0,
        height: 0,
        type: 'horizontal' as 'horizontal' | 'vertical' // horizontal = left/right, vertical = top/bottom
    })

    useEffect(() => {
        // Calculate mask dimensions based on canvas container and aspect ratio
        const updateMaskDimensions = () => {
            const canvasContainer = document.querySelector('.canvas-container')
            if (canvasContainer) {
                const rect = canvasContainer.getBoundingClientRect()
                const containerWidth = rect.width
                const containerHeight = rect.height

                // Add 7% padding to ensure masks are always visible as visual guides
                // Note: This is for visual reference only - actual render uses full aspect ratio
                const PADDING_PERCENT = 0.07

                if (exportSettings.aspectRatio === '16:9') {
                    // For 16:9, calculate top/bottom mask height
                    // Target: width = height × (16/9) (landscape)
                    // Shrink target by padding to ensure masks show
                    const targetHeight = (containerWidth * (1 - PADDING_PERCENT)) / (16 / 9)

                    if (containerHeight > targetHeight) {
                        setMaskDimensions({
                            width: 0,
                            height: (containerHeight - targetHeight) / 2,
                            type: 'vertical'
                        })
                    } else {
                        // Even if container is smaller, add minimum padding
                        const minHeight = containerHeight * PADDING_PERCENT / 2
                        setMaskDimensions({
                            width: 0,
                            height: minHeight,
                            type: 'vertical'
                        })
                    }
                } else if (exportSettings.aspectRatio === '1:1') {
                    // For 1:1, calculate left/right mask width
                    // Target: width = height (square)
                    // Shrink target by padding
                    const targetWidth = containerHeight * (1 - PADDING_PERCENT)

                    if (containerWidth > targetWidth) {
                        setMaskDimensions({
                            width: (containerWidth - targetWidth) / 2,
                            height: 0,
                            type: 'horizontal'
                        })
                    } else {
                        // Add minimum padding
                        const minWidth = containerWidth * PADDING_PERCENT / 2
                        setMaskDimensions({
                            width: minWidth,
                            height: 0,
                            type: 'horizontal'
                        })
                    }
                } else if (exportSettings.aspectRatio === '9:16') {
                    // For 9:16, calculate left/right mask width
                    // Target: width = height × (9/16) (portrait)
                    // Shrink target by padding
                    const targetWidth = (containerHeight * (1 - PADDING_PERCENT)) * (9 / 16)

                    if (containerWidth > targetWidth) {
                        setMaskDimensions({
                            width: (containerWidth - targetWidth) / 2,
                            height: 0,
                            type: 'horizontal'
                        })
                    } else {
                        // Add minimum padding
                        const minWidth = containerWidth * PADDING_PERCENT / 2
                        setMaskDimensions({
                            width: minWidth,
                            height: 0,
                            type: 'horizontal'
                        })
                    }
                } else {
                    setMaskDimensions({ width: 0, height: 0, type: 'horizontal' })
                }
            }
        }

        // Update immediately and on resize
        updateMaskDimensions()

        // Small delay to ensure DOM has updated after timeline state change
        const timeoutId = setTimeout(updateMaskDimensions, 100)

        window.addEventListener('resize', updateMaskDimensions)
        return () => {
            window.removeEventListener('resize', updateMaskDimensions)
            clearTimeout(timeoutId)
        }
    }, [isTimelineOpen, exportSettings.aspectRatio]) // Re-run when timeline or aspect ratio changes

    // Show masks when dimensions are calculated
    const showMasks = (maskDimensions.width > 0 || maskDimensions.height > 0)

    if (!showMasks) return null

    return (
        <>
            {maskDimensions.type === 'horizontal' ? (
                <>
                    {/* Left mask */}
                    <div
                        className="absolute top-0 left-0 bottom-0 bg-black/50 pointer-events-none z-10"
                        style={{ width: `${maskDimensions.width}px` }}
                    />

                    {/* Right mask */}
                    <div
                        className="absolute top-0 right-0 bottom-0 bg-black/50 pointer-events-none z-10"
                        style={{ width: `${maskDimensions.width}px` }}
                    />
                </>
            ) : (
                <>
                    {/* Top mask */}
                    <div
                        className="absolute top-0 left-0 right-0 bg-black/50 pointer-events-none z-10"
                        style={{ height: `${maskDimensions.height}px` }}
                    />

                    {/* Bottom mask */}
                    <div
                        className="absolute bottom-0 left-0 right-0 bg-black/50 pointer-events-none z-10"
                        style={{ height: `${maskDimensions.height}px` }}
                    />
                </>
            )}
        </>
    )
}

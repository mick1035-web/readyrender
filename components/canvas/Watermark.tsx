'use client'

import { Html } from '@react-three/drei'
import { useStore } from '@/store/useStore'

export default function Watermark() {
    const subscription = useStore(s => s.subscription)
    const exportSettings = useStore(s => s.exportSettings)
    const isRendering = useStore(s => s.isRendering)

    // Only show watermark for FREE tier AND when rendering
    if (subscription.userTier !== 'FREE' || !isRendering) {
        return null
    }

    // Calculate position based on aspect ratio
    const aspectRatio = exportSettings.aspectRatio
    let positionStyle: React.CSSProperties = {
        position: 'absolute',
        bottom: '20px',
        right: '20px',
    }

    return (
        <Html
            fullscreen
            style={{
                pointerEvents: 'none',
                zIndex: 1000,
            }}
        >
            <div style={positionStyle}>
                <div style={{
                    background: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(8px)',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '16px',
                    }}>
                        <span style={{
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: '600',
                        }}>
                            ReadyRender
                        </span>
                        <span style={{
                            color: '#a1a1aa',
                            fontSize: '12px',
                        }}>
                            Free Trial
                        </span>
                    </div>
                </div>
            </div>
        </Html>
    )
}

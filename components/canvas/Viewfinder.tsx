'use client'

import { useStore } from '@/store/useStore'
import { Html } from '@react-three/drei'

export default function Viewfinder() {
    return (
        <Html
            fullscreen
            style={{
                pointerEvents: 'none',
                zIndex: 50,
                width: '100%',
                height: '100%'
            }}
        >
            {/* Simple frame overlay without aspect ratio constraints */}
            <div className="w-full h-full border border-white/20 relative">

                {/* Corner Markers */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white/80"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white/80"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white/80"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white/80"></div>

                {/* Center Crosshair */}
                <div className="absolute top-1/2 left-1/2 w-3 h-[1px] bg-white/30 -translate-x-1/2"></div>
                <div className="absolute top-1/2 left-1/2 h-3 w-[1px] bg-white/30 -translate-y-1/2"></div>
            </div>
        </Html>
    )
}
'use client'

import { useStore } from '@/store/useStore'
import { Check, XCircle } from 'lucide-react'

export default function NoneSection() {
    const hdriMode = useStore(s => s.hdriMode)
    const activeHdriId = useStore(s => s.activeHdriId)
    const setActiveHdri = useStore(s => s.setActiveHdri)

    const isActive = hdriMode === 'preset' && activeHdriId === 'none'

    const handleSelectNone = () => {
        setActiveHdri('preset', 'none')
    }

    return (
        <section>
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 px-1">
                🚫 No Environment
            </h3>

            <button
                onClick={handleSelectNone}
                className={`relative w-full p-4 rounded-lg border transition-all text-left ${isActive
                        ? 'bg-green-900/20 border-green-500/50'
                        : 'bg-zinc-800 border-zinc-700 hover:border-zinc-500 hover:bg-zinc-700'
                    }`}
            >
                {/* Checkmark */}
                {isActive && (
                    <div className="absolute top-3 right-3 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <Check size={12} className="text-white" />
                    </div>
                )}

                {/* Content */}
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-zinc-900 border border-zinc-700 rounded-lg flex items-center justify-center">
                        <XCircle size={24} className="text-zinc-600" />
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-zinc-200 mb-1">
                            None
                        </div>
                        <div className="text-xs text-zinc-500">
                            No environment lighting
                        </div>
                    </div>
                </div>
            </button>
        </section>
    )
}

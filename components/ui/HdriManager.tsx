'use client'

import { useStore } from '@/store/useStore'
import { X, Image as ImageIcon } from 'lucide-react'
import NoneSection from './hdri/NoneSection'
import PresetSection from './hdri/PresetSection'
import CustomSection from './hdri/CustomSection'
import AiGenerateSection from './hdri/AiGenerateSection'

export default function HdriManager() {
    const isOpen = useStore(s => s.isHdriManagerOpen)
    const setIsOpen = useStore(s => s.setIsHdriManagerOpen)

    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto"
            onClick={() => setIsOpen(false)}
        >
            <div
                className="w-[500px] h-[80vh] bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-800/50">
                    <div className="flex items-center gap-2">
                        <ImageIcon size={20} className="text-green-500" />
                        <h2 className="text-lg font-bold text-white">HDRI Manager</h2>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-zinc-500 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                    {/* Section 0: None */}
                    <NoneSection />

                    {/* Section 1: Preset Library */}
                    <PresetSection />

                    {/* Section 2: Custom HDRI */}
                    <CustomSection />

                    {/* Section 3: AI Generate */}
                    <AiGenerateSection />
                </div>
            </div>
        </div>
    )
}

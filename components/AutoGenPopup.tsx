'use client'

import { useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { Video, X, Zap, Play } from 'lucide-react'

export default function AutoGenPopup() {
    const step = useStore(s => s.autoGenPopupStep)
    const setStep = useStore(s => s.setAutoGenPopupStep)
    const applyPreset = useStore(s => s.applyPreset)
    const setIsPlaying = useStore(s => s.setIsPlaying)
    const isPlaying = useStore(s => s.isPlaying)
    const setIsTimelineOpen = useStore(s => s.setIsTimelineOpen)
    const setIsRendering = useStore(s => s.setIsRendering)

    // Detect when playback finishes
    useEffect(() => {
        if (step === 'preview' && !isPlaying) {
            setStep('render')
        }
    }, [step, isPlaying, setStep])

    const handleGenerate = () => {
        applyPreset('orbit-360')
        setIsTimelineOpen(true)

        // Wait for template to be applied and scene to stabilize before playing
        setTimeout(() => {
            setIsPlaying(true)
            setStep('preview')
        }, 500)
    }

    const handleRender = () => {
        setStep('idle')
        setIsRendering(true)
    }

    const handleCancel = () => {
        setStep('idle')
    }

    if (step === 'idle') return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4 pointer-events-auto" onClick={handleCancel}>
            {/* UI Fix: 
               - Removed fixed w-[400px]
               - Added w-full max-w-lg (max 512px)
               - Maintains min-w-[320px] for mobile safety
            */}
            <div className="w-full max-w-lg min-w-[320px] bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden p-8 relative animate-in zoom-in-95 duration-200 flex flex-col items-center" onClick={e => e.stopPropagation()}>

                <button
                    onClick={handleCancel}
                    className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Step 1: Ask */}
                {step === 'ask' && (
                    <div className="w-full space-y-6 text-center">
                        <div className="w-16 h-16 rounded-full bg-blue-600/20 text-blue-500 flex items-center justify-center mx-auto mb-4">
                            <Zap size={32} fill="currentColor" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-3">Auto-Generate Video?</h2>
                            <p className="text-zinc-400 text-base leading-relaxed">
                                We can automatically create a cinematic camera move <br />(360° Orbit) for your model instantly.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 w-full pt-2">
                            <button
                                onClick={handleCancel}
                                className="w-full py-3 rounded-xl bg-zinc-800 text-zinc-300 font-medium hover:bg-zinc-700 transition-colors"
                            >
                                No thanks
                            </button>
                            <button
                                onClick={handleGenerate}
                                className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-colors flex items-center justify-center gap-2"
                            >
                                <Play size={18} fill="currentColor" />
                                Yes, Auto-Gen
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Previewing */}
                {step === 'preview' && (
                    <div className="w-full space-y-6 text-center">
                        <div className="w-16 h-16 rounded-full bg-green-600/20 text-green-500 flex items-center justify-center mx-auto mb-4 animate-pulse">
                            <Play size={32} fill="currentColor" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-3">Previewing...</h2>
                            <p className="text-zinc-400 text-base">
                                Playing your generated shots on the main screen.
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                setIsPlaying(false)
                                setStep('render')
                            }}
                            className="w-full py-3 rounded-xl bg-zinc-800 text-zinc-300 font-medium hover:bg-zinc-700 transition-colors"
                        >
                            Skip Preview
                        </button>
                    </div>
                )}

                {/* Step 3: Ask Render */}
                {step === 'render' && (
                    <div className="w-full space-y-6 text-center">
                        <div className="w-16 h-16 rounded-full bg-purple-600/20 text-purple-500 flex items-center justify-center mx-auto mb-4">
                            <Video size={32} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-3">Looks Good?</h2>
                            <p className="text-zinc-400 text-base leading-relaxed">
                                Ready to render the high-quality 4K video <br />with transparent background?
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 w-full pt-2">
                            <button
                                onClick={handleCancel}
                                className="w-full py-3 rounded-xl bg-zinc-800 text-zinc-300 font-medium hover:bg-zinc-700 transition-colors"
                            >
                                Edit Timeline
                            </button>
                            <button
                                onClick={handleRender}
                                className="w-full py-3 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-500 transition-colors flex items-center justify-center gap-2"
                            >
                                <Video size={18} />
                                Start Render
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    )
}
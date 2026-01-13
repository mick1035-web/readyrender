'use client'

import { useStore } from '@/store/useStore'
import { Loader2, Sparkles } from 'lucide-react'

export default function AiGeneratingOverlay() {
    const isGeneratingEnv = useStore(s => s.isGeneratingEnv)

    if (!isGeneratingEnv) return null

    return (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center">
            <div className="bg-zinc-900/95 border border-zinc-800 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-center gap-3 mb-6">
                    <div className="relative">
                        <Sparkles className="w-8 h-8 text-purple-500 animate-pulse" />
                        <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full animate-pulse" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Generating Environment</h2>
                </div>

                {/* Loading Animation */}
                <div className="flex flex-col items-center gap-6 mb-6">
                    <div className="relative w-24 h-24">
                        <Loader2 className="w-24 h-24 text-purple-500 animate-spin" />
                        <div className="absolute inset-0 bg-purple-500/10 blur-2xl rounded-full animate-pulse" />
                    </div>

                    {/* Progress Steps */}
                    <div className="w-full space-y-3">
                        <div className="flex items-center gap-3 text-sm">
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                            <span className="text-zinc-300">Processing your prompt...</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <div className="w-2 h-2 bg-purple-500/50 rounded-full animate-pulse delay-150" />
                            <span className="text-zinc-400">Generating 360° panorama...</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <div className="w-2 h-2 bg-purple-500/30 rounded-full animate-pulse delay-300" />
                            <span className="text-zinc-500">Applying to scene...</span>
                        </div>
                    </div>
                </div>

                {/* Info */}
                <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                    <p className="text-sm text-zinc-400 text-center">
                        ⏱️ This usually takes <span className="text-white font-semibold">~30 seconds</span>
                    </p>
                    <p className="text-xs text-zinc-500 text-center mt-2">
                        Please wait while we create your custom environment
                    </p>
                </div>
            </div>
        </div>
    )
}

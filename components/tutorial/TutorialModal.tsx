'use client'

import { useStore } from '@/store/useStore'
import { X, Check } from 'lucide-react'

export default function TutorialModal() {
    const activeTip = useStore(s => s.tutorial.activeTip)
    const dismissTip = useStore(s => s.dismissTip)
    const disableTutorial = useStore(s => s.disableTutorial)

    if (!activeTip) return null

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99998] transition-opacity duration-300"
                onClick={dismissTip}
            />

            {/* Modal */}
            <div className="fixed inset-0 flex items-center justify-center z-[99999] p-4 pointer-events-none">
                <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col pointer-events-auto transform animate-in fade-in zoom-in duration-300">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-zinc-700/50">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                Tip
                            </div>
                            <span className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Tutorial Tip</span>
                        </div>
                        <button
                            onClick={dismissTip}
                            className="text-zinc-400 hover:text-white transition-colors p-2 hover:bg-zinc-800 rounded-lg"
                            aria-label="Close Tip"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <h2 className="text-2xl font-bold text-white mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            {activeTip.title}
                        </h2>

                        <div className="text-base text-zinc-300 leading-relaxed whitespace-pre-line mb-6">
                            {activeTip.content}
                        </div>

                        {activeTip.tip && (
                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-2">
                                <div className="flex items-start gap-3">
                                    <div className="text-blue-400 text-xs font-bold flex-shrink-0">PRO</div>
                                    <div>
                                        <div className="text-xs font-bold text-blue-300 uppercase mb-1">Pro Tip</div>
                                        <div className="text-sm text-zinc-300">{activeTip.tip}</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between p-6 pt-2 border-t border-zinc-700/50 bg-zinc-900/50">
                        <button
                            onClick={disableTutorial}
                            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors underline underline-offset-4"
                        >
                            Don't show tips anymore
                        </button>

                        <button
                            onClick={dismissTip}
                            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                        >
                            <Check size={18} />
                            Got it!
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

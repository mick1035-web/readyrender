'use client'

import { AlertTriangle } from 'lucide-react'

interface AiGenerateConfirmDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    prompt: string
    cost: number
    balance: number
}

export default function AiGenerateConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    prompt,
    cost,
    balance
}: AiGenerateConfirmDialogProps) {
    if (!isOpen) return null

    const hasEnoughCredits = balance >= cost

    return (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6 max-w-md mx-4 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 bg-yellow-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <AlertTriangle size={20} className="text-yellow-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white mb-1">
                            Generate AI HDRI?
                        </h3>
                        <p className="text-sm text-zinc-400 mb-3">
                            This will consume <strong className="text-white">{cost} credits</strong> from your account.
                        </p>

                        {/* Prompt Preview */}
                        <div className="p-3 bg-zinc-900 rounded border border-zinc-700 mb-3">
                            <div className="text-xs text-zinc-500 mb-1">Your prompt:</div>
                            <div className="text-sm text-zinc-200 italic">"{prompt}"</div>
                        </div>

                        <p className="text-zinc-300 mb-4">
                            Generate a custom 360° HDRI environment using AI.
                        </p>
                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4">
                            <p className="text-sm text-yellow-200">
                                <strong>Generation takes approximately 30 seconds.</strong>
                            </p>
                            <p className="text-xs text-yellow-300/80 mt-1">
                                Please wait while we create your custom environment.
                            </p>
                        </div>
                        <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 mb-4">
                            <p className="text-sm text-zinc-400">
                                Cost: <span className="text-white font-semibold">{cost} credits</span>
                            </p>
                            <p className="text-xs text-zinc-500 mt-1">
                                Credits will be deducted only after successful generation.
                            </p>
                        </div>

                        {/* Credits Info */}
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-zinc-400">Current balance:</span>
                            <span className="text-white font-semibold">{balance.toLocaleString()} credits</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-zinc-400">After generation:</span>
                            <span className={`font-semibold ${hasEnoughCredits ? 'text-green-400' : 'text-red-400'}`}>
                                {(balance - cost).toLocaleString()} credits
                            </span>
                        </div>

                        {!hasEnoughCredits && (
                            <div className="mt-3 p-2 bg-red-900/20 border border-red-700/30 rounded text-xs text-red-200">
                                Insufficient credits! You need {cost - balance} more credits.
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex gap-2 justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded text-sm font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={!hasEnoughCredits}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-purple-600"
                    >
                        Generate
                    </button>
                </div>
            </div>
        </div>
    )
}

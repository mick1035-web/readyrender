'use client'

import { X } from 'lucide-react'
import { calculateExportCost, getExportCostBreakdown } from '@/constants/export-costs'

interface ExportConfirmDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    duration: number // in seconds
    quality: '720p' | '1080p' | '4k'
    currentCredits: number
}

export default function ExportConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    duration,
    quality,
    currentCredits
}: ExportConfirmDialogProps) {
    if (!isOpen) return null

    const breakdown = getExportCostBreakdown(duration, quality)
    const hasEnoughCredits = currentCredits >= breakdown.totalCost
    const remainingCredits = currentCredits - breakdown.totalCost

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Dialog */}
            <div className="relative bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                    <h2 className="text-xl font-bold text-white">Confirm Video Export</h2>
                    <button
                        onClick={onClose}
                        className="text-zinc-400 hover:text-white transition-colors p-1"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Video Info */}
                    <div className="bg-zinc-800/50 rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-zinc-400">Duration:</span>
                            <span className="text-white font-semibold">{duration.toFixed(1)}s</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-zinc-400">Quality:</span>
                            <span className="text-white font-semibold">{quality.toUpperCase()}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-zinc-400">Segments:</span>
                            <span className="text-white font-semibold">
                                {breakdown.segments} × {breakdown.costPerSegment} credits
                            </span>
                        </div>
                    </div>

                    {/* Cost Breakdown */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                            <span className="text-blue-300 font-medium">Export Cost:</span>
                            <span className="text-white text-lg font-bold">
                                {breakdown.totalCost} credits
                            </span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <span className="text-zinc-400">Current Balance:</span>
                            <span className="text-white font-semibold">
                                {currentCredits.toLocaleString()} credits
                            </span>
                        </div>

                        {hasEnoughCredits ? (
                            <div className="flex items-center justify-between text-sm p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                                <span className="text-green-300">After Export:</span>
                                <span className="text-green-400 font-semibold">
                                    {remainingCredits.toLocaleString()} credits
                                </span>
                            </div>
                        ) : (
                            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                                <p className="text-red-400 text-sm font-medium">
                                    Insufficient credits! You need {breakdown.totalCost - currentCredits} more credits.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Info Note */}
                    <div className="text-xs text-zinc-500 bg-zinc-800/30 p-3 rounded-lg">
                        <p className="mb-1">
                            <strong className="text-zinc-400">Pricing:</strong>
                        </p>
                        <ul className="space-y-0.5 ml-4 list-disc">
                            <li>720p: 10 credits per 10 seconds</li>
                            <li>1080p: 15 credits per 10 seconds</li>
                            <li>4K: 30 credits per 10 seconds</li>
                        </ul>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center gap-3 p-6 border-t border-zinc-800 bg-zinc-900/50">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 bg-zinc-800 text-white font-medium rounded-lg hover:bg-zinc-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            if (hasEnoughCredits) {
                                onConfirm()
                                onClose()
                            }
                        }}
                        disabled={!hasEnoughCredits}
                        className={`flex-1 px-4 py-2.5 font-bold rounded-lg transition-all ${hasEnoughCredits
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:shadow-lg'
                            : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                            }`}
                    >
                        {hasEnoughCredits ? 'Confirm Export' : 'Insufficient Credits'}
                    </button>
                </div>
            </div>
        </div>
    )
}

'use client'

import { X, Check, Zap } from 'lucide-react'
import { PLANS, PlanTier } from '@/constants/plans'
import { useRouter } from 'next/navigation'

interface UpgradeDialogProps {
    isOpen: boolean
    onClose: () => void
    currentTier: PlanTier
    feature: string
    requiredTier?: 'PRO' | 'ULTRA'
}

export default function UpgradeDialog({
    isOpen,
    onClose,
    currentTier,
    feature,
    requiredTier = 'PRO'
}: UpgradeDialogProps) {
    const router = useRouter()
    const targetPlan = PLANS[requiredTier]

    if (!isOpen) return null

    const handleUpgrade = () => {
        router.push('/pricing')
        onClose()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Dialog */}
            <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full shadow-2xl">
                {/* Header */}
                <div className="relative p-6 border-b border-zinc-800">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <Zap size={20} className="text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Upgrade Required</h2>
                    </div>
                    <p className="text-zinc-400">
                        Unlock <span className="text-white font-semibold">{feature}</span> with {targetPlan.name}
                    </p>

                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 text-zinc-400 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Current Plan */}
                    <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                        <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Current Plan</div>
                        <div className="text-lg font-semibold text-white">{PLANS[currentTier].name}</div>
                    </div>

                    {/* Target Plan Benefits */}
                    <div>
                        <div className="text-sm font-semibold text-zinc-400 mb-3">
                            What you'll get with {targetPlan.name}:
                        </div>
                        <div className="space-y-2">
                            {targetPlan.featureList.map((feature, index) => (
                                <div key={index} className="flex items-start gap-2">
                                    <Check size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-zinc-300">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-4">
                        <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-3xl font-bold text-white">
                                ${targetPlan.monthlyPrice}
                            </span>
                            <span className="text-zinc-400">/month</span>
                        </div>
                        <div className="text-sm text-zinc-400">
                            or ${targetPlan.yearlyPrice}/year (save {Math.round((1 - targetPlan.yearlyPrice / (targetPlan.monthlyPrice * 12)) * 100)}%)
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="p-6 border-t border-zinc-800 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 bg-zinc-800 text-white font-medium rounded-lg hover:bg-zinc-700 transition-colors"
                    >
                        Maybe Later
                    </button>
                    <button
                        onClick={handleUpgrade}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                    >
                        Upgrade Now
                    </button>
                </div>
            </div>
        </div>
    )
}

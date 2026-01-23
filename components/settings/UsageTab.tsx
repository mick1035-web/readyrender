'use client'

import { useStore } from '@/store/useStore'
import { PLANS } from '@/constants/plans'
import { Zap, HardDrive, AlertCircle } from 'lucide-react'

export default function UsageTab() {
    const subscription = useStore(s => s.subscription)
    const currentPlan = PLANS[subscription.userTier]

    // Credits Calculation
    const totalCredits = subscription.subscriptionCredits + subscription.purchasedCredits
    // For free plan, maybe show a limit if relevant, or just show balance.
    // Let's show specific breakdown.

    // Storage Calculation (Mocked for MVP as per plan)
    const storageUsed = 0 // In MB
    const storageLimit = currentPlan.id === 'FREE' ? 1024 : 10240 // 1GB vs 10GB example limits
    const storagePercent = Math.min(100, (storageUsed / storageLimit) * 100)

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-xl font-bold text-white mb-2">Usage & Billing</h2>
                <p className="text-zinc-400 text-sm">Monitor your resource usage and subscription plan.</p>
            </div>

            {/* Current Plan Card */}
            <div className="p-6 bg-gradient-to-br from-zinc-900 to-zinc-900 border border-zinc-800 rounded-xl relative overflow-hidden group">
                <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${currentPlan.id === 'FREE' ? 'text-zinc-500' : 'text-blue-500'
                    }`}>
                    <Zap size={120} />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2 text-zinc-300">
                        <h3 className="text-sm font-semibold uppercase tracking-wider">Current Plan</h3>
                        <span className={`px-2 py-0.5 text-xs font-bold rounded border ${currentPlan.id === 'FREE'
                            ? 'bg-zinc-800 text-zinc-400 border-zinc-700'
                            : currentPlan.id === 'PRO'
                                ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                                : 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                            }`}>
                            {currentPlan.name}
                        </span>
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-white">{currentPlan.monthlyPrice === 0 ? 'Free' : `$${currentPlan.monthlyPrice}`}</span>
                        <span className="text-sm text-zinc-500 mb-1">/ month</span>
                    </div>
                </div>
            </div>

            {/* Credits Usage */}
            <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl space-y-6">
                <div className="flex items-center gap-2 text-zinc-300">
                    <h3 className="text-sm font-semibold uppercase tracking-wider">Credits Balance</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800/50">
                        <span className="text-xs text-zinc-500 block mb-1">Subscription Credits Left</span>
                        <span className="text-2xl font-bold text-white">{subscription.subscriptionCredits}</span>
                    </div>
                    <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800/50">
                        <span className="text-xs text-zinc-500 block mb-1">Purchased Credits Left</span>
                        <span className="text-2xl font-bold text-white">{subscription.purchasedCredits}</span>
                    </div>
                </div>

                <div className="flex items-start gap-2 text-xs text-zinc-500 bg-zinc-950/30 p-3 rounded-lg">
                    <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                    <p>Credits are used for 3Dvideo generation and AI HDRI environment generation.</p>
                </div>
            </div>

            {/* Storage Usage */}
            <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-zinc-300">
                        <h3 className="text-sm font-semibold uppercase tracking-wider">Storage Usage</h3>
                    </div>
                    <span className="text-xs text-zinc-400">
                        {storageUsed} MB / {storageLimit} MB
                    </span>
                </div>

                <div className="space-y-2">
                    <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden">
                        <div
                            className="bg-blue-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${storagePercent}%` }}
                        />
                    </div>
                    <p className="text-xs text-right text-zinc-500">
                        {storagePercent.toFixed(1)}% used
                    </p>
                </div>
            </div>
        </div>
    )
}

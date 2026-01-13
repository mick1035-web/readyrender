'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Zap, Crown } from 'lucide-react'
import Header from '@/components/common/Header'
import Button from '@/components/ui/Button'
import { PLANS, getYearlySavings, getSavingsPercentage, PlanTier } from '@/constants/plans'
import { useStore } from '@/store/useStore'

export default function PricingPage() {
    const router = useRouter()
    const [isYearly, setIsYearly] = useState(false)
    const subscription = useStore(s => s.subscription)

    const handleSubscribe = async (planId: PlanTier, yearly: boolean) => {
        if (planId === 'FREE') {
            // Free plan - redirect to dashboard
            router.push('/dashboard')
            return
        }

        // TODO: Implement Stripe checkout
        // const response = await fetch('/api/create-checkout-session', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({
        //         priceId: yearly ? PLANS[planId].stripePriceId_yearly : PLANS[planId].stripePriceId_monthly,
        //         planId,
        //         isYearly: yearly
        //     })
        // })
        // const { url } = await response.json()
        // window.location.href = url

        alert(`Stripe integration coming soon!\nPlan: ${PLANS[planId].name}\nBilling: ${yearly ? 'Yearly' : 'Monthly'}`)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-black to-zinc-900 text-white">
            <Header />

            <main className="container mx-auto px-12 py-24">
                {/* Header Section */}
                <div className="text-center mb-16">
                    <h1 className="text-5xl md:text-6xl font-bold mb-4">
                        Choose Your Plan
                    </h1>
                    <p className="text-xl text-zinc-400 mb-8">
                        Start creating professional 3D videos today
                    </p>

                    {/* Billing Toggle */}
                    <div className="inline-flex items-center gap-4 bg-white/5 rounded-full p-2 border border-white/10">
                        <button
                            onClick={() => setIsYearly(false)}
                            className={`px-6 py-2 rounded-full transition-all ${!isYearly
                                ? 'bg-white text-black font-semibold'
                                : 'text-zinc-400 hover:text-white'
                                }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setIsYearly(true)}
                            className={`px-6 py-2 rounded-full transition-all ${isYearly
                                ? 'bg-white text-black font-semibold'
                                : 'text-zinc-400 hover:text-white'
                                }`}
                        >
                            Yearly
                            <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                                Save {getSavingsPercentage('PRO')}%
                            </span>
                        </button>
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {(['FREE', 'PRO', 'ULTRA'] as PlanTier[]).map((tier) => {
                        const plan = PLANS[tier]
                        const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice
                        const displayPrice = isYearly && tier !== 'FREE'
                            ? (plan.yearlyPrice / 12).toFixed(2)
                            : price

                        // Check if this is the user's current plan
                        const isCurrentPlan = subscription.userTier === tier
                        // Only show "Most Popular" badge if user is on FREE plan (not subscribed to paid plan)
                        const showPopularBadge = plan.popular && subscription.userTier === 'FREE'

                        return (
                            <div
                                key={tier}
                                className={`relative bg-white/5 rounded-3xl p-8 border ${isCurrentPlan
                                    ? 'border-green-500 scale-105 shadow-2xl shadow-green-500/20'
                                    : showPopularBadge
                                        ? 'border-blue-500 scale-105 shadow-2xl shadow-blue-500/20'
                                        : 'border-white/10'
                                    }`}
                            >
                                {/* Badge - Current Plan or Most Popular (mutually exclusive) */}
                                {isCurrentPlan ? (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                                            <Crown size={14} />
                                            Current Plan
                                        </div>
                                    </div>
                                ) : showPopularBadge && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                                            <Zap size={14} />
                                            Most Popular
                                        </div>
                                    </div>
                                )}

                                {/* Plan Header */}
                                <div className="mb-6">
                                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                                    <p className="text-zinc-400 text-sm">{plan.description}</p>
                                </div>

                                {/* Price */}
                                <div className="mb-6">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-5xl font-bold">
                                            ${displayPrice}
                                        </span>
                                        {tier !== 'FREE' && (
                                            <span className="text-zinc-400">
                                                /month
                                            </span>
                                        )}
                                    </div>
                                    {isYearly && tier !== 'FREE' && (
                                        <p className="text-sm text-green-400 mt-2">
                                            Save ${getYearlySavings(tier)} per year
                                        </p>
                                    )}
                                </div>

                                {/* CTA Button */}
                                <Button
                                    onClick={() => handleSubscribe(tier, isYearly)}
                                    variant={
                                        isCurrentPlan
                                            ? 'secondary'
                                            : showPopularBadge
                                                ? 'primary'
                                                : 'secondary'
                                    }
                                    className="w-full mb-6"
                                    size="lg"
                                    disabled={isCurrentPlan}
                                >
                                    {isCurrentPlan ? 'Current Plan' : tier === 'FREE' ? 'Start for Free' : 'Subscribe'}
                                </Button>

                                {/* Features List */}
                                <div className="space-y-3">
                                    {plan.featureList.map((feature, index) => (
                                        <div key={index} className="flex items-start gap-3">
                                            <Check size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
                                            <span className="text-sm text-zinc-300">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* FAQ or Additional Info */}
                <div className="mt-20 text-center">
                    <p className="text-zinc-400">
                        All plans include access to our core 3D video generation features.
                        <br />
                        Credits reset monthly and do not roll over.
                    </p>
                </div>
            </main>
        </div>
    )
}

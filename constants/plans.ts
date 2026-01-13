export type PlanTier = 'FREE' | 'PRO' | 'ULTRA'

export interface PlanFeatures {
    credits: number
    maxProjects: number
    maxResolution: '720p' | '1080p' | '4K'
    hasWatermark: boolean
    allowHdriGen: boolean
    allowPremiumTemplates: boolean
    maxCustomHdris: number
}

export interface Plan {
    id: PlanTier
    name: string
    description: string
    monthlyPrice: number
    yearlyPrice: number
    features: PlanFeatures
    stripePriceId_monthly?: string
    stripePriceId_yearly?: string
    popular?: boolean
    featureList: string[]
}

export const PLANS: Record<PlanTier, Plan> = {
    FREE: {
        id: 'FREE',
        name: 'Free Trial',
        description: 'Perfect for trying out ReadyRender',
        monthlyPrice: 0,
        yearlyPrice: 0,
        features: {
            credits: 200,
            maxProjects: 1,
            maxResolution: '720p',
            hasWatermark: true,
            allowHdriGen: false,
            allowPremiumTemplates: false,
            maxCustomHdris: 1
        },
        featureList: [
            '200 credits per month',
            '1 project maximum',
            '720p resolution',
            'Watermark on exports',
            'Basic templates only'
        ]
    },
    PRO: {
        id: 'PRO',
        name: 'Pro Creator',
        description: 'For professional content creators',
        monthlyPrice: 9.90,
        yearlyPrice: 90,
        popular: true,
        features: {
            credits: 2000,
            maxProjects: 12,
            maxResolution: '4K',
            hasWatermark: false,
            allowHdriGen: true,
            allowPremiumTemplates: true,
            maxCustomHdris: 10
        },
        stripePriceId_monthly: 'price_pro_monthly', // Replace with actual Stripe Price ID
        stripePriceId_yearly: 'price_pro_yearly',   // Replace with actual Stripe Price ID
        featureList: [
            '2,000 credits per month',
            '12 projects maximum',
            'Up to 4K resolution',
            'No watermark',
            'AI HDRI generation',
            'Premium templates access'
        ]
    },
    ULTRA: {
        id: 'ULTRA',
        name: 'Ultra',
        description: 'For power users and teams',
        monthlyPrice: 25,
        yearlyPrice: 260,
        features: {
            credits: 6000,
            maxProjects: 50,
            maxResolution: '4K',
            hasWatermark: false,
            allowHdriGen: true,
            allowPremiumTemplates: true,
            maxCustomHdris: Infinity
        },
        stripePriceId_monthly: 'price_ultra_monthly', // Replace with actual Stripe Price ID
        stripePriceId_yearly: 'price_ultra_yearly',   // Replace with actual Stripe Price ID
        featureList: [
            '6,000 credits per month',
            '50 projects maximum',
            'Up to 4K resolution',
            'No watermark',
            'AI HDRI generation',
            'Premium templates access',
            'Priority support'
        ]
    }
}

// Helper function to get plan by tier
export function getPlan(tier: PlanTier): Plan {
    return PLANS[tier]
}

// Helper function to calculate yearly savings
export function getYearlySavings(tier: PlanTier): number {
    const plan = PLANS[tier]
    const monthlyTotal = plan.monthlyPrice * 12
    const yearlySavings = monthlyTotal - plan.yearlyPrice
    return Math.round(yearlySavings * 100) / 100
}

// Helper function to get savings percentage
export function getSavingsPercentage(tier: PlanTier): number {
    const plan = PLANS[tier]
    if (plan.monthlyPrice === 0) return 0
    const monthlyTotal = plan.monthlyPrice * 12
    const savings = monthlyTotal - plan.yearlyPrice
    return Math.round((savings / monthlyTotal) * 100)
}

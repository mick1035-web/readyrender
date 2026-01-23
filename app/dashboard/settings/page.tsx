'use client'

import { useState } from 'react'
import { User, CreditCard, Shield, Lock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import ProfileTab from '@/components/settings/ProfileTab'
import UsageTab from '@/components/settings/UsageTab'
import SecurityTab from '@/components/settings/SecurityTab'

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<'profile' | 'usage' | 'security'>('profile')

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User, disabled: false },
        { id: 'usage', label: 'Usage & Billing', icon: CreditCard, disabled: false },
        { id: 'security', label: 'Security', icon: Shield, disabled: false },
    ] as const

    return (
        <div className="flex h-screen bg-black overflow-hidden">
            {/* Settings Sidebar */}
            <div className="w-64 border-r border-zinc-800 bg-zinc-900/50 p-6 flex flex-col">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6 group"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Dashboard
                </Link>
                <h1 className="text-2xl font-bold text-white mb-8">Settings</h1>

                <nav className="space-y-2">
                    {tabs.map((tab) => {
                        const Icon = tab.icon
                        return (
                            <button
                                key={tab.id}
                                onClick={() => !tab.disabled && setActiveTab(tab.id as any)}
                                disabled={tab.disabled}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
                                    ? 'bg-blue-600 text-white'
                                    : tab.disabled
                                        ? 'text-zinc-600 cursor-not-allowed justify-between'
                                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon size={18} />
                                    {tab.label}
                                </div>
                                {tab.disabled && <Lock size={14} />}
                            </button>
                        )
                    })}
                </nav>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-8 lg:p-12 max-w-4xl">
                {activeTab === 'profile' && <ProfileTab />}
                {activeTab === 'usage' && <UsageTab />}
                {activeTab === 'security' && <SecurityTab />}
            </div>
        </div>
    )
}

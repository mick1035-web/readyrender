'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useStore } from '@/store/useStore'
import { User, Settings, LogOut, Crown, FolderOpen, ChevronDown, CreditCard } from 'lucide-react'
import { PLANS } from '@/constants/plans'

export default function UserAccountMenu() {
    const { user, logout, signInWithGoogle } = useAuth()
    const [isOpen, setIsOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)
    const router = useRouter()
    const subscription = useStore(s => s.subscription)
    const totalCredits = subscription.subscriptionCredits + subscription.purchasedCredits

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen])

    // If not logged in, show sign-in button
    if (!user) {
        return (
            <button
                onClick={signInWithGoogle}
                className="px-6 py-2.5 bg-white text-black rounded-full font-semibold hover:bg-zinc-100 transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
                Sign In
            </button>
        )
    }

    const handleSignOut = async () => {
        await logout()
        setIsOpen(false)
    }

    const handleMyProjects = () => {
        setIsOpen(false)
        router.push('/dashboard')
    }

    const handlePricing = () => {
        setIsOpen(false)
        router.push('/pricing')
    }

    // Get user initials for avatar
    const getInitials = () => {
        if (user.displayName) {
            return user.displayName
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)
        }
        return user.email?.[0]?.toUpperCase() || 'U'
    }

    const currentPlan = PLANS[subscription.userTier]

    return (
        <div className="relative" ref={menuRef}>
            {/* Avatar Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 transition-all group"
            >
                {user.photoURL ? (
                    <Image
                        src={user.photoURL}
                        alt={user.displayName || 'User'}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full"
                    />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                        {getInitials()}
                    </div>
                )}
                <ChevronDown
                    size={16}
                    className={`text-white/70 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up z-[110]">
                    {/* User Info Section */}
                    <div className="p-5 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            {user.photoURL ? (
                                <Image
                                    src={user.photoURL}
                                    alt={user.displayName || 'User'}
                                    width={48}
                                    height={48}
                                    className="w-12 h-12 rounded-full ring-2 ring-white/10"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-lg font-semibold ring-2 ring-white/10">
                                    {getInitials()}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-semibold truncate text-base">
                                    {user.displayName || 'User'}
                                </p>
                                <p className="text-zinc-400 text-sm truncate">{user.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Subscription Plan */}
                    <div className="p-5 border-b border-white/10 bg-white/[0.02]">
                        <button
                            onClick={handlePricing}
                            className="w-full text-left hover:bg-white/5 rounded-xl p-3 -m-3 transition-all group"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-zinc-400 text-sm font-medium">Current Plan</span>
                                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${subscription.userTier === 'FREE'
                                    ? 'bg-zinc-800 border border-zinc-700'
                                    : subscription.userTier === 'PRO'
                                        ? 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-500/40'
                                        : 'bg-gradient-to-r from-purple-500/20 to-purple-600/20 border border-purple-500/40'
                                    }`}>
                                    <Crown size={14} className={
                                        subscription.userTier === 'FREE'
                                            ? 'text-zinc-500'
                                            : subscription.userTier === 'PRO'
                                                ? 'text-blue-400'
                                                : 'text-purple-400'
                                    } />
                                    <span className={`text-sm font-semibold ${subscription.userTier === 'FREE'
                                        ? 'text-zinc-400'
                                        : subscription.userTier === 'PRO'
                                            ? 'text-blue-400'
                                            : 'text-purple-400'
                                        }`}>
                                        {currentPlan.name}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <CreditCard size={14} className="text-zinc-500" />
                                    <span className="text-xs text-zinc-500">
                                        {totalCredits.toLocaleString()} credits
                                    </span>
                                </div>
                                <span className="text-xs text-zinc-600 group-hover:text-zinc-500 transition-colors">
                                    View Plans →
                                </span>
                            </div>
                        </button>
                        {subscription.userTier === 'FREE' && (
                            <button
                                onClick={handlePricing}
                                className="w-full mt-3 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium text-sm hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/20"
                            >
                                Upgrade to Pro
                            </button>
                        )}
                    </div>

                    {/* Menu Items */}
                    <div className="p-2">
                        <button
                            onClick={handleMyProjects}
                            className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 rounded-xl transition-colors group"
                        >
                            <FolderOpen size={18} className="text-zinc-400 group-hover:text-white transition-colors" />
                            <span className="font-medium">My Projects</span>
                        </button>

                        <button
                            onClick={() => {
                                setIsOpen(false)
                                // Add settings navigation here
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 rounded-xl transition-colors group"
                        >
                            <Settings size={18} className="text-zinc-400 group-hover:text-white transition-colors" />
                            <span className="font-medium">Account Settings</span>
                        </button>
                    </div>

                    {/* Sign Out */}
                    <div className="p-2 border-t border-white/10">
                        <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors group"
                        >
                            <LogOut size={18} />
                            <span className="font-medium">Sign Out</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

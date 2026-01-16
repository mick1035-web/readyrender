'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { Video, Home, FolderOpen } from 'lucide-react'
import UserAccountMenu from '@/components/landing/UserAccountMenu'
import Button from '@/components/ui/Button'

import Image from 'next/image'

export default function Header() {
    const { user, signInWithGoogle } = useAuth()
    const router = useRouter()
    const pathname = usePathname()

    const isActive = (path: string) => pathname === path

    return (
        <header className="sticky top-0 z-50 bg-zinc-900/80 backdrop-blur-xl border-b border-white/10">
            <div className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <button
                        onClick={() => router.push('/')}
                        className="flex items-center gap-3 group"
                    >
                        <div className="w-10 h-10 relative flex items-center justify-center transition-transform hover:scale-105">
                            <Image
                                src="/logo.png"
                                alt="ReadyRender Logo"
                                width={120}
                                height={120}
                                className="object-contain max-w-none"
                                priority
                            />
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-white">
                            ReadyRender
                        </span>
                    </button>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center gap-6">
                        {user && (
                            <>
                                <button
                                    onClick={() => router.push('/')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isActive('/')
                                        ? 'bg-white/10 text-white'
                                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <Home size={18} />
                                    <span>Home</span>
                                </button>

                                <button
                                    onClick={() => router.push('/dashboard')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isActive('/dashboard')
                                        ? 'bg-white/10 text-white'
                                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <FolderOpen size={18} />
                                    <span>My Projects</span>
                                </button>

                                <button
                                    onClick={() => router.push('/pricing')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isActive('/pricing')
                                        ? 'bg-white/10 text-white'
                                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <span>Pricing</span>
                                </button>
                            </>
                        )}
                    </nav>

                    {/* Right Side */}
                    <div className="flex items-center gap-4">
                        {user ? (
                            <UserAccountMenu />
                        ) : (
                            <Button onClick={signInWithGoogle} size="sm">
                                Sign In
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}

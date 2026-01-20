import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '@/contexts/AuthContext'
import { X, Facebook, Mail, Loader2, ArrowRight, Eye, EyeOff, ChevronLeft, Twitter } from 'lucide-react'
import Image from 'next/image'

interface Props {
    isOpen: boolean
    onClose: () => void
}

type AuthMode = 'signin' | 'signup' | 'forgot-password'

export default function LoginModal({ isOpen, onClose }: Props) {
    const { signInWithGoogle, signInWithFacebook, signInWithTwitter, signInWithEmail, signUpWithEmail, resetPassword } = useAuth()
    const [mode, setMode] = useState<AuthMode>('signin')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        return () => setMounted(false)
    }, [])

    useEffect(() => {
        if (!isOpen) {
            // Reset state when closed
            setMode('signin')
            setEmail('')
            setPassword('')
            setName('')
            setShowPassword(false)
            setIsLoading(false)
        }
    }, [isOpen])

    if (!isOpen) return null
    if (!mounted) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) return

        if (mode !== 'forgot-password' && !password) return

        setIsLoading(true)
        try {
            if (mode === 'signup') {
                await signUpWithEmail(email, password, name)
            } else if (mode === 'signin') {
                await signInWithEmail(email, password)
                onClose()
            } else if (mode === 'forgot-password') {
                await resetPassword(email)
                setMode('signin') // Go back to sign in after sending reset email
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const toggleMode = () => {
        setMode(prev => prev === 'signin' ? 'signup' : 'signin')
        setEmail('')
        setPassword('')
        setName('')
    }

    const handleSocialLogin = async (provider: 'google' | 'facebook' | 'twitter') => {
        setIsLoading(true)
        try {
            if (provider === 'google') {
                await signInWithGoogle()
            } else if (provider === 'twitter') {
                await signInWithTwitter()
            } else {
                await signInWithFacebook()
            }
            onClose()
        } catch (error) {
            console.error(`${provider} login error:`, error)
        } finally {
            setIsLoading(false)
        }
    }

    const getTitle = () => {
        switch (mode) {
            case 'signin': return 'Sign In'
            case 'signup': return 'Create Account'
            case 'forgot-password': return 'Reset Password'
        }
    }

    const getSubtitle = () => {
        switch (mode) {
            case 'signin': return 'Welcome back to ReadyRender'
            case 'signup': return 'Get started for free'
            case 'forgot-password': return "Enter your email and we'll send you a reset link"
        }
    }

    // Portal content to document.body to avoid CSS stacking context issues in Header
    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
            <div
                className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden m-4"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white mb-1">
                            {getTitle()}
                        </h2>
                        <p className="text-sm text-zinc-400">
                            {getSubtitle()}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-zinc-500 hover:text-white transition-colors disabled:opacity-50"
                        disabled={isLoading}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">

                    {/* Email Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Name Field - Only for SignUp */}
                        {mode === 'signup' && (
                            <div className="space-y-2">
                                <label className="text-xs text-zinc-400 font-medium ml-1">Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your Name"
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs text-zinc-400 font-medium ml-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50"
                                required
                                disabled={isLoading}
                            />
                        </div>

                        {mode !== 'forgot-password' && (
                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-xs text-zinc-400 font-medium">Password</label>
                                    {mode === 'signin' && (
                                        <button
                                            type="button"
                                            onClick={() => setMode('forgot-password')}
                                            className="text-xs text-blue-400 hover:text-blue-300 hover:underline disabled:opacity-50"
                                            disabled={isLoading}
                                        >
                                            Forgot Password?
                                        </button>
                                    )}
                                </div>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50 pr-10"
                                        required
                                        minLength={6}
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-300 transition-colors disabled:opacity-50"
                                        disabled={isLoading}
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                <>
                                    {mode === 'signin' && 'Sign In'}
                                    {mode === 'signup' && 'Sign Up'}
                                    {mode === 'forgot-password' && 'Send Reset Link'}
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    {mode !== 'forgot-password' && (
                        <>
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-zinc-800"></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-zinc-900 px-2 text-zinc-500">Or continue with</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                {/* Google Button */}
                                <button
                                    onClick={() => handleSocialLogin('google')}
                                    type="button"
                                    disabled={isLoading}
                                    className="flex items-center justify-center gap-2 px-2 py-2 bg-white text-black hover:bg-zinc-100 font-medium rounded-lg transition-all active:scale-[0.98] text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <Loader2 size={16} className="animate-spin text-black" />
                                    ) : (
                                        <>
                                            <Image
                                                src="https://www.google.com/favicon.ico"
                                                alt="Google"
                                                width={18}
                                                height={18}
                                            />
                                            <span className="hidden sm:inline">Google</span>
                                        </>
                                    )}
                                </button>

                                {/* Facebook Button */}
                                <button
                                    onClick={() => handleSocialLogin('facebook')}
                                    type="button"
                                    disabled={true}
                                    className="flex items-center justify-center gap-2 px-2 py-2 bg-[#1877F2] hover:bg-[#166fe5] text-white font-medium rounded-lg transition-all active:scale-[0.98] text-sm opacity-50 cursor-not-allowed"
                                    title="Temporarily disabled"
                                >
                                    {isLoading ? (
                                        <Loader2 size={16} className="animate-spin text-white" />
                                    ) : (
                                        <>
                                            <Facebook size={18} fill="currentColor" />
                                            <span className="hidden sm:inline">Facebook</span>
                                        </>
                                    )}
                                </button>

                                {/* Twitter Button */}
                                <button
                                    onClick={() => handleSocialLogin('twitter')}
                                    type="button"
                                    disabled={isLoading}
                                    className="flex items-center justify-center gap-2 px-2 py-2 bg-black text-white border border-zinc-700 hover:bg-zinc-900 font-medium rounded-lg transition-all active:scale-[0.98] text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <Loader2 size={16} className="animate-spin text-white" />
                                    ) : (
                                        <>
                                            <Twitter size={18} fill="currentColor" />
                                            <span className="hidden sm:inline">Twitter</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Toggle Mode */}
                            <div className="text-center text-sm text-zinc-400 pt-2">
                                {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
                                <button
                                    onClick={toggleMode}
                                    disabled={isLoading}
                                    className="text-blue-400 hover:text-blue-300 font-medium hover:underline focus:outline-none disabled:opacity-50"
                                >
                                    {mode === 'signin' ? 'Sign up' : 'Sign in'}
                                </button>
                            </div>
                        </>
                    )}

                    {/* Back to Sign In (for Forgot Password mode) */}
                    {mode === 'forgot-password' && (
                        <div className="text-center">
                            <button
                                onClick={() => setMode('signin')}
                                disabled={isLoading}
                                className="flex items-center justify-center gap-1 mx-auto text-sm text-zinc-400 hover:text-white transition-colors"
                            >
                                <ChevronLeft size={16} />
                                Back to Sign In
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    )
}

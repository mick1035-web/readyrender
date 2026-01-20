'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, User, signInWithPopup, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from 'firebase/auth'
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore'
import { auth, googleProvider, facebookProvider, twitterProvider, db } from '@/lib/firebase'
import { useRouter } from 'next/navigation'
import { useStore } from '@/store/useStore'
import { PlanTier } from '@/constants/plans'
import { subscribeToUserHdris } from '@/lib/hdriService'
import { errorHandler } from '@/lib/errorHandler'
import { ErrorType } from '@/types/errors'
import * as Sentry from '@sentry/nextjs'
import { useToast } from '@/contexts/ToastContext'

interface AuthContextType {
    user: User | null
    loading: boolean
    signInWithGoogle: () => Promise<void>
    signInWithFacebook: () => Promise<void>
    signInWithTwitter: () => Promise<void>
    signInWithEmail: (email: string, password: string) => Promise<void>
    signUpWithEmail: (email: string, password: string, name?: string) => Promise<void>
    resetPassword: (email: string) => Promise<void>
    logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const { showToast } = useToast()

    // [FIX] 修正：使用正確的 action 名稱 'setCreditsData'
    const setUserTier = useStore(s => s.setUserTier)
    const setCreditsData = useStore(s => s.setCreditsData)

    useEffect(() => {
        let unsubscribeSnapshot: (() => void) | null = null
        let unsubscribeHdris: (() => void) | null = null

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser)

            // Set Sentry user context
            if (currentUser) {
                Sentry.setUser({
                    id: currentUser.uid,
                    email: currentUser.email || undefined,
                })
            } else {
                Sentry.setUser(null)
            }

            if (currentUser) {
                const userDocRef = doc(db, "users", currentUser.uid)

                // 1. 檢查資料是否存在，若無則建立預設 PRO 檔案 (BETA 測試期間)
                try {
                    const docSnap = await getDoc(userDocRef)
                    const isNewUser = !docSnap.exists()

                    if (isNewUser) {
                        // BETA 測試期間：所有新用戶預設為 PRO 方案
                        await setDoc(userDocRef, {
                            email: currentUser.email,
                            tier: 'PRO',
                            subscriptionCredits: 2000,
                            purchasedCredits: 0,
                            maxProjects: 12,
                            createdAt: new Date(),
                            uid: currentUser.uid,
                            isBetaTester: true, // 標記為測試用戶
                            displayName: currentUser.displayName || '' // Save initial display name
                        })

                        // Reset tutorial for new users
                        if (typeof window !== 'undefined') {
                            localStorage.removeItem('tutorial_completed')
                            localStorage.removeItem('tutorial_skipped')
                            localStorage.removeItem('tutorial_step')
                            localStorage.removeItem('tutorial_started')
                        }

                        // Display BETA testing notifications
                        setTimeout(() => {
                            showToast({
                                type: 'info',
                                message: '🎉 Welcome to ReadyRender BETA!',
                                duration: 8000
                            })

                            setTimeout(() => {
                                showToast({
                                    type: 'warning',
                                    message: '⚠️ Beta Testing Notice: All accounts and content will be deleted after the testing period. Please do not upload important data.',
                                    duration: 10000
                                })
                            }, 1000)
                        }, 2000)
                    }

                    // 2. 開啟即時監聽 (Real-time Listener) - User Profile
                    unsubscribeSnapshot = onSnapshot(userDocRef, (doc) => {
                        if (doc.exists()) {
                            const data = doc.data()
                            console.log("Synced user profile:", data)

                            // 更新等級
                            if (data.tier) {
                                setUserTier(data.tier as PlanTier)
                            }

                            // 更新點數：同時更新訂閱點數與加購點數
                            if (data.subscriptionCredits !== undefined) {
                                setCreditsData(
                                    data.subscriptionCredits,
                                    data.purchasedCredits || 0
                                )
                            }
                        }
                    }, (error) => {
                        // Ignore permission denied errors which happen on logout
                        if (error.code !== 'permission-denied') {
                            console.error("Error in user profile listener:", error)
                        }
                    })

                    // 3. 開啟即時監聽 - User HDRIs
                    unsubscribeHdris = subscribeToUserHdris(currentUser.uid, (hdris) => {
                        console.log("Synced user HDRIs:", hdris)
                        useStore.setState({ customHdris: hdris })
                    })
                } catch (error) {
                    console.error("Error fetching user profile:", error)

                    const errorMessage = error instanceof Error ? error.message : String(error)

                    if (errorMessage.includes('permission') || errorMessage.includes('denied')) {
                        errorHandler.handle(ErrorType.PERMISSION_DENIED)
                    } else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
                        errorHandler.handle(ErrorType.NETWORK_ERROR)
                    } else {
                        // Don't show error for initial profile load failures
                        console.error('User profile load failed:', errorMessage)
                    }
                }
            } else {
                // 用戶登出時，清理 snapshot 監聽
                if (unsubscribeSnapshot) {
                    unsubscribeSnapshot()
                    unsubscribeSnapshot = null
                }
                if (unsubscribeHdris) {
                    unsubscribeHdris()
                    unsubscribeHdris = null
                }
                // 清空 HDRIs
                useStore.setState({ customHdris: [] })
            }

            // 無論有無登入，檢查完畢後都設為 false
            setLoading(false)
        })

        return () => {
            unsubscribe()
            if (unsubscribeSnapshot) {
                unsubscribeSnapshot()
            }
            if (unsubscribeHdris) {
                unsubscribeHdris()
            }
        }
    }, [setUserTier, setCreditsData])

    const signInWithGoogle = async () => {
        try {
            await signInWithPopup(auth, googleProvider)
            router.push('/dashboard')
        } catch (error) {
            console.error("Login failed", error)

            const errorMessage = error instanceof Error ? error.message : String(error)

            // Check if user cancelled the popup
            if (errorMessage.includes('popup-closed') || errorMessage.includes('cancelled')) {
                errorHandler.warning('Login cancelled', 'Please try logging in again')
            } else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
                errorHandler.handle(ErrorType.NETWORK_ERROR)
            } else {
                errorHandler.handle(ErrorType.AUTH_FAILED, {
                    details: errorMessage
                })
            }
        }
    }

    const signInWithFacebook = async () => {
        try {
            await signInWithPopup(auth, facebookProvider)
            router.push('/dashboard')
        } catch (error) {
            console.error("Facebook Login failed", error)

            const errorMessage = error instanceof Error ? error.message : String(error)

            if (errorMessage.includes('account-exists-with-different-credential')) {
                errorHandler.handle(ErrorType.AUTH_FAILED, {
                    details: 'An account already exists with the same email address but different sign-in credentials. Sign in using a provider associated with this email address.'
                })
            } else if (errorMessage.includes('popup-closed') || errorMessage.includes('cancelled')) {
                errorHandler.warning('Login cancelled', 'Please try logging in again')
            } else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
                errorHandler.handle(ErrorType.NETWORK_ERROR)
            } else {
                errorHandler.handle(ErrorType.AUTH_FAILED, {
                    details: errorMessage
                })
            }
        }
    }

    const signInWithTwitter = async () => {
        try {
            await signInWithPopup(auth, twitterProvider)
            router.push('/dashboard')
        } catch (error) {
            console.error("Twitter Login failed", error)

            const errorMessage = error instanceof Error ? error.message : String(error)

            if (errorMessage.includes('account-exists-with-different-credential')) {
                errorHandler.handle(ErrorType.AUTH_FAILED, {
                    details: 'An account already exists with the same email. Please sign in with the original provider.'
                })
            } else if (errorMessage.includes('popup-closed') || errorMessage.includes('cancelled')) {
                errorHandler.warning('Login cancelled', 'Please try logging in again')
            } else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
                errorHandler.handle(ErrorType.NETWORK_ERROR)
            } else {
                errorHandler.handle(ErrorType.AUTH_FAILED, {
                    details: errorMessage
                })
            }
        }
    }

    const signInWithEmail = async (email: string, password: string) => {
        try {
            await signInWithEmailAndPassword(auth, email, password)
            router.push('/dashboard')
        } catch (error) {
            console.error("Email Login failed", error)
            const errorMessage = error instanceof Error ? error.message : String(error)

            if (errorMessage.includes('user-not-found') || errorMessage.includes('wrong-password') || errorMessage.includes('invalid-credential')) {
                errorHandler.handle(ErrorType.AUTH_FAILED, { details: 'Invalid email or password' })
            } else if (errorMessage.includes('invalid-email')) {
                errorHandler.handle(ErrorType.AUTH_FAILED, { details: 'Invalid email address' })
            } else {
                errorHandler.handle(ErrorType.AUTH_FAILED, { details: errorMessage })
            }
            throw error // Re-throw to let UI handle loading state if needed
        }
    }

    const signUpWithEmail = async (email: string, password: string, name?: string) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password)

            // Name update
            if (name) {
                await updateProfile(userCredential.user, {
                    displayName: name
                })
                // Trigger local state update if needed, though onAuthStateChanged usually handles it
                // We'll rely on the snapshot listener or next refresh to pick it up fully, 
                // but for immediate UI feedback we might verify user object.
            }

            router.push('/dashboard')
        } catch (error) {
            console.error("Email Sign Up failed", error)
            const errorMessage = error instanceof Error ? error.message : String(error)

            if (errorMessage.includes('email-already-in-use')) {
                errorHandler.handle(ErrorType.AUTH_FAILED, { details: 'Email already in use' })
            } else if (errorMessage.includes('weak-password')) {
                errorHandler.handle(ErrorType.AUTH_FAILED, { details: 'Password should be at least 6 characters' })
            } else if (errorMessage.includes('invalid-email')) {
                errorHandler.handle(ErrorType.AUTH_FAILED, { details: 'Invalid email address' })
            } else {
                errorHandler.handle(ErrorType.AUTH_FAILED, { details: errorMessage })
            }
            throw error // Re-throw to let UI handle loading state
        }
    }

    const resetPassword = async (email: string) => {
        try {
            await sendPasswordResetEmail(auth, email)
            errorHandler.success('Password reset email sent!', 'Check your inbox for further instructions.')
        } catch (error) {
            console.error("Reset Password failed", error)
            const errorMessage = error instanceof Error ? error.message : String(error)

            if (errorMessage.includes('user-not-found')) {
                errorHandler.handle(ErrorType.AUTH_FAILED, { details: 'No user found with this email address.' })
            } else if (errorMessage.includes('invalid-email')) {
                errorHandler.handle(ErrorType.AUTH_FAILED, { details: 'Invalid email address.' })
            } else {
                errorHandler.handle(ErrorType.AUTH_FAILED, { details: errorMessage })
            }
            throw error
        }
    }

    const logout = async () => {
        await signOut(auth)
        // 登出時重置 Store 狀態回預設值 (可選，這裡先不處理以免複雜化)
        router.push('/')
    }

    return (
        <AuthContext.Provider value={{ user, loading, signInWithGoogle, signInWithFacebook, signInWithTwitter, signInWithEmail, signUpWithEmail, resetPassword, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
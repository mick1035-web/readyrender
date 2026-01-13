'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, User, signInWithPopup, signOut } from 'firebase/auth'
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore'
import { auth, googleProvider, db } from '@/lib/firebase'
import { useRouter } from 'next/navigation'
import { useStore } from '@/store/useStore'
import { PlanTier } from '@/constants/plans'
import { subscribeToUserHdris } from '@/lib/hdriService'
import { errorHandler } from '@/lib/errorHandler'
import { ErrorType } from '@/types/errors'
import * as Sentry from '@sentry/nextjs'

interface AuthContextType {
    user: User | null
    loading: boolean
    signInWithGoogle: () => Promise<void>
    logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

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

                // 1. 檢查資料是否存在，若無則建立預設免費檔案
                try {
                    const docSnap = await getDoc(userDocRef)
                    if (!docSnap.exists()) {
                        await setDoc(userDocRef, {
                            email: currentUser.email,
                            tier: 'FREE',
                            subscriptionCredits: 200,
                            purchasedCredits: 0,
                            maxProjects: 1,
                            createdAt: new Date(),
                            uid: currentUser.uid
                        })
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

    const logout = async () => {
        await signOut(auth)
        // 登出時重置 Store 狀態回預設值 (可選，這裡先不處理以免複雜化)
        router.push('/')
    }

    return (
        <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
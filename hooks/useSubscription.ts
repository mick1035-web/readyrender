'use client'

import { useEffect } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useStore } from '@/store/useStore'
import { PlanTier } from '@/constants/plans'

export function useSubscription(userId: string | null | undefined) {
    const updateSubscription = useStore(state => state.updateSubscription)

    useEffect(() => {
        if (!userId) {
            // 如果沒有登入，重置為 FREE tier
            updateSubscription('FREE')
            return
        }

        // 監聽 Firestore 的用戶訂閱資料
        const userDocRef = doc(db, 'users', userId)

        const unsubscribe = onSnapshot(
            userDocRef,
            (docSnapshot) => {
                if (docSnapshot.exists()) {
                    const userData = docSnapshot.data()
                    const subscription = userData.subscription

                    if (subscription) {
                        // 從 Firestore 載入訂閱資料
                        updateSubscription(
                            subscription.tier as PlanTier,
                            subscription.credits,
                            subscription.resetDate?.toDate()
                        )
                        console.log('✅ Subscription loaded:', subscription.tier, subscription.credits)
                    } else {
                        // 如果沒有訂閱資料，使用預設 FREE tier
                        updateSubscription('FREE')
                        console.log('ℹ️ No subscription data, using FREE tier')
                    }
                } else {
                    // 用戶文件不存在，使用預設 FREE tier
                    updateSubscription('FREE')
                    console.log('ℹ️ User document not found, using FREE tier')
                }
            },
            (error) => {
                console.error('❌ Error loading subscription:', error)
                // 發生錯誤時使用預設 FREE tier
                updateSubscription('FREE')
            }
        )

        // 清理監聽器
        return () => unsubscribe()
    }, [userId, updateSubscription])
}

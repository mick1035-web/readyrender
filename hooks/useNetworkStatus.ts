'use client'

import { useState, useEffect } from 'react'

export function useNetworkStatus() {
    const [isOnline, setIsOnline] = useState(true)
    const [wasOffline, setWasOffline] = useState(false)

    useEffect(() => {
        // Initialize with current status
        setIsOnline(navigator.onLine)

        const handleOnline = () => {
            setIsOnline(true)
            setWasOffline(true)

            // Reset wasOffline after 5 seconds
            setTimeout(() => setWasOffline(false), 5000)
        }

        const handleOffline = () => {
            setIsOnline(false)
        }

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    return { isOnline, wasOffline }
}

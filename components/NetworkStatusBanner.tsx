'use client'

import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { Wifi, WifiOff, CheckCircle } from 'lucide-react'

export default function NetworkStatusBanner() {
    const { isOnline, wasOffline } = useNetworkStatus()

    // Don't show anything if online and never was offline
    if (isOnline && !wasOffline) {
        return null
    }

    return (
        <div className="fixed top-0 left-0 right-0 z-[9999]">
            {!isOnline ? (
                // Offline Banner
                <div className="bg-red-600 text-white px-4 py-3 flex items-center justify-center gap-2 shadow-lg animate-in slide-in-from-top duration-300">
                    <WifiOff size={20} />
                    <span className="font-medium">
                        No internet connection. Changes will be saved when you reconnect.
                    </span>
                </div>
            ) : wasOffline ? (
                // Back Online Banner
                <div className="bg-green-600 text-white px-4 py-3 flex items-center justify-center gap-2 shadow-lg animate-in slide-in-from-top duration-300">
                    <CheckCircle size={20} />
                    <span className="font-medium">
                        Back online! Syncing changes...
                    </span>
                </div>
            ) : null}
        </div>
    )
}

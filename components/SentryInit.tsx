'use client'

import { useEffect } from 'react'

export function SentryInit() {
    useEffect(() => {
        // Dynamically import Sentry client config only in browser
        import('@/sentry.client.config').catch((error) => {
            console.error('Failed to load Sentry client config:', error)
        })
    }, [])

    return null
}

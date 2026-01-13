import * as Sentry from "@sentry/nextjs"

Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: 1.0,

    // Note: debug mode is disabled for edge runtime to reduce bundle size
    debug: false,

    // Environment
    environment: process.env.NODE_ENV || 'development',
})

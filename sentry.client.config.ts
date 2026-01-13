import * as Sentry from "@sentry/nextjs"

Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: 1.0,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false, // Disabled to reduce console noise

    // Environment
    environment: process.env.NODE_ENV || 'development',

    // Ignore specific errors that are not actionable
    ignoreErrors: [
        // Browser extensions
        'top.GLOBALS',
        // Random plugins/extensions
        'originalCreateNotification',
        'canvas.contentDocument',
        'MyApp_RemoveAllHighlights',
        // Facebook borked
        'fb_xd_fragment',
        // ISP "optimizing" proxy - `Cache-Control: no-transform` seems to reduce this. (thanks @acdha)
        'bmi_SafeAddOnload',
        'EBCallBackMessageReceived',
        // See http://toolbar.conduit.com/Developer/HtmlAndGadget/Methods/JSInjection.aspx
        'conduitPage',
        // Generic error messages
        'Script error.',
        'ResizeObserver loop limit exceeded',
        'ResizeObserver loop completed with undelivered notifications.',
        'Non-Error promise rejection captured',
    ],

    // Filter out errors from browser extensions
    beforeSend(event, hint) {
        // Don't send errors in development
        if (process.env.NODE_ENV === 'development') {
            console.log('Sentry event (not sent in dev):', event)
            return null
        }

        // Filter out errors from browser extensions
        if (event.exception?.values?.[0]?.stacktrace?.frames) {
            const frames = event.exception.values[0].stacktrace.frames
            if (frames.some(frame => frame.filename?.includes('chrome-extension://'))) {
                return null
            }
        }

        return event
    },

    // Session Replay - only enable in production
    // This sets the sample rate to be 10%. You may want this to be 100% while
    // in development and sample at a lower rate in production
    replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,

    // If the entire session is not sampled, use the below sample rate to sample
    // sessions when an error occurs.
    replaysOnErrorSampleRate: process.env.NODE_ENV === 'production' ? 1.0 : 0,

    integrations: [
        // Note: replayIntegration is only available in browser environment and production
        // Disabled in development to prevent console errors
        ...(typeof window !== 'undefined' &&
            process.env.NODE_ENV === 'production' &&
            Sentry.replayIntegration
            ? [Sentry.replayIntegration({
                maskAllText: true,
                blockAllMedia: true,
            })]
            : []),
    ],
})

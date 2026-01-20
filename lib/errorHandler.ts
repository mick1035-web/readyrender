import { ErrorType, ErrorContext, ErrorInfo, ErrorAction } from '@/types/errors'
import { getErrorMessage } from './errorMessages'
import * as Sentry from '@sentry/nextjs'

// Error handler utility
export class ErrorHandler {
    private static showToast: ((options: {
        type: 'success' | 'error' | 'warning' | 'info'
        title?: string
        message: string
        description?: string
        actions?: ErrorAction[]
        duration?: number
    }) => void) | null = null

    // Initialize with toast function
    static init(showToastFn: typeof ErrorHandler.showToast) {
        ErrorHandler.showToast = showToastFn
    }

    // Handle error with type
    static handle(errorType: ErrorType, context?: ErrorContext, customActions?: ErrorAction[]) {
        const errorInfo = getErrorMessage(errorType, context)
        this.showError(errorInfo, customActions)

        // Send to Sentry (or log in development)
        if (typeof window !== 'undefined') {
            const sentryEvent = {
                level: this.getSentryLevel(errorInfo.severity),
                tags: {
                    errorType: errorType,
                    severity: errorInfo.severity,
                },
                contexts: {
                    errorInfo: {
                        title: errorInfo.title,
                        description: errorInfo.description,
                        solutions: errorInfo.solutions,
                    },
                    userContext: context || {},
                },
            }

            if (process.env.NODE_ENV === 'production') {
                // Send to Sentry in production
                Sentry.captureException(new Error(errorInfo.title), sentryEvent)
            } else {
                // Log in development (matching sentry.client.config.ts beforeSend behavior)
                console.log('Sentry event (not sent in dev):', {
                    message: errorInfo.title,
                    ...sentryEvent
                })
            }
        }

        // Log to console for debugging
        console.error(`[${errorType}]`, errorInfo, context)
    }

    // Handle generic error
    static handleGeneric(error: Error | unknown, context?: ErrorContext) {
        console.error('Unhandled error:', error)

        // Try to determine error type from error message
        const errorType = this.determineErrorType(error)
        this.handle(errorType, context)
    }

    // Show error with full info
    private static showError(errorInfo: ErrorInfo, customActions?: ErrorAction[]) {
        if (!this.showToast) {
            console.error('ErrorHandler not initialized! Call ErrorHandler.init() first.')
            return
        }

        const toastType = this.mapSeverityToToastType(errorInfo.severity)

        this.showToast({
            type: toastType,
            title: errorInfo.title,
            message: errorInfo.description,
            description: errorInfo.solutions.length > 0
                ? `Solution：\n${errorInfo.solutions.map((s, i) => `${i + 1}. ${s}`).join('\n')}`
                : undefined,
            actions: customActions || errorInfo.actions,
            duration: errorInfo.duration
        })
    }

    // Map severity to toast type
    private static mapSeverityToToastType(severity: ErrorInfo['severity']): 'success' | 'error' | 'warning' | 'info' {
        switch (severity) {
            case 'critical':
            case 'error':
                return 'error'
            case 'warning':
                return 'warning'
            case 'info':
                return 'info'
            default:
                return 'error'
        }
    }

    // Determine error type from error object
    private static determineErrorType(error: Error | unknown): ErrorType {
        if (!(error instanceof Error)) {
            return ErrorType.UNKNOWN_ERROR
        }

        const message = error.message.toLowerCase()

        // Network errors
        if (message.includes('network') || message.includes('fetch')) {
            return ErrorType.NETWORK_ERROR
        }
        if (message.includes('timeout')) {
            return ErrorType.TIMEOUT_ERROR
        }

        // Auth errors
        if (message.includes('auth') || message.includes('permission')) {
            return ErrorType.AUTH_FAILED
        }

        // File errors
        if (message.includes('file') || message.includes('upload')) {
            return ErrorType.FILE_UPLOAD_FAILED
        }

        // Model errors
        if (message.includes('model') || message.includes('gltf') || message.includes('glb')) {
            return ErrorType.MODEL_LOAD_FAILED
        }

        // HDRI errors
        if (message.includes('hdri') || message.includes('hdr') || message.includes('environment')) {
            return ErrorType.HDRI_LOAD_FAILED
        }

        return ErrorType.UNKNOWN_ERROR
    }

    // Map error severity to Sentry level
    private static getSentryLevel(severity: ErrorInfo['severity']): Sentry.SeverityLevel {
        switch (severity) {
            case 'critical':
                return 'fatal'
            case 'error':
                return 'error'
            case 'warning':
                return 'warning'
            case 'info':
                return 'info'
            default:
                return 'error'
        }
    }

    // Convenience methods for common errors
    static fileTooLarge(fileSize: number, maxSize: number, fileName?: string) {
        this.handle(ErrorType.FILE_TOO_LARGE, { fileSize, maxSize, fileName })
    }

    static invalidFormat(format: string, supportedFormats: string[]) {
        this.handle(ErrorType.INVALID_FILE_FORMAT, { format, supportedFormats })
    }

    static insufficientCredits(credits: number, requiredCredits: number, upgradeAction?: () => void) {
        const actions: ErrorAction[] = upgradeAction ? [
            { label: '升級方案', onClick: upgradeAction, variant: 'primary' }
        ] : []
        this.handle(ErrorType.INSUFFICIENT_CREDITS, { credits, requiredCredits }, actions)
    }

    static modelTooComplex(polygonCount: number, maxPolygons: number = 100000) {
        this.handle(ErrorType.MODEL_TOO_COMPLEX, { polygonCount, maxPolygons })
    }

    static exportFailed(retryAction?: () => void) {
        const actions: ErrorAction[] = retryAction ? [
            { label: '重試', onClick: retryAction, variant: 'primary' }
        ] : []
        this.handle(ErrorType.EXPORT_FAILED, {}, actions)
    }

    static projectSaveFailed(retryAction?: () => void) {
        const actions: ErrorAction[] = retryAction ? [
            { label: '重試儲存', onClick: retryAction, variant: 'primary' }
        ] : []
        this.handle(ErrorType.PROJECT_SAVE_FAILED, {}, actions)
    }

    static sessionExpired(loginAction?: () => void) {
        const actions: ErrorAction[] = loginAction ? [
            { label: '重新登入', onClick: loginAction, variant: 'primary' }
        ] : []
        this.handle(ErrorType.SESSION_EXPIRED, {}, actions)
    }

    // Success message helper
    static success(message: string, description?: string, duration: number = 5000) {
        if (!this.showToast) return
        this.showToast({
            type: 'success',
            message,
            description,
            duration
        })
    }

    // Info message helper
    static info(message: string, duration: number = 5000) {
        if (!this.showToast) return
        this.showToast({
            type: 'info',
            message,
            duration
        })
    }

    // Warning message helper
    static warning(message: string, description?: string, duration: number = 7000) {
        if (!this.showToast) return
        this.showToast({
            type: 'warning',
            message,
            description,
            duration
        })
    }
}

// Export singleton instance
export const errorHandler = ErrorHandler

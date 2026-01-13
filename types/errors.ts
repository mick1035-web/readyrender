// Error type definitions for the application
export enum ErrorType {
    // File Upload Errors
    FILE_TOO_LARGE = 'FILE_TOO_LARGE',
    INVALID_FILE_FORMAT = 'INVALID_FILE_FORMAT',
    FILE_UPLOAD_FAILED = 'FILE_UPLOAD_FAILED',
    FILE_CORRUPTED = 'FILE_CORRUPTED',

    // Model Errors
    MODEL_LOAD_FAILED = 'MODEL_LOAD_FAILED',
    MODEL_TOO_COMPLEX = 'MODEL_TOO_COMPLEX',

    // HDRI Errors
    HDRI_UPLOAD_FAILED = 'HDRI_UPLOAD_FAILED',
    HDRI_GENERATION_FAILED = 'HDRI_GENERATION_FAILED',
    HDRI_LOAD_FAILED = 'HDRI_LOAD_FAILED',

    // Export Errors
    EXPORT_FAILED = 'EXPORT_FAILED',
    INSUFFICIENT_CREDITS = 'INSUFFICIENT_CREDITS',
    BROWSER_NOT_SUPPORTED = 'BROWSER_NOT_SUPPORTED',
    EXPORT_TIMEOUT = 'EXPORT_TIMEOUT',

    // Project Errors
    PROJECT_LOAD_FAILED = 'PROJECT_LOAD_FAILED',
    PROJECT_SAVE_FAILED = 'PROJECT_SAVE_FAILED',
    PROJECT_NOT_FOUND = 'PROJECT_NOT_FOUND',

    // Auth Errors
    AUTH_FAILED = 'AUTH_FAILED',
    PERMISSION_DENIED = 'PERMISSION_DENIED',
    SESSION_EXPIRED = 'SESSION_EXPIRED',

    // Network Errors
    NETWORK_ERROR = 'NETWORK_ERROR',
    TIMEOUT_ERROR = 'TIMEOUT_ERROR',

    // Generic Errors
    UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface ErrorContext {
    fileSize?: number
    maxSize?: number
    fileName?: string
    format?: string
    supportedFormats?: string[]
    polygonCount?: number
    maxPolygons?: number
    credits?: number
    requiredCredits?: number
    browser?: string
    [key: string]: any
}

export interface ErrorAction {
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary'
}

export interface ErrorInfo {
    type: ErrorType
    title: string
    description: string
    solutions: string[]
    actions?: ErrorAction[]
    severity: 'critical' | 'error' | 'warning' | 'info'
    duration?: number
}

import { ErrorType, ErrorContext, ErrorInfo } from '@/types/errors'

// Error message templates with dynamic content support
export const errorMessages: Record<ErrorType, (context?: ErrorContext) => ErrorInfo> = {
    // File Upload Errors
    [ErrorType.FILE_TOO_LARGE]: (context) => ({
        type: ErrorType.FILE_TOO_LARGE,
        title: 'File Too Large',
        description: `File size ${context?.fileSize ? `${(context.fileSize / 1024 / 1024).toFixed(1)}MB` : ''} exceeds the limit of ${context?.maxSize ? `${context.maxSize}MB` : '50MB'}`,
        solutions: [
            'Use 3D software (like Blender) to reduce polygon count',
            'Remove unnecessary materials and textures',
            'Upgrade to PRO plan for larger file support (up to 200MB)'
        ],
        severity: 'error',
        duration: 10000
    }),

    [ErrorType.INVALID_FILE_FORMAT]: (context) => ({
        type: ErrorType.INVALID_FILE_FORMAT,
        title: 'Invalid File Format',
        description: `${context?.format || 'This'} format is not supported. Please use ${context?.supportedFormats?.join(', ') || 'GLB or GLTF'} format`,
        solutions: [
            'Export your model as GLB or GLTF using 3D software',
            'Verify the file extension is correct',
            'Check if the file downloaded completely'
        ],
        severity: 'error',
        duration: 8000
    }),

    [ErrorType.FILE_UPLOAD_FAILED]: (context) => ({
        type: ErrorType.FILE_UPLOAD_FAILED,
        title: 'Upload Failed',
        description: 'An error occurred during file upload',
        solutions: [
            'Check your internet connection',
            'Refresh the page and try again',
            'Contact support if the problem persists'
        ],
        severity: 'error',
        duration: 8000
    }),

    [ErrorType.FILE_CORRUPTED]: (context) => ({
        type: ErrorType.FILE_CORRUPTED,
        title: 'File Corrupted',
        description: 'The file may be corrupted or incomplete',
        solutions: [
            'Re-export the model from your 3D software',
            'Verify the file downloaded completely',
            'Try using a different file'
        ],
        severity: 'error',
        duration: 8000
    }),

    // Model Errors
    [ErrorType.MODEL_LOAD_FAILED]: (context) => ({
        type: ErrorType.MODEL_LOAD_FAILED,
        title: 'Model Load Failed',
        description: 'Unable to load the 3D model',
        solutions: [
            'Verify the file format is correct (GLB/GLTF)',
            'Check if the model contains valid geometry data',
            'Try re-uploading the model'
        ],
        severity: 'error',
        duration: 8000
    }),

    [ErrorType.MODEL_TOO_COMPLEX]: (context) => ({
        type: ErrorType.MODEL_TOO_COMPLEX,
        title: 'Model Too Complex',
        description: `Model contains ${context?.polygonCount?.toLocaleString() || ''} polygons, which may affect performance`,
        solutions: [
            'Simplify the model using 3D software (recommended under 100,000 polygons)',
            'Remove unnecessary details',
            'Consider using normal maps instead of high-poly details'
        ],
        severity: 'warning',
        duration: 10000
    }),

    // HDRI Errors
    [ErrorType.HDRI_UPLOAD_FAILED]: (context) => ({
        type: ErrorType.HDRI_UPLOAD_FAILED,
        title: 'HDRI Upload Failed',
        description: 'Environment map upload failed',
        solutions: [
            'Verify the file format is HDR or EXR',
            'Check if the file size is within limits',
            'Retry the upload'
        ],
        severity: 'error',
        duration: 8000
    }),

    [ErrorType.HDRI_GENERATION_FAILED]: (context) => ({
        type: ErrorType.HDRI_GENERATION_FAILED,
        title: 'AI Generation Failed',
        description: 'An error occurred during AI environment generation',
        solutions: [
            'Try modifying your prompt with more specific descriptions',
            'Try again later (service may be busy)',
            'Use a preset environment or upload a custom HDRI'
        ],
        severity: 'error',
        duration: 8000
    }),

    [ErrorType.HDRI_LOAD_FAILED]: (context) => ({
        type: ErrorType.HDRI_LOAD_FAILED,
        title: 'HDRI Load Failed',
        description: 'Unable to load the environment map',
        solutions: [
            'Check your internet connection',
            'Try using a different environment',
            'Refresh the page'
        ],
        severity: 'error',
        duration: 8000
    }),

    // Export Errors
    [ErrorType.EXPORT_FAILED]: (context) => ({
        type: ErrorType.EXPORT_FAILED,
        title: 'Video Export Failed',
        description: 'An error occurred during export',
        solutions: [
            'Check if your browser supports video recording',
            'Ensure you have enough memory available',
            'Try lowering the export resolution',
            'Refresh the page and try again'
        ],
        severity: 'error',
        duration: 10000
    }),

    [ErrorType.INSUFFICIENT_CREDITS]: (context) => ({
        type: ErrorType.INSUFFICIENT_CREDITS,
        title: 'Insufficient Credits',
        description: `Requires ${context?.requiredCredits || ''} credits, you currently have ${context?.credits || 0} credits`,
        solutions: [
            'Upgrade to a higher plan for more credits',
            'Purchase additional credit packs',
            'Lower the export resolution to reduce credit usage'
        ],
        severity: 'warning',
        duration: 0 // Don't auto-close
    }),

    [ErrorType.BROWSER_NOT_SUPPORTED]: (context) => ({
        type: ErrorType.BROWSER_NOT_SUPPORTED,
        title: 'Browser Not Supported',
        description: `Your browser ${context?.browser || ''} does not support this feature`,
        solutions: [
            'Use the latest version of Chrome or Edge',
            'Update your browser to the latest version',
            'Enable hardware acceleration'
        ],
        severity: 'critical',
        duration: 0
    }),

    [ErrorType.EXPORT_TIMEOUT]: (context) => ({
        type: ErrorType.EXPORT_TIMEOUT,
        title: 'Export Timeout',
        description: 'Export took too long and was automatically cancelled',
        solutions: [
            'Reduce the number of keyframes',
            'Lower the export resolution',
            'Simplify model complexity',
            'Shorten the video duration'
        ],
        severity: 'error',
        duration: 10000
    }),

    // Project Errors
    [ErrorType.PROJECT_LOAD_FAILED]: (context) => ({
        type: ErrorType.PROJECT_LOAD_FAILED,
        title: 'Project Load Failed',
        description: 'Unable to load project data',
        solutions: [
            'Check your internet connection',
            'Verify you have permission to access this project',
            'Refresh the page',
            'Return to project list and select again'
        ],
        severity: 'error',
        duration: 8000
    }),

    [ErrorType.PROJECT_SAVE_FAILED]: (context) => ({
        type: ErrorType.PROJECT_SAVE_FAILED,
        title: 'Save Failed',
        description: 'Unable to save project changes',
        solutions: [
            'Check your internet connection',
            'Verify you have enough storage space',
            'Retry saving',
            'Copy important settings to prevent data loss'
        ],
        severity: 'error',
        duration: 10000
    }),

    [ErrorType.PROJECT_NOT_FOUND]: (context) => ({
        type: ErrorType.PROJECT_NOT_FOUND,
        title: 'Project Not Found',
        description: 'This project does not exist',
        solutions: [
            'Verify the project ID is correct',
            'Check if the project has been deleted',
            'Return to project list to view all projects'
        ],
        severity: 'error',
        duration: 8000
    }),

    // Auth Errors
    [ErrorType.AUTH_FAILED]: (context) => ({
        type: ErrorType.AUTH_FAILED,
        title: 'Login Failed',
        description: 'Unable to complete login',
        solutions: [
            'Check your internet connection',
            'Clear browser cache and try again',
            'Use an alternative login method',
            'Contact support for assistance'
        ],
        severity: 'critical',
        duration: 0
    }),

    [ErrorType.PERMISSION_DENIED]: (context) => ({
        type: ErrorType.PERMISSION_DENIED,
        title: 'Permission Denied',
        description: 'You do not have permission to perform this action',
        solutions: [
            'Verify you are logged in',
            'Check your subscription plan',
            'Upgrade your plan to unlock this feature',
            'Contact an administrator'
        ],
        severity: 'warning',
        duration: 8000
    }),

    [ErrorType.SESSION_EXPIRED]: (context) => ({
        type: ErrorType.SESSION_EXPIRED,
        title: 'Session Expired',
        description: 'Your login session has expired, please log in again',
        solutions: [
            'Click the login button',
            'Refresh the page'
        ],
        severity: 'warning',
        duration: 0
    }),

    // Network Errors
    [ErrorType.NETWORK_ERROR]: (context) => ({
        type: ErrorType.NETWORK_ERROR,
        title: 'Network Error',
        description: 'Unable to connect to server',
        solutions: [
            'Check your internet connection',
            'Verify firewall settings',
            'Try again later',
            'Contact your network administrator'
        ],
        severity: 'error',
        duration: 8000
    }),

    [ErrorType.TIMEOUT_ERROR]: (context) => ({
        type: ErrorType.TIMEOUT_ERROR,
        title: 'Request Timeout',
        description: 'Server response took too long',
        solutions: [
            'Check your internet connection speed',
            'Retry the operation',
            'Try again later (service may be busy)'
        ],
        severity: 'error',
        duration: 8000
    }),

    // Generic Errors
    [ErrorType.UNKNOWN_ERROR]: (context) => ({
        type: ErrorType.UNKNOWN_ERROR,
        title: 'Error Occurred',
        description: 'An unexpected error occurred',
        solutions: [
            'Refresh the page',
            'Clear browser cache',
            'Contact support with error details if the problem persists'
        ],
        severity: 'error',
        duration: 8000
    }),
}

// Helper function to get error message
export function getErrorMessage(type: ErrorType, context?: ErrorContext): ErrorInfo {
    const messageGenerator = errorMessages[type] || errorMessages[ErrorType.UNKNOWN_ERROR]
    return messageGenerator(context)
}

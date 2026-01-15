/**
 * File validation utilities
 */

export interface FileValidationResult {
    valid: boolean
    error?: string
}

// Maximum file size: UNLIMITED (restrictions removed for testing)
// Note: Original limit was 100MB - uncomment the check below to re-enable
const MAX_FILE_SIZE = 100 * 1024 * 1024

// Valid file extensions by category
const VALID_EXTENSIONS = {
    models: ['.glb', '.gltf', '.obj', '.fbx'],
    images: ['.png', '.jpg', '.jpeg', '.svg', '.webp'],
    environments: ['.hdr', '.exr']
}

// Valid MIME types by category
const VALID_MIME_TYPES = {
    models: [
        'model/gltf-binary',
        'model/gltf+json',
        'model/obj',
        'application/octet-stream' // fbx, obj often use this
    ],
    images: [
        'image/png',
        'image/jpeg',
        'image/svg+xml',
        'image/webp'
    ],
    environments: [
        'image/vnd.radiance', // .hdr
        'image/x-exr', // .exr
        'application/octet-stream' // Sometimes used for HDR/EXR
    ]
}

/**
 * Validate file size, extension, and MIME type
 */
export function validateFile(
    file: File,
    category: 'models' | 'images' | 'environments'
): FileValidationResult {
    // 1. Check file size (DISABLED - no size limit)
    // Warning: Large files may cause performance issues
    if (file.size > MAX_FILE_SIZE) {
        console.warn(`Large file detected: ${formatFileSize(file.size)}. This may cause performance issues.`)
        // Size check disabled - allow upload to proceed
    }

    if (file.size === 0) {
        return {
            valid: false,
            error: 'File is empty.'
        }
    }

    // 2. Check file extension
    const fileName = file.name.toLowerCase()
    const validExtensions = VALID_EXTENSIONS[category]
    const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext))

    if (!hasValidExtension) {
        return {
            valid: false,
            error: `Invalid file type. Allowed: ${validExtensions.join(', ')}`
        }
    }

    // 3. Check MIME type
    const validMimeTypes = VALID_MIME_TYPES[category]
    const hasValidMimeType = validMimeTypes.includes(file.type)

    if (!hasValidMimeType && file.type !== '') {
        // Only warn if MIME type is present but invalid
        // Some files may not have MIME type set
        console.warn(`Unexpected MIME type: ${file.type} for ${category}`)
    }

    return { valid: true }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Get max file size in MB
 */
export function getMaxFileSizeMB(): number {
    return Math.round(MAX_FILE_SIZE / 1024 / 1024)
}

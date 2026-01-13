import DOMPurify from 'isomorphic-dompurify'

/**
 * Sanitize plain text input (no HTML allowed)
 * Use for: text fields, names, prompts
 */
export function sanitizeText(text: string): string {
    return DOMPurify.sanitize(text, {
        ALLOWED_TAGS: [], // No HTML tags
        ALLOWED_ATTR: [],
        KEEP_CONTENT: true
    }).trim()
}

/**
 * Sanitize HTML with limited safe tags
 * Use for: rich text content (if needed)
 */
export function sanitizeHtml(html: string): string {
    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
        ALLOWED_ATTR: ['href', 'target'],
        ALLOW_DATA_ATTR: false
    })
}

/**
 * Sanitize filename
 * Remove path traversal attempts and dangerous characters
 */
export function sanitizeFilename(filename: string): string {
    return filename
        .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace unsafe chars
        .replace(/\.{2,}/g, '.') // Remove multiple dots
        .replace(/^\.+/, '') // Remove leading dots
        .substring(0, 255) // Limit length
}

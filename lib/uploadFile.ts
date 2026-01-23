import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from './firebase'
import { validateFile } from './fileValidation'
import { sanitizeFilename } from './sanitize'

/**
 * Delay helper for retry logic
 */
function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Upload file with automatic retry on failure
 * @param file - File to upload
 * @param userId - User ID
 * @param folder - Folder type
 * @param onProgress - Progress callback (0-100, attempt number)
 * @param maxRetries - Maximum retry attempts (default: 3)
 * @returns Download URL
 */
export async function uploadFileWithRetry(
    file: File,
    userId: string,
    folder: 'models' | 'images' | 'environments' | 'avatars',
    onProgress?: (progress: number, attempt?: number) => void,
    maxRetries: number = 3
): Promise<string> {
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Upload attempt ${attempt}/${maxRetries}`)

            const url = await uploadFile(file, userId, folder, (progress) => {
                onProgress?.(progress, attempt)
            })

            // Success!
            return url
        } catch (error) {
            lastError = error as Error
            console.error(`Upload attempt ${attempt} failed:`, error)

            // If this was the last attempt, throw the error
            if (attempt === maxRetries) {
                throw new Error(`Upload failed after ${maxRetries} attempts: ${lastError.message}`)
            }

            // Exponential backoff: 1s, 2s, 4s
            const delayMs = Math.pow(2, attempt - 1) * 1000
            console.log(`Retrying in ${delayMs}ms...`)
            await delay(delayMs)
        }
    }

    // This should never be reached, but TypeScript needs it
    throw lastError || new Error('Upload failed')
}

/**
 * 上傳檔案到 Firebase Storage
 * @param file - 要上傳的檔案
 * @param userId - 用戶 ID
 * @param type - 檔案類型 ('models' 或 'images')
 * @param folder - 檔案類型 ('models', 'images' 或 'environments')
 * @param onProgress - 進度回調函數 (0-100)
 * @returns 下載 URL
 */
export async function uploadFile(
    file: File,
    userId: string,
    folder: 'models' | 'images' | 'environments' | 'avatars',
    onProgress?: (progress: number) => void
): Promise<string> {
    // 1. Validate file using comprehensive validation
    const validation = validateFile(file, folder)
    if (!validation.valid) {
        throw new Error(validation.error)
    }

    // 2. Sanitize filename to prevent path traversal and XSS
    const sanitizedFileName = sanitizeFilename(file.name)

    // 3. Create unique filename with timestamp
    const timestamp = Date.now()
    const fileName = `${timestamp}_${sanitizedFileName}`
    const storagePath = `${folder}/${userId}/${fileName}`

    // 4. Create Storage reference
    const storageRef = ref(storage, storagePath)

    // 上傳檔案
    return new Promise((resolve, reject) => {
        const uploadTask = uploadBytesResumable(storageRef, file)

        uploadTask.on(
            'state_changed',
            (snapshot) => {
                // 計算進度
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                onProgress?.(progress)
            },
            (error) => {
                // 處理錯誤
                console.error('Upload error:', error)
                reject(error)
            },
            async () => {
                // 上傳完成，獲取下載 URL
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
                    resolve(downloadURL)
                } catch (error) {
                    reject(error)
                }
            }
        )
    })
}

/**
 * 從 Firebase Storage 刪除檔案
 * @param url - 檔案的下載 URL
 */
export async function deleteFile(url: string): Promise<void> {
    try {
        // 從 URL 提取 Storage 路徑
        const storageRef = ref(storage, url)
        await deleteObject(storageRef)
    } catch (error) {
        console.error('Delete file error:', error)
        throw error
    }
}

/**
 * 驗證檔案是否為 Storage URL
 * @param url - 要檢查的 URL
 * @returns 是否為 Firebase Storage URL
 */
export function isStorageUrl(url: string): boolean {
    return url.includes('firebasestorage.googleapis.com')
}

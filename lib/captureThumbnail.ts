import { ref, uploadString, getDownloadURL } from 'firebase/storage'
import { storage } from './firebase'

/**
 * Capture a screenshot from a canvas element and upload to Firebase Storage
 * @param canvas - The canvas element to capture
 * @param projectId - The project ID for storage path
 * @returns Download URL of the uploaded thumbnail
 */
export async function captureThumbnail(
    canvas: HTMLCanvasElement,
    projectId: string
): Promise<string> {
    try {
        // Capture canvas as base64 JPEG (0.8 quality for good balance)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8)

        // Create storage reference
        const storageRef = ref(storage, `thumbnails/${projectId}.jpg`)

        // Upload base64 string
        await uploadString(storageRef, dataUrl, 'data_url')

        // Get download URL
        const downloadUrl = await getDownloadURL(storageRef)

        return downloadUrl
    } catch (error) {
        console.error('Error capturing thumbnail:', error)
        throw error
    }
}

/**
 * Capture thumbnail and update Firestore project document
 * @param canvas - The canvas element to capture
 * @param projectId - The project ID
 * @param updateDoc - Function to update Firestore document
 */
export async function capturAndUpdateThumbnail(
    canvas: HTMLCanvasElement,
    projectId: string,
    updateDoc: (thumbnailUrl: string) => Promise<void>
): Promise<void> {
    try {
        const thumbnailUrl = await captureThumbnail(canvas, projectId)
        await updateDoc(thumbnailUrl)
        console.log('Thumbnail updated successfully')
    } catch (error) {
        console.error('Error updating thumbnail:', error)
    }
}

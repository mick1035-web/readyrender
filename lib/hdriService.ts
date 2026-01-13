import { db } from './firebase'
import { collection, addDoc, deleteDoc, doc, getDocs, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore'
import { CustomHdri } from '@/constants/hdri'

/**
 * Load all HDRIs for a specific user
 */
export async function loadUserHdris(userId: string): Promise<CustomHdri[]> {
    try {
        const hdrisRef = collection(db, 'users', userId, 'hdris')
        const q = query(hdrisRef, orderBy('uploadedAt', 'desc'))
        const snapshot = await getDocs(q)

        return snapshot.docs.map(doc => {
            const data = doc.data()
            return {
                id: doc.id,
                name: data.name,
                url: data.url,
                uploadedAt: data.uploadedAt?.toDate() || new Date(),
                type: data.type as 'ai-generated' | 'upload'
            }
        })
    } catch (error) {
        console.error('Error loading user HDRIs:', error)
        return []
    }
}

/**
 * Add a new HDRI to user's library
 */
export async function addUserHdri(userId: string, hdri: Omit<CustomHdri, 'id'>): Promise<string> {
    try {
        const hdrisRef = collection(db, 'users', userId, 'hdris')
        const docRef = await addDoc(hdrisRef, {
            name: hdri.name,
            url: hdri.url,
            uploadedAt: Timestamp.fromDate(hdri.uploadedAt),
            type: hdri.type
        })
        return docRef.id
    } catch (error) {
        console.error('Error adding HDRI:', error)
        throw error
    }
}

/**
 * Remove a HDRI from user's library
 */
export async function removeUserHdri(userId: string, hdriId: string): Promise<void> {
    try {
        const hdriRef = doc(db, 'users', userId, 'hdris', hdriId)
        await deleteDoc(hdriRef)
    } catch (error) {
        console.error('Error removing HDRI:', error)
        throw error
    }
}

/**
 * Subscribe to real-time updates of user's HDRIs
 */
export function subscribeToUserHdris(
    userId: string,
    onUpdate: (hdris: CustomHdri[]) => void
): () => void {
    const hdrisRef = collection(db, 'users', userId, 'hdris')
    const q = query(hdrisRef, orderBy('uploadedAt', 'desc'))

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const hdris = snapshot.docs.map(doc => {
            const data = doc.data()
            return {
                id: doc.id,
                name: data.name,
                url: data.url,
                uploadedAt: data.uploadedAt?.toDate() || new Date(),
                type: data.type as 'ai-generated' | 'upload'
            }
        })
        onUpdate(hdris)
    }, (error) => {
        console.error('Error subscribing to HDRIs:', error)
    })

    return unsubscribe
}

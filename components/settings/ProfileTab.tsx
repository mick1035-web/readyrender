'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { uploadFile } from '@/lib/uploadFile'
import { updateProfile } from 'firebase/auth'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { errorHandler } from '@/lib/errorHandler'
import { Camera, User, Mail, Loader2, Save } from 'lucide-react'
import Image from 'next/image'

export default function ProfileTab() {
    const { user } = useAuth()
    const [displayName, setDisplayName] = useState('')
    const [isUploading, setIsUploading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Sync state with user profile
    useEffect(() => {
        if (user?.displayName) {
            setDisplayName(user.displayName)
        }
    }, [user])

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !user) return

        setIsUploading(true)
        try {
            // 1. Upload to Firebase Storage
            const photoURL = await uploadFile(file, user.uid, 'avatars')

            // 2. Update Firebase Auth Profile
            await updateProfile(user, { photoURL })

            // 3. Update Firestore User Document
            await updateDoc(doc(db, 'users', user.uid), { photoURL })

            errorHandler.success('Avatar updated successfully')
        } catch (error) {
            console.error('Avatar upload failed:', error)
            errorHandler.handleGeneric(error as Error)
        } finally {
            setIsUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    const handleSaveProfile = async () => {
        if (!user) return
        if (!displayName.trim()) {
            errorHandler.warning('Display name cannot be empty')
            return
        }

        setIsSaving(true)
        try {
            // 1. Update Firebase Auth
            await updateProfile(user, { displayName })

            // 2. Update Firestore
            await updateDoc(doc(db, 'users', user.uid), { displayName })

            errorHandler.success('Profile updated successfully')
        } catch (error) {
            console.error('Profile update failed:', error)
            errorHandler.handleGeneric(error as Error)
        } finally {
            setIsSaving(false)
        }
    }

    if (!user) return null

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-xl font-bold text-white mb-2">Profile Settings</h2>
                <p className="text-zinc-400 text-sm">Manage your public profile and account details.</p>
            </div>

            {/* Avatar Section */}
            <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl space-y-4">
                <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Avatar</h3>
                <div className="flex items-center gap-6">
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-zinc-700 bg-zinc-800 relative">
                            {user.photoURL ? (
                                <Image
                                    src={user.photoURL}
                                    alt="Avatar"
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-500">
                                    <User size={32} />
                                </div>
                            )}

                            {/* Overlay Loading/Hover */}
                            <div
                                onClick={() => !isUploading && fileInputRef.current?.click()}
                                className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
                            >
                                <Camera size={24} />
                            </div>

                            {isUploading && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                                    <Loader2 className="animate-spin text-white" size={24} />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex-1">
                        <p className="text-sm text-zinc-400 mb-2">
                            Upload a new avatar. Recommended size: 256x256px.
                        </p>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-lg transition-colors border border-zinc-700 disabled:opacity-50"
                        >
                            {isUploading ? 'Uploading...' : 'Upload Image'}
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={handleAvatarChange}
                            className="hidden"
                        />
                    </div>
                </div>
            </div>

            {/* Personal Info Section */}
            <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl space-y-6">
                <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Personal Information</h3>

                <div className="grid gap-6 max-w-xl">
                    {/* Display Name */}
                    <div className="space-y-2">
                        <label className="text-sm text-zinc-400 block">Display Name</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="Enter your display name"
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-zinc-600 focus:border-blue-500 focus:outline-none transition-colors"
                            />
                            <User size={16} className="absolute left-3.5 top-3.5 text-zinc-500" />
                        </div>
                    </div>

                    {/* Email (Read Only) */}
                    <div className="space-y-2">
                        <label className="text-sm text-zinc-400 block">Email Address</label>
                        <div className="relative">
                            <input
                                type="email"
                                value={user.email || ''}
                                readOnly
                                disabled
                                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-zinc-500 cursor-not-allowed"
                            />
                            <Mail size={16} className="absolute left-3.5 top-3.5 text-zinc-600" />
                        </div>
                        <p className="text-xs text-zinc-500">
                            Email cannot be changed directly. Please contact support if needed.
                        </p>
                    </div>

                    {/* Save Button */}
                    <div className="pt-2">
                        <button
                            onClick={handleSaveProfile}
                            disabled={isSaving || displayName === user.displayName}
                            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <Save size={18} />
                            )}
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

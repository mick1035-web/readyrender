'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { GoogleAuthProvider, FacebookAuthProvider, TwitterAuthProvider, deleteUser } from 'firebase/auth'
import { doc, deleteDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { errorHandler } from '@/lib/errorHandler'
import { Shield, AlertTriangle, Trash2, Mail } from 'lucide-react'
import Image from 'next/image'

// Icons for providers
import { FcGoogle } from "react-icons/fc"
import { FaFacebook, FaTwitter } from "react-icons/fa"

export default function SecurityTab() {
    const { user } = useAuth()
    const [isDeleting, setIsDeleting] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    if (!user) return null

    // Helper to check if a provider is linked
    const isProviderLinked = (providerId: string) => {
        return user.providerData.some(p => p.providerId === providerId)
    }

    const handleDeleteAccount = async () => {
        setIsDeleting(true)
        try {
            // 1. Delete Firestore User Document
            // Note: This should ideally be handled by a Cloud Function for comprehensive cleanup (storage, subcollections etc.)
            // For MVP, we delete the main user doc.
            await deleteDoc(doc(db, 'users', user.uid))

            // 2. Delete Auth User
            await deleteUser(user)

            // 3. Redirect is handled by AuthContext or Router logic usually, 
            // but deleteUser generally triggers onAuthStateChanged -> null

            errorHandler.success('Account deleted successfully')
        } catch (error) {
            console.error('Account deletion failed:', error)

            // Re-authentication might be required
            const errorMessage = error instanceof Error ? error.message : String(error)
            if (errorMessage.includes('requires-recent-login')) {
                errorHandler.handleGeneric(new Error('For security, please log out and log in again before deleting your account.'))
            } else {
                errorHandler.handleGeneric(error as Error)
            }
        } finally {
            setIsDeleting(false)
            setShowDeleteConfirm(false)
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-xl font-bold text-white mb-2">Security Settings</h2>
                <p className="text-zinc-400 text-sm">Manage your login methods and account security.</p>
            </div>

            {/* Linked Accounts */}
            <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl space-y-6">
                <div className="flex items-center gap-2 text-zinc-300">
                    <h3 className="text-sm font-semibold uppercase tracking-wider">Linked Accounts</h3>
                </div>

                <div className="space-y-4">
                    {/* Google */}
                    <div className="flex items-center justify-between p-4 bg-zinc-950/50 rounded-lg border border-zinc-800/50">
                        <div className="flex items-center gap-3">
                            <div className="bg-white p-1.5 rounded-full">
                                <FcGoogle size={18} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white">Google</p>
                                <p className="text-xs text-zinc-500">
                                    {isProviderLinked(GoogleAuthProvider.PROVIDER_ID) ? 'Connected' : 'Not Connected'}
                                </p>
                            </div>
                        </div>
                        {isProviderLinked(GoogleAuthProvider.PROVIDER_ID) && (
                            <span className="text-xs text-green-500 font-medium px-2 py-1 bg-green-500/10 rounded">Linked</span>
                        )}
                    </div>

                    {/* Facebook */}
                    <div className="flex items-center justify-between p-4 bg-zinc-950/50 rounded-lg border border-zinc-800/50">
                        <div className="flex items-center gap-3">
                            <div className="bg-[#1877F2] p-1.5 rounded-full text-white">
                                <FaFacebook size={18} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white">Facebook</p>
                                <p className="text-xs text-zinc-500">
                                    {isProviderLinked(FacebookAuthProvider.PROVIDER_ID) ? 'Connected' : 'Not Connected'}
                                </p>
                            </div>
                        </div>
                        {isProviderLinked(FacebookAuthProvider.PROVIDER_ID) && (
                            <span className="text-xs text-green-500 font-medium px-2 py-1 bg-green-500/10 rounded">Linked</span>
                        )}
                    </div>

                    {/* Twitter */}
                    <div className="flex items-center justify-between p-4 bg-zinc-950/50 rounded-lg border border-zinc-800/50">
                        <div className="flex items-center gap-3">
                            <div className="bg-black p-1.5 rounded-full text-white border border-zinc-700">
                                <FaTwitter size={18} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white">Twitter / X</p>
                                <p className="text-xs text-zinc-500">
                                    {isProviderLinked('twitter.com') ? 'Connected' : 'Not Connected'}
                                </p>
                            </div>
                        </div>
                        {isProviderLinked('twitter.com') && (
                            <span className="text-xs text-green-500 font-medium px-2 py-1 bg-green-500/10 rounded">Linked</span>
                        )}
                    </div>

                    {/* Email */}
                    <div className="flex items-center justify-between p-4 bg-zinc-950/50 rounded-lg border border-zinc-800/50">
                        <div className="flex items-center gap-3">
                            <div className="bg-zinc-700 p-1.5 rounded-full text-white">
                                <Mail size={18} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white">Email & Password</p>
                                <p className="text-xs text-zinc-500">
                                    {isProviderLinked('password') ? 'Enabled' : 'Not Enabled'}
                                </p>
                            </div>
                        </div>
                        {isProviderLinked('password') && (
                            <span className="text-xs text-green-500 font-medium px-2 py-1 bg-green-500/10 rounded">Set</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="p-6 bg-red-950/10 border border-red-900/30 rounded-xl space-y-6">
                <div className="flex items-center gap-2 text-red-400">
                    <AlertTriangle size={20} />
                    <h3 className="text-sm font-semibold uppercase tracking-wider">Danger Zone</h3>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-base font-medium text-white">Delete Account</p>
                        <p className="text-sm text-zinc-400 mt-1">
                            Permanently delete your account and all associated data. This action cannot be undone.
                        </p>
                    </div>

                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-4 py-2 bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white font-medium rounded-lg transition-colors border border-red-600/30"
                    >
                        Delete Account
                    </button>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-zinc-900 border border-red-900/50 rounded-xl max-w-md w-full p-6 shadow-2xl relative">
                        <div className="flex items-center gap-3 mb-4 text-red-500">
                            <div className="bg-red-500/10 p-3 rounded-full">
                                <AlertTriangle size={24} />
                            </div>
                            <h3 className="text-xl font-bold">Delete Account?</h3>
                        </div>

                        <p className="text-zinc-300 mb-6 leading-relaxed">
                            Are you absolutely sure? This action will permanently delete your account, projects, uploaded models, and generated assets. <br /><br />
                            <span className="font-semibold text-red-400">This action cannot be undone.</span>
                        </p>

                        <div className="flex items-center justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={isDeleting}
                                className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={isDeleting}
                                className={`flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors ${isDeleting ? 'opacity-50 cursor-wait' : ''
                                    }`}
                            >
                                {isDeleting ? (
                                    <>Deleting...</>
                                ) : (
                                    <>
                                        <Trash2 size={16} />
                                        Yes, Delete Account
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

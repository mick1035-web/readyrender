'use client'

import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { Trash2, Upload } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { uploadFile } from '@/lib/uploadFile'
import { errorHandler } from '@/lib/errorHandler'
import { ErrorType } from '@/types/errors'

export default function CustomSection() {
    const { user } = useAuth()
    const customHdris = useStore(s => s.customHdris)
    const hdriMode = useStore(s => s.hdriMode)
    const activeHdriId = useStore(s => s.activeHdriId)
    const setActiveHdri = useStore(s => s.setActiveHdri)

    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !user) return

        setIsUploading(true)
        setUploadProgress(0)

        try {
            const url = await uploadFile(file, user.uid, 'environments', (progress) => {
                setUploadProgress(progress)
            })

            // No need to add #.exr or #.hdr suffix
            // useTexture can detect the file type from the URL itself

            // Save to Firestore (will auto-sync to store via AuthContext)
            const newHdri = {
                name: file.name,
                url: url,
                uploadedAt: new Date(),
                type: 'upload' as const
            }

            const { addUserHdri } = await import('@/lib/hdriService')
            const hdriId = await addUserHdri(user.uid, newHdri)

            // Auto-apply and set as active
            setActiveHdri('custom', hdriId)
        } catch (error) {
            console.error('HDRI upload failed:', error)

            // Parse error message to determine specific error type
            const errorMessage = error instanceof Error ? error.message : String(error)

            if (errorMessage.includes('Invalid file type') || errorMessage.includes('not allowed')) {
                const ext = file.name.substring(file.name.lastIndexOf('.'))
                errorHandler.invalidFormat(ext, ['.hdr', '.exr'])
            } else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
                errorHandler.handle(ErrorType.NETWORK_ERROR)
            } else {
                errorHandler.handle(ErrorType.HDRI_UPLOAD_FAILED, { fileName: file.name })
            }
        } finally {
            setIsUploading(false)
            setUploadProgress(0)
            e.target.value = ''
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this HDRI?')) return
        if (!user) return

        try {
            const { removeUserHdri } = await import('@/lib/hdriService')
            await removeUserHdri(user.uid, id)
        } catch (error) {
            console.error('Error deleting HDRI:', error)
            errorHandler.handle(ErrorType.HDRI_LOAD_FAILED)
        }
    }

    const handleApply = (id: string) => {
        setActiveHdri('custom', id)
    }

    return (
        <section>
            <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    My HDRI Library ({customHdris.length})
                </h3>
            </div>

            {/* HDRI Gallery Grid */}
            <div className="space-y-2 mb-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                {customHdris.map(hdri => {
                    const isActive = hdriMode === 'custom' && activeHdriId === hdri.id
                    const isUpload = hdri.type === 'upload'

                    return (
                        <div
                            key={hdri.id}
                            className={`group relative flex items-center gap-3 p-3 rounded-lg transition-all ${isActive
                                ? 'bg-green-900/20 border border-green-500/50'
                                : 'bg-zinc-800/50 border border-zinc-800 hover:border-green-500/30'
                                }`}
                        >
                            <button
                                onClick={() => handleApply(hdri.id)}
                                className="flex-1 flex items-center gap-3 text-left"
                            >
                                {/* Type Icon */}
                                <div className={`w-10 h-10 rounded flex items-center justify-center text-xl ${isUpload ? 'bg-blue-900/20 text-blue-400' : 'bg-purple-900/20 text-purple-400'
                                    }`}>
                                    {isUpload ? 'Upload' : 'AI'}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-semibold text-zinc-200 truncate">
                                        {hdri.name}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                                        <span>{isUpload ? 'Uploaded' : 'AI Generated'}</span>
                                        <span>•</span>
                                        <span>{new Date(hdri.uploadedAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </button>

                            {/* Active Indicator */}
                            {isActive && (
                                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            )}

                            {/* Delete Button */}
                            <button
                                onClick={() => handleDelete(hdri.id)}
                                className="p-2 text-zinc-600 hover:text-red-500 hover:bg-red-900/20 rounded transition-colors flex-shrink-0"
                                title="Delete HDRI"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    )
                })}
            </div>

            {/* Upload Button */}
            <div className="relative">
                <input
                    type="file"
                    accept=".hdr,.exr"
                    onChange={handleFileChange}
                    disabled={isUploading || !user}
                    className="hidden"
                    id="hdri-upload-input"
                />
                <label
                    htmlFor="hdri-upload-input"
                    className={`block w-full px-4 py-3 rounded-lg text-sm font-medium text-center transition-all cursor-pointer ${isUploading
                        ? 'bg-zinc-700 text-zinc-400 cursor-wait'
                        : !user
                            ? 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
                            : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'
                        }`}
                >
                    {isUploading ? (
                        <span className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Uploading... {Math.round(uploadProgress)}%
                        </span>
                    ) : !user ? (
                        'Login to Upload'
                    ) : (
                        <span className="flex items-center justify-center gap-2">
                            <Upload size={16} />
                            + Upload HDRI (.hdr, .exr)
                        </span>
                    )}
                </label>
            </div>

        </section>
    )
}

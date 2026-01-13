'use client'

import { useStore, ImageConfig } from '@/store/useStore'
import { X, Image as ImageIcon, Upload, Trash2, Move, RotateCw } from 'lucide-react'
import { ChangeEvent, useState } from 'react'
import { uploadFile } from '@/lib/uploadFile'
import { useAuth } from '@/contexts/AuthContext'
import { errorHandler } from '@/lib/errorHandler'
import { ErrorType } from '@/types/errors'

export default function ImagePropertyPanel() {
    const editingImageId = useStore(s => s.editingImageId)
    const setEditingImageId = useStore(s => s.setEditingImageId)
    const keyframes = useStore(s => s.keyframes)
    const updateKeyframeImage = useStore(s => s.updateKeyframeImage)
    const { user } = useAuth()
    const [uploadProgress, setUploadProgress] = useState(0)
    const [isUploading, setIsUploading] = useState(false)

    if (!editingImageId) return null

    const keyframe = keyframes.find(k => k.id === editingImageId)
    if (!keyframe) return null

    const config = keyframe.imageConfig

    const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !user) return

        setIsUploading(true)
        setUploadProgress(0)

        try {
            // 上傳到 Firebase Storage
            const url = await uploadFile(file, user.uid, 'images', (progress) => {
                setUploadProgress(progress)
            })

            const isVector = file.type.includes('svg')

            const newConfig: ImageConfig = {
                url,
                name: file.name,
                visible: true,
                scale: 1,
                position: [0, 2, 0],
                rotation: [0, 0, 0],
                isVector
            }
            updateKeyframeImage(editingImageId, newConfig)
        } catch (error) {
            console.error('Upload failed:', error)

            // Parse error message to determine specific error type
            const errorMessage = error instanceof Error ? error.message : String(error)

            if (errorMessage.includes('Invalid file type') || errorMessage.includes('not allowed')) {
                const ext = file.name.substring(file.name.lastIndexOf('.'))
                errorHandler.invalidFormat(ext, ['.png', '.jpg', '.jpeg', '.svg', '.webp'])
            } else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
                errorHandler.handle(ErrorType.NETWORK_ERROR)
            } else {
                errorHandler.handle(ErrorType.FILE_UPLOAD_FAILED, { fileName: file.name })
            }
        } finally {
            setIsUploading(false)
            setUploadProgress(0)
            if (e.target) e.target.value = ''
        }
    }

    const handleChange = (newValues: Partial<ImageConfig>) => {
        if (!config) return
        const newConfig = { ...config, ...newValues }
        updateKeyframeImage(editingImageId, newConfig)
    }

    const handleDelete = () => {
        if (confirm('Remove image from this shot?')) {
            updateKeyframeImage(editingImageId, undefined)
        }
    }

    // [NEW] 封裝的拉霸群組元件 (與 Text 相同)
    const TransformSliderGroup = ({
        label,
        icon: Icon,
        value,
        onChange,
        min,
        max,
        step = 0.1,
        isRotation = false
    }: any) => (
        <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
                <Icon size={12} />
                <span>{label}</span>
            </div>
            {['X', 'Y', 'Z'].map((axis, i) => {
                const displayValue = isRotation
                    ? Math.round(value[i] * (180 / Math.PI))
                    : Number(value[i].toFixed(2))

                return (
                    <div key={axis} className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-zinc-500 w-3">{axis}</span>
                        <input
                            type="range"
                            min={min}
                            max={max}
                            step={step}
                            value={displayValue}
                            onChange={(e) => {
                                const newValue = [...value]
                                const inputVal = parseFloat(e.target.value)
                                newValue[i] = isRotation ? inputVal * (Math.PI / 180) : inputVal
                                onChange(newValue)
                            }}
                            className={`flex-1 h-1 rounded-lg appearance-none cursor-pointer ${isRotation ? 'bg-zinc-700 accent-blue-500' : 'bg-zinc-700 accent-green-500'
                                }`}
                        />
                        <span className="text-[10px] text-zinc-300 w-8 text-right font-mono">
                            {displayValue}°
                        </span>
                    </div>
                )
            })}
        </div>
    )

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-auto" onClick={() => setEditingImageId(null)}>
            <div className="w-80 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl p-5 space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <div className="flex items-center gap-2">
                        <ImageIcon size={16} className="text-green-500" />
                        <h3 className="text-sm font-bold text-white">Edit Image</h3>
                    </div>
                    <button onClick={() => setEditingImageId(null)} className="text-zinc-500 hover:text-white">
                        <X size={16} />
                    </button>
                </div>

                {/* Upload or Controls */}
                {!config ? (
                    <>
                        <label className={`py-10 flex flex-col items-center justify-center border-2 border-dashed rounded-lg transition-colors group ${isUploading
                            ? 'border-zinc-600 bg-zinc-800/30 cursor-wait'
                            : !user
                                ? 'border-zinc-700 bg-zinc-800/20 cursor-not-allowed'
                                : 'border-zinc-700 hover:bg-zinc-800/50 cursor-pointer'
                            }`}>
                            <input
                                type="file"
                                accept="image/png, image/jpeg, image/jpg, image/svg+xml, image/webp"
                                onChange={handleUpload}
                                disabled={isUploading || !user}
                                className="hidden"
                            />
                            <div className="flex flex-col items-center gap-2 text-zinc-400 group-hover:text-white">
                                {isUploading ? (
                                    <>
                                        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                                        <span className="text-xs font-medium mt-2">Uploading to Storage...</span>
                                    </>
                                ) : (
                                    <>
                                        <Upload size={32} />
                                        <span className="text-xs font-medium mt-2">
                                            {user ? 'Click to Upload Image' : 'Login to Upload'}
                                        </span>
                                    </>
                                )}
                            </div>
                        </label>

                        {/* Upload Progress Bar */}
                        {isUploading && uploadProgress > 0 && (
                            <div className="space-y-1">
                                <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                                    <div
                                        className="bg-gradient-to-r from-green-600 to-emerald-600 h-2 transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                                <p className="text-xs text-zinc-400 text-center">{Math.round(uploadProgress)}%</p>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <div className="flex items-center justify-between bg-zinc-800 p-2 rounded border border-zinc-700">
                            <span className="text-xs text-zinc-300 truncate max-w-[180px]">{config.name}</span>
                            <button onClick={handleDelete} className="text-red-400 hover:text-red-300 transition-colors">
                                <Trash2 size={14} />
                            </button>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs text-zinc-400">Scale ({config.scale.toFixed(1)}x)</label>
                            <input
                                type="range" min="0.1" max="5" step="0.1"
                                value={config.scale}
                                onChange={e => handleChange({ scale: parseFloat(e.target.value) })}
                                className="w-full h-1 bg-zinc-700 accent-green-500 rounded appearance-none cursor-pointer mt-3"
                            />
                        </div>

                        <hr className="border-zinc-800" />

                        <TransformSliderGroup
                            label="Position"
                            icon={Move}
                            value={config.position}
                            onChange={(pos: any) => handleChange({ position: pos })}
                            min={-10} max={10} step={0.1}
                        />

                        <TransformSliderGroup
                            label="Rotation"
                            icon={RotateCw}
                            value={config.rotation}
                            onChange={(rot: any) => handleChange({ rotation: rot })}
                            min={-180} max={180} step={1}
                            isRotation={true}
                        />
                    </>
                )}
            </div>
        </div>
    )
}
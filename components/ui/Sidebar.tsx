'use client'

import { useStore } from '@/store/useStore'
import { Box, Image, Upload, Video, Download, RotateCcw, Move, RotateCw, Edit2, Lock } from 'lucide-react'
import { ChangeEvent, useRef, useState, useEffect } from 'react'
import { uploadFile } from '@/lib/uploadFile'
import { useAuth } from '@/contexts/AuthContext'
import { useParams } from 'next/navigation'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { PLANS } from '@/constants/plans'
import UpgradeDialog from '@/components/ui/UpgradeDialog'
import HdriManager from '@/components/ui/HdriManager'
import { useToast } from '@/contexts/ToastContext'
import { errorHandler } from '@/lib/errorHandler'
import { ErrorType } from '@/types/errors'
import { validateFile } from '@/lib/fileValidation'

export default function Sidebar() {
    // Model State
    const modelUrl = useStore((state) => state.modelUrl)
    const setModelUrl = useStore((state) => state.setModelUrl)
    const modelScale = useStore((state) => state.modelScale)
    const setModelScale = useStore((state) => state.setModelScale)
    const setModelPosition = useStore((state) => state.setModelPosition)
    const setModelRotation = useStore((state) => state.setModelRotation)

    // Transform Mode (For Gizmo)
    const transformMode = useStore((state) => state.transformMode)
    const setTransformMode = useStore((state) => state.setTransformMode)

    // Environment State
    const envPreset = useStore((state) => state.envPreset)
    const setEnvPreset = useStore((state) => state.setEnvPreset)
    const customEnvUrl = useStore((state) => state.customEnvUrl)
    const setCustomEnvUrl = useStore((state) => state.setCustomEnvUrl)
    const envBlur = useStore((state) => state.envBlur)
    const setEnvBlur = useStore((state) => state.setEnvBlur)
    const envOpacity = useStore((state) => state.envOpacity)
    const setEnvOpacity = useStore((state) => state.setEnvOpacity)

    // UI & App State
    const setIsTimelineOpen = useStore((state) => state.setIsTimelineOpen)
    const isRendering = useStore((state) => state.isRendering)
    const setIsRendering = useStore((state) => state.setIsRendering)
    const exportSettings = useStore((state) => state.exportSettings)
    const setExportSettings = useStore((state) => state.setExportSettings)
    const keyframes = useStore((state) => state.keyframes)

    const setAutoGenPopupStep = useStore(s => s.setAutoGenPopupStep)

    const { user } = useAuth()
    const { showToast } = useToast()
    const params = useParams()
    const projectId = params.projectId as string

    const [uploadProgress, setUploadProgress] = useState(0)
    const [isUploading, setIsUploading] = useState(false)
    const [isModelLoading, setIsModelLoading] = useState(false)
    const [hdrUploadProgress, setHdrUploadProgress] = useState(0)
    const [isHdrUploading, setIsHdrUploading] = useState(false)
    const [isHdrLoading, setIsHdrLoading] = useState(false)
    const [projectName, setProjectName] = useState('Untitled Project')
    const [projectSubtitle, setProjectSubtitle] = useState('')
    const [isEditingTitle, setIsEditingTitle] = useState(false)
    const [isEditingSubtitle, setIsEditingSubtitle] = useState(false)
    const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
    const [uploadedHdrFileName, setUploadedHdrFileName] = useState<string | null>(null)
    const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
    const [upgradeFeature, setUpgradeFeature] = useState('')

    // Subscription state
    const subscription = useStore((state) => state.subscription)
    const currentPlan = PLANS[subscription.userTier]

    const modelInputRef = useRef<HTMLInputElement>(null)
    const hdrInputRef = useRef<HTMLInputElement>(null)
    const titleRef = useRef<HTMLHeadingElement>(null)

    // Track model loading completion and trigger auto-gen popup
    useEffect(() => {
        if (modelUrl && isModelLoading) {
            // Give the model time to load and render (2 seconds)
            const timer = setTimeout(() => {
                setIsModelLoading(false)
                console.log('✅ Model loaded and rendered')

                // Trigger auto-gen popup AFTER model is fully loaded
                // Using store method directly to avoid dependency issues
                useStore.getState().setAutoGenPopupStep('ask')
            }, 2000)

            return () => clearTimeout(timer)
        }
    }, [modelUrl, isModelLoading])

    // Track HDRI loading completion
    useEffect(() => {
        if (customEnvUrl && isHdrLoading) {
            // Give the HDRI time to load and render (2 seconds)
            const timer = setTimeout(() => {
                setIsHdrLoading(false)
                console.log('✅ HDRI loaded and rendered')
            }, 2000)

            return () => clearTimeout(timer)
        }
    }, [customEnvUrl, isHdrLoading])
    const subtitleRef = useRef<HTMLParagraphElement>(null)

    // Load project name from Firestore
    useState(() => {
        if (projectId) {
            const loadProjectName = async () => {
                try {
                    const projectDoc = await import('firebase/firestore').then(m => m.getDoc(doc(db, 'projects', projectId)))
                    if (projectDoc.exists()) {
                        const data = projectDoc.data()
                        setProjectName(data.name || 'Untitled Project')
                        setProjectSubtitle(data.subtitle || '3D Video Project')
                    }
                } catch (error) {
                    console.error('Error loading project:', error)
                }
            }
            loadProjectName()
        }
    })

    const updateProjectName = async (newName: string) => {
        if (!projectId || !newName.trim()) return
        try {
            await updateDoc(doc(db, 'projects', projectId), { name: newName })
            setProjectName(newName)
        } catch (error) {
            console.error('Error updating project name:', error)
        }
    }

    const updateProjectSubtitle = async (newSubtitle: string) => {
        if (!projectId || !newSubtitle.trim()) return
        try {
            await updateDoc(doc(db, 'projects', projectId), { subtitle: newSubtitle })
            setProjectSubtitle(newSubtitle)
        } catch (error) {
            console.error('Error updating project subtitle:', error)
        }
    }

    const handleTitleBlur = () => {
        setIsEditingTitle(false)
        updateProjectName(projectName)
    }

    const handleSubtitleBlur = () => {
        setIsEditingSubtitle(false)
        updateProjectSubtitle(projectSubtitle)
    }

    const handleTitleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            setIsEditingTitle(false)
            updateProjectName(projectName)
        }
    }

    const handleSubtitleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            setIsEditingSubtitle(false)
            updateProjectSubtitle(projectSubtitle)
        }
    }

    const handleModelFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !user) return

        // Validate file before upload
        const validation = validateFile(file, 'models')
        if (!validation.valid) {
            if (validation.error?.includes('Invalid file type')) {
                const ext = file.name.substring(file.name.lastIndexOf('.'))
                errorHandler.invalidFormat(ext, ['.glb', '.gltf', '.obj', '.fbx'])
            } else if (validation.error?.includes('empty')) {
                errorHandler.handle(ErrorType.FILE_CORRUPTED, { fileName: file.name })
            } else {
                errorHandler.handle(ErrorType.FILE_UPLOAD_FAILED)
            }
            if (e.target) e.target.value = ''
            return
        }

        // Check file size
        const maxSize = (currentPlan.features as any).maxModelSize || 50
        if (file.size > maxSize * 1024 * 1024) {
            errorHandler.fileTooLarge(file.size, maxSize, file.name)
            if (e.target) e.target.value = ''
            return
        }

        // Store the original filename
        setUploadedFileName(file.name)

        setIsUploading(true)
        setIsModelLoading(true)
        setUploadProgress(0)

        try {
            // 上傳到 Firebase Storage
            const url = await uploadFile(file, user.uid, 'models', (progress) => {
                setUploadProgress(progress)
            })

            // 判斷檔案類型
            const fileName = file.name.toLowerCase()
            let type: 'gltf' | 'obj' | 'fbx' = 'gltf'
            if (fileName.endsWith('.obj')) type = 'obj'
            else if (fileName.endsWith('.fbx')) type = 'fbx'

            setModelUrl(url, type)
            errorHandler.success('Model uploaded successfully!')

            // Keep upload progress visible until model loads
            setIsUploading(false)
        } catch (error) {
            console.error('Upload failed:', error)

            // Parse error message to determine specific error type
            const errorMessage = error instanceof Error ? error.message : String(error)

            if (errorMessage.includes('Invalid file type') || errorMessage.includes('not allowed')) {
                const ext = file.name.substring(file.name.lastIndexOf('.'))
                errorHandler.invalidFormat(ext, ['.glb', '.gltf', '.obj', '.fbx'])
            } else if (errorMessage.includes('too large') || errorMessage.includes('exceeds')) {
                const maxSize = (currentPlan.features as any).maxModelSize || 50
                errorHandler.fileTooLarge(file.size, maxSize, file.name)
            } else if (errorMessage.includes('empty') || errorMessage.includes('corrupted')) {
                errorHandler.handle(ErrorType.FILE_CORRUPTED, { fileName: file.name })
            } else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
                errorHandler.handle(ErrorType.NETWORK_ERROR)
            } else {
                // Generic upload failure
                errorHandler.handle(ErrorType.FILE_UPLOAD_FAILED, { fileName: file.name })
            }

            setIsUploading(false)
            setIsModelLoading(false)
            setUploadProgress(0)
        } finally {
            if (e.target) e.target.value = ''
        }
    }

    const handleHdrFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !user) return

        // 檢查 HDRI 上傳權限
        if (!currentPlan.features.allowHdriGen) {
            setUpgradeFeature('Custom HDRI Upload')
            setShowUpgradeDialog(true)
            if (e.target) e.target.value = ''
            return
        }

        // Validate file
        const validation = validateFile(file, 'environments')
        if (!validation.valid) {
            if (validation.error?.includes('Invalid file type')) {
                const ext = file.name.substring(file.name.lastIndexOf('.'))
                errorHandler.invalidFormat(ext, ['.hdr', '.exr'])
            } else {
                errorHandler.handle(ErrorType.HDRI_UPLOAD_FAILED)
            }
            if (e.target) e.target.value = ''
            return
        }

        // Store the original filename
        setUploadedHdrFileName(file.name)

        setIsHdrUploading(true)
        setIsHdrLoading(true)
        setHdrUploadProgress(0)

        try {
            // Upload to Firebase Storage
            const url = await uploadFile(file, user.uid, 'environments', (progress) => {
                setHdrUploadProgress(progress)
            })

            const isExr = file.name.toLowerCase().endsWith('.exr')
            const extension = isExr ? '#.exr' : '#.hdr'
            setCustomEnvUrl(url + extension)

            errorHandler.success('HDRI uploaded successfully!')

            // Keep upload progress visible until HDRI loads
            setIsHdrUploading(false)
        } catch (error) {
            console.error('HDR upload failed:', error)

            // Parse error message to determine specific error type
            const errorMessage = error instanceof Error ? error.message : String(error)

            if (errorMessage.includes('Invalid file type') || errorMessage.includes('not allowed')) {
                const ext = file.name.substring(file.name.lastIndexOf('.'))
                errorHandler.invalidFormat(ext, ['.hdr', '.exr'])
            } else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
                errorHandler.handle(ErrorType.NETWORK_ERROR)
            } else {
                // Generic HDRI upload failure
                errorHandler.handle(ErrorType.HDRI_UPLOAD_FAILED, { fileName: file.name })
            }

            setIsHdrUploading(false)
            setIsHdrLoading(false)
            setHdrUploadProgress(0)
            setUploadedHdrFileName('')
        } finally {
            if (e.target) e.target.value = ''
        }
    }
    const handleResetModelTransforms = () => {
        setModelScale(1.0)
        setModelPosition([0, 0, 0])
        setModelRotation([0, 0, 0])
        setTransformMode('translate') // Reset to default mode
    }

    const handleResetEnvSettings = () => {
        setEnvOpacity(1.0)
        setEnvBlur(0)
    }

    const fileName = uploadedFileName || (modelUrl ? 'model.glb' : null)

    // Calculate estimated export time based on resolution and video duration
    const calculateEstimatedTime = () => {
        // Calculate total video duration from keyframes
        const totalDuration = keyframes.reduce((sum, kf) => sum + kf.duration, 0)

        if (totalDuration === 0) return 0

        // Base time per second of video (in seconds)
        let timePerSecond = 1.5 // 720p baseline

        if (exportSettings.quality === '1080p') {
            timePerSecond = 2.5
        } else if (exportSettings.quality === '4k') {
            timePerSecond = 5.0
        }

        // Calculate estimated time and increase by 150% (multiply by 2.5)
        const estimatedSeconds = Math.ceil(totalDuration * timePerSecond * 2.5)
        return estimatedSeconds
    }

    const estimatedTime = calculateEstimatedTime()

    return (
        <aside className="w-[320px] h-screen bg-zinc-900 border-r border-zinc-800 flex flex-col overflow-y-auto">
            <div className="p-6 border-b border-zinc-800">
                <div className="group">
                    {isEditingTitle ? (
                        <input
                            type="text"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            onBlur={handleTitleBlur}
                            onKeyDown={handleTitleKeyDown}
                            autoFocus
                            className="w-full text-xl font-bold text-white bg-zinc-800 px-2 py-1 rounded outline-none border-2 border-blue-500"
                        />
                    ) : (
                        <div className="flex items-center justify-between gap-2">
                            <h1
                                onClick={() => setIsEditingTitle(true)}
                                className="text-xl font-bold text-white cursor-pointer hover:text-blue-400 transition-colors"
                            >
                                {projectName}
                            </h1>
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded border ${subscription.userTier === 'FREE'
                                ? 'bg-zinc-800 text-zinc-400 border-zinc-700'
                                : subscription.userTier === 'PRO'
                                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                                    : 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                                }`}>
                                {currentPlan.name}
                            </span>
                        </div>
                    )}

                    {isEditingSubtitle ? (
                        <input
                            type="text"
                            value={projectSubtitle}
                            onChange={(e) => setProjectSubtitle(e.target.value)}
                            onBlur={handleSubtitleBlur}
                            onKeyDown={handleSubtitleKeyDown}
                            autoFocus
                            className="w-full text-sm text-zinc-400 mt-1 bg-zinc-800 px-2 py-1 rounded outline-none border-2 border-blue-500"
                        />
                    ) : (
                        <p
                            onClick={() => setIsEditingSubtitle(true)}
                            className="text-sm text-zinc-400 mt-1 cursor-pointer hover:text-zinc-300 transition-colors"
                        >
                            {projectSubtitle}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex-1 p-6 space-y-8">

                {/* Section 1: Product Model */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Box className="w-5 h-5 text-blue-400" />
                            <h2 className="text-sm font-semibold text-zinc-300">1. Product Model</h2>
                        </div>
                    </div>

                    {/* Hint text with link */}
                    <p className="text-xs text-zinc-500 mb-3">
                        If your product does not have a 3D model, please{' '}
                        <button
                            onClick={() => alert('More applications will be launched soon.')}
                            className="text-blue-400 hover:text-blue-300 underline transition-colors cursor-pointer bg-transparent border-none p-0"
                        >
                            click here
                        </button>.
                    </p>

                    <div className="space-y-3">
                        {fileName && (
                            <div className="px-3 py-2 bg-zinc-800 rounded-md text-sm text-zinc-300 truncate">
                                {fileName}
                            </div>
                        )}

                        <input
                            ref={modelInputRef}
                            type="file"
                            accept=".glb,.gltf,.obj,.fbx"
                            onChange={handleModelFileChange}
                            className="hidden"
                        />

                        <button
                            onClick={() => modelInputRef.current?.click()}
                            disabled={isUploading || isModelLoading || !user}
                            data-tutorial="upload-model"
                            className={`w-full flex items-center justify-center gap-2 px-4 py-3 font-medium rounded-lg transition-all duration-200 shadow-lg ${isUploading || isModelLoading
                                ? 'bg-zinc-700 text-zinc-400 cursor-wait'
                                : !user
                                    ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:shadow-xl'
                                }`}
                        >
                            {isUploading || isModelLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    {isUploading ? 'Uploading...' : 'Loading Model...'}
                                </>
                            ) : (
                                <>
                                    <Upload size={18} />
                                    {user ? 'Upload Model' : 'Login to Upload'}
                                </>
                            )}
                        </button>

                        {/* Model Upload Progress Bar */}
                        {(isUploading || isModelLoading) && (
                            <div className="space-y-2 px-1">
                                <div className="flex items-center justify-between text-xs text-zinc-400">
                                    <span>{isUploading ? 'Uploading to storage...' : 'Loading 3D model...'}</span>
                                    {isUploading && <span>{Math.round(uploadProgress)}%</span>}
                                </div>
                                <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-300 ${isUploading ? 'bg-blue-500' : 'bg-purple-500 animate-pulse'
                                            }`}
                                        style={{ width: isUploading ? `${uploadProgress}%` : '100%' }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Model Active Status */}
                        {modelUrl && !isModelLoading && (
                            <div className="px-3 py-2 bg-blue-900/30 border border-blue-700 rounded-md text-xs text-blue-300 flex items-center justify-between">
                                <span>✓ 3D Model Active</span>
                                <button
                                    onClick={() => {
                                        setModelUrl('', 'gltf')
                                        setUploadedFileName(null)
                                    }}
                                    className="text-blue-400 hover:text-blue-200 underline"
                                >
                                    Clear
                                </button>
                            </div>
                        )}



                        {/* Model Controls */}
                        {modelUrl && (
                            <div className="pt-2 space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Transform</label>
                                    <button
                                        onClick={handleResetModelTransforms}
                                        title="Reset Model Scale, Position & Rotation"
                                        className="text-zinc-500 hover:text-white transition-colors p-1"
                                    >
                                        <RotateCcw size={14} />
                                    </button>
                                </div>

                                {/* [NEW] Transform Mode Toggles */}
                                <div className="grid grid-cols-2 gap-2 bg-zinc-800 p-1 rounded-lg">
                                    <button
                                        onClick={() => setTransformMode('translate')}
                                        className={`flex items-center justify-center gap-2 py-1.5 rounded-md text-xs font-medium transition-all ${transformMode === 'translate'
                                            ? 'bg-zinc-600 text-white shadow'
                                            : 'text-zinc-400 hover:text-white hover:bg-zinc-700'
                                            }`}
                                    >
                                        <Move size={14} />
                                        Move
                                    </button>
                                    <button
                                        onClick={() => setTransformMode('rotate')}
                                        className={`flex items-center justify-center gap-2 py-1.5 rounded-md text-xs font-medium transition-all ${transformMode === 'rotate'
                                            ? 'bg-zinc-600 text-white shadow'
                                            : 'text-zinc-400 hover:text-white hover:bg-zinc-700'
                                            }`}
                                    >
                                        <RotateCw size={14} />
                                        Rotate
                                    </button>
                                </div>

                                {/* Scale Slider */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs text-zinc-400">Scale</label>
                                        <span className="text-xs text-zinc-500">{modelScale.toFixed(2)}x</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0.1"
                                        max="3"
                                        step="0.1"
                                        value={modelScale}
                                        onChange={(e) => setModelScale(parseFloat(e.target.value))}
                                        className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                                        style={{
                                            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((modelScale - 0.1) / (3 - 0.1)) * 100}%, #3f3f46 ${((modelScale - 0.1) / (3 - 0.1)) * 100}%, #3f3f46 100%)`
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </section>



                {/* Section 2: Environment */}
                <section data-tutorial="hdri-section">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Image className="w-5 h-5 text-green-400" />
                            <h2 className="text-sm font-semibold text-zinc-300">2. Environment</h2>
                        </div>
                    </div>

                    <button
                        onClick={() => useStore.getState().setIsHdriManagerOpen(true)}
                        data-tutorial="hdri-presets"
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                        <Image size={18} />
                        HDRI Manager
                    </button>

                    <div className="pt-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Lighting</label>
                            <button
                                onClick={handleResetEnvSettings}
                                className="text-zinc-500 hover:text-white transition-colors p-1"
                            >
                                <RotateCcw size={14} />
                            </button>
                        </div>

                        {/* Brightness Slider */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs text-zinc-400">Brightness</label>
                                <span className="text-xs text-zinc-500">{Math.round(envOpacity * 100)}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={envOpacity * 100}
                                onChange={(e) => setEnvOpacity(Number(e.target.value) / 100)}
                                className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                                style={{
                                    background: `linear-gradient(to right, #10b981 0%, #10b981 ${envOpacity * 100}%, #3f3f46 ${envOpacity * 100}%, #3f3f46 100%)`
                                }}
                            />
                        </div>

                        {/* Blur Slider */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs text-zinc-400">Blur</label>
                                <span className="text-xs text-zinc-500">{Math.round(envBlur * 100)}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={envBlur * 100}
                                onChange={(e) => setEnvBlur(parseInt(e.target.value) / 100)}
                                className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                                style={{
                                    background: `linear-gradient(to right, #10b981 0%, #10b981 ${envBlur * 100}%, #3f3f46 ${envBlur * 100}%, #3f3f46 100%)`
                                }}
                            />
                        </div>
                    </div>
                </section>

                {/* Section 3: Camera Motion */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Video className="w-5 h-5 text-orange-400" />
                        <h2 className="text-sm font-semibold text-zinc-300">3. Camera Motion</h2>
                    </div>

                    <button
                        onClick={() => setIsTimelineOpen(true)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-medium rounded-lg hover:from-orange-700 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                        <Video size={18} />
                        Set Keyframe
                    </button>
                </section>
            </div>

            {/* Export Section */}
            <div className="p-6 border-t border-zinc-800 space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-400">Export Settings</label>

                    <div className="grid grid-cols-3 gap-2">
                        {['720p', '1080p', '4k'].map((q) => {
                            // Check if this resolution is allowed for current subscription tier
                            const maxRes = currentPlan.features.maxResolution
                            let isAllowed = false

                            if (maxRes === '720p') {
                                isAllowed = q === '720p'
                            } else if (maxRes === '1080p') {
                                isAllowed = q === '720p' || q === '1080p'
                            } else if (maxRes === '4K') {
                                isAllowed = true
                            }

                            return (
                                <button
                                    key={q}
                                    onClick={() => isAllowed && setExportSettings({ quality: q as any })}
                                    disabled={!isAllowed}
                                    title={!isAllowed ? `Upgrade to ${currentPlan.id === 'FREE' ? 'Pro' : 'Ultra'} to unlock ${q.toUpperCase()}` : ''}
                                    className={`text-xs py-1.5 rounded border transition-colors flex items-center justify-center gap-1 ${!isAllowed
                                        ? 'bg-zinc-800/50 border-zinc-700/50 text-zinc-600 cursor-not-allowed'
                                        : exportSettings.quality === q
                                            ? 'bg-blue-600 border-blue-500 text-white'
                                            : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700'
                                        }`}
                                >
                                    {q.toUpperCase()}
                                    {!isAllowed && <Lock size={10} />}
                                </button>
                            )
                        })}
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs text-zinc-400">Aspect Ratio</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['16:9', '1:1', '9:16'].map((ratio) => (
                                <button
                                    key={ratio}
                                    onClick={() => setExportSettings({ aspectRatio: ratio as any })}
                                    className={`text-xs py-1.5 rounded border transition-colors ${exportSettings.aspectRatio === ratio
                                        ? 'bg-purple-600 border-purple-500 text-white'
                                        : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700'
                                        }`}
                                >
                                    {ratio}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Export Format Info */}
                    <div className="text-xs text-zinc-400 bg-zinc-800/50 p-3 rounded-lg space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">MP4 (.mp4)</span>
                            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs">
                                H.264
                            </span>
                        </div>
                        <p>Universal compatibility: YouTube, TikTok, Instagram, Amazon ...</p>
                        {keyframes.length > 0 && (
                            <p className="text-blue-400">
                                The export is expected to take {estimatedTime} seconds.
                            </p>
                        )}
                    </div>
                </div>

                <button
                    onClick={() => setIsRendering(true)}
                    disabled={isRendering || !modelUrl}
                    data-tutorial="export-button"
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 font-bold rounded-lg transition-all duration-200 shadow-lg ${isRendering
                        ? 'bg-zinc-700 text-zinc-400 cursor-wait'
                        : !modelUrl
                            ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-white to-zinc-300 text-zinc-900 hover:from-zinc-100 hover:to-zinc-400 hover:shadow-2xl hover:scale-[1.02]'
                        }`}
                >
                    {isRendering ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Rendering...
                        </>
                    ) : (
                        <>
                            <Download size={18} strokeWidth={2.5} />
                            Start Render
                        </>
                    )}
                </button>

                <p className="text-xs text-zinc-500 text-center">
                    Powered by Three.js & React
                </p>
            </div>

            {/* Upgrade Dialog */}
            <UpgradeDialog
                isOpen={showUpgradeDialog}
                onClose={() => setShowUpgradeDialog(false)}
                currentTier={subscription.userTier}
                feature={upgradeFeature}
                requiredTier="PRO"
            />

            {/* HDRI Manager */}
            <HdriManager />
        </aside >
    )
}
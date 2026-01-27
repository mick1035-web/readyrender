'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import { useStore } from '@/store/useStore'
import { useUndoRedo } from '@/hooks/useUndoRedo'
import { captureThumbnail } from '@/lib/captureThumbnail'
import dynamic from 'next/dynamic'
import WebGLContextGuard from '@/components/WebGLContextGuard'
import TutorialModal from '@/components/tutorial/TutorialModal'
import { errorHandler } from '@/lib/errorHandler'
import { ErrorType } from '@/types/errors'

// Components
import Sidebar from '@/components/ui/Sidebar'

// Dynamic imports for heavy components (code splitting)
const Scene = dynamic(() => import('@/components/canvas/Scene'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center bg-zinc-900">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-zinc-400">Loading 3D Editor...</p>
            </div>
        </div>
    )
})

const TimelineContainer = dynamic(() => import('@/components/timeline/TimelineContainer'), {
    ssr: false,
    loading: () => (
        <div className="h-full flex items-center justify-center bg-zinc-900">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
    )
})
import SafeFrameOverlay from '@/components/canvas/SafeFrameOverlay'
import ConversionProgress from '@/components/ui/ConversionProgress'
import { Loader2, Save, ArrowLeft, Cloud } from 'lucide-react'
import Link from 'next/link'

export default function EditorPage() {
    const params = useParams()
    const projectId = params?.projectId as string
    const { user } = useAuth()
    const router = useRouter()

    // Enable undo/redo keyboard shortcuts
    useUndoRedo()

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [lastSaved, setLastSaved] = useState<Date | null>(null)
    const [lastProjectId, setLastProjectId] = useState<string | null>(null)
    const thumbnailTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const isLoadingRef = useRef(false) // Guard to prevent duplicate loads

    // Conversion state from store (must be at top level)
    const isConverting = useStore(s => s.isConverting)
    const conversionProgress = useStore(s => s.conversionProgress)
    const conversionStage = useStore(s => s.conversionStage)
    const exportSettings = useStore(s => s.exportSettings)

    // Watch for scene changes to capture thumbnail
    const modelUrl = useStore(s => s.modelUrl)
    const envPreset = useStore(s => s.envPreset)
    const canvasRef = useStore(s => s.canvasRef)
    const checkAndShowTip = useStore(s => s.checkAndShowTip)

    // Helper: Reset store to default values (for new projects)
    const resetStoreToDefaults = () => {
        console.log('Resetting store to defaults for new project')

        // CRITICAL: Use a single setState call to batch all updates
        // This prevents triggering 20+ individual re-renders
        const currentState = useStore.getState()
        useStore.setState({
            ...currentState,
            modelUrl: null,
            modelType: null,
            envPreset: 'default', // CHANGED: Default to 'default'
            stylePreset: 'natural',
            customEnvUrl: null,
            envBlur: 0, // CHANGED: 0% blur
            envOpacity: 1.0, // CHANGED: 100% brightness
            animationPreset: 'static',
            modelScale: 1.0,
            modelPosition: [0, 0, 0],
            modelRotation: [0, 0, 0],
            transformMode: 'translate',
            keyframes: [],
            isTimelineOpen: false,
            selectedKeyframeId: null,
            isPlaying: false,
            editingTextId: null,
            editingImageId: null,
            activeObjectId: null,
            hdriMode: 'preset', // CHANGED: Default HDRI mode to preset
            activeHdriId: 'default', // CHANGED: Default 'Default Studio'
            textConfig: {
                content: "",
                visible: false,
                color: "#ffffff",
                size: 1.5,
                position: [0, 2, 0],
                rotation: [0, 0, 0]
            },
            imageConfig: null,
            exportSettings: {
                quality: '720p',
                aspectRatio: '16:9',
                transparent: false,
                format: 'mp4'
            },
            aspectRatio: '16:9'
        }, true) // IMPORTANT: 'true' replaces the entire state, preventing partial updates

        console.log('✅ Store reset complete')
    }

    // [CRITICAL] Reset store when projectId changes (route change)
    useEffect(() => {
        if (projectId && projectId !== lastProjectId) {
            console.log('🔀 Project ID changed from', lastProjectId, 'to', projectId)
            console.log('🧹 Clearing store before loading new project')
            resetStoreToDefaults()
            setLastProjectId(projectId)
        }
    }, [projectId]) // FIXED: Removed lastProjectId from dependencies to prevent infinite loop

    // 1. 讀取專案資料 (Load Project)
    useEffect(() => {
        if (!projectId) {
            setLoading(false)
            return
        }

        // GUARD: Prevent duplicate loads
        if (isLoadingRef.current) {
            console.log('⏭️ Skipping duplicate project load')
            return
        }

        const loadProject = async () => {
            isLoadingRef.current = true // Set guard
            try {
                const docRef = doc(db, "projects", projectId)
                const docSnap = await getDoc(docRef)

                if (docSnap.exists()) {
                    const data = docSnap.data()
                    console.log('📂 Loading project:', projectId)
                    console.log('📊 Project data:', data)

                    // 權限檢查：確認是該使用者的專案
                    if (user && data.userId !== user.uid) {
                        errorHandler.handle(ErrorType.PERMISSION_DENIED)
                        router.push('/dashboard')
                        return
                    }

                    // [Critical] Load project state if it exists
                    if (data.storeState && Object.keys(data.storeState).length > 0) {
                        console.log('📥 Loading existing project state')
                        useStore.setState(data.storeState)
                    } else {
                        console.log('🆕 New project (empty storeState) - keeping defaults')
                        // Store was already reset in the previous useEffect
                    }

                    if (data.updatedAt) {
                        setLastSaved(new Date(data.updatedAt.seconds * 1000))
                    }
                } else {
                    errorHandler.handle(ErrorType.PROJECT_NOT_FOUND)
                    router.push('/dashboard')
                }
            } catch (error) {
                console.error("Error loading project:", error)

                const errorMessage = error instanceof Error ? error.message : String(error)

                if (errorMessage.includes('permission') || errorMessage.includes('denied')) {
                    errorHandler.handle(ErrorType.PERMISSION_DENIED)
                } else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
                    errorHandler.handle(ErrorType.NETWORK_ERROR)
                } else {
                    errorHandler.handle(ErrorType.PROJECT_LOAD_FAILED, {
                        projectId,
                        details: errorMessage
                    })
                }
            } finally {
                setLoading(false)
                isLoadingRef.current = false // Release guard
            }
        }

        loadProject()
    }, [projectId, user, router])

    // 自動啟動教學提示
    useEffect(() => {
        if (!loading && !modelUrl) {
            checkAndShowTip('editor_load')
        } else if (!loading && modelUrl) {
            checkAndShowTip('model_uploaded')
        }
    }, [loading, modelUrl, checkAndShowTip])

    // 2. 儲存專案 (Save Project)
    const handleSave = useCallback(async () => {
        if (!projectId || saving) return

        setSaving(true)
        try {
            // 取得當前所有狀態
            const state = useStore.getState()

            // Helper function to remove undefined values
            const removeUndefined = (obj: any): any => {
                if (obj === null || obj === undefined) return null
                if (Array.isArray(obj)) {
                    return obj.map(removeUndefined)
                }
                if (typeof obj === 'object') {
                    const cleaned: any = {}
                    Object.keys(obj).forEach(key => {
                        const value = obj[key]
                        if (value !== undefined) {
                            cleaned[key] = removeUndefined(value)
                        }
                    })
                    return cleaned
                }
                return obj
            }

            // 挑選需要儲存的欄位 (避免儲存過多無效資料，如 canvasRef)
            const stateToSave = removeUndefined({
                modelUrl: state.modelUrl,
                modelType: state.modelType,
                envPreset: state.envPreset,
                customEnvUrl: state.customEnvUrl,
                envBlur: state.envBlur,
                envOpacity: state.envOpacity,
                stylePreset: state.stylePreset,
                animationPreset: state.animationPreset,

                // [FIX] Save HDRI selection state
                hdriMode: state.hdriMode,
                activeHdriId: state.activeHdriId,

                modelScale: state.modelScale,
                modelPosition: state.modelPosition,
                modelRotation: state.modelRotation,

                keyframes: state.keyframes,
                exportSettings: state.exportSettings,
                aspectRatio: state.aspectRatio,

                // 記得儲存當前的文字/圖片設定，以便下次打開時恢復
                textConfig: state.textConfig,
                imageConfig: state.imageConfig
            })

            const docRef = doc(db, "projects", projectId)

            // 📸 Capture and upload thumbnail before updating Firestore
            let thumbnailUrl = undefined
            if (canvasRef) {
                try {
                    console.log('📸 Capturing thumbnail during save...')
                    thumbnailUrl = await captureThumbnail(canvasRef, projectId)
                    console.log('✅ Thumbnail captured:', thumbnailUrl)
                } catch (thumbError) {
                    console.error('⚠️ Failed to capture thumbnail:', thumbError)
                    // Continue saving even if thumbnail fails
                }
            }

            await updateDoc(docRef, {
                storeState: stateToSave,
                ...(thumbnailUrl ? { thumbnail: thumbnailUrl } : {}),
                updatedAt: serverTimestamp()
            })

            setLastSaved(new Date())
            errorHandler.success('Project saved successfully')
        } catch (error) {
            console.error("Error saving project:", error)

            const errorMessage = error instanceof Error ? error.message : String(error)

            if (errorMessage.includes('network') || errorMessage.includes('connection')) {
                errorHandler.handle(ErrorType.NETWORK_ERROR)
            } else if (errorMessage.includes('permission') || errorMessage.includes('denied')) {
                errorHandler.handle(ErrorType.PERMISSION_DENIED)
            } else {
                errorHandler.handle(ErrorType.PROJECT_SAVE_FAILED, {
                    projectId,
                    details: errorMessage
                })
            }
        } finally {
            setSaving(false)
        }
    }, [projectId, saving])


    // 自動儲存 (可選：每 60 秒自動存一次)
    useEffect(() => {
        const interval = setInterval(() => {
            if (!loading) handleSave()
        }, 60000)
        return () => clearInterval(interval)
    }, [loading, handleSave])


    if (loading) {
        return (
            <div className="w-full h-screen flex flex-col items-center justify-center bg-zinc-950 text-white gap-4">
                <Loader2 className="animate-spin text-blue-500" size={48} />
                <p className="text-zinc-400">Loading project...</p>
            </div>
        )
    }

    return (
        <WebGLContextGuard>
            <TutorialModal />
            <div className="flex h-screen bg-black text-white overflow-hidden">

                {/* Left Sidebar */}
                <Sidebar />

                {/* Main Content */}
                <div className="flex-1 flex flex-col relative overflow-hidden">

                    {/* Top Bar (Overlay on top of Scene) */}
                    <div className="absolute top-0 left-0 right-0 h-14 z-40 flex items-center justify-between px-6 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">

                        {/* Left: Back to Dashboard */}
                        <Link href="/dashboard" className="flex items-center gap-2 text-zinc-300 hover:text-white pointer-events-auto transition-colors">
                            <ArrowLeft size={16} />
                            <span className="text-sm font-medium">Dashboard</span>
                        </Link>

                        {/* Right: Save Status & Button */}
                        <div className="flex items-center gap-4 pointer-events-auto">
                            {lastSaved && (
                                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                                    <Cloud size={12} />
                                    <span>Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            )}

                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-lg ${saving
                                    ? 'bg-zinc-700 text-zinc-400 cursor-wait'
                                    : 'bg-white text-black hover:bg-zinc-200'
                                    }`}
                            >
                                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                {saving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>

                    {/* 3D Scene Area - flex-1 to fill available space */}
                    <div className="flex-1 relative bg-zinc-900 min-h-0 canvas-container" data-tutorial="canvas">
                        <SafeFrameOverlay />
                        <Scene />
                    </div>

                    {/* Bottom Timeline - flex-shrink-0 to prevent being pushed off */}
                    <TimelineContainer />
                </div>

                {/* Conversion Progress Modal */}
                {isConverting && (
                    <ConversionProgress
                        progress={conversionProgress}
                        stage={conversionStage}
                        format={exportSettings.format}
                    />
                )}
            </div>
        </WebGLContextGuard>
    )
}


import { create } from 'zustand'
import { temporal } from 'zundo'
import { shallow } from 'zustand/shallow'
import { CAMERA_PRESETS, PresetData } from '@/constants/presets'
import { PlanTier, PLANS } from '@/constants/plans'
import { CustomHdri } from '@/constants/hdri'

type Vector3Array = [number, number, number]

export interface CameraState {
    position: Vector3Array
    target: Vector3Array
}

export interface TextConfig {
    content: string
    visible: boolean
    color: string
    size: number
    position: [number, number, number]
    rotation: [number, number, number]
}

export interface ImageConfig {
    url: string
    name: string
    visible: boolean
    scale: number
    position: [number, number, number]
    rotation: [number, number, number]
    isVector: boolean
}

export interface Keyframe {
    id: string
    cameraState?: CameraState
    duration: number
    textConfig?: TextConfig
    imageConfig?: ImageConfig
}

export interface ExportSettings {
    quality: '720p' | '1080p' | '4k'
    aspectRatio: '16:9' | '1:1' | '9:16'
    transparent: boolean
}

export type PopupStep = 'idle' | 'ask' | 'preview' | 'render'

export interface SubscriptionState {
    userTier: PlanTier
    subscriptionCredits: number // [MODIFIED] 每月重置的點數
    purchasedCredits: number    // [NEW] 永久有效的加購點數
    resetDate: Date
    stripeCustomerId?: string
    stripeSubscriptionId?: string
}

interface StoreState {
    // Model & Env
    modelUrl: string | null
    modelType: 'gltf' | 'obj' | 'fbx' | null
    setModelUrl: (url: string, type: 'gltf' | 'obj' | 'fbx') => void
    envPreset: string
    setEnvPreset: (preset: string) => void
    stylePreset: string
    setStylePreset: (preset: string) => void
    customEnvUrl: string | null
    setCustomEnvUrl: (url: string | null) => void
    envBlur: number
    setEnvBlur: (blur: number) => void
    envOpacity: number
    setEnvOpacity: (opacity: number) => void
    animationPreset: string
    setAnimationPreset: (preset: string) => void
    canvasRef: HTMLCanvasElement | null
    setCanvasRef: (ref: HTMLCanvasElement | null) => void
    isExporting: boolean
    setIsExporting: (isExporting: boolean) => void

    // Model Transform
    modelScale: number
    setModelScale: (scale: number) => void
    modelPosition: [number, number, number]
    setModelPosition: (pos: [number, number, number]) => void
    modelRotation: [number, number, number]
    setModelRotation: (rot: [number, number, number]) => void

    // Gizmo Mode
    transformMode: 'translate' | 'rotate'
    setTransformMode: (mode: 'translate' | 'rotate') => void

    // Timeline
    keyframes: Keyframe[]
    addKeyframe: () => void
    updateKeyframeDuration: (id: string, duration: number) => void
    reorderKeyframes: (newOrder: Keyframe[]) => void
    removeKeyframe: (id: string) => void

    // Template System
    isTemplateManagerOpen: boolean
    setIsTemplateManagerOpen: (isOpen: boolean) => void
    customPresets: PresetData[]
    saveCurrentAsPreset: (name: string) => void
    deleteCustomPreset: (id: string) => void
    applyPreset: (presetId: string, isCustom?: boolean) => void

    isTimelineOpen: boolean
    setIsTimelineOpen: (isOpen: boolean) => void
    selectedKeyframeId: string | null
    setSelectedKeyframeId: (id: string | null) => void
    isPlaying: boolean
    setIsPlaying: (playing: boolean) => void

    // Signals
    captureSignal: 'start' | 'end' | null
    setCaptureSignal: (signal: 'start' | 'end' | null) => void
    updateSignal: string | null
    setUpdateSignal: (id: string | null) => void
    updateKeyframeCamera: (id: string, cameraState: CameraState) => void
    clearKeyframeCamera: (id: string) => void

    // Popup
    autoGenPopupStep: PopupStep
    setAutoGenPopupStep: (step: PopupStep) => void

    // Text State
    editingTextId: string | null
    setEditingTextId: (id: string | null) => void
    updateKeyframeText: (id: string, config: TextConfig) => void
    textConfig: TextConfig
    setTextConfig: (config: Partial<TextConfig>) => void

    // Image State
    editingImageId: string | null
    setEditingImageId: (id: string | null) => void
    updateKeyframeImage: (id: string, config: ImageConfig | undefined) => void
    imageConfig: ImageConfig | null
    setImageConfig: (config: Partial<ImageConfig> | null) => void

    // Selection
    activeObjectId: 'model' | 'text' | 'image' | null
    setActiveObjectId: (id: 'model' | 'text' | 'image' | null) => void

    // Render
    isRendering: boolean
    setIsRendering: (isRendering: boolean) => void
    exportSettings: ExportSettings
    setExportSettings: (settings: Partial<ExportSettings>) => void

    // Conversion (FFmpeg)
    isConverting: boolean
    setIsConverting: (isConverting: boolean) => void
    conversionStage: 'loading' | 'converting'
    setConversionStage: (stage: 'loading' | 'converting') => void
    conversionProgress: number
    setConversionProgress: (progress: number) => void

    aspectRatio: string
    setAspectRatio: (ratio: string) => void

    // Subscription & Credits
    subscription: SubscriptionState
    deductCredits: (amount: number) => boolean
    resetMonthlyCredits: () => void
    updateSubscription: (tier: PlanTier, credits?: number, resetDate?: Date) => void
    setUserTier: (tier: PlanTier) => void // [NEW] 設定使用者等級
    setCreditsData: (sub: number, purchased: number) => void // [NEW] 設定點數資料

    // HDRI Manager
    isHdriManagerOpen: boolean
    setIsHdriManagerOpen: (isOpen: boolean) => void
    customHdris: CustomHdri[]
    addCustomHdri: (hdri: CustomHdri) => void
    removeCustomHdri: (id: string) => void
    isGeneratingEnv: boolean
    setIsGeneratingEnv: (isGenerating: boolean) => void

    // Exclusive HDRI Mode Selection
    hdriMode: 'preset' | 'custom' | 'none'
    activeHdriId: string | null
    setActiveHdri: (mode: 'preset' | 'custom' | 'none', id?: string) => void

    // Tutorial System
    tutorial: {
        isActive: boolean
        currentStep: number
        completed: boolean
        skipped: boolean
    }
    startTutorial: () => void
    nextTutorialStep: () => void
    skipTutorial: () => void
    completeTutorial: () => void
    resetTutorial: () => void

    // Legacy states (kept for backward compatibility)
    selectedPreset: string
    setSelectedPreset: (preset: string) => void
    showEnvBackground: boolean
    setShowEnvBackground: (show: boolean) => void

    // Model loading state
    setModelLoaded: () => void
}

export const useStore = create<StoreState>()(
    temporal(
        (set, get) => ({
            modelUrl: null,
            modelType: null,
            setModelUrl: (url, type) => set({ modelUrl: url, modelType: type }),
            envPreset: 'city',
            setEnvPreset: (preset) => set({ envPreset: preset, customEnvUrl: null }),
            stylePreset: 'natural',
            setStylePreset: (preset) => set({ stylePreset: preset }),
            customEnvUrl: null,
            setCustomEnvUrl: (url) => set({ customEnvUrl: url }),
            envBlur: 0,
            setEnvBlur: (blur) => set({ envBlur: blur }),
            envOpacity: 1.0,
            setEnvOpacity: (opacity) => set({ envOpacity: opacity }),
            animationPreset: 'static',
            setAnimationPreset: (preset) => set({ animationPreset: preset }),
            canvasRef: null,
            setCanvasRef: (ref) => set({ canvasRef: ref }),
            isExporting: false,
            setIsExporting: (isExporting) => set({ isExporting }),

            modelScale: 1.0,
            setModelScale: (scale) => set({ modelScale: scale }),
            modelPosition: [0, 0, 0],
            setModelPosition: (pos) => set({ modelPosition: pos }),
            modelRotation: [0, 0, 0],
            setModelRotation: (rot) => set({ modelRotation: rot }),

            transformMode: 'translate',
            setTransformMode: (mode) => set({ transformMode: mode }),

            // Timeline
            keyframes: [],
            isTimelineOpen: false,
            setIsTimelineOpen: (isOpen) => set({ isTimelineOpen: isOpen }),
            selectedKeyframeId: null,
            setSelectedKeyframeId: (id) => set({ selectedKeyframeId: id }),
            isPlaying: false,
            setIsPlaying: (playing) => set({ isPlaying: playing }),

            // Template Logic
            isTemplateManagerOpen: false,
            setIsTemplateManagerOpen: (isOpen) => set({ isTemplateManagerOpen: isOpen }),
            customPresets: (() => {
                if (typeof window === 'undefined') return []
                try {
                    const saved = localStorage.getItem('customCameraPresets')
                    return saved ? JSON.parse(saved) : []
                } catch (e) {
                    console.error('Failed to load custom presets from localStorage:', e)
                    return []
                }
            })(),

            saveCurrentAsPreset: (name) => {
                const { keyframes } = get()
                if (keyframes.length === 0) return

                const presetKeyframes = keyframes.map(k => ({
                    duration: k.duration,
                    cameraState: k.cameraState ? { ...k.cameraState } : undefined,
                    textConfig: k.textConfig ? { ...k.textConfig } : undefined,
                    imageConfig: k.imageConfig ? {
                        ...k.imageConfig,
                        url: '[USER_IMAGE]',
                        name: ''
                    } : undefined
                }))

                const newPreset: PresetData = {
                    id: `custom-${Date.now()}`,
                    label: name,
                    description: `${keyframes.length} shots • Custom User Template`,
                    keyframes: presetKeyframes as any
                }

                const updatedPresets = [...get().customPresets, newPreset]
                set({ customPresets: updatedPresets })

                try {
                    localStorage.setItem('customCameraPresets', JSON.stringify(updatedPresets))
                } catch (e) {
                    console.error('Failed to save templates to localStorage:', e)
                }
            },

            deleteCustomPreset: (id) => {
                const updatedPresets = get().customPresets.filter(p => p.id !== id)
                set({ customPresets: updatedPresets })

                try {
                    localStorage.setItem('customCameraPresets', JSON.stringify(updatedPresets))
                } catch (e) {
                    console.error('Failed to update localStorage:', e)
                }
            },

            applyPreset: (presetId, isCustom = false) => {
                try {
                    console.log('🎬 Applying preset:', { presetId, isCustom })

                    const state = get()
                    const preset = isCustom
                        ? state.customPresets.find(p => p.id === presetId)
                        : CAMERA_PRESETS.find(p => p.id === presetId)

                    if (!preset) {
                        console.error('❌ Preset not found:', presetId)
                        return
                    }

                    console.log('✅ Preset found:', preset.label, 'with', preset.keyframes.length, 'keyframes')

                    const newKeyframes: Keyframe[] = preset.keyframes.map((k, index) => {
                        let imageConfig = (k as any).imageConfig
                        if (imageConfig && imageConfig.url === '[USER_IMAGE]') {
                            imageConfig = undefined
                        }

                        const keyframe = {
                            id: `kf-${Date.now()}-${index}`,
                            duration: k.duration,
                            cameraState: k.cameraState,
                            textConfig: k.textConfig,
                            imageConfig
                        }

                        console.log(`  📍 Keyframe ${index + 1}:`, {
                            hasCamera: !!k.cameraState,
                            hasText: !!k.textConfig,
                            hasImage: !!imageConfig
                        })

                        return keyframe
                    })

                    console.log('🔄 Setting new state with', newKeyframes.length, 'keyframes')

                    set({
                        keyframes: newKeyframes,
                        selectedKeyframeId: null,
                        editingTextId: null,
                        editingImageId: null,
                        activeObjectId: null,
                        textConfig: {
                            content: "",
                            visible: false,
                            color: "#ffffff",
                            size: 1.5,
                            position: [0, 2, 0],
                            rotation: [0, 0, 0]
                        },
                        imageConfig: null,
                        isTemplateManagerOpen: false
                    })

                    console.log('✅ Preset applied successfully!')
                } catch (error) {
                    console.error('💥 Error applying preset:', error)
                    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
                    throw error // Re-throw to show error boundary
                }
            },

            autoGenPopupStep: 'idle',
            setAutoGenPopupStep: (step) => set({ autoGenPopupStep: step }),

            // Signals
            captureSignal: null,
            setCaptureSignal: (signal) => set({ captureSignal: signal }),
            updateSignal: null,
            setUpdateSignal: (id) => set({ updateSignal: id }),
            updateKeyframeCamera: (id, cameraState) => set((state) => ({
                keyframes: state.keyframes.map((k) =>
                    k.id === id ? { ...k, cameraState } : k
                )
            })),
            clearKeyframeCamera: (id) => set((state) => ({
                keyframes: state.keyframes.map((k) =>
                    k.id === id ? { ...k, cameraState: undefined } : k
                )
            })),

            addKeyframe: () => set((state) => ({
                keyframes: [
                    ...state.keyframes,
                    {
                        id: `kf-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
                        cameraState: undefined,
                        duration: 2
                    }
                ]
            })),

            updateKeyframeDuration: (id, duration) => set((state) => ({
                keyframes: state.keyframes.map((k) =>
                    k.id === id ? { ...k, duration: Math.max(0.5, duration) } : k
                )
            })),

            reorderKeyframes: (newOrder) => set({ keyframes: newOrder }),

            removeKeyframe: (id) => set((state) => {
                const keyframeToRemove = state.keyframes.find(k => k.id === id)

                let shouldResetText = false
                let shouldResetImage = false

                if (keyframeToRemove) {
                    if (state.textConfig.visible &&
                        keyframeToRemove.textConfig &&
                        state.textConfig.content === keyframeToRemove.textConfig.content &&
                        state.textConfig.position[0] === keyframeToRemove.textConfig.position[0]) {
                        shouldResetText = true
                    }

                    if (state.imageConfig?.visible &&
                        keyframeToRemove.imageConfig &&
                        state.imageConfig.url === keyframeToRemove.imageConfig.url) {
                        shouldResetImage = true
                    }
                }

                const isTargetActive =
                    state.selectedKeyframeId === id ||
                    state.editingTextId === id ||
                    state.editingImageId === id

                if (isTargetActive) {
                    shouldResetText = true
                    shouldResetImage = true
                }

                return {
                    keyframes: state.keyframes.filter((k) => k.id !== id),
                    selectedKeyframeId: state.selectedKeyframeId === id ? null : state.selectedKeyframeId,
                    editingTextId: state.editingTextId === id ? null : state.editingTextId,
                    editingImageId: state.editingImageId === id ? null : state.editingImageId,
                    activeObjectId: isTargetActive ? null : state.activeObjectId,
                    textConfig: shouldResetText ? { ...state.textConfig, visible: false } : state.textConfig,
                    imageConfig: shouldResetImage ? null : state.imageConfig
                }
            }),

            // Text Implementation
            editingTextId: null,
            setEditingTextId: (id) => set({ editingTextId: id, editingImageId: null }),

            updateKeyframeText: (id, config) => set((state) => {
                const shouldUpdateView = state.editingTextId === id
                return {
                    keyframes: state.keyframes.map(k => k.id === id ? { ...k, textConfig: config } : k),
                    textConfig: shouldUpdateView ? config : state.textConfig
                }
            }),

            textConfig: {
                content: "",
                visible: false,
                color: "#ffffff",
                size: 1.5,
                position: [0, 2, 0],
                rotation: [0, 0, 0]
            },
            setTextConfig: (config) => set((state) => ({
                textConfig: { ...state.textConfig, ...config }
            })),

            // Image Implementation
            editingImageId: null,
            setEditingImageId: (id) => set({ editingImageId: id, editingTextId: null }),

            updateKeyframeImage: (id, config) => set((state) => {
                const shouldUpdateView = state.editingImageId === id
                return {
                    keyframes: state.keyframes.map(k => k.id === id ? { ...k, imageConfig: config } : k),
                    imageConfig: shouldUpdateView && config ? config : state.imageConfig
                }
            }),

            imageConfig: null,
            setImageConfig: (config) => set((state) => {
                if (config === null) return { imageConfig: null }
                if (state.imageConfig && typeof config === 'object') {
                    return { imageConfig: { ...state.imageConfig, ...config } }
                }
                return { imageConfig: config as ImageConfig }
            }),

            // Selection
            activeObjectId: null,
            setActiveObjectId: (id) => set({ activeObjectId: id }),

            isRendering: false,
            setIsRendering: (isRendering) => set({ isRendering }),
            exportSettings: {
                quality: '720p',
                aspectRatio: '16:9',
                transparent: false
            },
            setExportSettings: (settings) => set((state) => ({
                exportSettings: { ...state.exportSettings, ...settings }
            })),

            // Conversion State
            isConverting: false,
            setIsConverting: (isConverting) => set({ isConverting }),
            conversionStage: 'loading',
            setConversionStage: (stage) => set({ conversionStage: stage }),
            conversionProgress: 0,
            setConversionProgress: (progress) => set({ conversionProgress: progress }),

            aspectRatio: '16:9',
            setAspectRatio: (ratio) => set({ aspectRatio: ratio }),

            // Subscription & Credits Implementation
            subscription: {
                userTier: 'FREE',
                subscriptionCredits: 200, // [MODIFIED] Changed from userCredits
                purchasedCredits: 0,      // [NEW] Added
                resetDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
            },

            // [NEW] Action to update Tier from AuthContext
            setUserTier: (tier) => set((state) => ({
                subscription: { ...state.subscription, userTier: tier }
            })),

            // [NEW] Action to update Credits from AuthContext
            setCreditsData: (sub, purchased) => set((state) => ({
                subscription: {
                    ...state.subscription,
                    subscriptionCredits: sub,
                    purchasedCredits: purchased
                }
            })),

            // [MODIFIED] Intelligent Credit Deduction (Sub first, then Purchased)
            deductCredits: (amount) => {
                const { subscription } = get()
                const total = subscription.subscriptionCredits + subscription.purchasedCredits

                if (total >= amount) {
                    let newSub = subscription.subscriptionCredits
                    let newPurchased = subscription.purchasedCredits

                    if (newSub >= amount) {
                        // subscription credits are enough
                        newSub -= amount
                    } else {
                        // need to use purchased credits
                        const remainder = amount - newSub
                        newSub = 0
                        newPurchased -= remainder
                    }

                    set({
                        subscription: {
                            ...subscription,
                            subscriptionCredits: newSub,
                            purchasedCredits: newPurchased
                        }
                    })
                    return true
                } else {
                    alert(`Insufficient credits! You need ${amount} credits but only have ${total}.`)
                    return false
                }
            },

            resetMonthlyCredits: () => {
                const { subscription } = get()
                const plan = PLANS[subscription.userTier]
                const nextResetDate = new Date()
                nextResetDate.setMonth(nextResetDate.getMonth() + 1)

                set({
                    subscription: {
                        ...subscription,
                        subscriptionCredits: plan.features?.credits || 200, // [MODIFIED] Safe access
                        resetDate: nextResetDate
                    }
                })
            },

            updateSubscription: (tier, credits, resetDate) => {
                const { subscription } = get()
                const plan = PLANS[tier]

                set({
                    subscription: {
                        ...subscription,
                        userTier: tier,
                        subscriptionCredits: credits !== undefined ? credits : (plan.features?.credits || 200), // [MODIFIED]
                        resetDate: resetDate || new Date(new Date().setMonth(new Date().getMonth() + 1))
                    }
                })
            },

            // HDRI Manager
            isHdriManagerOpen: false,
            setIsHdriManagerOpen: (isOpen) => set({ isHdriManagerOpen: isOpen }),

            // Custom HDRIs - managed by Firestore via AuthContext
            customHdris: [],

            addCustomHdri: (hdri) => set((state) => ({
                customHdris: [...state.customHdris, hdri]
            })),

            removeCustomHdri: (id) => set((state) => ({
                customHdris: state.customHdris.filter(h => h.id !== id)
            })),

            isGeneratingEnv: false,
            setIsGeneratingEnv: (isGenerating) => set({ isGeneratingEnv: isGenerating }),

            // Exclusive HDRI Mode Selection
            hdriMode: 'none', // CHANGED: Default to none instead of preset
            activeHdriId: null, // CHANGED: No active HDRI by default
            setActiveHdri: (mode, id) => set((state) => {
                if (mode === 'preset') {
                    return {
                        hdriMode: 'preset',
                        activeHdriId: id || null,
                        selectedPreset: id || 'none',
                        customEnvUrl: null,
                        envPreset: id || 'none'
                    }
                } else if (mode === 'custom') {
                    const customHdri = state.customHdris.find(h => h.id === id)
                    return {
                        hdriMode: 'custom',
                        activeHdriId: id || null,
                        customEnvUrl: customHdri?.url || null,
                        selectedPreset: '',
                        envPreset: ''
                    }
                } else {
                    return {
                        hdriMode: 'none',
                        activeHdriId: null,
                        customEnvUrl: null,
                        selectedPreset: '',
                        envPreset: ''
                    }
                }
            }),

            // Tutorial System Implementation
            tutorial: (() => {
                if (typeof window === 'undefined') return {
                    isActive: false,
                    currentStep: 0,
                    completed: false,
                    skipped: false
                }
                try {
                    const completed = localStorage.getItem('tutorial_completed') === 'true'
                    const skipped = localStorage.getItem('tutorial_skipped') === 'true'
                    const currentStep = parseInt(localStorage.getItem('tutorial_step') || '0')
                    return {
                        isActive: false,
                        currentStep: completed || skipped ? 0 : currentStep,
                        completed,
                        skipped
                    }
                } catch (e) {
                    return {
                        isActive: false,
                        currentStep: 0,
                        completed: false,
                        skipped: false
                    }
                }
            })(),

            startTutorial: () => {
                set({ tutorial: { isActive: true, currentStep: 0, completed: false, skipped: false } })
                if (typeof window !== 'undefined') {
                    localStorage.setItem('tutorial_started', 'true')
                    localStorage.setItem('tutorial_step', '0')
                }
            },

            nextTutorialStep: () => {
                const { currentStep } = get().tutorial
                const nextStep = currentStep + 1
                const totalSteps = 18 // Total tutorial steps

                if (nextStep >= totalSteps) {
                    get().completeTutorial()
                } else {
                    set(state => ({
                        tutorial: { ...state.tutorial, currentStep: nextStep }
                    }))
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('tutorial_step', nextStep.toString())
                    }
                }
            },

            skipTutorial: () => {
                set(state => ({
                    tutorial: { ...state.tutorial, isActive: false, skipped: true }
                }))
                if (typeof window !== 'undefined') {
                    localStorage.setItem('tutorial_skipped', 'true')
                }
            },

            completeTutorial: () => {
                set(state => ({
                    tutorial: { ...state.tutorial, isActive: false, completed: true }
                }))
                if (typeof window !== 'undefined') {
                    localStorage.setItem('tutorial_completed', 'true')
                    localStorage.removeItem('tutorial_step')
                }
            },

            resetTutorial: () => {
                set({ tutorial: { isActive: false, currentStep: 0, completed: false, skipped: false } })
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('tutorial_completed')
                    localStorage.removeItem('tutorial_skipped')
                    localStorage.removeItem('tutorial_step')
                    localStorage.removeItem('tutorial_started')
                }
            },

            // Legacy states
            selectedPreset: 'none',
            setSelectedPreset: (preset) => {
                get().setActiveHdri('preset', preset)
            },

            showEnvBackground: true,
            setShowEnvBackground: (show) => set({ showEnvBackground: show }),

            setModelLoaded: () => {
                // Placeholder
            }
        }),
        {
            partialize: (state) => {
                const {
                    isTimelineOpen,
                    isPlaying,
                    isRendering,
                    isExporting,
                    isTemplateManagerOpen,
                    canvasRef,
                    captureSignal,
                    updateSignal,
                    autoGenPopupStep,
                    ...trackedState
                } = state
                return trackedState
            },
            limit: 50,
            equality: shallow,
        }
    )
)
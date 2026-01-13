'use client'

import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { PLANS } from '@/constants/plans'
import { AI_GENERATE_COST } from '@/constants/hdri'
import { Sparkles, Lock, Loader2 } from 'lucide-react'
import UpgradeDialog from '@/components/ui/UpgradeDialog'
import AiGenerateConfirmDialog from '@/components/ui/AiGenerateConfirmDialog'
import { useAuth } from '@/contexts/AuthContext'
import { errorHandler } from '@/lib/errorHandler'
import { ErrorType } from '@/types/errors'

const PRESET_PROMPTS = [
    { label: '🏙️ Studio', keywords: 'modern photography studio with softbox lights' },
    { label: '🌅 Sunset', keywords: 'beautiful sunset with warm golden hour lighting' },
    { label: '🌲 Nature', keywords: 'lush forest with natural daylight' },
    { label: '🌃 Cyberpunk', keywords: 'cyberpunk city with neon lights at night' },
]

export default function AiGenerateSection() {
    const { user } = useAuth()
    const subscription = useStore(s => s.subscription)
    const deductCredits = useStore(s => s.deductCredits)
    const isGeneratingEnv = useStore(s => s.isGeneratingEnv)
    const setIsGeneratingEnv = useStore(s => s.setIsGeneratingEnv)
    const setActiveHdri = useStore(s => s.setActiveHdri)
    const setIsHdriManagerOpen = useStore(s => s.setIsHdriManagerOpen)

    const currentPlan = PLANS[subscription.userTier]
    const canUseAi = currentPlan.features.allowHdriGen
    const totalCredits = subscription.subscriptionCredits + subscription.purchasedCredits

    const [prompt, setPrompt] = useState('')
    const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
    const [showConfirmDialog, setShowConfirmDialog] = useState(false)

    const handleGenerate = () => {
        if (!canUseAi) {
            setShowUpgradeDialog(true)
            return
        }

        // Show confirmation dialog
        setShowConfirmDialog(true)
    }

    const handleConfirm = async () => {
        setShowConfirmDialog(false)
        setIsGeneratingEnv(true)

        try {
            // Step 1: Enhance the prompt
            console.log('Original prompt:', prompt)
            const enhanceResponse = await fetch('/api/enhance-prompt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            })

            if (!enhanceResponse.ok) {
                throw new Error('Failed to enhance prompt')
            }

            const { enhanced: enhancedPrompt } = await enhanceResponse.json()
            console.log('Enhanced prompt:', enhancedPrompt)

            // Step 2: Generate environment with enhanced prompt
            const response = await fetch('/api/generate-env', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: enhancedPrompt })
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to generate environment')
            }

            const { url } = await response.json()

            // Deduct credits (only after successful generation)
            const success = deductCredits(AI_GENERATE_COST)
            if (!success) {
                throw new Error('Insufficient credits')
            }

            // Save to Firestore (will auto-sync to store via AuthContext)
            if (!user) {
                throw new Error('User not authenticated')
            }

            const newHdri = {
                name: prompt.slice(0, 30) + (prompt.length > 30 ? '...' : ''),
                url: url,
                uploadedAt: new Date(),
                type: 'ai-generated' as const
            }

            // Import and use hdriService
            const { addUserHdri } = await import('@/lib/hdriService')
            const hdriId = await addUserHdri(user.uid, newHdri)

            // Activate the new environment (use the Firestore-generated ID)
            setActiveHdri('custom', hdriId)

            // Close HDRI Manager
            setIsHdriManagerOpen(false)

            // Clear prompt
            setPrompt('')

            errorHandler.success('Environment generated successfully!')

        } catch (error: any) {
            console.error('Error generating environment:', error)

            const errorMessage = error instanceof Error ? error.message : String(error)

            if (errorMessage.includes('enhance prompt') || errorMessage.includes('Failed to enhance')) {
                errorHandler.handle(ErrorType.HDRI_GENERATION_FAILED, {
                    details: 'Prompt enhancement failed, please simplify your description'
                })
            } else if (errorMessage.includes('Insufficient credits')) {
                errorHandler.insufficientCredits(totalCredits, AI_GENERATE_COST)
            } else if (errorMessage.includes('not authenticated') || errorMessage.includes('User not authenticated')) {
                errorHandler.handle(ErrorType.AUTH_FAILED)
            } else if (errorMessage.includes('network') || errorMessage.includes('connection') || errorMessage.includes('fetch')) {
                errorHandler.handle(ErrorType.NETWORK_ERROR)
            } else if (errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
                errorHandler.handle(ErrorType.HDRI_GENERATION_FAILED, {
                    details: 'API quota exceeded, please try again later'
                })
            } else {
                errorHandler.handle(ErrorType.HDRI_GENERATION_FAILED, {
                    details: errorMessage
                })
            }
        } finally {
            setIsGeneratingEnv(false)
        }
    }

    const appendPreset = (keywords: string) => {
        setPrompt(prev => prev ? `${prev}, ${keywords}` : keywords)
    }

    return (
        <section>
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 px-1">
                ✨ AI Generate {!canUseAi && '💎 PRO FEATURE'}
            </h3>

            {!canUseAi ? (
                // FREE tier - Upgrade prompt
                <div className="p-8 border-2 border-dashed border-zinc-800 rounded-lg flex flex-col items-center justify-center text-center gap-3">
                    <div className="w-12 h-12 bg-purple-900/20 rounded-full flex items-center justify-center">
                        <Lock size={24} className="text-purple-500" />
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-white mb-1">
                            Upgrade to Pro
                        </div>
                        <div className="text-xs text-zinc-400">
                            Unlock AI HDRI generation with natural language descriptions
                        </div>
                    </div>
                    <button
                        onClick={() => setShowUpgradeDialog(true)}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-bold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
                    >
                        Upgrade to Pro
                    </button>
                </div>
            ) : (
                // PRO/ULTRA tier - AI Generate UI
                <div className="space-y-3">
                    {/* Prompt Input */}
                    <div>
                        <label className="text-xs text-zinc-400 mb-2 block">
                            Describe your environment:
                        </label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="sunset beach with palm trees and calm ocean waves..."
                            disabled={isGeneratingEnv}
                            className="w-full h-24 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                    </div>

                    {/* Preset Chips */}
                    <div className="flex flex-wrap gap-2">
                        {PRESET_PROMPTS.map((preset) => (
                            <button
                                key={preset.label}
                                onClick={() => appendPreset(preset.keywords)}
                                disabled={isGeneratingEnv}
                                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-full text-xs text-zinc-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>

                    {/* Credits Info */}
                    <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg border border-zinc-800">
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-zinc-400">💎 Cost:</span>
                            <span className="text-white font-semibold">{AI_GENERATE_COST} credits</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-zinc-400">💰 Balance:</span>
                            <span className="text-white font-semibold">
                                {totalCredits.toLocaleString()} credits
                            </span>
                        </div>
                    </div>

                    {/* Generate Button */}
                    <button
                        onClick={handleGenerate}
                        disabled={!prompt.trim() || totalCredits < AI_GENERATE_COST || isGeneratingEnv}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-purple-600 disabled:hover:to-pink-600"
                    >
                        {isGeneratingEnv ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles size={18} />
                                Generate HDRI ({AI_GENERATE_COST} Credits)
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Upgrade Dialog */}
            <UpgradeDialog
                isOpen={showUpgradeDialog}
                onClose={() => setShowUpgradeDialog(false)}
                currentTier={subscription.userTier}
                feature="AI HDRI Generation"
                requiredTier="PRO"
            />

            {/* Confirm Dialog */}
            <AiGenerateConfirmDialog
                isOpen={showConfirmDialog}
                onClose={() => setShowConfirmDialog(false)}
                onConfirm={handleConfirm}
                prompt={prompt}
                cost={AI_GENERATE_COST}
                balance={totalCredits}
            />
        </section>
    )
}

'use client'

import { useStore } from '@/store/useStore'
import { tutorialSteps } from '@/lib/tutorialSteps'
import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

export default function TutorialOverlay() {
    const { isActive, currentStep } = useStore(s => s.tutorial)
    const skipTutorial = useStore(s => s.skipTutorial)
    const nextTutorialStep = useStore(s => s.nextTutorialStep)
    const completeTutorial = useStore(s => s.completeTutorial)

    const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null)
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })

    const step = tutorialSteps[currentStep]

    useEffect(() => {
        if (!isActive || !step) return

        if (step.target === 'fullscreen') {
            setHighlightedElement(null)
            return
        }

        // Find target element
        const element = document.querySelector(step.target) as HTMLElement
        if (element) {
            setHighlightedElement(element)

            // Calculate tooltip position
            const rect = element.getBoundingClientRect()
            let top = 0
            let left = 0

            switch (step.placement) {
                case 'top':
                    top = rect.top - 20
                    left = rect.left + rect.width / 2
                    break
                case 'bottom':
                    top = rect.bottom + 20
                    left = rect.left + rect.width / 2
                    break
                case 'left':
                    top = rect.top + rect.height / 2
                    left = rect.left - 20
                    break
                case 'right':
                    top = rect.top + rect.height / 2
                    left = rect.right + 20
                    break
                case 'center':
                    top = window.innerHeight / 2
                    left = window.innerWidth / 2
                    break
            }

            setTooltipPosition({ top, left })
        }
    }, [isActive, currentStep, step])

    // Auto-advance for wait actions
    useEffect(() => {
        if (!isActive || !step || step.action !== 'wait') return

        const timer = setTimeout(() => {
            nextTutorialStep()
        }, (step.waitTime || 2) * 1000)

        return () => clearTimeout(timer)
    }, [isActive, currentStep, step, nextTutorialStep])

    if (!isActive || !step) return null

    const isFullscreen = step.target === 'fullscreen'
    const totalSteps = tutorialSteps.length

    return (
        <>
            {/* Dark overlay */}
            <div
                className="fixed inset-0 bg-black/75 z-[9998] transition-opacity duration-300"
                style={{ pointerEvents: isFullscreen ? 'auto' : 'none' }}
            />

            {/* Spotlight highlight */}
            {highlightedElement && (
                <div
                    className="fixed z-[9999] rounded-lg pointer-events-none transition-all duration-300"
                    style={{
                        top: highlightedElement.offsetTop,
                        left: highlightedElement.offsetLeft,
                        width: highlightedElement.offsetWidth,
                        height: highlightedElement.offsetHeight,
                        boxShadow: '0 0 0 4px #3b82f6, 0 0 0 8px rgba(59, 130, 246, 0.3), 0 0 0 9999px rgba(0, 0, 0, 0.75)',
                        animation: 'pulse 2s infinite'
                    }}
                />
            )}

            {/* Tooltip */}
            <div
                className={`fixed z-[10000] bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-md shadow-2xl transition-all duration-300 ${isFullscreen ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' : ''
                    }`}
                style={!isFullscreen ? {
                    top: tooltipPosition.top,
                    left: tooltipPosition.left,
                    transform: step.placement === 'center' ? 'translate(-50%, -50%)' :
                        step.placement === 'top' ? 'translate(-50%, -100%)' :
                            step.placement === 'bottom' ? 'translate(-50%, 0)' :
                                step.placement === 'left' ? 'translate(-100%, -50%)' :
                                    'translate(0, -50%)'
                } : {}}
            >
                {/* Close button */}
                <button
                    onClick={skipTutorial}
                    className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
                    aria-label="關閉教學"
                >
                    <X size={20} />
                </button>

                {/* Progress */}
                <div className="text-xs text-zinc-400 mb-3">
                    步驟 {currentStep + 1} / {totalSteps}
                </div>

                {/* Progress bar */}
                <div className="w-full h-1 bg-zinc-800 rounded-full mb-4">
                    <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-300"
                        style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                    />
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-white mb-3">
                    {step.title}
                </h3>

                {/* Content */}
                <p className="text-sm text-zinc-300 leading-relaxed mb-6 whitespace-pre-line">
                    {step.content}
                </p>

                {/* Actions */}
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={skipTutorial}
                        className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
                    >
                        跳過教學
                    </button>

                    {step.action === 'none' && (
                        <button
                            onClick={nextTutorialStep}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
                        >
                            {step.nextButtonText || '下一步'}
                        </button>
                    )}

                    {step.optional && (
                        <button
                            onClick={nextTutorialStep}
                            className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
                        >
                            跳過此步驟
                        </button>
                    )}
                </div>

                {/* Waiting indicator */}
                {step.action === 'wait' && (
                    <div className="mt-4 text-center text-xs text-zinc-500">
                        {step.waitTime}秒後自動繼續...
                    </div>
                )}

                {/* Action hint */}
                {step.action === 'click' && (
                    <div className="mt-4 text-center text-xs text-blue-400">
                        👆 點擊高亮的元素繼續
                    </div>
                )}

                {step.action === 'interact' && (
                    <div className="mt-4 text-center text-xs text-blue-400">
                        🖱️ 試試操作後點擊"下一步"
                    </div>
                )}
            </div>

            {/* Completion modal */}
            {currentStep >= totalSteps - 1 && step.action === 'click' && (
                <div className="fixed inset-0 flex items-center justify-center z-[10001]">
                    <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-8 max-w-md text-center">
                        <div className="text-6xl mb-4">🎉</div>
                        <h2 className="text-2xl font-bold text-white mb-3">
                            恭喜完成教學！
                        </h2>
                        <p className="text-zinc-300 mb-6">
                            您已經掌握了 ReadyRender 的基本功能。繼續探索更多進階功能吧！
                        </p>
                        <button
                            onClick={completeTutorial}
                            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
                        >
                            開始創作
                        </button>
                    </div>
                </div>
            )}

            <style jsx global>{`
                @keyframes pulse {
                    0%, 100% {
                        box-shadow: 0 0 0 4px #3b82f6, 0 0 0 8px rgba(59, 130, 246, 0.3), 0 0 0 9999px rgba(0, 0, 0, 0.75);
                    }
                    50% {
                        box-shadow: 0 0 0 4px #3b82f6, 0 0 0 12px rgba(59, 130, 246, 0.1), 0 0 0 9999px rgba(0, 0, 0, 0.75);
                    }
                }
            `}</style>
        </>
    )
}

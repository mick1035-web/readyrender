'use client'

import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { useEffect } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastAction {
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary'
}

export interface ToastProps {
    id: string
    type: ToastType
    title?: string
    message: string
    description?: string
    actions?: ToastAction[]
    duration?: number
    onClose: (id: string) => void
}

const toastStyles = {
    success: {
        bg: 'bg-green-500/10',
        border: 'border-green-500/50',
        text: 'text-green-400',
        icon: CheckCircle
    },
    error: {
        bg: 'bg-red-500/10',
        border: 'border-red-500/50',
        text: 'text-red-400',
        icon: AlertCircle
    },
    warning: {
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/50',
        text: 'text-yellow-400',
        icon: AlertTriangle
    },
    info: {
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/50',
        text: 'text-blue-400',
        icon: Info
    }
}

export default function Toast({
    id,
    type,
    title,
    message,
    description,
    actions,
    duration = 5000,
    onClose
}: ToastProps) {
    const style = toastStyles[type]
    const Icon = style.icon

    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                onClose(id)
            }, duration)
            return () => clearTimeout(timer)
        }
    }, [id, duration, onClose])

    return (
        <div
            className={`flex flex-col gap-2 p-4 rounded-lg border backdrop-blur-sm shadow-lg animate-in slide-in-from-right-full duration-300 min-w-[320px] max-w-md ${style.bg} ${style.border}`}
        >
            {/* Header */}
            <div className="flex items-start gap-3">
                <Icon size={20} className={`flex-shrink-0 mt-0.5 ${style.text}`} />
                <div className="flex-1 min-w-0">
                    {title && (
                        <h4 className="font-semibold text-white text-sm mb-1">
                            {title}
                        </h4>
                    )}
                    <p className="text-sm text-zinc-200">
                        {message}
                    </p>
                </div>
                <button
                    onClick={() => onClose(id)}
                    className="flex-shrink-0 text-zinc-400 hover:text-white transition-colors"
                    aria-label="Close"
                >
                    <X size={16} />
                </button>
            </div>

            {/* Description */}
            {description && (
                <div className="pl-8 text-xs text-zinc-300 whitespace-pre-line">
                    {description}
                </div>
            )}

            {/* Actions */}
            {actions && actions.length > 0 && (
                <div className="pl-8 flex gap-2 mt-1">
                    {actions.map((action, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                action.onClick()
                                onClose(id)
                            }}
                            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${action.variant === 'primary'
                                ? `${style.text} bg-white/10 hover:bg-white/20`
                                : 'text-zinc-300 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {action.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

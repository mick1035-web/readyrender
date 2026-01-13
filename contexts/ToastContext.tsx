'use client'

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'
import Toast, { ToastType, ToastAction } from '@/components/ui/Toast'
import { errorHandler } from '@/lib/errorHandler'

interface ToastData {
    id: string
    type: ToastType
    title?: string
    message: string
    description?: string
    actions?: ToastAction[]
    duration?: number
}

interface ToastContextType {
    showToast: (options: {
        type: ToastType
        title?: string
        message: string
        description?: string
        actions?: ToastAction[]
        duration?: number
    }) => void
    hideToast: (id: string) => void
    success: (message: string, duration?: number) => void
    error: (message: string, title?: string, duration?: number) => void
    warning: (message: string, description?: string, duration?: number) => void
    info: (message: string, duration?: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastData[]>([])

    const showToast = useCallback((options: {
        type: ToastType
        title?: string
        message: string
        description?: string
        actions?: ToastAction[]
        duration?: number
    }) => {
        const id = `toast-${Date.now()}-${Math.random()}`
        setToasts(prev => [...prev, { id, ...options }])
    }, [])

    const hideToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id))
    }, [])

    // Convenience methods
    const success = useCallback((message: string, duration: number = 5000) => {
        showToast({ type: 'success', message, duration })
    }, [showToast])

    const error = useCallback((message: string, title?: string, duration: number = 8000) => {
        showToast({ type: 'error', title, message, duration })
    }, [showToast])

    const warning = useCallback((message: string, description?: string, duration: number = 7000) => {
        showToast({ type: 'warning', message, description, duration })
    }, [showToast])

    const info = useCallback((message: string, duration: number = 5000) => {
        showToast({ type: 'info', message, duration })
    }, [showToast])

    // Initialize error handler with showToast
    useEffect(() => {
        errorHandler.init(showToast)
    }, [showToast])

    return (
        <ToastContext.Provider value={{ showToast, hideToast, success, error, warning, info }}>
            {children}

            {/* Toast Container */}
            <div className="fixed top-4 right-4 z-[10000] flex flex-col gap-2 max-w-md pointer-events-none">
                <div className="flex flex-col gap-2 pointer-events-auto">
                    {toasts.map(toast => (
                        <Toast
                            key={toast.id}
                            id={toast.id}
                            type={toast.type}
                            title={toast.title}
                            message={toast.message}
                            description={toast.description}
                            actions={toast.actions}
                            duration={toast.duration}
                            onClose={hideToast}
                        />
                    ))}
                </div>
            </div>
        </ToastContext.Provider>
    )
}

export function useToast() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within ToastProvider')
    }
    return context
}

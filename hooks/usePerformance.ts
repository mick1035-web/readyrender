import { useEffect, useState } from 'react'

interface UseProgressiveLoadingOptions {
    onProgress?: (progress: number) => void
}

/**
 * Hook for progressive loading with progress tracking
 */
export function useProgressiveLoading(options?: UseProgressiveLoadingOptions) {
    const [progress, setProgress] = useState(0)
    const [isLoading, setIsLoading] = useState(true)

    const updateProgress = (value: number) => {
        setProgress(value)
        options?.onProgress?.(value)

        if (value >= 100) {
            setIsLoading(false)
        }
    }

    return {
        progress,
        isLoading,
        updateProgress,
        setIsLoading
    }
}

/**
 * Hook for intersection observer (lazy loading)
 */
export function useInView(options?: IntersectionObserverInit) {
    const [ref, setRef] = useState<Element | null>(null)
    const [inView, setInView] = useState(false)

    useEffect(() => {
        if (!ref) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true)
                    observer.disconnect()
                }
            },
            {
                threshold: 0.1,
                ...options
            }
        )

        observer.observe(ref)

        return () => observer.disconnect()
    }, [ref, options])

    return { ref: setRef, inView }
}

'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function WebGLContextGuard({ children }: { children: React.ReactNode }) {
    const [contextLost, setContextLost] = useState(false)
    const [errorInfo, setErrorInfo] = useState<string>('')

    useEffect(() => {
        const handleContextLost = (event: Event) => {
            event.preventDefault()
            console.error('WebGL context lost - GPU memory exhausted or driver crashed')

            // Log memory usage if available (Chrome only)
            if ((performance as any).memory) {
                const memory = (performance as any).memory
                console.error('Memory usage:', {
                    used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + 'MB',
                    total: Math.round(memory.totalJSHeapSize / 1024 / 1024) + 'MB',
                    limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + 'MB'
                })
            }

            // DISABLED: Don't block UI on context loss
            // setContextLost(true)
            // setErrorInfo('The 3D model may be too complex for your GPU. Try uploading a simpler model or reducing polygon count.')

            // Just log the error, don't show blocking screen
            console.warn('WebGL context lost, but continuing anyway. You may need to reload the page if rendering stops.')
        }

        const handleContextRestored = () => {
            console.log('WebGL context restored')
            setContextLost(false)
            setErrorInfo('')
        }

        // Listen for WebGL context loss on canvas elements
        const canvases = document.querySelectorAll('canvas')
        canvases.forEach(canvas => {
            canvas.addEventListener('webglcontextlost', handleContextLost)
            canvas.addEventListener('webglcontextrestored', handleContextRestored)
        })

        // Cleanup
        return () => {
            canvases.forEach(canvas => {
                canvas.removeEventListener('webglcontextlost', handleContextLost)
                canvas.removeEventListener('webglcontextrestored', handleContextRestored)
            })
        }
    }, [])

    // BLOCKING ERROR SCREEN DISABLED
    // WebGL context loss is now non-blocking - warnings logged to console only
    // Uncomment the code below to re-enable the blocking error screen
    /*
    if (contextLost) {
        return (
            <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-zinc-800 border border-zinc-700 rounded-xl p-8 text-center">
                    <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle size={32} className="text-yellow-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">
                        GPU Memory Exhausted
                    </h1>
                    <p className="text-zinc-400 mb-4">
                        {errorInfo}
                    </p>
                    <div className="bg-zinc-900 rounded-lg p-4 mb-6 text-left">
                        <p className="text-sm font-semibold text-white mb-2">Recommendations:</p>
                        <ul className="text-xs text-zinc-400 space-y-1 list-disc list-inside">
                            <li>Use models with fewer than 100K polygons</li>
                            <li>Optimize your model in Blender or similar software</li>
                            <li>Remove unnecessary details or textures</li>
                            <li>Try using a different browser or device</li>
                        </ul>
                    </div>
                    <div className="flex flex-col gap-2">
                        <button
                            onClick={() => window.location.reload()}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
                        >
                            <RefreshCw size={18} />
                            Reload Page
                        </button>
                        <button
                            onClick={() => window.location.href = '/dashboard'}
                            className="px-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg font-medium transition-colors"
                        >
                            Go to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        )
    }
    */

    return <>{children}</>
}

'use client'

import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'

/**
 * WebGLContextRecovery Component
 * 
 * Handles WebGL context loss and restoration automatically.
 * Prevents white screen errors when GPU memory is exhausted.
 */
export default function WebGLContextRecovery() {
    const { gl } = useThree()

    useEffect(() => {
        const canvas = gl.domElement

        const handleContextLost = (event: Event) => {
            event.preventDefault()
            console.warn('⚠️ WebGL context lost - attempting to restore...')

            // Log memory usage if available (Chrome only)
            if ((performance as any).memory) {
                const memory = (performance as any).memory
                console.warn('💾 Memory usage:', {
                    used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + 'MB',
                    total: Math.round(memory.totalJSHeapSize / 1024 / 1024) + 'MB',
                    limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + 'MB'
                })
            }
        }

        const handleContextRestored = () => {
            console.log('✅ WebGL context restored successfully')
            // Force a re-render by invalidating the renderer
            gl.resetState()
        }

        canvas.addEventListener('webglcontextlost', handleContextLost)
        canvas.addEventListener('webglcontextrestored', handleContextRestored)

        return () => {
            canvas.removeEventListener('webglcontextlost', handleContextLost)
            canvas.removeEventListener('webglcontextrestored', handleContextRestored)
        }
    }, [gl])

    return null
}

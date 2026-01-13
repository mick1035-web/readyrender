import { useEffect } from 'react'
import { useStore } from '@/store/useStore'

/**
 * Custom hook to enable undo/redo keyboard shortcuts
 * - Ctrl+Z (Windows/Linux) or Cmd+Z (Mac): Undo
 * - Ctrl+Shift+Z or Ctrl+Y (Windows/Linux) or Cmd+Shift+Z (Mac): Redo
 */
export function useUndoRedo() {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Check for Ctrl/Cmd key
            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
            const modifier = isMac ? e.metaKey : e.ctrlKey

            if (!modifier) return

            // Ignore if user is typing in an input field
            const target = e.target as HTMLElement
            if (
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.isContentEditable
            ) {
                return
            }

            // Undo: Ctrl+Z or Cmd+Z
            if (e.key === 'z' && !e.shiftKey) {
                e.preventDefault()
                const { undo } = useStore.temporal.getState()
                undo()
                console.log('⏪ Undo')
            }

            // Redo: Ctrl+Shift+Z, Cmd+Shift+Z, or Ctrl+Y
            if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
                e.preventDefault()
                const { redo } = useStore.temporal.getState()
                redo()
                console.log('⏩ Redo')
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])
}

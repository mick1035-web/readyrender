'use client'

import { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
    children: ReactNode
}

interface State {
    hasError: boolean
    error: Error | null
    errorInfo: any
}

export default class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        }
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
            errorInfo: null
        }
    }

    componentDidCatch(error: Error, errorInfo: any) {
        // Log error to console
        console.error('Error Boundary caught an error:', error, errorInfo)

        // TODO: Send to error tracking service (e.g., Sentry)
        // Sentry.captureException(error, { extra: errorInfo })

        this.setState({
            error,
            errorInfo
        })
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        })
    }

    render() {
        // DISABLED: Don't show error screen, just log
        // DON'T auto-reset - causes infinite loops when HDRI fails to load!
        if (this.state.hasError) {
            console.error('ErrorBoundary caught error:', this.state.error)
            console.error('Error info:', this.state.errorInfo)
            console.warn('⚠️ Error occurred. Please reload the page if things stop working.')
        }

        return this.props.children
    }
}

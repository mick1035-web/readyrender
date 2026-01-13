'use client'

import React, { Component, ReactNode } from 'react'
import { Html } from '@react-three/drei'

interface ErrorBoundaryProps {
    children: ReactNode
}

interface ErrorBoundaryState {
    hasError: boolean
    error: any
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error: any): ErrorBoundaryState {
        return { hasError: true, error }
    }

    componentDidCatch(error: any, errorInfo: any) {
        console.error('Model loading error:', error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            return (
                <mesh>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshStandardMaterial color="red" />
                    <Html center>
                        <div style={{
                            color: 'white',
                            background: 'rgba(255, 0, 0, 0.8)',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            fontWeight: 'bold'
                        }}>
                            Load Failed
                        </div>
                    </Html>
                </mesh>
            )
        }

        return this.props.children
    }
}

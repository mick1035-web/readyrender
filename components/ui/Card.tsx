import { ReactNode } from 'react'

interface CardProps {
    children: ReactNode
    className?: string
    hover?: boolean
    onClick?: () => void
}

export default function Card({ children, className = '', hover = false, onClick }: CardProps) {
    const baseStyles = 'bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden transition-all duration-200'
    const hoverStyles = hover ? 'hover:bg-zinc-900/70 hover:border-white/20 hover:shadow-2xl hover:scale-[1.02] cursor-pointer' : ''

    return (
        <div
            className={`${baseStyles} ${hoverStyles} ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    )
}

export function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
    return (
        <div className={`p-6 border-b border-white/10 ${className}`}>
            {children}
        </div>
    )
}

export function CardBody({ children, className = '' }: { children: ReactNode; className?: string }) {
    return (
        <div className={`p-6 ${className}`}>
            {children}
        </div>
    )
}

export function CardFooter({ children, className = '' }: { children: ReactNode; className?: string }) {
    return (
        <div className={`p-6 border-t border-white/10 ${className}`}>
            {children}
        </div>
    )
}

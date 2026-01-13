import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    size?: 'sm' | 'md' | 'lg'
    children: ReactNode
    isLoading?: boolean
}

export default function Button({
    variant = 'primary',
    size = 'md',
    children,
    isLoading = false,
    className = '',
    disabled,
    ...props
}: ButtonProps) {
    const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
        primary: 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:opacity-90 shadow-lg hover:shadow-xl hover:scale-105',
        secondary: 'bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-sm',
        ghost: 'text-white hover:bg-white/10',
        danger: 'bg-red-500 text-white hover:bg-red-600 shadow-lg hover:shadow-xl'
    }

    const sizes = {
        sm: 'px-4 py-2 text-sm gap-2',
        md: 'px-6 py-2.5 text-base gap-2',
        lg: 'px-8 py-4 text-lg gap-3'
    }

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Loading...</span>
                </>
            ) : (
                children
            )}
        </button>
    )
}

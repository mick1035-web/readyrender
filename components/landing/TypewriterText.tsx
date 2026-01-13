'use client'

import { useState, useEffect } from 'react'

interface TypewriterTextProps {
    texts: string[]
    typingSpeed?: number
    deletingSpeed?: number
    pauseDuration?: number
}

export default function TypewriterText({
    texts,
    typingSpeed = 100,
    deletingSpeed = 50,
    pauseDuration = 2000
}: TypewriterTextProps) {
    const [currentTextIndex, setCurrentTextIndex] = useState(0)
    const [currentText, setCurrentText] = useState('')
    const [isDeleting, setIsDeleting] = useState(false)
    const [isPaused, setIsPaused] = useState(false)

    useEffect(() => {
        const fullText = texts[currentTextIndex]

        if (isPaused) {
            const pauseTimer = setTimeout(() => {
                setIsPaused(false)
                setIsDeleting(true)
            }, pauseDuration)
            return () => clearTimeout(pauseTimer)
        }

        if (!isDeleting && currentText === fullText) {
            setIsPaused(true)
            return
        }

        if (isDeleting && currentText === '') {
            setIsDeleting(false)
            setCurrentTextIndex((prev) => (prev + 1) % texts.length)
            return
        }

        const timeout = setTimeout(
            () => {
                setCurrentText((prev) => {
                    if (isDeleting) {
                        return fullText.substring(0, prev.length - 1)
                    } else {
                        return fullText.substring(0, prev.length + 1)
                    }
                })
            },
            isDeleting ? deletingSpeed : typingSpeed
        )

        return () => clearTimeout(timeout)
    }, [currentText, isDeleting, isPaused, currentTextIndex, texts, typingSpeed, deletingSpeed, pauseDuration])

    return (
        <span className="inline-block min-w-[280px] sm:min-w-[350px] md:min-w-[450px]">
            {currentText || '\u200B'}
            <span className="animate-pulse ml-1">|</span>
        </span>
    )
}

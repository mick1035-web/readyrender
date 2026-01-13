'use client'

import { useEffect, useRef } from 'react'

interface Particle {
    x: number
    y: number
    vx: number
    vy: number
    size: number
    opacity: number
    color: string
}

export default function ParticleBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const mouseRef = useRef({ x: 0, y: 0 })
    const particlesRef = useRef<Particle[]>([])

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Set canvas size
        const resizeCanvas = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }
        resizeCanvas()
        window.addEventListener('resize', resizeCanvas)

        // Initialize particles
        const particleCount = 80
        const colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981']

        for (let i = 0; i < particleCount; i++) {
            particlesRef.current.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 3 + 1,
                opacity: Math.random() * 0.5 + 0.2,
                color: colors[Math.floor(Math.random() * colors.length)]
            })
        }

        // Mouse move handler
        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY }
        }
        window.addEventListener('mousemove', handleMouseMove)

        // Animation loop
        let animationId: number
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            // Draw gradient background waves
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
            const time = Date.now() * 0.0001
            gradient.addColorStop(0, `rgba(59, 130, 246, ${0.05 + Math.sin(time) * 0.02})`)
            gradient.addColorStop(0.5, `rgba(139, 92, 246, ${0.05 + Math.cos(time) * 0.02})`)
            gradient.addColorStop(1, `rgba(16, 185, 129, ${0.05 + Math.sin(time + 1) * 0.02})`)
            ctx.fillStyle = gradient
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            // Update and draw particles
            particlesRef.current.forEach((particle, i) => {
                // Move particle
                particle.x += particle.vx
                particle.y += particle.vy

                // Mouse interaction - particles move away from cursor
                const dx = mouseRef.current.x - particle.x
                const dy = mouseRef.current.y - particle.y
                const distance = Math.sqrt(dx * dx + dy * dy)

                if (distance < 150) {
                    const force = (150 - distance) / 150
                    particle.x -= (dx / distance) * force * 2
                    particle.y -= (dy / distance) * force * 2
                }

                // Bounce off edges
                if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
                if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1

                // Keep particles in bounds
                particle.x = Math.max(0, Math.min(canvas.width, particle.x))
                particle.y = Math.max(0, Math.min(canvas.height, particle.y))

                // Draw particle
                ctx.beginPath()
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
                ctx.fillStyle = particle.color
                ctx.globalAlpha = particle.opacity
                ctx.fill()

                // Draw connections to nearby particles
                particlesRef.current.slice(i + 1).forEach(otherParticle => {
                    const dx = particle.x - otherParticle.x
                    const dy = particle.y - otherParticle.y
                    const distance = Math.sqrt(dx * dx + dy * dy)

                    if (distance < 120) {
                        ctx.beginPath()
                        ctx.moveTo(particle.x, particle.y)
                        ctx.lineTo(otherParticle.x, otherParticle.y)
                        ctx.strokeStyle = particle.color
                        ctx.globalAlpha = (1 - distance / 120) * 0.2
                        ctx.lineWidth = 1
                        ctx.stroke()
                    }
                })
            })

            ctx.globalAlpha = 1
            animationId = requestAnimationFrame(animate)
        }

        animate()

        return () => {
            window.removeEventListener('resize', resizeCanvas)
            window.removeEventListener('mousemove', handleMouseMove)
            cancelAnimationFrame(animationId)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none"
            style={{ opacity: 0.6 }}
        />
    )
}

import { NextRequest, NextResponse } from 'next/server'

/**
 * Simple in-memory rate limiter
 * For production, use Redis or a dedicated rate limiting service
 */

interface RateLimitStore {
    [key: string]: {
        count: number
        resetTime: number
    }
}

const store: RateLimitStore = {}

export interface RateLimitConfig {
    windowMs: number // Time window in milliseconds
    max: number // Max requests per window
}

export function rateLimit(config: RateLimitConfig) {
    return async (req: NextRequest): Promise<NextResponse | null> => {
        // Get client identifier (IP address or user ID)
        const forwarded = req.headers.get('x-forwarded-for')
        const ip = forwarded ? forwarded.split(',')[0] : req.headers.get('x-real-ip') || 'unknown'

        const key = `${ip}:${req.nextUrl.pathname}`
        const now = Date.now()

        // Initialize or get existing record
        if (!store[key] || store[key].resetTime < now) {
            store[key] = {
                count: 1,
                resetTime: now + config.windowMs
            }
            return null // Allow request
        }

        // Increment count
        store[key].count++

        // Check if limit exceeded
        if (store[key].count > config.max) {
            const retryAfter = Math.ceil((store[key].resetTime - now) / 1000)

            return NextResponse.json(
                {
                    error: 'Too many requests',
                    message: 'Rate limit exceeded. Please try again later.',
                    retryAfter
                },
                {
                    status: 429,
                    headers: {
                        'Retry-After': retryAfter.toString(),
                        'X-RateLimit-Limit': config.max.toString(),
                        'X-RateLimit-Remaining': '0',
                        'X-RateLimit-Reset': new Date(store[key].resetTime).toISOString()
                    }
                }
            )
        }

        return null // Allow request
    }
}

// Cleanup old entries every 10 minutes
setInterval(() => {
    const now = Date.now()
    Object.keys(store).forEach(key => {
        if (store[key].resetTime < now) {
            delete store[key]
        }
    })
}, 10 * 60 * 1000)

// Predefined rate limiters
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // 100 requests per 15 minutes
})

export const aiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10 // 10 requests per minute
})

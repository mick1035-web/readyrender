import { NextRequest, NextResponse } from 'next/server'
import { aiLimiter } from '@/lib/rateLimit'
import { PromptEngine } from '@/lib/prompt-engineering/engine'

export async function POST(request: NextRequest) {
    // Apply rate limiting
    const rateLimitResponse = await aiLimiter(request)
    if (rateLimitResponse) {
        return rateLimitResponse
    }

    try {
        const { prompt } = await request.json()

        if (!prompt || typeof prompt !== 'string') {
            return NextResponse.json(
                { error: 'Prompt is required and must be a string' },
                { status: 400 }
            )
        }

        // New Prompt Engine Implementation
        const engine = new PromptEngine(prompt)
        const enhancedResult = engine.enhance()

        return NextResponse.json(enhancedResult)

    } catch (error: any) {
        console.error('Error enhancing prompt:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to enhance prompt' },
            { status: 500 }
        )
    }
}



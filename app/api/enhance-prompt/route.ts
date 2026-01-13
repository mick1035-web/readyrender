import { NextRequest, NextResponse } from 'next/server'
import { aiLimiter } from '@/lib/rateLimit'

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

        // Enhanced prompt engineering for 360 panorama generation
        // Add technical details and quality modifiers
        const enhancedPrompt = enhancePromptForPanorama(prompt)

        return NextResponse.json({
            original: prompt,
            enhanced: enhancedPrompt
        })

    } catch (error: any) {
        console.error('Error enhancing prompt:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to enhance prompt' },
            { status: 500 }
        )
    }
}

function enhancePromptForPanorama(userPrompt: string): string {
    // Clean up the prompt
    const cleanPrompt = userPrompt.trim()

    // CRITICAL: Emphasize 360 panorama format at the beginning
    const panoramaPrefix = "360 degree equirectangular panorama"

    // Technical specifications for optimal panorama generation
    // PERSPECTIVE FIX: Add equirectangular-specific keywords first
    const technicalSpecs = [
        'equirectangular projection',
        'correct spherical perspective',
        'proper latitude-longitude mapping',
        'seamless horizontal wrap',
        'no visible seams',
        '2:1 aspect ratio',
        'spherical projection',
        'full 360x180 coverage',
        'fisheye distortion at poles',
        'curved horizon line',
        'ultra wide angle view',
        '8k resolution',
        'highly detailed',
        'photorealistic'
    ]

    // Quality enhancers
    const qualityEnhancers = [
        'professional photography',
        'cinematic lighting',
        'HDR quality',
        'vibrant colors',
        'sharp focus throughout'
    ]

    // CUSTOM REQUIREMENT 1: Detect if user wants people in the scene
    const hasPeopleKeywords = detectPeopleInPrompt(cleanPrompt)

    // CUSTOM REQUIREMENT 2: Detect if user specified camera angle
    const hasCameraAngle = detectCameraAngle(cleanPrompt)

    // Detect content type and add relevant enhancers
    const contentEnhancers = detectContentType(cleanPrompt)

    // IMPORTANT: Structure the prompt to emphasize panorama format
    // Format: [PANORAMA TYPE] of [CONTENT], [TECHNICAL SPECS], [QUALITY], [CUSTOM REQUIREMENTS]
    const enhancedParts = [
        panoramaPrefix,
        'of',
        cleanPrompt,
        ...technicalSpecs.slice(0, 5), // Top 5 technical specs
        ...qualityEnhancers.slice(0, 3), // Top 3 quality enhancers
        ...contentEnhancers
    ]

    // Add people exclusion if not mentioned by user
    if (!hasPeopleKeywords) {
        enhancedParts.push('no people', 'no humans', 'empty scene', 'unpopulated')
    }

    // Add wide shot preference if camera angle not specified
    if (!hasCameraAngle) {
        enhancedParts.push('wide angle shot', 'distant view', 'expansive perspective', 'far camera distance')
    }

    return enhancedParts.join(', ')
}

function detectContentType(prompt: string): string[] {
    const lowerPrompt = prompt.toLowerCase()
    const enhancers: string[] = []

    // Nature/Outdoor
    if (lowerPrompt.match(/\b(nature|forest|mountain|beach|ocean|sky|sunset|sunrise|landscape)\b/)) {
        enhancers.push(
            'natural lighting',
            'atmospheric perspective',
            'environmental depth',
            'curved horizon line',
            'proper sky-to-ground transition',
            '360 degree environmental wrap'
        )
    }

    // Urban/City
    if (lowerPrompt.match(/\b(city|urban|street|building|skyline|downtown|cyberpunk)\b/)) {
        enhancers.push(
            'architectural detail',
            'urban atmosphere',
            '360 city view',
            'buildings wrapping around sphere',
            'curved street perspective',
            'proper vertical line distortion'
        )
    }

    // Interior/Indoor - CUSTOM REQUIREMENT 3: Add table for interior spaces
    if (lowerPrompt.match(/\b(room|interior|indoor|studio|office|apartment|lobby|kitchen|dining|living|bedroom|workspace)\b/)) {
        enhancers.push(
            'ambient lighting',
            'interior design',
            'spherical room view',
            'correct interior perspective',
            'walls curving to meet at poles',
            'ceiling and floor with proper distortion',
            'stylish table in the center of the room',
            'table matching the interior design style',
            'centered furniture piece'
        )
    }

    // Time of day
    if (lowerPrompt.match(/\b(night|evening|dusk)\b/)) {
        enhancers.push('night lighting', 'ambient glow', 'low light photography')
    }

    if (lowerPrompt.match(/\b(day|morning|noon|afternoon)\b/)) {
        enhancers.push('daylight', 'natural illumination', 'bright environment')
    }

    // Weather
    if (lowerPrompt.match(/\b(rain|storm|cloudy|fog|mist)\b/)) {
        enhancers.push('atmospheric effects', 'weather dynamics', 'volumetric atmosphere')
    }

    // Sky emphasis for better panorama
    if (!lowerPrompt.includes('sky')) {
        enhancers.push('complete sky coverage')
    }

    return enhancers
}

/**
 * CUSTOM REQUIREMENT 1: Detect if user prompt contains people-related keywords
 * Returns true if people are mentioned, false otherwise
 */
function detectPeopleInPrompt(prompt: string): boolean {
    const lowerPrompt = prompt.toLowerCase()

    // Comprehensive list of people-related keywords
    const peopleKeywords = [
        'people', 'person', 'human', 'humans',
        'man', 'woman', 'men', 'women',
        'character', 'characters',
        'figure', 'figures',
        'crowd', 'crowds',
        'pedestrian', 'pedestrians',
        'worker', 'workers',
        'employee', 'employees',
        'customer', 'customers',
        'visitor', 'visitors',
        'student', 'students',
        'child', 'children', 'kid', 'kids',
        'boy', 'girl', 'boys', 'girls',
        'adult', 'adults',
        'portrait', 'portraits',
        'model', 'models'
    ]

    return peopleKeywords.some(keyword => lowerPrompt.includes(keyword))
}

/**
 * CUSTOM REQUIREMENT 2: Detect if user prompt specifies camera angle/distance
 * Returns true if camera angle is specified, false otherwise
 */
function detectCameraAngle(prompt: string): boolean {
    const lowerPrompt = prompt.toLowerCase()

    // Camera angle and distance keywords
    const cameraKeywords = [
        'close-up', 'closeup', 'close up',
        'macro', 'detail', 'detailed shot',
        'zoom', 'zoomed',
        'tight shot', 'tight frame',
        'extreme close', 'extreme closeup',
        'medium shot', 'mid shot',
        'wide shot', 'wide angle',
        'long shot', 'distant',
        'aerial', 'bird eye', 'top down',
        'low angle', 'high angle',
        'eye level', 'ground level',
        'panoramic', 'vista'
    ]

    return cameraKeywords.some(keyword => lowerPrompt.includes(keyword))
}

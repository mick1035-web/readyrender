import { NextRequest, NextResponse } from 'next/server'
import Replicate from 'replicate'

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
})

export async function POST(request: NextRequest) {
    try {
        const { prompt } = await request.json()

        if (!prompt || typeof prompt !== 'string') {
            return NextResponse.json(
                { error: 'Prompt is required and must be a string' },
                { status: 400 }
            )
        }

        console.log('Generating 360 panorama with prompt:', prompt)

        // Hardcoded negative prompt to ensure quality
        const negativePrompt = "low quality, worst quality, distortion, blurry, text, watermark, signature, ugly, tiling, bad geometry, deformed, seams, artifacts"

        // Create prediction using predictions API
        // Using igorriti/flux-360 latest version
        const prediction = await replicate.predictions.create({
            version: "d26037255a2b298408505e2fbd0bf7703521daca8f07e8c8f335ba874b4aa11a",
            input: {
                prompt: prompt,
                negative_prompt: negativePrompt,
                width: 1440,      // Maximum supported by model
                height: 720,      // 2:1 aspect ratio for 360 panorama
                num_inference_steps: 50,  // Maximum steps for finest quality
                guidance_scale: 3.5,      // Standard guidance
            }
        })

        console.log('Prediction created:', prediction.id)

        // Wait for prediction to complete
        let completedPrediction = prediction
        while (
            completedPrediction.status !== "succeeded" &&
            completedPrediction.status !== "failed" &&
            completedPrediction.status !== "canceled"
        ) {
            await new Promise(resolve => setTimeout(resolve, 1000))
            completedPrediction = await replicate.predictions.get(prediction.id)
            console.log('Prediction status:', completedPrediction.status)
        }

        if (completedPrediction.status !== "succeeded") {
            throw new Error(`Prediction failed with status: ${completedPrediction.status}`)
        }

        console.log('Prediction output:', completedPrediction.output)

        // Extract image URL from output
        const output = completedPrediction.output
        let imageUrl: string | null = null

        if (Array.isArray(output) && output.length > 0) {
            imageUrl = output[0]
        } else if (typeof output === 'string') {
            imageUrl = output
        }

        console.log('Extracted image URL:', imageUrl)

        if (!imageUrl || typeof imageUrl !== 'string') {
            console.error('Invalid output format:', JSON.stringify(output, null, 2))
            throw new Error(`Invalid response from Replicate API. Output: ${JSON.stringify(output)}`)
        }

        return NextResponse.json({ url: imageUrl })

    } catch (error: any) {
        console.error('Error generating environment:', error)
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        })

        // If it's a 404 error, provide helpful message
        if (error.message?.includes('404')) {
            return NextResponse.json(
                { error: 'Model not found. Please check Replicate API configuration.' },
                { status: 500 }
            )
        }

        return NextResponse.json(
            { error: error.message || 'Failed to generate environment' },
            { status: 500 }
        )
    }
}

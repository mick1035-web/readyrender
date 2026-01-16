import { ImageResponse } from 'next/og'
import { join } from 'path'
import { readFileSync } from 'fs'

// Image metadata
export const size = {
    width: 32,
    height: 32,
}
export const contentType = 'image/png'

// Image generation
export default function Icon() {
    // Read the logo file from the public directory
    // Note: We use process.cwd() to get the project root
    const logoPath = join(process.cwd(), 'public', 'logo.png')
    const logoData = readFileSync(logoPath)

    // Convert buffer to base64 string
    const base64Image = `data:image/png;base64,${logoData.toString('base64')}`

    return new ImageResponse(
        (
            // ImageResponse JSX element
            <div
                style={{
                    background: 'transparent',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {/* Render the image using base64 data */}
                <img
                    src={base64Image}
                    style={{
                        width: '310%',
                        height: '310%',
                        objectFit: 'contain',
                    }}
                />
            </div>
        ),
        {
            ...size,
        }
    )
}

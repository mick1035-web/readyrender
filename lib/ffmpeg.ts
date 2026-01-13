import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

class FFmpegService {
    private ffmpeg: FFmpeg | null = null
    private loaded = false

    /**
     * Load FFmpeg core (only needs to be done once)
     */
    async load(onProgress?: (progress: number) => void) {
        if (this.loaded) return

        this.ffmpeg = new FFmpeg()

        // Progress callback for loading
        this.ffmpeg.on('log', ({ message }) => {
            console.log('[FFmpeg]', message)
        })

        // Load FFmpeg core from CDN
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'

        try {
            await this.ffmpeg.load({
                coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
                wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
            })

            this.loaded = true
            console.log('✅ FFmpeg loaded successfully')
        } catch (error) {
            console.error('❌ FFmpeg load failed:', error)
            throw error
        }
    }

    /**
     * Convert WebM to MP4 (H.264) - No alpha channel
     * Best for: iPhone, Instagram, universal compatibility
     */
    async convertToMP4(
        webmBlob: Blob,
        onProgress?: (progress: number) => void
    ): Promise<Blob> {
        if (!this.ffmpeg || !this.loaded) {
            throw new Error('FFmpeg not loaded. Call load() first.')
        }

        console.log('🎬 Starting MP4 conversion...')

        // Write input file to virtual filesystem
        await this.ffmpeg.writeFile('input.webm', await fetchFile(webmBlob))

        // Set up progress tracking
        if (onProgress) {
            this.ffmpeg.on('progress', ({ progress }) => {
                onProgress(progress * 100)
            })
        }

        // Convert to MP4 with H.264 codec
        await this.ffmpeg.exec([
            '-i', 'input.webm',
            '-c:v', 'libx264',        // H.264 codec
            '-preset', 'fast',         // Balance speed/quality
            '-crf', '23',              // Quality (18-28, lower = better)
            '-pix_fmt', 'yuv420p',     // No alpha channel
            '-movflags', '+faststart', // Web optimization (moov atom at start)
            'output.mp4'
        ])

        // Read output file
        const data = await this.ffmpeg.readFile('output.mp4') as Uint8Array

        // Cleanup virtual filesystem
        await this.ffmpeg.deleteFile('input.webm')
        await this.ffmpeg.deleteFile('output.mp4')

        console.log('✅ MP4 conversion complete')
        return new Blob([new Uint8Array(data)], { type: 'video/mp4' })
    }

    /**
     * Convert WebM to HEVC (H.265) - With alpha channel
     * Best for: Safari, iOS, Final Cut Pro, transparency
     */
    async convertToHEVC(
        webmBlob: Blob,
        onProgress?: (progress: number) => void
    ): Promise<Blob> {
        if (!this.ffmpeg || !this.loaded) {
            throw new Error('FFmpeg not loaded. Call load() first.')
        }

        console.log('✨ Starting HEVC conversion with alpha...')

        // Write input file to virtual filesystem
        await this.ffmpeg.writeFile('input.webm', await fetchFile(webmBlob))

        // Set up progress tracking
        if (onProgress) {
            this.ffmpeg.on('progress', ({ progress }) => {
                onProgress(progress * 100)
            })
        }

        // Convert to HEVC with alpha channel
        await this.ffmpeg.exec([
            '-i', 'input.webm',
            '-c:v', 'libx265',         // H.265/HEVC codec
            '-preset', 'fast',
            '-crf', '23',
            '-pix_fmt', 'yuva420p',    // With alpha channel
            '-tag:v', 'hvc1',          // QuickTime compatible tag
            '-movflags', '+faststart',
            'output.mov'
        ])

        // Read output file
        const data = await this.ffmpeg.readFile('output.mov') as Uint8Array

        // Cleanup virtual filesystem
        await this.ffmpeg.deleteFile('input.webm')
        await this.ffmpeg.deleteFile('output.mov')

        console.log('✅ HEVC conversion complete')
        return new Blob([new Uint8Array(data)], { type: 'video/quicktime' })
    }

    /**
     * Check if FFmpeg is loaded
     */
    isLoaded(): boolean {
        return this.loaded
    }

    /**
     * Cleanup and reset FFmpeg instance
     */
    async cleanup() {
        if (this.ffmpeg) {
            this.ffmpeg = null
            this.loaded = false
            console.log('🧹 FFmpeg cleaned up')
        }
    }
}

// Export singleton instance
export const ffmpegService = new FFmpegService()

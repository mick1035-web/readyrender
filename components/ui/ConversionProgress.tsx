'use client'

interface ConversionProgressProps {
    progress: number
    stage: 'loading' | 'converting'
    format: 'mp4' | 'hevc'
}

export default function ConversionProgress({ progress, stage, format }: ConversionProgressProps) {
    const formatInfo = {
        mp4: {
            name: 'MP4 (H.264)',
            color: 'blue'
        },
        hevc: {
            name: 'HEVC (H.265)',
            color: 'purple'
        }
    }

    const info = formatInfo[format]

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-zinc-900 p-8 rounded-2xl max-w-md w-full border border-zinc-800 shadow-2xl">

                <h3 className="text-xl font-bold mb-2 text-center">
                    {stage === 'loading' ? 'Loading FFmpeg...' : `Converting to ${info.name}...`}
                </h3>

                <div className="w-full bg-zinc-800 rounded-full h-3 mb-3 overflow-hidden">
                    <div
                        className={`bg-${info.color}-600 h-3 rounded-full transition-all duration-300 ease-out`}
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <p className="text-lg text-zinc-400 text-center mb-6 font-mono">
                    {Math.round(progress)}%
                </p>

                <div className="text-xs text-zinc-500 space-y-2 bg-zinc-800/50 p-4 rounded-lg">
                    <p className="text-center font-semibold text-zinc-400">
                        Please keep this tab open...
                    </p>
                    {stage === 'converting' && (
                        <p className="text-center text-yellow-500">
                            This may take 30-90 seconds depending on video length
                        </p>
                    )}
                    {stage === 'loading' && (
                        <p className="text-center text-blue-400">
                            Loading video processing engine...
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}

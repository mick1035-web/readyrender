'use client'

import { X, Smartphone, Box, Download, Upload } from 'lucide-react'

interface Props {
    isOpen: boolean
    onClose: () => void
}

export default function ScanGuideModal({ isOpen, onClose }: Props) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div
                className="w-[600px] bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white mb-1">Scan Real Objects to 3D</h2>
                        <p className="text-sm text-zinc-400">Turn any physical object into a 3D model using your phone</p>
                    </div>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-8 overflow-y-auto max-h-[70vh] custom-scrollbar">

                    {/* Step 1: Download App */}
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500 font-bold text-lg">
                            1
                        </div>
                        <div className="flex-1 space-y-3">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Smartphone size={18} />
                                Download a Scanning App
                            </h3>
                            <p className="text-zinc-400 text-sm">
                                Install one of these free apps on your smartphone. The free version is sufficient.
                            </p>

                            <div className="grid grid-cols-2 gap-4">
                                <a
                                    href="https://poly.cam/"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block p-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-blue-500 rounded-lg transition-all group"
                                >
                                    <div className="font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">Polycam</div>
                                    <div className="text-xs text-zinc-500">Best for LiDAR (iPhone Pro) & Photo Mode</div>
                                </a>

                                <a
                                    href="https://lumalabs.ai/interactive-scenes"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block p-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-purple-500 rounded-lg transition-all group"
                                >
                                    <div className="font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">Luma AI</div>
                                    <div className="text-xs text-zinc-500">Excellent NeRF technology for details</div>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Step 2: Scan */}
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 font-bold text-lg">
                            2
                        </div>
                        <div className="flex-1 space-y-2">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Box size={18} />
                                Scan Your Object
                            </h3>
                            <p className="text-zinc-400 text-sm">
                                Place your object in a well-lit area. Walk around it slowly while recording, ensuring you capture all angles (top, bottom, sides).
                            </p>
                        </div>
                    </div>

                    {/* Step 3: Export */}
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 font-bold text-lg">
                            3
                        </div>
                        <div className="flex-1 space-y-2">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Download size={18} />
                                Export as .GLB
                            </h3>
                            <p className="text-zinc-400 text-sm">
                                Once processing is complete, export the model. Choose the <span className="text-white font-mono bg-zinc-800 px-1 py-0.5 rounded">.glb</span> or <span className="text-white font-mono bg-zinc-800 px-1 py-0.5 rounded">.gltf</span> format. This format includes textures and is optimized for web.
                            </p>
                        </div>
                    </div>

                    {/* Step 4: Upload */}
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 font-bold text-lg">
                            4
                        </div>
                        <div className="flex-1 space-y-2">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Upload size={18} />
                                Upload to ReadyRender
                            </h3>
                            <p className="text-zinc-400 text-sm">
                                Bring your .glb file here and upload it to start creating your video!
                            </p>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-zinc-800 bg-zinc-800/50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors"
                    >
                        Got it
                    </button>
                </div>
            </div>
        </div>
    )
}

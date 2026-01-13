'use client'

import { useStore } from '@/store/useStore'
import { Upload } from 'lucide-react'
import { ChangeEvent, useRef } from 'react'

export default function UploadPanel() {
    const setModelUrl = useStore((state) => state.setModelUrl)
    const inputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const url = URL.createObjectURL(file)
            // Determine model type from file extension
            const extension = file.name.split('.').pop()?.toLowerCase()
            let type: 'gltf' | 'obj' | 'fbx' = 'gltf'
            if (extension === 'obj') type = 'obj'
            else if (extension === 'fbx') type = 'fbx'
            setModelUrl(url, type)
        }
    }

    const handleButtonClick = () => {
        inputRef.current?.click()
    }

    return (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
            <input
                ref={inputRef}
                type="file"
                accept=".glb,.gltf,.obj,.fbx"
                onChange={handleFileChange}
                className="hidden"
            />
            <button
                onClick={handleButtonClick}
                className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
            >
                <Upload size={20} />
                Upload 3D Model
            </button>
        </div>
    )
}

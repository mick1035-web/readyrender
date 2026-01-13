'use client'

import { useStore } from '@/store/useStore'

const ENV_PRESETS = [
    { value: 'studio', label: 'Studio' },
    { value: 'city', label: 'City' },
    { value: 'sunset', label: 'Sunset' },
    { value: 'dawn', label: 'Dawn' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'warehouse', label: 'Warehouse' },
]

export default function ControlsPanel() {
    const envPreset = useStore((state) => state.envPreset)
    const setEnvPreset = useStore((state) => state.setEnvPreset)

    return (
        <div className="absolute right-4 top-24 p-4 bg-zinc-900/80 backdrop-blur-md rounded-lg text-white border border-zinc-700 z-10 min-w-[200px]">
            <h3 className="text-sm font-semibold mb-3 text-zinc-300">
                Lighting Environment
            </h3>

            <select
                value={envPreset}
                onChange={(e) => setEnvPreset(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer hover:bg-zinc-750 transition-colors"
            >
                {ENV_PRESETS.map((preset) => (
                    <option key={preset.value} value={preset.value}>
                        {preset.label}
                    </option>
                ))}
            </select>
        </div>
    )
}

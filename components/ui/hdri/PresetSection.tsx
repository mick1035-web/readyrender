'use client'

import { useStore } from '@/store/useStore'
import { PRESET_ENVIRONMENTS } from '@/constants/hdri'
import { Check, ChevronDown } from 'lucide-react'

export default function PresetSection() {
    const hdriMode = useStore(s => s.hdriMode)
    const activeHdriId = useStore(s => s.activeHdriId)
    const setActiveHdri = useStore(s => s.setActiveHdri)

    const handleSelectPreset = (presetId: string) => {
        setActiveHdri('preset', presetId)
    }

    // Get current preset name
    const currentPreset = PRESET_ENVIRONMENTS.find(p => p.id === activeHdriId)
    const isPresetActive = hdriMode === 'preset' && activeHdriId !== 'none'

    return (
        <section>
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 px-1">
                📚 Preset Library
            </h3>

            {/* Dropdown Select */}
            <div className="relative">
                <select
                    value={isPresetActive && activeHdriId ? activeHdriId : ''}
                    onChange={(e) => handleSelectPreset(e.target.value)}
                    className={`w-full px-4 py-3 pr-10 rounded-lg border transition-all appearance-none cursor-pointer ${isPresetActive
                        ? 'bg-green-900/20 border-green-500/50 text-white'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:bg-zinc-700'
                        }`}
                >
                    <option value="" disabled className="bg-zinc-800 text-zinc-400">
                        Select a preset environment...
                    </option>
                    {PRESET_ENVIRONMENTS.map(preset => (
                        <option
                            key={preset.id}
                            value={preset.id}
                            className="bg-zinc-800 text-white"
                        >
                            {preset.name} - {preset.category}
                        </option>
                    ))}
                </select>

                {/* Custom dropdown icon */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    {isPresetActive ? (
                        <Check size={18} className="text-green-500" />
                    ) : (
                        <ChevronDown size={18} className="text-zinc-500" />
                    )}
                </div>
            </div>

            {/* Selected preset info */}
            {isPresetActive && currentPreset && (
                <div className="mt-2 px-3 py-2 bg-zinc-800/50 rounded-lg border border-zinc-700">
                    <div className="text-xs text-zinc-400">
                        Active: <span className="text-white font-semibold">{currentPreset.name}</span>
                        <span className="text-zinc-600 mx-1">•</span>
                        <span className="text-zinc-500">{currentPreset.category}</span>
                    </div>
                </div>
            )}
        </section>
    )
}

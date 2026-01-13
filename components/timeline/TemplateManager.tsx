'use client'

import { useStore } from '@/store/useStore'
import { CAMERA_PRESETS } from '@/constants/presets'
import { X, Save, Trash2, LayoutTemplate, Film, AlertTriangle } from 'lucide-react'
import { useState } from 'react'

type ConfirmAction = {
    type: 'apply' | 'delete'
    presetId: string
    isCustom: boolean
    label: string
} | null

export default function TemplateManager() {
    const isOpen = useStore(s => s.isTemplateManagerOpen)
    const setIsOpen = useStore(s => s.setIsTemplateManagerOpen)
    const applyPreset = useStore(s => s.applyPreset)
    const customPresets = useStore(s => s.customPresets)
    const saveCurrentAsPreset = useStore(s => s.saveCurrentAsPreset)
    const deleteCustomPreset = useStore(s => s.deleteCustomPreset)
    const keyframes = useStore(s => s.keyframes)

    const [newPresetName, setNewPresetName] = useState('')
    const [isNaming, setIsNaming] = useState(false)
    const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)

    if (!isOpen) return null

    const handleSave = () => {
        if (!newPresetName.trim()) return
        saveCurrentAsPreset(newPresetName)
        setNewPresetName('')
        setIsNaming(false)
    }

    const handleConfirm = () => {
        if (!confirmAction) return

        if (confirmAction.type === 'apply') {
            applyPreset(confirmAction.presetId, confirmAction.isCustom)
            setIsOpen(false)
        } else if (confirmAction.type === 'delete') {
            deleteCustomPreset(confirmAction.presetId)
        }
        setConfirmAction(null)
    }

    const handleCancel = () => {
        setConfirmAction(null)
    }

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto" onClick={() => !confirmAction && setIsOpen(false)}>
            <div
                className="w-[500px] h-[80vh] bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-800/50">
                    <div className="flex items-center gap-2">
                        <LayoutTemplate size={20} className="text-blue-500" />
                        <h2 className="text-lg font-bold text-white">Template Manager</h2>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">

                    {/* Section 1: System Template Library */}
                    <section>
                        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 px-1">System Template Library</h3>
                        <select
                            onChange={(e) => {
                                const presetId = e.target.value
                                if (!presetId) return
                                const preset = CAMERA_PRESETS.find(p => p.id === presetId)
                                if (!preset) return
                                setConfirmAction({
                                    type: 'apply',
                                    presetId,
                                    isCustom: false,
                                    label: preset.label
                                })
                                e.target.value = '' // Reset selection
                            }}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-300 focus:border-blue-500 focus:outline-none hover:border-zinc-600 transition-colors cursor-pointer"
                        >
                            <option value="" className="text-zinc-500">Select a template...</option>
                            {CAMERA_PRESETS.map(preset => (
                                <option key={preset.id} value={preset.id} className="text-white bg-zinc-800">
                                    {preset.label} - {preset.description}
                                </option>
                            ))}
                        </select>
                    </section>

                    {/* Section 2: Custom Presets */}
                    <section>
                        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 px-1">My Templates</h3>

                        {customPresets.length === 0 ? (
                            <div className="p-8 border-2 border-dashed border-zinc-800 rounded-lg flex flex-col items-center justify-center text-zinc-600 gap-2">
                                <Save size={24} />
                                <span className="text-sm">No custom templates saved yet.</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-2">
                                {customPresets.map(preset => (
                                    <div key={preset.id} className="group relative flex items-center gap-3 p-3 bg-zinc-800/50 border border-zinc-800 hover:border-blue-500/30 rounded-lg transition-all">
                                        <button
                                            onClick={() => setConfirmAction({
                                                type: 'apply',
                                                presetId: preset.id,
                                                isCustom: true,
                                                label: preset.label
                                            })}
                                            className="flex-1 flex items-center gap-3 text-left"
                                        >
                                            <div className="w-10 h-10 bg-blue-900/20 rounded flex items-center justify-center text-blue-500">
                                                <LayoutTemplate size={18} />
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-zinc-200">{preset.label}</div>
                                                <div className="text-xs text-zinc-500">{preset.description}</div>
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => setConfirmAction({
                                                type: 'delete',
                                                presetId: preset.id,
                                                isCustom: true,
                                                label: preset.label
                                            })}
                                            className="p-2 text-zinc-600 hover:text-red-500 hover:bg-red-900/20 rounded transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                {/* Confirmation Dialog Overlay */}
                {confirmAction && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
                        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6 max-w-md mx-4 shadow-2xl animate-in zoom-in-95 duration-200">
                            <div className="flex items-start gap-3 mb-4">
                                <div className="w-10 h-10 bg-yellow-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                                    <AlertTriangle size={20} className="text-yellow-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-1">
                                        {confirmAction.type === 'apply' ? 'Apply Template?' : 'Delete Template?'}
                                    </h3>
                                    <p className="text-sm text-zinc-400">
                                        {confirmAction.type === 'apply'
                                            ? `Applying "${confirmAction.label}" will overwrite your current timeline. This action cannot be undone.`
                                            : `Are you sure you want to delete "${confirmAction.label}"? This action cannot be undone.`
                                        }
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2 justify-end">
                                <button
                                    onClick={handleCancel}
                                    className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded text-sm font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    className={`px-4 py-2 rounded text-sm font-bold transition-colors ${confirmAction.type === 'delete'
                                        ? 'bg-red-600 hover:bg-red-500 text-white'
                                        : 'bg-blue-600 hover:bg-blue-500 text-white'
                                        }`}
                                >
                                    {confirmAction.type === 'apply' ? 'Apply' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer - Save Action */}
                <div className="p-4 border-t border-zinc-800 bg-zinc-900">
                    {isNaming ? (
                        <div className="flex gap-2 animate-in slide-in-from-bottom-2">
                            <input
                                type="text"
                                autoFocus
                                placeholder="Enter template name..."
                                value={newPresetName}
                                onChange={e => setNewPresetName(e.target.value)}
                                className="flex-1 bg-zinc-800 border border-zinc-600 rounded px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                                onKeyDown={e => e.key === 'Enter' && handleSave()}
                            />
                            <button
                                onClick={handleSave}
                                disabled={!newPresetName.trim()}
                                className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-bold hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => setIsNaming(false)}
                                className="px-3 py-2 bg-zinc-800 text-zinc-400 rounded hover:bg-zinc-700"
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsNaming(true)}
                            disabled={keyframes.length === 0}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium rounded-lg transition-colors border border-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save size={16} />
                            Save Current Timeline as Template
                        </button>
                    )}
                </div>

            </div>
        </div>
    )
}

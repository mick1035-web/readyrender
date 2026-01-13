'use client'

import { useStore, TextConfig } from '@/store/useStore'
import { X, Type, Move, RotateCw } from 'lucide-react'
import { useEffect } from 'react'

export default function TextPropertyPanel() {
    const editingTextId = useStore(s => s.editingTextId)
    const setEditingTextId = useStore(s => s.setEditingTextId)
    const keyframes = useStore(s => s.keyframes)
    const updateKeyframeText = useStore(s => s.updateKeyframeText)

    const getDefaultConfig = (): TextConfig => ({
        content: "New Title",
        visible: true,
        color: "#ffffff",
        size: 1.0,
        position: [0, 0, 0],
        rotation: [0, 0, 0]
    })

    useEffect(() => {
        if (!editingTextId) return
        const keyframe = keyframes.find(k => k.id === editingTextId)
        if (keyframe && !keyframe.textConfig) {
            updateKeyframeText(editingTextId, getDefaultConfig())
        }
    }, [editingTextId, keyframes, updateKeyframeText])

    if (!editingTextId) return null

    const keyframe = keyframes.find(k => k.id === editingTextId)
    if (!keyframe) return null

    const config: TextConfig = keyframe.textConfig || getDefaultConfig()

    const handleChange = (newValues: Partial<TextConfig>) => {
        const newConfig = { ...config, ...newValues }
        updateKeyframeText(editingTextId, newConfig)
    }

    // [NEW] 封裝的拉霸群組元件 (XYZ) - Centered Layout
    const TransformSliderGroup = ({
        label,
        icon: Icon,
        value,
        onChange,
        min,
        max,
        step = 0.1,
        isRotation = false
    }: any) => (
        <div className="space-y-2 flex flex-col items-center">
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-zinc-400 w-full">
                <Icon size={12} />
                <span>{label}</span>
            </div>
            <div className="w-full max-w-xs mx-auto space-y-2">
                {['X', 'Y', 'Z'].map((axis, i) => {
                    // 顯示數值：如果是旋轉，將弧度轉為角度顯示
                    const displayValue = isRotation
                        ? Math.round(value[i] * (180 / Math.PI))
                        : Number(value[i].toFixed(2))

                    return (
                        <div key={axis} className="flex items-center justify-center gap-3">
                            <span className="text-[10px] font-bold text-zinc-500 w-3">{axis}</span>
                            <input
                                type="range"
                                min={min}
                                max={max}
                                step={step}
                                value={displayValue}
                                onChange={(e) => {
                                    const newValue = [...value]
                                    const inputVal = parseFloat(e.target.value)
                                    // 儲存數值：如果是旋轉，將角度轉回弧度
                                    newValue[i] = isRotation ? inputVal * (Math.PI / 180) : inputVal
                                    onChange(newValue)
                                }}
                                className={`flex-1 h-1 rounded-lg appearance-none cursor-pointer ${isRotation ? 'bg-zinc-700 accent-blue-500' : 'bg-zinc-700 accent-orange-500'
                                    }`}
                            />
                            <span className="text-[10px] text-zinc-300 w-8 text-right font-mono">
                                {displayValue}°
                            </span>
                        </div>
                    )
                })}
            </div>
        </div>
    )

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-auto" onClick={() => setEditingTextId(null)}>
            <div
                className="w-80 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl p-5 space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <div className="flex items-center gap-2">
                        <Type size={16} className="text-pink-500" />
                        <h3 className="text-sm font-bold text-white">Edit Title</h3>
                    </div>
                    <button onClick={() => setEditingTextId(null)} className="text-zinc-500 hover:text-white">
                        <X size={16} />
                    </button>
                </div>

                {/* Content */}
                <div className="space-y-1 flex flex-col items-center">
                    <label className="text-xs text-zinc-400 text-center w-full">Content</label>
                    <textarea
                        value={config.content}
                        onChange={e => handleChange({ content: e.target.value })}
                        className="w-full max-w-xs h-20 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white text-center focus:outline-none focus:border-blue-500 resize-none custom-scrollbar mx-auto"
                        placeholder="Enter text..."
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-xs text-zinc-400">Color</label>
                        <div className="flex items-center gap-2 bg-zinc-800 p-1 rounded border border-zinc-700">
                            <input
                                type="color"
                                value={config.color}
                                onChange={e => handleChange({ color: e.target.value })}
                                className="w-6 h-6 bg-transparent cursor-pointer rounded overflow-hidden border-none p-0"
                            />
                            <span className="text-xs text-zinc-400 font-mono">{config.color}</span>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-zinc-400">Size ({config.size})</label>
                        <input
                            type="range" min="0.5" max="5" step="0.1"
                            value={config.size}
                            onChange={e => handleChange({ size: parseFloat(e.target.value) })}
                            className="w-full h-1 bg-zinc-700 accent-pink-500 rounded appearance-none cursor-pointer mt-3"
                        />
                    </div>
                </div>

                <hr className="border-zinc-800" />

                {/* Transform Sliders */}
                <TransformSliderGroup
                    label="Position"
                    icon={Move}
                    value={config.position}
                    onChange={(pos: any) => handleChange({ position: pos })}
                    min={-10} max={10} step={0.1}
                />

                <TransformSliderGroup
                    label="Rotation"
                    icon={RotateCw}
                    value={config.rotation || [0, 0, 0]}
                    onChange={(rot: any) => handleChange({ rotation: rot })}
                    min={-180} max={180} step={1}
                    isRotation={true}
                />

                <div className="flex items-center justify-between pt-2">
                    <label className="text-xs text-zinc-400">Visible</label>
                    <input
                        type="checkbox"
                        checked={config.visible}
                        onChange={e => handleChange({ visible: e.target.checked })}
                        className="w-4 h-4 rounded border-zinc-600 bg-zinc-700 accent-pink-500"
                    />
                </div>
            </div>
        </div>
    )
}
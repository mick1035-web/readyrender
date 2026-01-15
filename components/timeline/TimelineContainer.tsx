'use client'

import { useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import TimelineBrick from './TimelineBrick'
import TextPropertyPanel from './TextPropertyPanel'
import ImagePropertyPanel from './ImagePropertyPanel'
import TemplateManager from './TemplateManager'
import { Camera, Play, Pause, Plus, X, LayoutTemplate } from 'lucide-react'

export default function TimelineContainer() {
    const isOpen = useStore(s => s.isTimelineOpen)
    const setIsOpen = useStore(s => s.setIsTimelineOpen)
    const keyframes = useStore(s => s.keyframes)
    const reorderKeyframes = useStore(s => s.reorderKeyframes)
    const isPlaying = useStore(s => s.isPlaying)
    const setIsPlaying = useStore(s => s.setIsPlaying)
    const setCaptureSignal = useStore(s => s.setCaptureSignal)
    const setIsTemplateManagerOpen = useStore(s => s.setIsTemplateManagerOpen)
    const checkAndShowTip = useStore(s => s.checkAndShowTip)

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor)
    )

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        if (active.id !== over?.id) {
            const oldIndex = keyframes.findIndex((k) => k.id === active.id)
            const newIndex = keyframes.findIndex((k) => k.id === over?.id)
            reorderKeyframes(arrayMove(keyframes, oldIndex, newIndex))
        }
    }

    // 自動開啟提示
    useEffect(() => {
        if (isOpen) {
            checkAndShowTip('timeline_open')
        }
    }, [isOpen, checkAndShowTip])

    if (!isOpen) return null

    return (
        <>
            {/* [FIX] 將面板移出動畫容器外，確保 fixed 定位是相對於視窗的 */}
            <TextPropertyPanel />
            <ImagePropertyPanel />
            <TemplateManager />

            <div className="w-full h-[170px] bg-zinc-950 border-t border-zinc-800 flex flex-col z-50 flex-shrink-0 animate-in slide-in-from-bottom-2 duration-300 relative">
                {/* Toolbar */}
                <div className="h-12 border-b border-zinc-800 flex items-center px-4 justify-between bg-zinc-900">
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-white">Timeline Editor</span>

                        <button
                            onClick={() => setCaptureSignal('start')}
                            data-tutorial="add-keyframe"
                            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold"
                        >
                            <Camera size={14} />
                            <Plus size={14} />
                            ADD KEYFRAME
                        </button>

                        <button
                            onClick={() => setIsTemplateManagerOpen(true)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-bold"
                        >
                            <LayoutTemplate size={14} />
                            TEMPLATE MANAGER
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            data-tutorial="play-button"
                            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold transition-colors ${isPlaying ? 'bg-red-600 text-white' : 'bg-green-600 text-white hover:bg-green-500'
                                }`}
                        >
                            {isPlaying ? <><Pause size={14} /> STOP</> : <><Play size={14} /> PLAY PREVIEW</>}
                        </button>
                        <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-zinc-800 text-zinc-400 rounded">
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* Track Area */}
                <div className="flex-1 overflow-x-auto p-4 custom-scrollbar">
                    <div className="flex gap-1 h-full items-center min-w-max">
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={keyframes.map(k => k.id)}
                                strategy={horizontalListSortingStrategy}
                            >
                                {keyframes.map((keyframe, index) => (
                                    <TimelineBrick key={keyframe.id} keyframe={keyframe} index={index} />
                                ))}
                            </SortableContext>
                        </DndContext>

                        {keyframes.length === 0 && (
                            <div className="text-zinc-600 text-sm italic ml-4">
                                Move camera in scene &rarr; Click "ADD KEYFRAME" to start
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
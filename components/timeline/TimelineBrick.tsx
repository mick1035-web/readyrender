import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Keyframe, useStore } from '@/store/useStore'
import { GripHorizontal, X, Diamond, Type, Image as ImageIcon } from 'lucide-react'

interface Props {
    keyframe: Keyframe
    index: number
}

// 1秒 = 60px 寬度
const PIXELS_PER_SECOND = 60

export default function TimelineBrick({ keyframe, index }: Props) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: keyframe.id })

    const updateKeyframeDuration = useStore(s => s.updateKeyframeDuration)
    const removeKeyframe = useStore(s => s.removeKeyframe)
    const setSelected = useStore(s => s.setSelectedKeyframeId)
    const selectedId = useStore(s => s.selectedKeyframeId)
    const setUpdateSignal = useStore(s => s.setUpdateSignal)
    const clearKeyframeCamera = useStore(s => s.clearKeyframeCamera)
    const setEditingTextId = useStore(s => s.setEditingTextId)
    const setEditingImageId = useStore(s => s.setEditingImageId) // [NEW]
    const checkAndShowTip = useStore(s => s.checkAndShowTip)

    // Helper to check config
    const hasText = keyframe.textConfig && keyframe.textConfig.visible && keyframe.textConfig.content
    const hasImage = keyframe.imageConfig && keyframe.imageConfig.visible && keyframe.imageConfig.url // [NEW]

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        width: `${keyframe.duration * PIXELS_PER_SECOND}px`,
    }

    const handleResizeMouseDown = (e: React.MouseEvent) => {
        e.stopPropagation()
        const startX = e.clientX
        const startDuration = keyframe.duration

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const deltaX = moveEvent.clientX - startX
            const deltaSeconds = deltaX / PIXELS_PER_SECOND
            updateKeyframeDuration(keyframe.id, Math.max(0.5, startDuration + deltaSeconds))
        }

        const handleMouseUp = () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
        }

        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseup', handleMouseUp)
    }

    const handleDiamondClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (keyframe.cameraState) {
            clearKeyframeCamera(keyframe.id)
        } else {
            setUpdateSignal(keyframe.id)
        }
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            className={`relative group flex flex-col flex-shrink-0 h-28 rounded-md border-2 overflow-hidden transition-colors select-none ${selectedId === keyframe.id
                ? 'bg-blue-900/50 border-blue-500'
                : 'bg-zinc-800 border-zinc-700 hover:border-zinc-500'
                } ${isDragging ? 'opacity-50 z-50' : ''}`}
            onClick={() => setSelected(keyframe.id)}
        >
            {/* Content Area */}
            <div className="flex-1 p-2 flex flex-col justify-center relative gap-1">

                {/* Header Row */}
                <div className="flex items-center gap-2 mb-1">
                    <button
                        onClick={handleDiamondClick}
                        title={keyframe.cameraState ? "Clear Camera Data" : "Record Camera Position"}
                        className={`p-1 rounded transition-colors ${keyframe.cameraState
                            ? 'bg-blue-600 hover:bg-blue-500 text-white'
                            : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-400'
                            }`}
                    >
                        <Diamond size={12} fill="currentColor" />
                    </button>
                    <div className="font-bold text-xs text-white">Shot {index + 1}</div>
                </div>

                {/* Row 2: Text Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        setEditingTextId(keyframe.id)
                        checkAndShowTip('first_text_add')
                    }}
                    data-tutorial="text-button"
                    className={`w-full flex items-center gap-1.5 px-1.5 py-0.5 rounded text-[10px] font-medium border transition-colors truncate ${hasText
                        ? 'bg-pink-900/40 border-pink-500/50 text-pink-200 hover:bg-pink-900/60'
                        : 'bg-zinc-700/50 border-transparent text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300'
                        }`}
                >
                    <Type size={10} />
                    {hasText ? keyframe.textConfig?.content : 'Set Title'}
                </button>

                {/* Row 3: Image Button [NEW] */}
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        setEditingImageId(keyframe.id)
                        checkAndShowTip('first_image_add')
                    }}
                    data-tutorial="image-button"
                    className={`w-full flex items-center gap-1.5 px-1.5 py-0.5 rounded text-[10px] font-medium border transition-colors truncate ${hasImage
                        ? 'bg-green-900/40 border-green-500/50 text-green-200 hover:bg-green-900/60'
                        : 'bg-zinc-700/50 border-transparent text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300'
                        }`}
                >
                    <ImageIcon size={10} />
                    {hasImage ? keyframe.imageConfig?.name : 'Add Image'}
                </button>

                {/* Delete Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        removeKeyframe(keyframe.id)
                    }}
                    className="absolute top-1 right-1 p-1 rounded-full text-zinc-500 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all"
                >
                    <X size={12} />
                </button>
            </div>

            {/* Drag Handle */}
            <div
                {...listeners}
                className="h-5 w-full bg-black/20 hover:bg-black/40 border-t border-white/5 flex items-center justify-center cursor-grab active:cursor-grabbing transition-colors"
            >
                <GripHorizontal size={14} className="text-zinc-500" />
            </div>

            {/* Resize Handle */}
            <div
                onMouseDown={handleResizeMouseDown}
                title="Drag to adjust duration"
                className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-blue-500/50 transition-colors z-10"
            />
        </div>
    )
}
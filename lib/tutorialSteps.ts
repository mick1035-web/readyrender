export type TriggerType =
    | 'dashboard_load'
    | 'first_project_create'
    | 'editor_load'
    | 'first_model_upload'
    | 'model_uploaded'
    | 'first_hdri_change'
    | 'first_keyframe_add'
    | 'timeline_open'
    | 'first_text_add'
    | 'first_image_add'
    | 'first_export'
    | 'export_complete'

export interface ContextualTip {
    id: string
    title: string
    content: string
    tip?: string
    trigger: TriggerType
    targetElement?: string
    position: 'top' | 'bottom' | 'left' | 'right' | 'center'
    showOnce: boolean
}

export const contextualTips: ContextualTip[] = [
    {
        id: 'welcome',
        title: 'Welcome to ReadyRender!',
        content: 'ReadyRender is a rapidly 3D product video creation platform that helps you transform static 3D models into stunning marketing videos.',
        tip: 'Each feature will show a short tip like this when you use it for the first time.',
        trigger: 'dashboard_load',
        position: 'center',
        showOnce: true
    },
    {
        id: 'create_project',
        title: 'Your First Project',
        content: 'Click "New Project" to start building your professional 3D product video.',
        trigger: 'dashboard_load',
        targetElement: '[data-tutorial="new-project"]',
        position: 'bottom',
        showOnce: true
    },
    {
        id: 'editor_intro',
        title: 'Welcome to the Editor',
        content: 'This is where the magic happens. Upload your model in the left sidebar to begin.',
        trigger: 'editor_load',
        position: 'center',
        showOnce: true
    },
    {
        id: 'upload_model',
        title: 'Upload 3D Model',
        content: 'Start by uploading a GLB or GLTF model. You can also load an example to see how it works.',
        trigger: 'editor_load',
        targetElement: '[data-tutorial="upload-model"]',
        position: 'right',
        showOnce: true
    },
    {
        id: 'model_navigation',
        title: 'Model Preview Controls',
        content: 'Left-click drag to rotate\nScroll to zoom\nRight-click drag to pan',
        tip: 'Try moving the camera to see your model from different angles.',
        trigger: 'model_uploaded',
        position: 'center',
        showOnce: true
    },
    {
        id: 'hdri_intro',
        title: 'Lighting & Environments',
        content: 'HDRI environments provide realistic lighting. Choose a preset or try AI generation!',
        trigger: 'first_hdri_change',
        targetElement: '[data-tutorial="hdri-section"]',
        position: 'left',
        showOnce: true
    },
    {
        id: 'keyframe_intro',
        title: 'Animating with Keyframes',
        content: 'Keyframes record camera positions. Click the + button after moving the camera to add one.',
        tip: 'Add at least two keyframes to create a smooth camera movement.',
        trigger: 'timeline_open',
        targetElement: '[data-tutorial="add-keyframe"]',
        position: 'top',
        showOnce: true
    },
    {
        id: 'text_intro',
        title: 'Adding 3D Text',
        content: 'Add 3D text to your keyframe. It will appear at the specific time you choose.',
        trigger: 'first_text_add',
        targetElement: '[data-tutorial="text-button"]',
        position: 'top',
        showOnce: true
    },
    {
        id: 'image_intro',
        title: 'Image Overlays',
        content: 'Add logos or images to your 3D scene. They can follow the camera or stay fixed.',
        trigger: 'first_image_add',
        targetElement: '[data-tutorial="image-button"]',
        position: 'top',
        showOnce: true
    },
    {
        id: 'export_intro',
        title: 'Exporting Your Masterpiece',
        content: 'When you are satisfied, choose a quality (720p, 1080p, or 4K) and export your video.',
        tip: 'High quality exports use more credits and take longer to render.',
        trigger: 'first_export',
        targetElement: '[data-tutorial="export-button"]',
        position: 'bottom',
        showOnce: true
    }
]

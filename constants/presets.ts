import { CameraState, TextConfig, ImageConfig } from '@/store/useStore'

export interface PresetData {
    id: string
    label: string
    description: string
    keyframes: {
        duration: number
        cameraState: CameraState
        textConfig?: TextConfig
        imageConfig?: ImageConfig
    }[]
}

export const CAMERA_PRESETS: PresetData[] = [
    {
        id: 'orbit-360',
        label: '360° Orbit',
        description: 'A smooth full circle rotation around the product',
        keyframes: [
            // Start (Front)
            {
                duration: 2,
                cameraState: { position: [0, 0, 5], target: [0, 0, 0] },
                textConfig: {
                    content: "Your Product Name",
                    visible: true,
                    color: "#ffffff",
                    size: 1.5,
                    position: [0, 2, 0],
                    rotation: [0, 0, 0]
                }
            },
            // Right
            {
                duration: 2,
                cameraState: { position: [5, 0, 0], target: [0, 0, 0] },
                textConfig: {
                    content: "360° View",
                    visible: true,
                    color: "#ffffff",
                    size: 1.2,
                    position: [0, 2, 0],
                    rotation: [0, 0, 0]
                }
            },
            // Back
            {
                duration: 2,
                cameraState: { position: [0, 0, -5], target: [0, 0, 0] }
            },
            // Left
            {
                duration: 2,
                cameraState: { position: [-5, 0, 0], target: [0, 0, 0] }
            },
            // Front (End)
            {
                duration: 2,
                cameraState: { position: [0, 0, 5], target: [0, 0, 0] }
            }
        ]
    },
    {
        id: 'hero-reveal',
        label: 'Hero Reveal',
        description: 'Low angle close-up pulling back to full view',
        keyframes: [
            {
                duration: 2,
                cameraState: { position: [0, -1, 2], target: [0, 1, 0] }, // Close low
                textConfig: {
                    content: "Introducing...",
                    visible: true,
                    color: "#ffffff",
                    size: 1.0,
                    position: [0, 2.5, 0],
                    rotation: [0, 0, 0]
                }
            },
            {
                duration: 3,
                cameraState: { position: [0, 2, 6], target: [0, 0, 0] }, // High far
                textConfig: {
                    content: "Your Product",
                    visible: true,
                    color: "#ffffff",
                    size: 1.5,
                    position: [0, 2, 0],
                    rotation: [0, 0, 0]
                }
            }
        ]
    },
    {
        id: 'cinematic-dolly',
        label: 'Cinematic Dolly',
        description: 'Smooth forward push-in for dramatic reveal',
        keyframes: [
            {
                duration: 3,
                cameraState: { position: [0, 1, 8], target: [0, 0, 0] }, // Far
                textConfig: {
                    content: "Discover",
                    visible: true,
                    color: "#ffffff",
                    size: 1.2,
                    position: [0, 2.5, 0],
                    rotation: [0, 0, 0]
                }
            },
            {
                duration: 2,
                cameraState: { position: [0, 0.5, 3], target: [0, 0, 0] } // Close
            }
        ]
    },
    {
        id: 'product-spin',
        label: 'Product Spin',
        description: 'Classic turntable rotation at eye level',
        keyframes: [
            { duration: 2, cameraState: { position: [0, 0, 5], target: [0, 0, 0] } },
            { duration: 2, cameraState: { position: [5, 0, 0], target: [0, 0, 0] } },
            { duration: 2, cameraState: { position: [0, 0, -5], target: [0, 0, 0] } },
            { duration: 2, cameraState: { position: [-5, 0, 0], target: [0, 0, 0] } },
            { duration: 2, cameraState: { position: [0, 0, 5], target: [0, 0, 0] } }
        ]
    },
    {
        id: 'dramatic-rise',
        label: 'Dramatic Rise',
        description: 'Ascending from low angle to overhead view',
        keyframes: [
            {
                duration: 2,
                cameraState: { position: [0, -2, 4], target: [0, 0, 0] }, // Low
                textConfig: {
                    content: "Rise",
                    visible: true,
                    color: "#ffffff",
                    size: 1.0,
                    position: [0, 2, 0],
                    rotation: [0, 0, 0]
                }
            },
            { duration: 2, cameraState: { position: [0, 2, 4], target: [0, 0, 0] } }, // Mid
            { duration: 2, cameraState: { position: [0, 6, 2], target: [0, 0, 0] } }  // High
        ]
    },
    {
        id: 'zoom-burst',
        label: 'Zoom Burst',
        description: 'Fast zoom in, pause, slow pull back',
        keyframes: [
            { duration: 1, cameraState: { position: [0, 0, 8], target: [0, 0, 0] } }, // Far
            { duration: 2, cameraState: { position: [0, 0, 2], target: [0, 0, 0] } }, // Close
            { duration: 3, cameraState: { position: [0, 0, 6], target: [0, 0, 0] } }  // Pull back
        ]
    },
    {
        id: 'spiral-ascent',
        label: 'Spiral Ascent',
        description: 'Circular upward spiral movement',
        keyframes: [
            { duration: 2, cameraState: { position: [4, 0, 0], target: [0, 0, 0] } },
            { duration: 2, cameraState: { position: [0, 2, 4], target: [0, 0, 0] } },
            { duration: 2, cameraState: { position: [-4, 4, 0], target: [0, 0, 0] } },
            { duration: 2, cameraState: { position: [0, 6, -2], target: [0, 0, 0] } }
        ]
    },
    {
        id: 'side-glide',
        label: 'Side Glide',
        description: 'Smooth horizontal tracking shot',
        keyframes: [
            {
                duration: 3,
                cameraState: { position: [-5, 0, 3], target: [0, 0, 0] }, // Left
                textConfig: {
                    content: "Glide",
                    visible: true,
                    color: "#ffffff",
                    size: 1.3,
                    position: [0, 2, 0],
                    rotation: [0, 0, 0]
                }
            },
            { duration: 2, cameraState: { position: [5, 0, 3], target: [0, 0, 0] } } // Right
        ]
    },
    {
        id: 'focus-shift',
        label: 'Focus Shift',
        description: 'Extreme close-up pulling back to wide shot',
        keyframes: [
            {
                duration: 2,
                cameraState: { position: [0, 0, 1.5], target: [0, 0, 0] }, // Macro
                textConfig: {
                    content: "Details",
                    visible: true,
                    color: "#ffffff",
                    size: 0.8,
                    position: [0, 1.5, 0],
                    rotation: [0, 0, 0]
                }
            },
            { duration: 3, cameraState: { position: [0, 3, 7], target: [0, 0, 0] } } // Wide
        ]
    },
    {
        id: 'dynamic-arc',
        label: 'Dynamic Arc',
        description: 'Curved arc movement from side to front',
        keyframes: [
            { duration: 2, cameraState: { position: [5, 1, 0], target: [0, 0, 0] } },  // Side
            { duration: 2, cameraState: { position: [3, 1, 3], target: [0, 0, 0] } },  // Diagonal
            { duration: 2, cameraState: { position: [0, 1, 5], target: [0, 0, 0] } }   // Front
        ]
    },
    {
        id: 'overhead-drop',
        label: 'Overhead Drop',
        description: 'Top-down descending reveal',
        keyframes: [
            {
                duration: 2,
                cameraState: { position: [0, 8, 0], target: [0, 0, 0] }, // High
                textConfig: {
                    content: "From Above",
                    visible: true,
                    color: "#ffffff",
                    size: 1.0,
                    position: [0, 2, 0],
                    rotation: [0, 0, 0]
                }
            },
            { duration: 2, cameraState: { position: [0, 4, 2], target: [0, 0, 0] } }, // Mid
            { duration: 2, cameraState: { position: [0, 1, 4], target: [0, 0, 0] } }  // Low
        ]
    },
    {
        id: 'cross-fade',
        label: 'Cross Fade',
        description: 'Smooth transition between complementary angles',
        keyframes: [
            {
                duration: 3,
                cameraState: { position: [4, 2, 4], target: [0, 0, 0] }, // Angle A
                textConfig: {
                    content: "Transition",
                    visible: true,
                    color: "#ffffff",
                    size: 1.2,
                    position: [0, 2.5, 0],
                    rotation: [0, 0, 0]
                }
            },
            { duration: 2, cameraState: { position: [-4, 2, 4], target: [0, 0, 0] } } // Angle B
        ]
    }
]
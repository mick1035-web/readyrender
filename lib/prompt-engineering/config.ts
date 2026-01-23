export type SceneContext = 'interior' | 'exterior' | 'nature' | 'urban' | 'abstract' | 'fantasy' | 'general'

export interface PromptConfig {
    templates: {
        base: string
    }
    modifiers: {
        technical: string[]
        quality: string[]
        negative: string[]
    }
    contextModifiers: Record<SceneContext, string[]>
    stylePresets: Record<string, {
        positive: string[]
        negative: string[]
        parameters: Record<string, any>
    }>
    safety: {
        blocklist: string[]
    }
}

export const PROMPT_CONFIG: PromptConfig = {
    templates: {
        // [PANORAMA TYPE] of [CONTENT], [TECHNICAL SPECS], [QUALITY], [CONTEXT MODIFIERS]
        base: "360 degree equirectangular panorama of {prompt}, {technical}, {quality}, {context}"
    },
    modifiers: {
        technical: [
            'equirectangular projection',
            'correct spherical perspective',
            'no visible seams',
            '2:1 aspect ratio',
            'full 360x180 coverage',
            '8k resolution'
        ],
        quality: [
            'professional photography',
            'cinematic lighting',
            'HDR quality',
            'sharp focus throughout',
            'high fidelity'
        ],
        negative: [
            'low quality',
            'worst quality',
            'distortion',
            'blurry',
            'text',
            'watermark',
            'signature',
            'ugly',
            'tiling',
            'bad geometry',
            'deformed',
            'seams',
            'artifacts',
            'amateur'
        ]
    },
    contextModifiers: {
        interior: [
            'ambient lighting',
            'interior design',
            'spherical room view',
            'correct interior perspective',
            'walls curving to meet at poles',
            'ceiling and floor with proper distortion',
            'centered furniture piece'
        ],
        exterior: [
            'natural lighting',
            'outdoor environment',
            'complete sky coverage',
            'horizon line'
        ],
        nature: [
            'natural lighting',
            'atmospheric perspective',
            'environmental depth',
            'curved horizon line',
            'proper sky-to-ground transition',
            '360 degree environmental wrap'
        ],
        urban: [
            'architectural detail',
            'urban atmosphere',
            '360 city view',
            'buildings wrapping around sphere',
            'curved street perspective',
            'proper vertical line distortion'
        ],
        abstract: [
            'soft studio lighting',
            'smooth gradient',
            'minimalist style',
            'clean empty space',
            'uniform lighting'
        ],
        fantasy: [
            'imaginative',
            'artistic style',
            'surreal atmosphere',
            'dreamlike'
        ],
        general: [
            'wide angle shot',
            'distant view'
        ]
    },
    stylePresets: {
        realistic: {
            positive: ['photorealistic', '8k', 'raw photo'],
            negative: ['cartoon', 'illustration', 'painting', 'drawing'],
            parameters: {
                guidance_scale: 3.5,
                num_inference_steps: 50
            }
        },
        creative: {
            positive: ['artistic', 'stylized', 'creative'],
            negative: ['boring', 'plain'],
            parameters: {
                guidance_scale: 7.0,
                num_inference_steps: 50
            }
        }
    },
    safety: {
        blocklist: [
            'nsfw', 'nude', 'naked', 'porn', 'sex', 'violence', 'gore', 'blood',
            'hate', 'racist', 'kill', 'murder', 'suicide', 'drug', 'cocaine', 'heroin'
        ]
    }
}

export const KEYWORDS = {
    interior: ['room', 'interior', 'indoor', 'studio', 'office', 'apartment', 'lobby', 'kitchen', 'dining', 'living', 'bedroom', 'workspace', 'hall', 'corridor'],
    nature: ['nature', 'forest', 'mountain', 'beach', 'ocean', 'sky', 'sunset', 'sunrise', 'landscape', 'field', 'garden', 'park'],
    urban: ['city', 'urban', 'street', 'building', 'skyline', 'downtown', 'cyberpunk', 'road', 'highway', 'bridge'],
    abstract: ['background', 'backdrop', 'gradient', 'abstract', 'solid', 'minimal', 'simple', 'gray', 'grey', 'neutral', 'monochrome'],
    fantasy: ['surreal', 'fantasy', 'sci-fi', 'magic', 'dream', 'alien', 'cyberpunk', 'futuristic', 'artistic'],
    people: ['people', 'person', 'human', 'man', 'woman', 'child', 'crowd', 'character']
}

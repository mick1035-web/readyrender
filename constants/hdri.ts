export interface PresetEnvironment {
    id: string
    name: string
    category: 'Indoor' | 'Outdoor' | 'Urban' | 'Natural'
}

export const PRESET_ENVIRONMENTS: PresetEnvironment[] = [
    { id: 'default', name: 'Default Studio', category: 'Indoor' },
    { id: 'apartment', name: 'Apartment', category: 'Indoor' },
    { id: 'city', name: 'City', category: 'Urban' },
    { id: 'dawn', name: 'Dawn', category: 'Outdoor' },
    { id: 'forest', name: 'Forest', category: 'Natural' },
    { id: 'lobby', name: 'Lobby', category: 'Indoor' },
    { id: 'night', name: 'Night', category: 'Outdoor' },
    { id: 'park', name: 'Park', category: 'Natural' },
    { id: 'studio', name: 'Studio', category: 'Indoor' },
    { id: 'sunset', name: 'Sunset', category: 'Outdoor' },
    { id: 'warehouse', name: 'Warehouse', category: 'Indoor' }
]

export const AI_GENERATE_COST = 50

export interface CustomHdri {
    id: string
    name: string
    url: string
    uploadedAt: Date
    type: 'upload' | 'ai-generated'
}

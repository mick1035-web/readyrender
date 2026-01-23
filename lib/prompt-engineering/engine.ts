import { PROMPT_CONFIG, KEYWORDS, SceneContext } from './config'

export interface EnhancedPrompt {
    original: string
    prompt: string
    negativePrompt: string
    parameters: Record<string, any>
    metadata: {
        context: SceneContext
        style: string
        isSafe: boolean
    }
}

export class PromptEngine {
    private prompt: string
    private context: SceneContext = 'general'
    private style: string = 'realistic'
    private isSafe: boolean = true

    constructor(prompt: string) {
        this.prompt = prompt.trim()
    }

    public enhance(): EnhancedPrompt {
        // 1. Safety Check
        if (!this.checkSafety()) {
            return this.buildResponse(false)
        }

        // 2. Context Detection
        this.detectContext()

        // 3. Style Detection
        this.detectStyle()

        // 4. Assemble Components
        const positiveComponents = this.assemblePositive()
        const negativeComponents = this.assembleNegative()
        const parameters = this.getSimpleParameters()

        // 5. Final String Construction
        const finalPrompt = PROMPT_CONFIG.templates.base
            .replace('{prompt}', this.prompt)
            .replace('{technical}', PROMPT_CONFIG.modifiers.technical.join(', '))
            .replace('{quality}', PROMPT_CONFIG.modifiers.quality.slice(0, 4).join(', '))
            .replace('{context}', positiveComponents.join(', '))

        return {
            original: this.prompt,
            prompt: finalPrompt,
            negativePrompt: negativeComponents.join(', '),
            parameters: parameters,
            metadata: {
                context: this.context,
                style: this.style,
                isSafe: true
            }
        }
    }

    private checkSafety(): boolean {
        const lowerPrompt = this.prompt.toLowerCase()
        this.isSafe = !PROMPT_CONFIG.safety.blocklist.some(word => lowerPrompt.includes(word))
        return this.isSafe
    }

    private buildResponse(isSafe: boolean): EnhancedPrompt {
        return {
            original: this.prompt,
            prompt: isSafe ? this.prompt : "Content blocked by safety filter.",
            negativePrompt: "",
            parameters: {},
            metadata: {
                context: 'general',
                style: 'realistic',
                isSafe: isSafe
            }
        }
    }

    private detectContext() {
        const lowerPrompt = this.prompt.toLowerCase()

        // Check specific contexts first (priority based)
        if (KEYWORDS.fantasy.some(k => lowerPrompt.includes(k))) {
            this.context = 'fantasy'
        } else if (KEYWORDS.abstract.some(k => lowerPrompt.includes(k))) {
            this.context = 'abstract'
        } else if (KEYWORDS.interior.some(k => lowerPrompt.includes(k))) {
            this.context = 'interior'
        } else if (KEYWORDS.urban.some(k => lowerPrompt.includes(k))) {
            this.context = 'urban'
        } else if (KEYWORDS.nature.some(k => lowerPrompt.includes(k))) {
            this.context = 'nature'
        } else {
            // Default check: does it mention "outdoor" things without specific urban/nature keywords?
            // For now default to 'general' or 'exterior' if needed.
            if (lowerPrompt.includes('outdoor') || lowerPrompt.includes('outside')) {
                this.context = 'exterior'
            } else {
                this.context = 'general'
            }
        }
    }

    private detectStyle() {
        // Simple style detection
        if (this.context === 'fantasy' || this.context === 'abstract') {
            this.style = 'creative'
        } else {
            this.style = 'realistic'
        }
    }

    private assemblePositive(): string[] {
        const modifiers: string[] = []

        // Context Modifiers
        if (PROMPT_CONFIG.contextModifiers[this.context]) {
            modifiers.push(...PROMPT_CONFIG.contextModifiers[this.context])
        }

        // Style Modifiers
        if (PROMPT_CONFIG.stylePresets[this.style]) {
            modifiers.push(...PROMPT_CONFIG.stylePresets[this.style].positive)
        }

        return modifiers
    }

    private assembleNegative(): string[] {
        const negatives = [...PROMPT_CONFIG.modifiers.negative]

        // Style Negatives
        if (PROMPT_CONFIG.stylePresets[this.style]) {
            negatives.push(...PROMPT_CONFIG.stylePresets[this.style].negative)
        }

        // Context Specific Negatives (e.g. no people unless requested)
        const hasPeople = KEYWORDS.people.some(k => this.prompt.toLowerCase().includes(k))
        if (!hasPeople && this.context !== 'fantasy') {
            negatives.push('people', 'humans', 'person', 'crowd')
        }

        return negatives
    }

    private getSimpleParameters() {
        return PROMPT_CONFIG.stylePresets[this.style]?.parameters || PROMPT_CONFIG.stylePresets['realistic'].parameters
    }
}

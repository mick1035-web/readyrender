export interface ExportCostRate {
    quality: '720p' | '1080p' | '4k'
    costPer10Seconds: number
}

export const EXPORT_COST_RATES: Record<'720p' | '1080p' | '4k', number> = {
    '720p': 10,
    '1080p': 15,
    '4k': 30
}

/**
 * Calculate the total credit cost for exporting a video
 * @param durationInSeconds Total video duration in seconds
 * @param quality Video quality (720p, 1080p, 4k)
 * @returns Total credits required
 * 
 * Formula: ceil(duration / 10) * costPer10Seconds
 * Examples:
 * - 10s @ 720p = 1 segment * 10 = 10 credits
 * - 11s @ 720p = 2 segments * 10 = 20 credits
 * - 25s @ 1080p = 3 segments * 15 = 45 credits
 * - 30s @ 4k = 3 segments * 30 = 90 credits
 */
export function calculateExportCost(
    durationInSeconds: number,
    quality: '720p' | '1080p' | '4k'
): number {
    if (durationInSeconds <= 0) return 0

    const costPerSegment = EXPORT_COST_RATES[quality]
    const segments = Math.ceil(durationInSeconds / 10)

    return segments * costPerSegment
}

/**
 * Get a breakdown of the export cost calculation
 */
export function getExportCostBreakdown(
    durationInSeconds: number,
    quality: '720p' | '1080p' | '4k'
) {
    const segments = Math.ceil(durationInSeconds / 10)
    const costPerSegment = EXPORT_COST_RATES[quality]
    const totalCost = segments * costPerSegment

    return {
        duration: durationInSeconds,
        quality,
        segments,
        costPerSegment,
        totalCost
    }
}

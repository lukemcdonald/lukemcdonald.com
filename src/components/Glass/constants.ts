export const GLASS_LEVELS = ['clear', 'tinted', 'solid'] as const

export type GlassLevel = (typeof GLASS_LEVELS)[number]

export const DEFAULT_GLASS_LEVEL: GlassLevel = 'tinted'

export const GLASS_STORAGE_KEY = 'glass-level'

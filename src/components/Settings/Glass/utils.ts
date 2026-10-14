import type { GlassLevel } from './constants'

import { getStorageItem, setStorageItem, STORAGE_KEYS } from '@/utils/storage'

import { DEFAULT_GLASS_LEVEL, GLASS_LEVELS } from './constants'

export function isGlassLevel(value: string): value is GlassLevel {
  return (GLASS_LEVELS as readonly string[]).includes(value)
}

function parseGlassLevel(value: unknown): GlassLevel {
  return typeof value === 'string' && isGlassLevel(value) ? value : DEFAULT_GLASS_LEVEL
}

export function getGlassLevel(): GlassLevel {
  return parseGlassLevel(getStorageItem(STORAGE_KEYS.glass))
}

export function applyGlassLevel(level: GlassLevel): void {
  document.documentElement.dataset.glass = level
}

export function setGlassLevel(level: GlassLevel): void {
  applyGlassLevel(level)
  setStorageItem(STORAGE_KEYS.glass, level)
}

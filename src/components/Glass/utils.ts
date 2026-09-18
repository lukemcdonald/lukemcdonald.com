import type { GlassLevel } from './constants'

import { DEFAULT_GLASS_LEVEL, GLASS_LEVELS, GLASS_STORAGE_KEY } from './constants'

function parseGlassLevel(value: unknown): GlassLevel {
  return GLASS_LEVELS.find((level) => level === value) ?? DEFAULT_GLASS_LEVEL
}

export function getGlassLevel(): GlassLevel {
  try {
    return parseGlassLevel(localStorage.getItem(GLASS_STORAGE_KEY))
  } catch {
    return DEFAULT_GLASS_LEVEL
  }
}

export function applyGlassLevel(level: GlassLevel): void {
  document.documentElement.dataset.glass = level
}

export function setGlassLevel(level: GlassLevel): void {
  applyGlassLevel(level)

  try {
    localStorage.setItem(GLASS_STORAGE_KEY, level)
  } catch {
    // Keep the current page usable when browser storage is unavailable.
  }
}

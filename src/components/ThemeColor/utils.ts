import type { ThemeColor } from './types'

import { applyThemeColor } from '@/utils/theme'

import { DEFAULT_THEME_COLOR } from './constants'

const STORAGE_KEY = 'theme-color'

function getStoredColor(): ThemeColor {
  if (typeof window === 'undefined') {
    return DEFAULT_THEME_COLOR
  }

  const stored = localStorage.getItem(STORAGE_KEY)

  if (stored && (['default', 'blue', 'purple', 'yellow', 'green', 'orange', 'neon'] as ThemeColor[]).includes(stored as ThemeColor)) {
    return stored as ThemeColor
  }

  return DEFAULT_THEME_COLOR
}

function setStoredColor(color: ThemeColor): void {
  if (typeof window === 'undefined') {
    return
  }

  localStorage.setItem(STORAGE_KEY, color)
}

export function getThemeColor(): ThemeColor {
  return getStoredColor()
}

export function setThemeColor(color: ThemeColor): void {
  setStoredColor(color)
  applyThemeColor(color)
}

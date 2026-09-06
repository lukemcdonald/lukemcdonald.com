import type { ThemeColor } from './types'

import { applyThemeColor } from '@/utils/theme'

import { DEFAULT_THEME_COLOR, THEME_COLOR_STORAGE_KEY, THEME_COLORS } from './constants'

export function isThemeColor(value: string): value is ThemeColor {
  return (THEME_COLORS as readonly string[]).includes(value)
}

function getStoredColor(): ThemeColor {
  if (typeof window === 'undefined') {
    return DEFAULT_THEME_COLOR
  }

  const stored = localStorage.getItem(THEME_COLOR_STORAGE_KEY)

  if (stored && isThemeColor(stored)) {
    return stored
  }

  return DEFAULT_THEME_COLOR
}

function setStoredColor(color: ThemeColor): void {
  if (typeof window === 'undefined') {
    return
  }

  localStorage.setItem(THEME_COLOR_STORAGE_KEY, color)
}

export function getThemeColor(): ThemeColor {
  return getStoredColor()
}

export function setThemeColor(color: ThemeColor): void {
  setStoredColor(color)
  applyThemeColor(color)
}

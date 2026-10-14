import type { ThemeColor } from './types'

import { getStorageItem, setStorageItem, STORAGE_KEYS } from '@/utils/storage'
import { applyThemeColor } from '@/utils/theme'

import { DEFAULT_THEME_COLOR, THEME_COLORS } from './constants'

export function isThemeColor(value: string): value is ThemeColor {
  return (THEME_COLORS as readonly string[]).includes(value)
}

function getStoredColor(): ThemeColor {
  const stored = getStorageItem(STORAGE_KEYS.themeColor)

  if (stored && isThemeColor(stored)) {
    return stored
  }

  return DEFAULT_THEME_COLOR
}

function setStoredColor(color: ThemeColor): void {
  setStorageItem(STORAGE_KEYS.themeColor, color)
}

export function getThemeColor(): ThemeColor {
  return getStoredColor()
}

export function setThemeColor(color: ThemeColor): void {
  setStoredColor(color)
  applyThemeColor(color)
}

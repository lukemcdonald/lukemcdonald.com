import type { EffectiveMode, ThemeMode } from './types'

import { applyThemeMode } from '@/utils/theme'

import { DEFAULT_THEME_MODE } from './constants'

const STORAGE_KEY = 'theme-mode'

function getSystemPreference(): EffectiveMode {
  if (typeof window === 'undefined') {
    return 'light'
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getStoredMode(): ThemeMode {
  if (typeof window === 'undefined') {
    return DEFAULT_THEME_MODE
  }

  const stored = localStorage.getItem(STORAGE_KEY)

  if (stored && (['light', 'dark', 'system'] as ThemeMode[]).includes(stored as ThemeMode)) {
    return stored as ThemeMode
  }

  return DEFAULT_THEME_MODE
}

function setStoredMode(mode: ThemeMode): void {
  if (typeof window === 'undefined') {
    return
  }

  localStorage.setItem(STORAGE_KEY, mode)
}

function getEffectiveMode(mode: ThemeMode = getStoredMode()): EffectiveMode {
  if (mode === 'system') {
    return getSystemPreference()
  }

  return mode
}

export function getThemeMode(): ThemeMode {
  return getStoredMode()
}

export function setThemeMode(mode: ThemeMode): void {
  setStoredMode(mode)
  const effectiveMode = getEffectiveMode(mode)
  applyThemeMode(effectiveMode)
}

export function getEffectiveThemeMode(): EffectiveMode {
  return getEffectiveMode()
}

export function watchSystemPreference(callback?: (mode: EffectiveMode) => void): () => void {
  if (typeof window === 'undefined') {
    return () => {}
  }

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

  const handler = (e: MediaQueryListEvent | MediaQueryList) => {
    const storedMode = getStoredMode()

    if (storedMode === 'system') {
      const systemMode = e.matches ? 'dark' : 'light'
      applyThemeMode(systemMode)
      callback?.(systemMode)
    }
  }

  // Modern browsers
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }

  // Safari < 14 fallback
  mediaQuery.addListener(handler)
  return () => mediaQuery.removeListener(handler)
}

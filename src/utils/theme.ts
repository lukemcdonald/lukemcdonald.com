export type ThemeColor = 'default' | 'blue' | 'purple' | 'yellow' | 'green' | 'orange' | 'neon'
export type ThemeMode = 'light' | 'dark' | 'system'

const STORAGE_KEYS = {
  color: 'theme-color',
  mode: 'theme-mode',
} as const

const DEFAULT_THEME_COLOR: ThemeColor = 'default'
const DEFAULT_THEME_MODE: ThemeMode = 'system'

export const THEME_COLORS: readonly ThemeColor[] = [
  'default',
  'blue',
  'green',
  'neon',
  'orange',
  'purple',
  'yellow',
] as const

export const THEME_MODES: readonly ThemeMode[] = ['light', 'dark', 'system'] as const

/**
 * Get the current system color scheme preference
 */
export function getSystemPreference(): 'light' | 'dark' {
  if (typeof window === 'undefined') {
    return 'light'
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * Get the stored theme color from localStorage
 */
export function getStoredThemeColor(): ThemeColor {
  if (typeof window === 'undefined') {
    return DEFAULT_THEME_COLOR
  }

  const stored = localStorage.getItem(STORAGE_KEYS.color)

  if (stored && THEME_COLORS.includes(stored as ThemeColor)) {
    return stored as ThemeColor
  }

  return DEFAULT_THEME_COLOR
}

/**
 * Store theme color in localStorage
 */
export function setStoredThemeColor(color: ThemeColor): void {
  if (typeof window === 'undefined') {
    return
  }

  localStorage.setItem(STORAGE_KEYS.color, color)
}

/**
 * Get the stored theme mode from localStorage
 */
export function getStoredThemeMode(): ThemeMode {
  if (typeof window === 'undefined') {
    return DEFAULT_THEME_MODE
  }

  const stored = localStorage.getItem(STORAGE_KEYS.mode)

  if (stored && THEME_MODES.includes(stored as ThemeMode)) {
    return stored as ThemeMode
  }

  return DEFAULT_THEME_MODE
}

/**
 * Store theme mode in localStorage
 */
export function setStoredThemeMode(mode: ThemeMode): void {
  if (typeof window === 'undefined') {
    return
  }

  localStorage.setItem(STORAGE_KEYS.mode, mode)
}

/**
 * Get the effective theme mode based on stored mode and system preference
 */
export function getEffectiveMode(mode: ThemeMode = getStoredThemeMode()): 'light' | 'dark' {
  if (mode === 'system') {
    return getSystemPreference()
  }

  return mode
}

/**
 * Apply theme color to the DOM
 */
export function applyThemeColor(color: ThemeColor): void {
  if (typeof window === 'undefined') {
    return
  }

  const html = document.documentElement

  if (color === 'default') {
    html.removeAttribute('data-theme')
  } else {
    html.setAttribute('data-theme', color)
  }
}

/**
 * Apply theme mode to the DOM
 */
export function applyThemeMode(mode: 'light' | 'dark'): void {
  if (typeof window === 'undefined') {
    return
  }

  const html = document.documentElement

  html.classList.toggle('dark', mode === 'dark')
}

/**
 * Set theme color and persist to localStorage
 */
export function setThemeColor(color: ThemeColor): void {
  setStoredThemeColor(color)
  applyThemeColor(color)
}

/**
 * Set theme mode and persist to localStorage
 */
export function setThemeMode(mode: ThemeMode): void {
  setStoredThemeMode(mode)

  const effectiveMode = getEffectiveMode(mode)

  applyThemeMode(effectiveMode)
}

/**
 * Initialize theme from stored preferences
 */
export function initializeTheme(): void {
  if (typeof window === 'undefined') {
    return
  }

  const color = getStoredThemeColor()
  const mode = getStoredThemeMode()
  const effectiveMode = getEffectiveMode(mode)

  applyThemeColor(color)
  applyThemeMode(effectiveMode)
}

/**
 * Listen to system color scheme changes and update if mode is 'system'
 */
export function watchSystemPreference(callback?: (mode: 'light' | 'dark') => void): () => void {
  if (typeof window === 'undefined') {
    return () => {}
  }

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

  const handler = (e: MediaQueryListEvent | MediaQueryList) => {
    const storedMode = getStoredThemeMode()

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

/**
 * Get inline script for initializing theme before hydration (prevents flash)
 */
export function getThemeInitScript(): string {
  return `
(function() {
  try {
    const STORAGE_KEYS = { color: 'theme-color', mode: 'theme-mode' };
    const DEFAULT_THEME_COLOR = 'default';
    const DEFAULT_THEME_MODE = 'system';

    const getSystemPreference = () => {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };

    const storedColor = localStorage.getItem(STORAGE_KEYS.color) || DEFAULT_THEME_COLOR;
    const storedMode = localStorage.getItem(STORAGE_KEYS.mode) || DEFAULT_THEME_MODE;
    const effectiveMode = storedMode === 'system' ? getSystemPreference() : storedMode;

    const html = document.documentElement;

    if (storedColor !== 'default') {
      html.setAttribute('data-theme', storedColor);
    } else {
      html.removeAttribute('data-theme');
    }

    if (effectiveMode === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  } catch (e) {
    console.error('Failed to initialize theme:', e);
  }
})();
`.trim()
}

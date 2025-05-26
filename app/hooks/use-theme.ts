import { useCallback, useEffect, useState } from 'react'
import useLocalStorageState from 'use-local-storage-state'

const themeColors = {
  blue: 'Blue',
  gray: 'Gray',
  green: 'Green',
  orange: 'Orange',
  purple: 'Purple',
  yellow: 'Yellow',
} as const

export interface ThemeMode {
  label: 'dark' | 'light' | 'system'
  value: 'dark' | 'light'
}

export interface ThemeColor {
  colors: {
    dark: string
    light: string
  }
  label: (typeof themeColors)[keyof typeof themeColors]
}

export interface ThemeData {
  mode: ThemeMode
  theme: ThemeColor
}

export const MODES: ThemeMode[] = [
  { label: 'light', value: 'light' },
  { label: 'dark', value: 'dark' },
  { label: 'system', value: 'dark' },
]

export const THEMES: ThemeColor[] = [
  { label: themeColors.gray, colors: { light: '#abab9d', dark: '#3e504f' } },
  { label: themeColors.green, colors: { light: '#9cd075', dark: '#15824e' } },
  { label: themeColors.blue, colors: { light: '#38bdf8', dark: '#0369a1' } },
  { label: themeColors.purple, colors: { light: '#818cf8', dark: '#4338ca' } },
  { label: themeColors.yellow, colors: { light: '#fde047', dark: '#facc15' } },
  { label: themeColors.orange, colors: { light: '#fb923c', dark: '#ea580c' } },
]

export const DEFAULT_THEME_DATA: ThemeData = {
  mode: MODES.filter((mode) => mode.label === 'system')[0],
  theme: THEMES.filter((theme) => theme.label === themeColors.gray)[0],
}

export function getThemeColor({ mode, theme }: ThemeData) {
  let color = DEFAULT_THEME_DATA.theme.colors.dark

  if (theme?.colors) {
    color = mode.value === 'dark' ? theme.colors.light : theme.colors.dark
  }

  return color
}

function useTheme() {
  const [mode, setMode] = useLocalStorageState('mode', {
    defaultValue: DEFAULT_THEME_DATA.mode,
  })
  const [theme, setTheme] = useLocalStorageState('theme', {
    defaultValue: DEFAULT_THEME_DATA.theme,
  })
  const [data, setData] = useState<ThemeData>(DEFAULT_THEME_DATA)

  // Memoized callback to handle system theme changes
  const handleSystemThemeChange = useCallback((e: MediaQueryListEvent) => {
    const systemMode = e.matches ? 'dark' : 'light'
    setData((current) => ({ ...current, mode: { ...current.mode, value: systemMode } }))
  }, [])

  useEffect(() => {
    if (mode.label === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const abortController = new AbortController()

      // Set initial value and add listener with AbortController
      const systemMode = mediaQuery.matches ? 'dark' : 'light'
      setData((current) => ({ ...current, mode: { ...current.mode, value: systemMode } }))
      mediaQuery.addEventListener('change', handleSystemThemeChange, {
        signal: abortController.signal,
      })

      // Cleanup function to prevent memory leaks
      return () => {
        abortController.abort()
      }
    } else {
      setData((current) => ({ ...current, mode }))
    }
  }, [mode, handleSystemThemeChange])

  useEffect(() => {
    setData((current) => ({ ...current, theme }))
  }, [theme])

  return { data, setTheme, setMode }
}

export { useTheme }

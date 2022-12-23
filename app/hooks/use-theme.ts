import { useEffect, useState } from 'react'
import useLocalStorageState from 'use-local-storage-state'

import type { ThemeData } from '~/types'
import { ThemeColor } from '~/types'

export const THEMES = [
  { label: ThemeColor.gray, colors: { light: '#abab9d', dark: '#3e504f' } },
  { label: ThemeColor.green, colors: { light: '#9cd075', dark: '#15824e' } },
  { label: ThemeColor.blue, colors: { light: '#38bdf8', dark: '#0369a1' } },
  { label: ThemeColor.purple, colors: { light: '#818cf8', dark: '#4338ca' } },
  { label: ThemeColor.yellow, colors: { light: '#fde047', dark: '#facc15' } },
  { label: ThemeColor.orange, colors: { light: '#fb923c', dark: '#ea580c' } },
]

export const DEFAULT_THEME_DATA: ThemeData = {
  mode: 'light',
  theme: THEMES[0],
}

export function getThemeColor({ mode, theme }: ThemeData) {
  let color = THEMES[0].colors.dark

  if (theme?.colors) {
    const { light, dark } = theme.colors
    color = mode === 'dark' ? light : dark
  }

  return color
}

function useTheme() {
  const [mode, setMode] = useLocalStorageState('mode', { defaultValue: DEFAULT_THEME_DATA.mode })
  const [theme, setTheme] = useLocalStorageState('theme', {
    defaultValue: DEFAULT_THEME_DATA.theme,
  })
  const [data, setData] = useState<ThemeData>(DEFAULT_THEME_DATA)

  useEffect(() => {
    setData((current) => ({ ...current, theme }))
  }, [theme])

  useEffect(() => {
    setData((current) => ({ ...current, mode }))
  }, [mode])

  return { data, setData, setMode, setTheme }
}

export { useTheme }

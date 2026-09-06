import { isThemeColor, setThemeColor } from '@/components/ThemeColor/utils'
import { isThemeMode, setThemeMode } from '@/components/ThemeMode/utils'

export function applyThemeColorSelection(value: string): boolean {
  if (!isThemeColor(value)) {
    return false
  }

  setThemeColor(value)

  return true
}

export function applyThemeModeSelection(value: string): boolean {
  if (!isThemeMode(value)) {
    return false
  }

  setThemeMode(value)

  return true
}

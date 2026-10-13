import { bindGlass, syncGlass } from './Glass/glass'
import { closeSettingsPickers, isSettingsPickerOpen, type SettingChange } from './picker'
import { bindSound, syncSound } from './Sound/sound'
import { bindThemeColor, snapshotThemeLandscapes, syncThemeColor } from './ThemeColor/theme-color'
import { bindThemeMode, syncThemeMode } from './ThemeMode/theme-mode'

export type BindSettingsOptions = SettingChange

export type SettingsHighlights = {
  color?: string
  mode?: boolean
  sound?: boolean
}

export { closeSettingsPickers, isSettingsPickerOpen, snapshotThemeLandscapes }

export function syncSettings(root: Element, highlights: SettingsHighlights = {}) {
  syncGlass(root)
  syncSound(root, highlights.sound === true)
  syncThemeColor(root, highlights.color)
  syncThemeMode(root, highlights.mode === true)
}

export function bindSettings(root: Element, options: BindSettingsOptions) {
  bindGlass(root, options)
  bindSound(root, options)
  bindThemeColor(root, options)
  bindThemeMode(root, options)
  syncSettings(root)
}

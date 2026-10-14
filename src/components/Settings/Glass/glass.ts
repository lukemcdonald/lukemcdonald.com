import { bindPreferencePicker, type SettingChange, syncPreferencePicker } from '../picker'
import { getGlassLevel, isGlassLevel, setGlassLevel } from './utils'

export function applyGlassSelection(value: string): boolean {
  if (!isGlassLevel(value)) {
    return false
  }

  setGlassLevel(value)

  return true
}

function glassPicker(root: Element) {
  return root.querySelector('[data-preference-kind="glass"]')
}

export function syncGlass(root: Element) {
  const picker = glassPicker(root)

  if (!picker) {
    return
  }

  syncPreferencePicker(picker, getGlassLevel(), 'Glass')
}

export function bindGlass(root: Element, { onChange, signal }: SettingChange) {
  const picker = glassPicker(root)

  if (!picker) {
    return
  }

  bindPreferencePicker(picker, {
    apply: applyGlassSelection,
    onChange,
    signal,
    sync: () => syncGlass(root),
  })
}

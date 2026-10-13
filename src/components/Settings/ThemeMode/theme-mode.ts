import { PALETTE_CHROME } from '@/components/CommandPalette/chrome'
import { getThemeMode, isThemeMode, setThemeMode } from '@/components/ThemeMode/utils'
import { toggleClasses } from '@/utils/toggle-classes'

import {
  afterSettingChange,
  bindPreferencePicker,
  type SettingChange,
  syncPreferencePicker,
} from '../picker'

export function applyThemeModeSelection(value: string): boolean {
  if (!isThemeMode(value)) {
    return false
  }

  setThemeMode(value)

  return true
}

function modePicker(root: Element) {
  return root.querySelector('[data-preference-kind="mode"]')
}

export function syncThemeMode(root: Element, highlighted = false) {
  const selected = getThemeMode()
  const picker = modePicker(root)
  const select = root.querySelector<HTMLSelectElement>('[data-settings-select="mode"]')
  const trigger = picker?.querySelector('[data-preference-trigger]') ?? picker

  if (select) {
    select.value = selected
  }

  if (picker) {
    syncPreferencePicker(picker, selected, 'Appearance')
  }

  if (trigger) {
    toggleClasses(trigger, PALETTE_CHROME.activeFill, highlighted)
  }
}

export function bindThemeMode(root: Element, { onChange, signal }: SettingChange) {
  const picker = modePicker(root)
  const sync = () => syncThemeMode(root)

  if (picker) {
    bindPreferencePicker(picker, {
      apply: applyThemeModeSelection,
      onChange,
      signal,
      sync,
    })
  }

  root.querySelector<HTMLSelectElement>('[data-settings-select="mode"]')?.addEventListener(
    'change',
    (event) => {
      if (!(event.currentTarget instanceof HTMLSelectElement)) {
        return
      }

      applyThemeModeSelection(event.currentTarget.value)
      afterSettingChange(onChange, sync)
    },
    { signal },
  )
}

import { getStorageItem, removeStorageItem, setStorageItem, STORAGE_KEYS } from '@/utils/storage'

import {
  afterSettingChange,
  bindPreferencePicker,
  type SettingChange,
  syncPreferencePicker,
} from '../picker'
import { loadAllFontPairings, loadFontPairing } from './load-pairing'
import { FONT_PAIRINGS, type SelectableFontPairing } from './pairings'

export const DEFAULT_FONT_PAIRING = 'default'

export type FontPairing = SelectableFontPairing | typeof DEFAULT_FONT_PAIRING

function isSelectablePairing(value: string): value is (typeof FONT_PAIRINGS)[number] {
  return (FONT_PAIRINGS as readonly string[]).includes(value)
}

function isFontPairing(value: string): value is FontPairing {
  return value === DEFAULT_FONT_PAIRING || isSelectablePairing(value)
}

function parseFontPairing(value: unknown): FontPairing {
  return typeof value === 'string' && isFontPairing(value) ? value : DEFAULT_FONT_PAIRING
}

export function getFontPairing(): FontPairing {
  return parseFontPairing(getStorageItem(STORAGE_KEYS.font))
}

export function applyFontPairing(pairing: FontPairing): void {
  const html = document.documentElement

  if (pairing === DEFAULT_FONT_PAIRING) {
    delete html.dataset.font
    return
  }

  loadFontPairing(pairing)
  html.dataset.font = pairing
}

export function setFontPairing(pairing: FontPairing): void {
  applyFontPairing(pairing)

  if (pairing === DEFAULT_FONT_PAIRING) {
    removeStorageItem(STORAGE_KEYS.font)
    return
  }

  setStorageItem(STORAGE_KEYS.font, pairing)
}

function applyFontSelection(value: string): boolean {
  const pairing = value === '' ? DEFAULT_FONT_PAIRING : value

  if (!isFontPairing(pairing)) {
    return false
  }

  setFontPairing(pairing)

  return true
}

export function selectFontOption(value: string): boolean {
  if (isSelectablePairing(value) && getFontPairing() === value) {
    return applyFontSelection(DEFAULT_FONT_PAIRING)
  }

  return applyFontSelection(value)
}

function fontPicker(root: Element) {
  return root.querySelector('[data-preference-kind="font"]')
}

export function syncFont(root: Element) {
  const selected = getFontPairing()
  const picker = fontPicker(root)
  const select = root.querySelector<HTMLSelectElement>('[data-settings-select="font"]')

  if (select) {
    select.value = selected === DEFAULT_FONT_PAIRING ? '' : selected
  }

  if (!picker) {
    return
  }

  syncPreferencePicker(picker, selected, 'Font')
}

export function bindFont(root: Element, { onChange, signal }: SettingChange) {
  const picker = fontPicker(root)
  const sync = () => syncFont(root)

  if (picker) {
    picker.querySelector('[data-preference-options]')?.addEventListener(
      'toggle',
      (event) => {
        if (!(event.currentTarget instanceof HTMLElement)) {
          return
        }

        if (!event.currentTarget.matches(':popover-open')) {
          return
        }

        loadAllFontPairings()
      },
      { signal },
    )
    bindPreferencePicker(picker, {
      apply: selectFontOption,
      onChange,
      signal,
      sync,
    })
  }

  root.querySelector<HTMLSelectElement>('[data-settings-select="font"]')?.addEventListener(
    'change',
    (event) => {
      if (!(event.currentTarget instanceof HTMLSelectElement)) {
        return
      }

      applyFontSelection(event.currentTarget.value)
      afterSettingChange(onChange, sync)
    },
    { signal },
  )
}

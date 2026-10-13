import {
  afterSettingChange,
  bindPreferencePicker,
  type SettingChange,
  syncPreferencePicker,
} from '../picker'

export const FONT_PAIRINGS = ['default', 'editorial', 'geometric', 'mono'] as const

export type FontPairing = (typeof FONT_PAIRINGS)[number]

export const DEFAULT_FONT_PAIRING: FontPairing = 'default'

export const FONT_STORAGE_KEY = 'font-pairing'

export const FONT_LABELS: Record<FontPairing, string> = {
  default: 'Default',
  editorial: 'Editorial',
  geometric: 'Geometric',
  mono: 'Mono',
}

function isFontPairing(value: string): value is FontPairing {
  return (FONT_PAIRINGS as readonly string[]).includes(value)
}

function parseFontPairing(value: unknown): FontPairing {
  return typeof value === 'string' && isFontPairing(value) ? value : DEFAULT_FONT_PAIRING
}

export function getFontPairing(): FontPairing {
  try {
    return parseFontPairing(localStorage.getItem(FONT_STORAGE_KEY))
  } catch {
    return DEFAULT_FONT_PAIRING
  }
}

export function applyFontPairing(pairing: FontPairing): void {
  const html = document.documentElement

  if (pairing === DEFAULT_FONT_PAIRING) {
    delete html.dataset.font
    return
  }

  html.dataset.font = pairing
}

function setFontPairing(pairing: FontPairing): void {
  applyFontPairing(pairing)

  try {
    localStorage.setItem(FONT_STORAGE_KEY, pairing)
  } catch {
    // Keep the current page usable when browser storage is unavailable.
  }
}

export function applyFontSelection(value: string): boolean {
  if (!isFontPairing(value)) {
    return false
  }

  setFontPairing(value)

  return true
}

function fontPicker(root: Element) {
  return root.querySelector('[data-preference-kind="font"]')
}

export function syncFont(root: Element) {
  const selected = getFontPairing()
  const picker = fontPicker(root)
  const select = root.querySelector<HTMLSelectElement>('[data-settings-select="font"]')

  if (select) {
    select.value = selected
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
    bindPreferencePicker(picker, {
      apply: applyFontSelection,
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

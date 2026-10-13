import {
  afterSettingChange,
  bindPreferencePicker,
  type SettingChange,
  syncPreferencePicker,
} from '../picker'

export const DEFAULT_FONT_PAIRING = 'default'

export const FONT_PAIRINGS = ['work', 'play', 'live'] as const

export type FontPairing = (typeof FONT_PAIRINGS)[number] | typeof DEFAULT_FONT_PAIRING

export const FONT_STORAGE_KEY = 'font-pairing'

export const FONT_LABELS: Record<(typeof FONT_PAIRINGS)[number], string> = {
  live: 'Live',
  play: 'Play',
  work: 'Work',
}

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
    if (pairing === DEFAULT_FONT_PAIRING) {
      localStorage.removeItem(FONT_STORAGE_KEY)
      return
    }

    localStorage.setItem(FONT_STORAGE_KEY, pairing)
  } catch {
    // Keep the current page usable when browser storage is unavailable.
  }
}

export function applyFontSelection(value: string): boolean {
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

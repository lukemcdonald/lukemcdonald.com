import { PALETTE_CHROME } from '@/components/CommandPalette/chrome'
import { getGlassLevel } from '@/components/Glass/utils'
import { getSoundPreference, getSoundToggleCopy } from '@/components/Sound/utils'
import { getThemeColor } from '@/components/ThemeColor/utils'
import { getThemeMode } from '@/components/ThemeMode/utils'
import { toggleClasses } from '@/utils/toggle-classes'
import { wrapIndex } from '@/utils/wrap-index'

import { applyPreference, applySoundToggle, applyThemeColorSelection } from './settings.utils'

const LANDSCAPE_VARS = [
  ['--landscape-dark', '--color-primary-800'],
  ['--landscape-front', '--color-primary-500'],
  ['--landscape-middle', '--color-primary-600'],
  ['--landscape-ridge', '--color-primary-700'],
  ['--landscape-shadow', '--color-primary-900'],
  ['--landscape-sky', '--color-primary-400'],
] as const

export type SettingsHighlights = {
  color?: string
  mode?: boolean
  sound?: boolean
}

export type BindSettingsOptions = {
  onChange?: () => void
  signal: AbortSignal
}

function pickerOptionButtons(picker: Element) {
  return [...picker.querySelectorAll<HTMLButtonElement>('[data-preference-option]')]
}

function selectedPickerOption(picker: Element) {
  return (
    picker.querySelector<HTMLButtonElement>('[data-preference-option][data-selected]') ??
    pickerOptionButtons(picker)[0]
  )
}

function focusPickerOption(picker: Element, current: Element | null, delta: number) {
  const options = pickerOptionButtons(picker)
  const index = current instanceof HTMLButtonElement ? options.indexOf(current) : -1

  options[wrapIndex(index, delta, options.length)]?.focus()
}

function focusPickerEdge(picker: Element, key: string) {
  const options = pickerOptionButtons(picker)

  options[key === 'Home' ? 0 : options.length - 1]?.focus()
}

function currentPickerOption(event: KeyboardEvent) {
  return event.target instanceof Element ? event.target.closest('[data-preference-option]') : null
}

function openPickerAtSelected(picker: Element, panel: HTMLElement) {
  panel.showPopover()
  selectedPickerOption(picker)?.focus()
}

function moveOpenPicker(event: KeyboardEvent, picker: Element) {
  const current = currentPickerOption(event)

  if (!current) {
    selectedPickerOption(picker)?.focus()
    return
  }

  focusPickerOption(picker, current, event.key === 'ArrowDown' ? 1 : -1)
}

function onPickerArrow(event: KeyboardEvent, picker: Element, panel: HTMLElement) {
  if (!panel.matches(':popover-open')) {
    openPickerAtSelected(picker, panel)
    return
  }

  moveOpenPicker(event, picker)
}

function onPickerEdgeKey(picker: Element, panel: HTMLElement, key: string) {
  if (!panel.matches(':popover-open')) {
    panel.showPopover()
  }

  focusPickerEdge(picker, key)
}

function isPickerEdgeKey(key: string) {
  return key === 'Home' || key === 'End'
}

function isPickerArrowKey(key: string) {
  return key === 'ArrowDown' || key === 'ArrowUp'
}

function onPickerKeydown(event: KeyboardEvent, picker: Element, panel: HTMLElement) {
  if (isPickerEdgeKey(event.key)) {
    event.preventDefault()
    onPickerEdgeKey(picker, panel, event.key)
    return
  }

  if (!isPickerArrowKey(event.key)) {
    return
  }

  event.preventDefault()
  onPickerArrow(event, picker, panel)
}

function handlePickerKeydown(event: Event, picker: Element, panel: HTMLElement | null) {
  if (!panel || !(event instanceof KeyboardEvent)) {
    return
  }

  onPickerKeydown(event, picker, panel)
}

function syncPicker(picker: Element, value: string, labelPrefix: string) {
  const triggerButton = picker.querySelector<HTMLButtonElement>('[data-preference-trigger]')
  const selected = picker.querySelector(`[data-preference-option="${value}"]`)
  const selectedLabel = selected?.querySelector('span')?.textContent?.trim()
  const label = selectedLabel ? `${labelPrefix}: ${selectedLabel}` : labelPrefix

  picker.querySelectorAll<HTMLElement>('[data-picker-icon]').forEach((icon) => {
    icon.classList.toggle('hidden', icon.dataset.pickerIcon !== value)
  })
  picker.querySelectorAll<HTMLElement>('[data-preference-option]').forEach((option) => {
    const selectedOption = option.dataset.preferenceOption === value

    option.toggleAttribute('data-selected', selectedOption)
    option.setAttribute('aria-selected', selectedOption ? 'true' : 'false')
  })

  if (!triggerButton) {
    return
  }

  triggerButton.setAttribute('aria-label', label)
  triggerButton.title = label
}

function syncSelects(root: Element) {
  root.querySelectorAll<HTMLSelectElement>('[data-settings-select]').forEach((select) => {
    const kind = select.dataset.settingsSelect

    if (kind === 'color') {
      select.value = getThemeColor()
      return
    }

    if (kind === 'glass') {
      select.value = getGlassLevel()
      return
    }

    if (kind === 'mode') {
      select.value = getThemeMode()
    }
  })
}

function syncSound(root: Element, highlighted: boolean) {
  const soundToggle = root.querySelector<HTMLButtonElement>('[data-sound-toggle]')

  if (!soundToggle) {
    return
  }

  const preference = getSoundPreference()
  const copy = getSoundToggleCopy(preference === 'on')

  soundToggle.setAttribute('aria-label', copy.toggle)
  soundToggle.setAttribute('aria-pressed', copy.pressed)
  soundToggle.title = copy.label
  soundToggle.querySelector('[data-sound-label]')?.replaceChildren(copy.label)
  soundToggle.querySelectorAll<HTMLElement>('[data-sound-icon]').forEach((icon) => {
    icon.classList.toggle('hidden', icon.dataset.soundIcon !== preference)
  })
  toggleClasses(soundToggle, PALETTE_CHROME.activeFill, highlighted)
}

function syncThemeColors(root: Element, highlightedColor?: string) {
  const selected = getThemeColor()

  root.querySelectorAll<HTMLButtonElement>('[data-theme-swatch]').forEach((button) => {
    const color = button.dataset.theme
    const isSelected = color === selected
    const isHighlighted = color === highlightedColor

    button.setAttribute('aria-pressed', isSelected ? 'true' : 'false')
    button.querySelector('[data-theme-check]')?.classList.toggle('hidden', !isSelected)
    button.querySelector('[data-theme-check]')?.classList.toggle('flex', isSelected)
    toggleClasses(button, PALETTE_CHROME.swatchRing, isSelected || isHighlighted)
    toggleClasses(button, PALETTE_CHROME.hoverFill, !isSelected && !isHighlighted)
  })
}

function syncPickerValue(picker: Element, kind: string | null) {
  if (kind === 'glass') {
    syncPicker(picker, getGlassLevel(), 'Glass')
    return
  }

  if (kind === 'mode') {
    syncPicker(picker, getThemeMode(), 'Appearance')
  }
}

function syncPickerKind(picker: Element, highlightedMode: boolean) {
  const kind = picker.getAttribute('data-preference-kind')

  syncPickerValue(picker, kind)
  toggleClasses(
    picker.querySelector('[data-preference-trigger]') ?? picker,
    PALETTE_CHROME.activeFill,
    kind === 'mode' && highlightedMode,
  )
}

function syncPickers(root: Element, highlightedMode: boolean) {
  root.querySelectorAll('[data-preference-picker]').forEach((picker) => {
    syncPickerKind(picker, highlightedMode)
  })
}

function refreshSettings(root: Element, onChange?: () => void, highlights?: SettingsHighlights) {
  if (onChange) {
    onChange()
    return
  }

  syncSettings(root, highlights)
}

function bindSelects(root: Element, signal: AbortSignal, onChange?: () => void) {
  root.querySelectorAll<HTMLSelectElement>('[data-settings-select]').forEach((select) => {
    select.addEventListener(
      'change',
      () => {
        applyPreference(select.dataset.settingsSelect ?? null, select.value)
        refreshSettings(root, onChange)
      },
      { signal },
    )
  })
}

function bindThemeSwatches(root: Element, signal: AbortSignal, onChange?: () => void) {
  root.querySelectorAll<HTMLButtonElement>('[data-theme-swatch]').forEach((button) => {
    button.addEventListener(
      'click',
      () => {
        const color = button.dataset.theme

        if (!color || !applyThemeColorSelection(color)) {
          return
        }

        refreshSettings(root, onChange)
      },
      { signal },
    )
    button.addEventListener(
      'focus',
      () => {
        button.scrollIntoView({ block: 'nearest', inline: 'nearest' })
      },
      { signal },
    )
  })
}

function bindPickerOptions(
  root: Element,
  picker: Element,
  panel: HTMLElement | null,
  signal: AbortSignal,
  onChange?: () => void,
) {
  picker.querySelectorAll<HTMLButtonElement>('[data-preference-option]').forEach((option) => {
    option.addEventListener(
      'click',
      () => {
        const value = option.dataset.preferenceOption

        if (!value) {
          return
        }

        applyPreference(picker.getAttribute('data-preference-kind'), value)
        panel?.hidePopover()
        refreshSettings(root, onChange)
      },
      { signal },
    )
  })
}

function bindPreferencePickers(root: Element, signal: AbortSignal, onChange?: () => void) {
  root.querySelectorAll('[data-preference-picker]').forEach((picker) => {
    const panel = picker.querySelector<HTMLElement>('[data-preference-options]')
    const triggerButton = picker.querySelector<HTMLButtonElement>('[data-preference-trigger]')

    panel?.addEventListener(
      'toggle',
      () => {
        const isOpen = panel.matches(':popover-open')

        triggerButton?.setAttribute('aria-expanded', isOpen ? 'true' : 'false')

        if (isOpen) {
          selectedPickerOption(picker)?.focus()
        }
      },
      { signal },
    )
    picker.addEventListener('keydown', (event) => handlePickerKeydown(event, picker, panel), {
      signal,
    })
    bindPickerOptions(root, picker, panel, signal, onChange)
  })
}

function bindSoundToggle(root: Element, signal: AbortSignal, onChange?: () => void) {
  root.querySelector<HTMLButtonElement>('[data-sound-toggle]')?.addEventListener(
    'click',
    () => {
      applySoundToggle()
      refreshSettings(root, onChange)
    },
    { signal },
  )
}

export function closeSettingsPickers(root: Element) {
  root.querySelectorAll<HTMLElement>('[data-preference-options]').forEach((panel) => {
    if (panel.matches(':popover-open')) {
      panel.hidePopover()
    }
  })
}

export function isSettingsPickerOpen(root: Element) {
  return [...root.querySelectorAll('[data-preference-options]')].some((panel) =>
    panel.matches(':popover-open'),
  )
}

export function snapshotThemeLandscapes(root: Element) {
  root.querySelectorAll<HTMLElement>('[data-theme-swatch]').forEach((button) => {
    const styles = getComputedStyle(button)

    for (const [target, source] of LANDSCAPE_VARS) {
      button.style.setProperty(target, styles.getPropertyValue(source).trim())
    }
  })
}

export function syncSettings(root: Element, highlights: SettingsHighlights = {}) {
  syncSelects(root)
  syncPickers(root, highlights.mode === true)
  syncThemeColors(root, highlights.color)
  syncSound(root, highlights.sound === true)
}

export function bindSettings(root: Element, { onChange, signal }: BindSettingsOptions) {
  bindSelects(root, signal, onChange)
  bindThemeSwatches(root, signal, onChange)
  bindPreferencePickers(root, signal, onChange)
  bindSoundToggle(root, signal, onChange)
  syncSettings(root)
}

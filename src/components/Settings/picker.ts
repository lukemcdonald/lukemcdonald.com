import { wrapIndex } from '@/utils/wrap-index'

export type SettingChange = {
  onChange?: () => void
  signal: AbortSignal
}

export function afterSettingChange(onChange: (() => void) | undefined, fallback: () => void) {
  if (onChange) {
    onChange()
    return
  }

  fallback()
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

export function syncPreferencePicker(picker: Element, value: string, labelPrefix: string) {
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

export function bindPreferencePicker(
  picker: Element,
  {
    apply,
    onChange,
    signal,
    sync,
  }: SettingChange & {
    apply: (value: string) => boolean
    sync: () => void
  },
) {
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
  picker.querySelectorAll<HTMLButtonElement>('[data-preference-option]').forEach((option) => {
    option.addEventListener(
      'click',
      () => {
        const value = option.dataset.preferenceOption

        if (!value || !apply(value)) {
          return
        }

        panel?.hidePopover()
        afterSettingChange(onChange, sync)
      },
      { signal },
    )
  })
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

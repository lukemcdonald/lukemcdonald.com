import type { CommandPaletteNavItem } from './types'

import { navigate } from 'astro:transitions/client'
import { play } from 'cuelume'

import {
  getActiveEasterEggId,
  getEasterEggs,
  getFoundEasterEggIds,
  toggleEasterEgg,
} from '@/components/EasterEggs/easter-eggs'
import { getGlassLevel, isGlassLevel, setGlassLevel } from '@/components/Glass/utils'
import { getSoundPreference, toggleSoundPreference } from '@/components/Sound/utils'
import { getThemeColor, isThemeColor, setThemeColor } from '@/components/ThemeColor/utils'
import { getThemeMode, isThemeMode, setThemeMode } from '@/components/ThemeMode/utils'

import { PALETTE_CHROME } from './chrome'
import {
  applyHighlightedCommand,
  getFoundEggs,
  getHighlightedCommand,
  getSecretsFooterLabel,
  getSecretsProgressLabel,
  isPaletteBackKey,
  isSecretsShortcut,
  SECRETS_PAGE,
  wrapIndex,
} from './utils'

const DESKTOP_MEDIA = '(hover: hover) and (pointer: fine)'
const LANDSCAPE_VARS = [
  ['--landscape-dark', '--color-primary-800'],
  ['--landscape-front', '--color-primary-500'],
  ['--landscape-middle', '--color-primary-600'],
  ['--landscape-ridge', '--color-primary-700'],
  ['--landscape-shadow', '--color-primary-900'],
  ['--landscape-sky', '--color-primary-400'],
] as const

const binders = new WeakMap<Element, AbortController>()

type CloseOptions = {
  silent?: boolean
}

type Palette = {
  dialog: HTMLDialogElement
  eggs: ReturnType<typeof getEasterEggs>
  empty: HTMLElement | null
  footer: HTMLElement | null
  footerLabel: HTMLElement | null
  input: HTMLInputElement
  main: HTMLElement | null
  navItems: CommandPaletteNavItem[]
  navList: HTMLElement | null
  root: Element
  secrets: HTMLElement | null
  secretsTitle: HTMLElement | null
  soundToggle: HTMLButtonElement | null
  state: {
    activeIndex: number
    arrowOverride: boolean
    page?: string
    skipCloseSound: boolean
  }
  trigger: HTMLButtonElement
}

function isDesktop() {
  return window.matchMedia(DESKTOP_MEDIA).matches
}

function closeOpenPalettes() {
  document
    .querySelectorAll<HTMLDialogElement>('[data-command-palette-dialog]')
    .forEach((dialog) => {
      if (dialog.open) {
        dialog.close()
      }
    })
}

function toggleClasses(element: Element, className: string, enabled: boolean) {
  for (const token of className.split(/\s+/)) {
    if (token) {
      element.classList.toggle(token, enabled)
    }
  }
}

function snapshotLandscapes(root: Element) {
  root.querySelectorAll<HTMLElement>('[data-theme-swatch]').forEach((button) => {
    const styles = getComputedStyle(button)

    for (const [target, source] of LANDSCAPE_VARS) {
      button.style.setProperty(target, styles.getPropertyValue(source).trim())
    }
  })
}

function closePickers(root: Element) {
  root.querySelectorAll<HTMLElement>('[data-preference-options]').forEach((panel) => {
    if (panel.matches(':popover-open')) {
      panel.hidePopover()
    }
  })
}

function isPickerOpen(root: Element) {
  return [...root.querySelectorAll('[data-preference-options]')].some((panel) =>
    panel.matches(':popover-open'),
  )
}

function visibleItems(palette: Palette) {
  const selector = palette.state.page === SECRETS_PAGE ? '[data-palette-egg]' : '[data-palette-nav]'

  return [...palette.root.querySelectorAll<HTMLElement>(selector)].filter((item) => !item.hidden)
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

function soundCopy(isOn: boolean) {
  return {
    label: isOn ? 'Sounds on' : 'Sounds off',
    pressed: isOn ? 'true' : 'false',
    toggle: isOn ? 'Disable interaction sounds' : 'Enable interaction sounds',
  }
}

function syncSound(palette: Palette, highlighted: boolean) {
  const soundToggle = palette.soundToggle

  if (!soundToggle) {
    return
  }

  const preference = getSoundPreference()
  const copy = soundCopy(preference === 'on')

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

function eggMatches(name: string, needle: string) {
  return needle === '' || name.includes(needle)
}

function isFoundEgg(id: string, foundIds: readonly string[], name: string, needle: string) {
  return foundIds.includes(id) && eggMatches(name, needle)
}

function syncEggButton(
  button: HTMLButtonElement,
  foundIds: readonly string[],
  needle: string,
  activeId: string | undefined,
) {
  const id = button.dataset.paletteEgg ?? ''
  const isActive = id === activeId

  button.hidden = !isFoundEgg(id, foundIds, button.dataset.name ?? '', needle)
  button.setAttribute('aria-pressed', String(isActive))
  toggleClasses(button, PALETTE_CHROME.activeFill, isActive)
}

function syncEggs(palette: Palette, query: string) {
  const foundIds = getFoundEasterEggIds()
  const foundEggs = getFoundEggs(palette.eggs, foundIds)
  const needle = query.trim().toLowerCase()
  const activeId = getActiveEasterEggId()

  palette.root.querySelectorAll<HTMLButtonElement>('[data-palette-egg]').forEach((button) => {
    syncEggButton(button, foundIds, needle, activeId)
  })

  if (palette.secretsTitle) {
    palette.secretsTitle.textContent = getSecretsProgressLabel(
      foundEggs.length,
      palette.eggs.length,
    )
  }

  if (palette.footerLabel) {
    palette.footerLabel.textContent = getSecretsFooterLabel(foundEggs.length, palette.eggs.length)
  }
}

function filterNavItems(root: Element, needle: string) {
  root.querySelectorAll<HTMLAnchorElement>('[data-palette-nav]').forEach((item) => {
    const name = item.dataset.name ?? ''

    item.hidden = needle !== '' && !name.includes(needle)
  })
}

function resolveActiveIndex(palette: Palette, items: HTMLElement[], highlightedHref?: string) {
  if (!palette.state.arrowOverride) {
    palette.state.activeIndex =
      highlightedHref ?
        items.findIndex((item) => item.getAttribute('href') === highlightedHref)
      : -1
  }

  if (palette.state.activeIndex >= items.length) {
    palette.state.activeIndex = items.length - 1
  }
}

function syncActiveStyles(items: HTMLElement[], activeIndex: number) {
  items.forEach((item, index) => {
    const isActive = index === activeIndex
    const isPressedEgg =
      item.hasAttribute('data-palette-egg') && item.getAttribute('aria-pressed') === 'true'

    item.setAttribute('aria-selected', isActive ? 'true' : 'false')
    toggleClasses(item, PALETTE_CHROME.activeFill, isActive || isPressedEgg)
  })
}

function resultsList(palette: Palette) {
  const selector =
    palette.state.page === SECRETS_PAGE ? '[data-palette-secrets-list]' : '[data-palette-results]'

  return palette.root.querySelector<HTMLElement>(selector)
}

function setActiveDescendant(input: HTMLInputElement, activeId: string | undefined) {
  if (!activeId) {
    input.removeAttribute('aria-activedescendant')
    return
  }

  input.setAttribute('aria-activedescendant', activeId)
}

function syncComboboxControls(palette: Palette) {
  const listId = resultsList(palette)?.id

  if (listId) {
    palette.input.setAttribute('aria-controls', listId)
  }
}

function syncCombobox(palette: Palette, items: HTMLElement[]) {
  palette.input.setAttribute('aria-expanded', palette.dialog.open ? 'true' : 'false')
  syncComboboxControls(palette)
  setActiveDescendant(palette.input, items[palette.state.activeIndex]?.id)
}

function setHidden(element: HTMLElement | null, hidden: boolean) {
  if (element) {
    element.hidden = hidden
  }
}

function emptyMessage(command: ReturnType<typeof getHighlightedCommand>) {
  return command ? 'Press Enter to apply' : 'No matching pages'
}

function writeEmptyState(
  empty: HTMLElement | null,
  hidden: boolean,
  command: ReturnType<typeof getHighlightedCommand>,
) {
  setHidden(empty, hidden)

  if (empty) {
    empty.textContent = emptyMessage(command)
  }
}

function syncPageVisibility(
  palette: Palette,
  onSecrets: boolean,
  hasItems: boolean,
  command: ReturnType<typeof getHighlightedCommand>,
) {
  writeEmptyState(palette.empty, onSecrets || hasItems, command)
  setHidden(palette.navList, onSecrets || !hasItems)
  setHidden(palette.main, onSecrets)
  setHidden(palette.secrets, !onSecrets)
  setHidden(palette.footer, onSecrets)
}

function syncPreferenceHighlights(
  root: Element,
  command: ReturnType<typeof getHighlightedCommand>,
) {
  root.querySelectorAll('[data-preference-picker]').forEach((picker) => {
    const highlighted =
      picker.getAttribute('data-preference-kind') === 'mode' && command?.type === 'mode'

    toggleClasses(
      picker.querySelector('[data-preference-trigger]') ?? picker,
      PALETTE_CHROME.activeFill,
      highlighted,
    )
  })
}

function currentCommand(palette: Palette) {
  if (palette.state.page === SECRETS_PAGE) {
    return undefined
  }

  return getHighlightedCommand(palette.navItems, palette.input.value)
}

function commandHref(command: ReturnType<typeof getHighlightedCommand>) {
  return command?.type === 'nav' ? command.href : undefined
}

function commandColor(command: ReturnType<typeof getHighlightedCommand>) {
  return command?.type === 'color' ? command.color : undefined
}

function syncList(palette: Palette) {
  const query = palette.input.value
  const command = currentCommand(palette)

  filterNavItems(palette.root, query.trim().toLowerCase())
  syncEggs(palette, query)

  const items = visibleItems(palette)

  resolveActiveIndex(palette, items, commandHref(command))
  syncActiveStyles(items, palette.state.activeIndex)
  syncCombobox(palette, items)
  syncPageVisibility(palette, palette.state.page === SECRETS_PAGE, items.length > 0, command)
  syncPreferenceHighlights(palette.root, command)
  syncThemeColors(palette.root, commandColor(command))
  syncSound(palette, command?.type === 'sound')
}

function syncPreferences(palette: Palette) {
  palette.root.querySelectorAll('[data-preference-picker]').forEach((picker) => {
    const kind = picker.getAttribute('data-preference-kind')

    if (kind === 'glass') {
      syncPicker(picker, getGlassLevel(), 'Glass')
      return
    }

    if (kind === 'mode') {
      syncPicker(picker, getThemeMode(), 'Appearance')
    }
  })

  syncList(palette)
}

function applyGlassPreference(value: string) {
  if (isGlassLevel(value)) {
    setGlassLevel(value)
  }
}

function applyModePreference(value: string) {
  if (isThemeMode(value)) {
    setThemeMode(value)
  }
}

function applyPreference(kind: string | null, value: string) {
  if (kind === 'glass') {
    applyGlassPreference(value)
  }

  if (kind === 'mode') {
    applyModePreference(value)
  }
}

function showMain(palette: Palette) {
  palette.state.page = undefined
  palette.state.arrowOverride = false
  palette.state.activeIndex = -1
  palette.input.value = ''
  syncList(palette)
  palette.input.focus()
}

function openSecrets(palette: Palette) {
  palette.state.page = SECRETS_PAGE
  palette.state.arrowOverride = false
  palette.state.activeIndex = -1
  palette.input.value = ''
  syncList(palette)
  palette.input.focus()
}

function closePalette(palette: Palette, options?: CloseOptions) {
  if (options?.silent) {
    palette.state.skipCloseSound = true
  }

  if (palette.dialog.open) {
    palette.dialog.close()
  }
}

function openPalette(palette: Palette) {
  if (!isDesktop() || palette.dialog.open) {
    return
  }

  palette.dialog.showModal()
  palette.trigger.setAttribute('aria-expanded', 'true')
  snapshotLandscapes(palette.root)
  syncPreferences(palette)
  play('open')
  palette.input.focus()
}

function selectListItem(palette: Palette) {
  const item = visibleItems(palette)[palette.state.activeIndex]

  if (palette.state.page === SECRETS_PAGE) {
    item?.click()
    return true
  }

  if (!palette.state.arrowOverride) {
    return false
  }

  if (item instanceof HTMLAnchorElement) {
    item.click()
  }

  return true
}

function isPreferenceCommand(command: ReturnType<typeof getHighlightedCommand>) {
  return command?.type === 'color' || command?.type === 'mode'
}

function playPreferenceCue(command: ReturnType<typeof getHighlightedCommand>) {
  if (isPreferenceCommand(command)) {
    play('toggle')
  }
}

function selectActive(palette: Palette) {
  if (selectListItem(palette)) {
    return
  }

  const command = getHighlightedCommand(palette.navItems, palette.input.value)

  playPreferenceCue(command)
  applyHighlightedCommand(
    {
      close: () => closePalette(palette, { silent: true }),
      navigate: (href) => {
        navigate(href)
      },
      onPreferenceApplied: () => syncPreferences(palette),
      setThemeColor,
      setThemeMode,
      toggleSound: toggleSoundPreference,
    },
    command,
  )
}

function moveActive(palette: Palette, delta: number) {
  const items = visibleItems(palette)

  if (items.length === 0) {
    return
  }

  palette.state.arrowOverride = true
  palette.state.activeIndex = wrapIndex(palette.state.activeIndex, delta, items.length)

  items[palette.state.activeIndex]?.scrollIntoView({ block: 'nearest' })
  syncList(palette)
}

function onDialogCancel(event: Event, palette: Palette) {
  if (isPickerOpen(palette.root)) {
    event.preventDefault()
    closePickers(palette.root)
    return
  }

  if (palette.state.page !== SECRETS_PAGE) {
    return
  }

  event.preventDefault()
  showMain(palette)
}

function onDialogClose(palette: Palette) {
  closePickers(palette.root)
  palette.state.page = undefined
  palette.state.arrowOverride = false
  palette.state.activeIndex = -1
  palette.input.value = ''
  palette.trigger.setAttribute('aria-expanded', 'false')
  syncList(palette)

  if (palette.state.skipCloseSound) {
    palette.state.skipCloseSound = false
    return
  }

  play('close')
}

function onSearchNavKey(event: KeyboardEvent, palette: Palette) {
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    moveActive(palette, 1)
    return
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault()
    moveActive(palette, -1)
    return
  }

  if (event.key === 'Enter') {
    event.preventDefault()
    selectActive(palette)
  }
}

function onSearchKeydown(event: KeyboardEvent, palette: Palette) {
  if (isPickerOpen(palette.root)) {
    return
  }

  onSearchNavKey(event, palette)
}

function isPaletteToggle(event: KeyboardEvent) {
  return (event.metaKey || event.ctrlKey) && event.key === 'k'
}

function handlePaletteToggle(event: KeyboardEvent, palette: Palette) {
  if (!isPaletteToggle(event)) {
    return false
  }

  event.preventDefault()

  if (palette.dialog.open) {
    closePalette(palette)
  } else {
    openPalette(palette)
  }

  return true
}

function handleSecretsShortcut(event: KeyboardEvent, palette: Palette) {
  if (!isSecretsShortcut(event)) {
    return false
  }

  event.preventDefault()

  if (palette.state.page === SECRETS_PAGE) {
    showMain(palette)
  } else {
    openSecrets(palette)
  }

  return true
}

function handleSecretsBack(event: KeyboardEvent, palette: Palette) {
  if (isPickerOpen(palette.root)) {
    return true
  }

  if (palette.state.page !== SECRETS_PAGE || !isPaletteBackKey(event, palette.input.value)) {
    return false
  }

  event.preventDefault()
  event.stopPropagation()
  showMain(palette)
  return true
}

function handleOpenPaletteKeys(event: KeyboardEvent, palette: Palette) {
  if (handleSecretsShortcut(event, palette)) {
    return
  }

  handleSecretsBack(event, palette)
}

function onDocumentKeydown(event: KeyboardEvent, palette: Palette) {
  if (!isDesktop()) {
    return
  }

  if (handlePaletteToggle(event, palette)) {
    return
  }

  if (!palette.dialog.open) {
    return
  }

  handleOpenPaletteKeys(event, palette)
}

function bindNavAndEggs(palette: Palette, signal: AbortSignal) {
  palette.root.querySelectorAll<HTMLAnchorElement>('[data-palette-nav]').forEach((item) => {
    item.addEventListener(
      'click',
      (event) => {
        if (event.button !== 0 || event.defaultPrevented) {
          return
        }

        closePalette(palette, { silent: true })
      },
      { signal },
    )
  })

  palette.root.querySelectorAll<HTMLButtonElement>('[data-palette-egg]').forEach((button) => {
    button.addEventListener(
      'click',
      () => {
        const id = button.dataset.paletteEgg

        if (!id) {
          return
        }

        toggleEasterEgg(id)
        syncPreferences(palette)
      },
      { signal },
    )
  })
}

function bindThemeSwatches(palette: Palette, signal: AbortSignal) {
  palette.root.querySelectorAll<HTMLButtonElement>('[data-theme-swatch]').forEach((button) => {
    button.addEventListener(
      'click',
      () => {
        const color = button.dataset.theme

        if (!color || !isThemeColor(color)) {
          return
        }

        setThemeColor(color)
        syncPreferences(palette)
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

function bindPickerOptions(
  palette: Palette,
  picker: Element,
  panel: HTMLElement | null,
  signal: AbortSignal,
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
        syncPreferences(palette)
      },
      { signal },
    )
  })
}

function bindPreferencePickers(palette: Palette, signal: AbortSignal) {
  palette.root.querySelectorAll('[data-preference-picker]').forEach((picker) => {
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
    bindPickerOptions(palette, picker, panel, signal)
  })
}

function isDialogTarget(event: Event, dialog: HTMLDialogElement) {
  return event.target === dialog
}

function bindBackdropClose(palette: Palette, signal: AbortSignal) {
  let pointerStartedOnDialog = false

  palette.dialog.addEventListener(
    'pointerdown',
    (event) => {
      pointerStartedOnDialog = isDialogTarget(event, palette.dialog)
    },
    { signal },
  )
  palette.dialog.addEventListener(
    'click',
    (event) => {
      if (pointerStartedOnDialog && isDialogTarget(event, palette.dialog)) {
        closePalette(palette)
      }
    },
    { signal },
  )
}

function bindPaletteEvents(palette: Palette, signal: AbortSignal) {
  palette.trigger.addEventListener('click', () => openPalette(palette), { signal })
  bindBackdropClose(palette, signal)
  palette.dialog.addEventListener('cancel', (event) => onDialogCancel(event, palette), { signal })
  palette.dialog.addEventListener('close', () => onDialogClose(palette), { signal })
  palette.input.addEventListener(
    'input',
    () => {
      palette.state.arrowOverride = false
      syncList(palette)
    },
    { signal },
  )
  palette.input.addEventListener('keydown', (event) => onSearchKeydown(event, palette), { signal })
  palette.soundToggle?.addEventListener(
    'click',
    () => {
      toggleSoundPreference()
      syncPreferences(palette)
    },
    { signal },
  )
  bindNavAndEggs(palette, signal)
  bindThemeSwatches(palette, signal)
  bindPreferencePickers(palette, signal)
  document.addEventListener('keydown', (event) => onDocumentKeydown(event, palette), {
    capture: true,
    signal,
  })
}

function queryPalette(root: Element): Palette | undefined {
  const dialog = root.querySelector<HTMLDialogElement>('[data-command-palette-dialog]')
  const input = root.querySelector<HTMLInputElement>('[data-command-palette-input]')
  const trigger = root.querySelector<HTMLButtonElement>('[data-command-palette-trigger]')

  if (!dialog || !input || !trigger) {
    return
  }

  return {
    dialog,
    eggs: getEasterEggs(),
    empty: root.querySelector('[data-palette-empty]'),
    footer: root.querySelector('[data-palette-secrets-footer]'),
    footerLabel: root.querySelector('[data-palette-secrets-footer-label]'),
    input,
    main: root.querySelector('[data-palette-main]'),
    navItems: [...root.querySelectorAll<HTMLAnchorElement>('[data-palette-nav]')].map((item) => ({
      href: item.getAttribute('href') ?? '',
      name: item.textContent?.trim() ?? '',
    })),
    navList: root.querySelector('[data-palette-nav-list]'),
    root,
    secrets: root.querySelector('[data-palette-secrets]'),
    secretsTitle: root.querySelector('[data-palette-secrets-title]'),
    soundToggle: root.querySelector('[data-sound-toggle]'),
    state: {
      activeIndex: -1,
      arrowOverride: false,
      skipCloseSound: false,
    },
    trigger,
  }
}

function bindPalette(root: Element) {
  const palette = queryPalette(root)

  if (!palette) {
    return
  }

  binders.get(root)?.abort()

  const controller = new AbortController()

  binders.set(root, controller)
  bindPaletteEvents(palette, controller.signal)
  snapshotLandscapes(root)
  palette.trigger.setAttribute('aria-expanded', palette.dialog.open ? 'true' : 'false')
  syncPreferences(palette)
}

function bindPalettes() {
  document.querySelectorAll('[data-command-palette]').forEach(bindPalette)
}

document.addEventListener('astro:before-preparation', closeOpenPalettes)
document.addEventListener('astro:page-load', bindPalettes)
bindPalettes()

import type { CommandPaletteNavItem } from './types'

import { navigate } from 'astro:transitions/client'

import {
  getActiveEasterEggId,
  getEasterEggs,
  getFoundEasterEggIds,
  toggleEasterEgg,
} from '@/components/EasterEggs/easter-eggs'
import {
  bindSettings,
  closeSettingsPickers,
  isSettingsPickerOpen,
  snapshotThemeLandscapes,
  syncSettings,
} from '@/components/Settings/settings'
import { playSound, toggleSoundPreference } from '@/components/Settings/Sound/utils'
import { setThemeColor } from '@/components/Settings/ThemeColor/utils'
import { setThemeMode } from '@/components/Settings/ThemeMode/utils'
import { toggleClasses } from '@/utils/toggle-classes'
import { wrapIndex } from '@/utils/wrap-index'

import { PALETTE_CHROME } from './chrome'
import {
  applyHighlightedCommand,
  formatPaletteFooterLabel,
  formatPaletteFooterShortcut,
  formatSecretsProgressLabel,
  getFoundEggs,
  getHighlightedCommand,
  isPaletteBackKey,
  isSecretsShortcut,
  SECRETS_PAGE,
} from './utils'

const DESKTOP_MEDIA = '(hover: hover) and (pointer: fine)'

const binders = new WeakMap<Element, AbortController>()

type CloseOptions = {
  silent?: boolean
}

type Palette = {
  dialog: HTMLDialogElement
  eggs: ReturnType<typeof getEasterEggs>
  empty: HTMLElement | null
  footerKbd: HTMLElement | null
  footerLabel: HTMLElement | null
  input: HTMLInputElement
  list: HTMLElement | null
  listSizer: HTMLElement | null
  main: HTMLElement | null
  navItems: CommandPaletteNavItem[]
  navList: HTMLElement | null
  root: Element
  secrets: HTMLElement | null
  secretsTitle: HTMLElement | null
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

function visibleItems(palette: Palette) {
  const selector = palette.state.page === SECRETS_PAGE ? '[data-palette-egg]' : '[data-palette-nav]'

  return [...palette.root.querySelectorAll<HTMLElement>(selector)].filter((item) => !item.hidden)
}

function isEggNameMatch(name: string, needle: string) {
  return needle === '' || name.includes(needle)
}

function isFoundEgg(id: string, foundIds: readonly string[], name: string, needle: string) {
  return foundIds.includes(id) && isEggNameMatch(name, needle)
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
  button.setAttribute('aria-checked', isActive ? 'true' : 'false')
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
    palette.secretsTitle.textContent = formatSecretsProgressLabel(
      foundEggs.length,
      palette.eggs.length,
    )
  }

  syncFooterHint(palette, foundEggs.length, palette.eggs.length)
}

function syncFooterHint(palette: Palette, foundCount: number, totalCount: number) {
  const onSecrets = palette.state.page === SECRETS_PAGE

  if (palette.footerLabel) {
    palette.footerLabel.textContent = formatPaletteFooterLabel(onSecrets, foundCount, totalCount)
  }

  if (palette.footerKbd) {
    palette.footerKbd.textContent = formatPaletteFooterShortcut(onSecrets)
  }
}

function filterNavItems(root: Element, needle: string) {
  root.querySelectorAll<HTMLAnchorElement>('[data-palette-nav]').forEach((item) => {
    const name = item.dataset.name ?? ''

    item.hidden = needle !== '' && !name.includes(needle)
  })
}

function hideEmptyNavGroups(root: Element) {
  root.querySelectorAll<HTMLElement>('[data-palette-nav-group]').forEach((group) => {
    const hasVisible = [...group.querySelectorAll<HTMLElement>('[data-palette-nav]')].some(
      (item) => {
        return !item.hidden
      },
    )

    group.hidden = !hasVisible
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

function setItemHighlight(item: HTMLElement, highlighted: boolean) {
  item.toggleAttribute('data-palette-highlighted', highlighted)
  toggleClasses(item, PALETTE_CHROME.activeFill, highlighted)
}

function syncActiveStyles(items: HTMLElement[], activeIndex: number) {
  items.forEach((item, index) => {
    const isActive = index === activeIndex

    item.setAttribute('aria-selected', isActive ? 'true' : 'false')
    setItemHighlight(item, isActive)
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
}

function currentCommand(palette: Palette) {
  if (palette.state.page === SECRETS_PAGE) {
    return undefined
  }

  return getHighlightedCommand(palette.navItems, palette.input.value)
}

function commandColor(command: ReturnType<typeof getHighlightedCommand>) {
  return command?.type === 'color' ? command.color : undefined
}

function commandHref(command: ReturnType<typeof getHighlightedCommand>) {
  return command?.type === 'nav' ? command.href : undefined
}

function syncList(palette: Palette) {
  const query = palette.input.value
  const command = currentCommand(palette)

  filterNavItems(palette.root, query.trim().toLowerCase())
  hideEmptyNavGroups(palette.root)
  syncEggs(palette, query)

  const items = visibleItems(palette)

  resolveActiveIndex(palette, items, commandHref(command))
  syncActiveStyles(items, palette.state.activeIndex)
  syncCombobox(palette, items)
  syncPageVisibility(palette, palette.state.page === SECRETS_PAGE, items.length > 0, command)
  syncSettings(palette.root, {
    color: commandColor(command),
    mode: command?.type === 'mode',
    sound: command?.type === 'sound',
  })
  measureList(palette)
}

function measureList(palette: Palette) {
  if (!palette.list || !palette.listSizer) {
    return
  }

  palette.list.style.setProperty('--palette-list-height', `${palette.listSizer.offsetHeight}px`)
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
  snapshotThemeLandscapes(palette.root)
  syncList(palette)
  playSound('open')
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

  item?.click()
  return true
}

function isPreferenceCommand(command: ReturnType<typeof getHighlightedCommand>) {
  return command?.type === 'color' || command?.type === 'mode'
}

function playPreferenceCue(command: ReturnType<typeof getHighlightedCommand>) {
  if (isPreferenceCommand(command)) {
    playSound('toggle')
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
      onPreferenceApplied: () => syncList(palette),
      setThemeColor,
      setThemeMode,
      toggleSound: toggleSoundPreference,
    },
    command,
  )
}

function activateItem(palette: Palette, item: HTMLElement) {
  const items = visibleItems(palette)
  const index = items.indexOf(item)

  if (index < 0 || index === palette.state.activeIndex) {
    return
  }

  palette.state.arrowOverride = true
  palette.state.activeIndex = index
  syncList(palette)
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
  if (isSettingsPickerOpen(palette.root)) {
    event.preventDefault()
    closeSettingsPickers(palette.root)
    return
  }

  if (palette.state.page !== SECRETS_PAGE) {
    return
  }

  event.preventDefault()
  showMain(palette)
}

function onDialogClose(palette: Palette) {
  closeSettingsPickers(palette.root)
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

  playSound('close')
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
  if (isSettingsPickerOpen(palette.root)) {
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
  if (isSettingsPickerOpen(palette.root)) {
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
    bindEggButton(palette, button, signal)
  })
}

function bindEggButton(palette: Palette, button: HTMLButtonElement, signal: AbortSignal) {
  button.addEventListener(
    'click',
    () => {
      const id = button.dataset.paletteEgg

      if (!id) {
        return
      }

      toggleEasterEgg(id)
      syncList(palette)
      palette.input.focus()
    },
    { signal },
  )
  button.addEventListener(
    'pointerenter',
    () => {
      activateItem(palette, button)
    },
    { signal },
  )
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

function bindListHeight(palette: Palette, signal: AbortSignal) {
  if (!palette.listSizer) {
    return
  }

  const observer = new ResizeObserver(() => {
    measureList(palette)
  })

  observer.observe(palette.listSizer)
  signal.addEventListener('abort', () => observer.disconnect())
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
  bindSettings(palette.root, {
    onChange: () => syncList(palette),
    signal,
  })
  bindListHeight(palette, signal)
  bindNavAndEggs(palette, signal)
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
    footerKbd: root.querySelector('[data-palette-secrets-footer-kbd]'),
    footerLabel: root.querySelector('[data-palette-secrets-footer-label]'),
    input,
    list: root.querySelector('[data-palette-list]'),
    listSizer: root.querySelector('[data-palette-list-sizer]'),
    main: root.querySelector('[data-palette-main]'),
    navItems: [...root.querySelectorAll<HTMLAnchorElement>('[data-palette-nav]')].map((item) => ({
      href: item.getAttribute('href') ?? '',
      name: item.textContent?.trim() ?? '',
    })),
    navList: root.querySelector('[data-palette-nav-list]'),
    root,
    secrets: root.querySelector('[data-palette-secrets]'),
    secretsTitle: root.querySelector('[data-palette-secrets-title]'),
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
  snapshotThemeLandscapes(root)
  palette.trigger.setAttribute('aria-expanded', palette.dialog.open ? 'true' : 'false')
  syncList(palette)
}

function bindPalettes() {
  document.querySelectorAll('[data-command-palette]').forEach(bindPalette)
}

document.addEventListener('astro:before-preparation', closeOpenPalettes)
document.addEventListener('astro:page-load', bindPalettes)
bindPalettes()

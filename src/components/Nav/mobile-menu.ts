import { getThemeColor } from '@/components/ThemeColor/utils'
import { getThemeMode } from '@/components/ThemeMode/utils'

import { applyThemeColorSelection, applyThemeModeSelection } from './mobile-menu-prefs'

const binders = new WeakMap<Element, AbortController>()
const SHEET_MS = 200

let pageScrollLocked = false
let savedScrollY = 0

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function lockPageScroll() {
  if (pageScrollLocked) {
    return
  }

  pageScrollLocked = true
  document.documentElement.style.overflow = 'hidden'
  document.documentElement.style.overscrollBehavior = 'none'
  document.body.style.inset = `-${savedScrollY}px 0 auto`
  document.body.style.overflow = 'hidden'
  document.body.style.overscrollBehavior = 'none'
  document.body.style.position = 'fixed'
  document.body.style.width = '100%'
}

function unlockPageScroll() {
  if (!pageScrollLocked) {
    return
  }

  pageScrollLocked = false
  document.documentElement.style.overflow = ''
  document.documentElement.style.overscrollBehavior = ''
  document.body.style.inset = ''
  document.body.style.overflow = ''
  document.body.style.overscrollBehavior = ''
  document.body.style.position = ''
  document.body.style.width = ''
  window.scrollTo(0, savedScrollY)
}

function closeOpenMenus() {
  document.querySelectorAll<HTMLDialogElement>('[data-mobile-menu-dialog]').forEach((dialog) => {
    if (dialog.open) {
      dialog.close()
    }
  })

  document.querySelectorAll('header[data-mobile-menu-open]').forEach((header) => {
    header.removeAttribute('data-mobile-menu-open')
  })

  document.querySelectorAll<HTMLElement>('[data-mobile-menu-sheet]').forEach((sheet) => {
    sheet.classList.add('translate-y-full')
  })

  unlockPageScroll()
}

function bindMenu(root: Element) {
  const dialog = root.querySelector<HTMLDialogElement>('[data-mobile-menu-dialog]')
  const header = root.closest('header')
  const modeSelect = root.querySelector<HTMLSelectElement>('[data-mobile-menu-mode]')
  const sheet = root.querySelector<HTMLElement>('[data-mobile-menu-sheet]')
  const themeSelect = root.querySelector<HTMLSelectElement>('[data-mobile-menu-theme]')
  const trigger = root.querySelector<HTMLButtonElement>('[data-mobile-menu-trigger]')

  if (!dialog || !trigger) {
    return
  }

  binders.get(root)?.abort()

  const controller = new AbortController()
  const { signal } = controller

  binders.set(root, controller)

  let closingTimer = 0
  let isClosing = false
  let onSheetClose: ((event: TransitionEvent) => void) | null = null

  const syncChrome = (isOpen: boolean) => {
    header?.toggleAttribute('data-mobile-menu-open', isOpen)
    trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false')
    trigger.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu')
  }

  const settleSheet = (show: boolean) => {
    if (!sheet) {
      return
    }

    sheet.classList.toggle('translate-y-full', !show)
  }

  const finishClose = () => {
    if (sheet && onSheetClose) {
      sheet.removeEventListener('transitionend', onSheetClose)
      onSheetClose = null
    }

    window.clearTimeout(closingTimer)
    closingTimer = 0
    isClosing = false
    settleSheet(false)

    if (dialog.open) {
      dialog.close()
    }

    syncChrome(false)
    unlockPageScroll()
  }

  const openDialog = () => {
    if (dialog.open || isClosing) {
      return
    }

    savedScrollY = window.scrollY
    settleSheet(false)
    dialog.showModal()
    dialog.focus({ preventScroll: true })
    syncChrome(true)
    lockPageScroll()

    if (!sheet || prefersReducedMotion()) {
      settleSheet(true)
      return
    }

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        settleSheet(true)
      })
    })
  }

  const closeDialog = (options?: { animate?: boolean }) => {
    const animate = options?.animate !== false

    if (!dialog.open || isClosing) {
      return
    }

    syncChrome(false)

    if (!sheet || !animate || prefersReducedMotion()) {
      finishClose()
      return
    }

    isClosing = true
    settleSheet(false)

    onSheetClose = (event: TransitionEvent) => {
      if (event.target !== sheet || event.propertyName !== 'transform') {
        return
      }

      finishClose()
    }

    sheet.addEventListener('transitionend', onSheetClose)
    closingTimer = window.setTimeout(finishClose, SHEET_MS + 50)
  }

  trigger.addEventListener(
    'click',
    () => {
      openDialog()
    },
    { signal },
  )

  dialog.addEventListener(
    'cancel',
    (event) => {
      event.preventDefault()
      closeDialog()
    },
    { signal },
  )

  dialog.addEventListener(
    'close',
    () => {
      isClosing = false
      settleSheet(false)
      syncChrome(false)
      unlockPageScroll()
    },
    { signal },
  )

  dialog.addEventListener(
    'click',
    (event) => {
      if (event.target === dialog) {
        closeDialog()
      }
    },
    { signal },
  )

  dialog.querySelectorAll<HTMLAnchorElement>('[data-mobile-menu-link]').forEach((link) => {
    link.addEventListener(
      'click',
      (event) => {
        if (event.button !== 0 || event.defaultPrevented) {
          return
        }

        const destination = new URL(link.href, window.location.href)
        const samePage =
          destination.pathname === window.location.pathname &&
          destination.search === window.location.search

        if (samePage) {
          closeDialog()
          return
        }

        closeDialog({ animate: false })
      },
      { signal },
    )
  })

  if (themeSelect) {
    themeSelect.value = getThemeColor()
    themeSelect.addEventListener(
      'change',
      () => {
        applyThemeColorSelection(themeSelect.value)
      },
      { signal },
    )
  }

  if (modeSelect) {
    modeSelect.value = getThemeMode()
    modeSelect.addEventListener(
      'change',
      () => {
        applyThemeModeSelection(modeSelect.value)
      },
      { signal },
    )
  }

  syncChrome(dialog.open)
}

function bindMobileMenus() {
  document.querySelectorAll('[data-mobile-menu]').forEach(bindMenu)
}

document.addEventListener('astro:before-preparation', closeOpenMenus)
document.addEventListener('astro:page-load', bindMobileMenus)

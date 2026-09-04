import { getThemeColor } from '@/components/ThemeColor/utils'
import { getThemeMode } from '@/components/ThemeMode/utils'

import { applyThemeColorSelection, applyThemeModeSelection } from './mobile-menu-prefs'

const binders = new WeakMap<Element, AbortController>()

function closeOpenMenus() {
  document.querySelectorAll<HTMLDialogElement>('[data-mobile-menu-dialog]').forEach((dialog) => {
    if (dialog.open) {
      dialog.close()
    }
  })

  document.querySelectorAll('header[data-mobile-menu-open]').forEach((header) => {
    header.removeAttribute('data-mobile-menu-open')
  })
}

function bindMenu(root: Element) {
  const dialog = root.querySelector<HTMLDialogElement>('[data-mobile-menu-dialog]')
  const header = root.closest('header')
  const modeSelect = root.querySelector<HTMLSelectElement>('[data-mobile-menu-mode]')
  const themeSelect = root.querySelector<HTMLSelectElement>('[data-mobile-menu-theme]')
  const trigger = root.querySelector<HTMLButtonElement>('[data-mobile-menu-trigger]')

  if (!dialog || !trigger) {
    return
  }

  binders.get(root)?.abort()

  const controller = new AbortController()
  const { signal } = controller

  binders.set(root, controller)

  const syncChrome = (isOpen: boolean) => {
    header?.toggleAttribute('data-mobile-menu-open', isOpen)
    trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false')
    trigger.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu')
  }

  const closeDialog = () => {
    if (dialog.open) {
      dialog.close()
    }
  }

  trigger.addEventListener(
    'click',
    () => {
      if (dialog.open) {
        return
      }

      dialog.showModal()
      dialog.focus({ preventScroll: true })
      syncChrome(true)
    },
    { signal },
  )

  dialog.addEventListener(
    'close',
    () => {
      syncChrome(false)
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

        closeDialog()
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

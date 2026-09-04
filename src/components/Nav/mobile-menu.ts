import { getSoundPreference } from '@/components/Sound/utils'
import { getThemeColor } from '@/components/ThemeColor/utils'
import { getThemeMode } from '@/components/ThemeMode/utils'

import {
  applySoundSelection,
  applyThemeColorSelection,
  applyThemeModeSelection,
} from './mobile-menu-prefs'

const binders = new WeakMap<Element, AbortController>()

function closeOpenMenus() {
  document.querySelectorAll<HTMLDialogElement>('[data-mobile-menu-dialog]').forEach((dialog) => {
    if (dialog.open) {
      dialog.close()
    }
  })
}

function bindMenu(root: Element) {
  const dialog = root.querySelector<HTMLDialogElement>('[data-mobile-menu-dialog]')
  const modeSelect = root.querySelector<HTMLSelectElement>('[data-mobile-menu-mode]')
  const soundInput = root.querySelector<HTMLInputElement>('[data-mobile-menu-sound]')
  const themeSelect = root.querySelector<HTMLSelectElement>('[data-mobile-menu-theme]')
  const trigger = root.querySelector<HTMLButtonElement>('[data-mobile-menu-trigger]')

  if (!dialog || !trigger) {
    return
  }

  binders.get(root)?.abort()

  const controller = new AbortController()
  const { signal } = controller

  binders.set(root, controller)

  const syncTrigger = () => {
    trigger.setAttribute('aria-expanded', dialog.open ? 'true' : 'false')
    trigger.setAttribute('aria-label', dialog.open ? 'Close menu' : 'Open menu')
  }

  const closeDialog = () => {
    if (dialog.open) {
      dialog.close()
    }

    syncTrigger()
  }

  trigger.addEventListener(
    'click',
    () => {
      if (dialog.open) {
        return
      }

      dialog.showModal()
      syncTrigger()
    },
    { signal },
  )

  dialog.addEventListener('close', syncTrigger, { signal })
  dialog.addEventListener('toggle', syncTrigger, { signal })

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

        window.setTimeout(() => {
          closeDialog()
        }, 0)
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

  if (soundInput) {
    soundInput.checked = getSoundPreference() === 'on'
    soundInput.addEventListener(
      'change',
      () => {
        applySoundSelection(soundInput.checked)
      },
      { signal },
    )
  }

  syncTrigger()
}

function bindMobileMenus() {
  document.querySelectorAll('[data-mobile-menu]').forEach(bindMenu)
}

document.addEventListener('astro:before-preparation', closeOpenMenus)
document.addEventListener('astro:page-load', bindMobileMenus)

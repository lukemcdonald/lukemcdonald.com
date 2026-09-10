const HIDE_DELAY_MS = 120
const binders = new WeakMap<Element, AbortController>()

function isPanelOpen(panel: HTMLElement): boolean {
  return panel.matches(':popover-open')
}

function closeOpenMenus() {
  document.querySelectorAll<HTMLElement>('[data-nav-menu-panel]').forEach((panel) => {
    if (isPanelOpen(panel)) {
      panel.hidePopover()
    }
  })
}

function bindMenu(root: Element) {
  const panel = root.querySelector<HTMLElement>('[data-nav-menu-panel]')
  const trigger = root.querySelector<HTMLButtonElement>('[data-nav-menu-trigger]')

  if (!panel || !trigger || typeof panel.showPopover !== 'function') {
    return
  }

  binders.get(root)?.abort()

  const controller = new AbortController()
  const { signal } = controller

  binders.set(root, controller)

  const syncExpanded = () => {
    trigger.setAttribute('aria-expanded', isPanelOpen(panel) ? 'true' : 'false')
  }

  let hideTimer = 0

  const show = () => {
    window.clearTimeout(hideTimer)

    if (!isPanelOpen(panel)) {
      panel.showPopover()
    }
  }

  const scheduleHide = () => {
    window.clearTimeout(hideTimer)
    hideTimer = window.setTimeout(() => {
      if (isPanelOpen(panel)) {
        panel.hidePopover()
      }
    }, HIDE_DELAY_MS)
  }

  panel.addEventListener('toggle', syncExpanded, { signal })
  trigger.addEventListener('pointerenter', show, { signal })
  trigger.addEventListener('pointerleave', scheduleHide, { signal })
  panel.addEventListener('pointerenter', show, { signal })
  panel.addEventListener('pointerleave', scheduleHide, { signal })

  syncExpanded()
}

function bindNavMenus() {
  document.querySelectorAll('[data-nav-menu]').forEach(bindMenu)
}

document.addEventListener('astro:before-preparation', closeOpenMenus)
document.addEventListener('astro:page-load', bindNavMenus)
bindNavMenus()

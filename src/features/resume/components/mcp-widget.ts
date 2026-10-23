import { getStorageItem, setStorageItem, STORAGE_KEYS } from '@/utils/storage'

const binders = new WeakMap<Element, AbortController>()

function dismissWidget(root: HTMLElement) {
  document.documentElement.dataset.resumeMcpHidden = ''
  root.hidden = true
  setStorageItem(STORAGE_KEYS.resumeMcpWidget, '1')
}

function isWidgetDismissed() {
  return getStorageItem(STORAGE_KEYS.resumeMcpWidget) !== null
}

function bindWidget(root: HTMLElement) {
  if (isWidgetDismissed()) {
    dismissWidget(root)
    return
  }

  const dismiss = root.querySelector<HTMLButtonElement>('[data-resume-mcp-dismiss]')
  const toggle = root.querySelector<HTMLButtonElement>('[data-resume-mcp-toggle]')

  binders.get(root)?.abort()

  const controller = new AbortController()
  const { signal } = controller

  binders.set(root, controller)

  dismiss?.addEventListener(
    'click',
    () => {
      dismissWidget(root)
    },
    { signal },
  )

  toggle?.addEventListener(
    'click',
    () => {
      const open = root.hasAttribute('data-open')

      root.toggleAttribute('data-open', !open)
      toggle.setAttribute('aria-expanded', String(!open))
    },
    { signal },
  )
}

function bindWidgets() {
  document.querySelectorAll<HTMLElement>('[data-resume-mcp-widget]').forEach(bindWidget)
}

document.addEventListener('astro:page-load', bindWidgets)

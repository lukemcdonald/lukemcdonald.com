const DESKTOP_MEDIA = '(hover: hover) and (pointer: fine)'
const SECRETS_EVENT = 'easter-eggs:secrets'

let bound = false
let loading: Promise<void> | undefined

function isDesktop() {
  return window.matchMedia(DESKTOP_MEDIA).matches
}

function isPaletteToggle(event: KeyboardEvent) {
  return (event.metaKey || event.ctrlKey) && event.key === 'k'
}

function loadPalette() {
  loading ??= import('./command-palette').then(() => {
    bound = true
  })

  return loading
}

function onDocumentClick(event: Event) {
  if (bound) {
    return
  }

  const target = event.target
  const trigger =
    target instanceof Element ? target.closest('[data-command-palette-trigger]') : null

  if (!(trigger instanceof HTMLButtonElement)) {
    return
  }

  event.preventDefault()
  event.stopImmediatePropagation()
  void loadPalette().then(() => {
    trigger.click()
  })
}

function onDocumentKeydown(event: KeyboardEvent) {
  if (bound || !isDesktop() || !isPaletteToggle(event)) {
    return
  }

  event.preventDefault()
  void loadPalette().then(() => {
    document.querySelector<HTMLButtonElement>('[data-command-palette-trigger]')?.click()
  })
}

function onSecretsRequested() {
  if (bound || !isDesktop()) {
    return
  }

  void loadPalette().then(() => {
    document.dispatchEvent(new Event(SECRETS_EVENT))
  })
}

function scheduleIdleLoad() {
  if (!isDesktop()) {
    return
  }

  const run = () => {
    void loadPalette()
  }

  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(run)
    return
  }

  setTimeout(run, 1)
}

document.addEventListener('click', onDocumentClick, { capture: true })
document.addEventListener('keydown', onDocumentKeydown, { capture: true })
document.addEventListener(SECRETS_EVENT, onSecretsRequested)
scheduleIdleLoad()

export {}

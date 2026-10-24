import { bindDialogBackdropClose } from '@/utils/dialog'

const DIALOG_ATTR = 'data-fca-dialog'
const EMBED_ATTR = 'data-fca-embed'
const EMBED_ORIGIN = 'https://www.youtube-nocookie.com/embed'
const EMBED_TITLE = 'FCA All Abilities camp at Camp Courageous'
const FCA_ID = 'fca'
const IFRAME_TEST_ID = 'fca-egg-iframe'
const SEQUENCE = ['KeyF', 'KeyC', 'KeyA'] as const
const VIDEO_ID = 'wM0if-w6PEs'

export function buildFcaEmbedSrc(reducedMotion = false) {
  const params = reducedMotion ? 'playsinline=1&rel=0' : 'autoplay=1&playsinline=1&rel=0'

  return `${EMBED_ORIGIN}/${VIDEO_ID}?${params}`
}

export const fcaEgg = {
  cycle: false,
  dismissOnEscape: true,
  hint: 'Camp still keeps a seat for every athlete.',
  id: FCA_ID,
  name: 'FCA',
  onActivate: (...args: [boolean?, (() => void)?]) => {
    mountFca(args[1])
  },
  onDismiss: unmountFca,
  persist: false,
  sequence: SEQUENCE,
  soundOff: 'close',
  soundOn: 'success',
} as const

let boundDialog: HTMLDialogElement | undefined
let dismissFca: (() => void) | undefined

function bindDialog(dialog: HTMLDialogElement) {
  if (boundDialog === dialog) {
    return
  }

  boundDialog = dialog
  bindDialogBackdropClose(dialog, () => {
    dialog.close()
  })
  dialog.addEventListener('close', onDialogClose)
}

function embedHost() {
  return document.querySelector<HTMLElement>(`[${EMBED_ATTR}]`)
}

function injectIframe() {
  const host = embedHost()

  if (!host || host.querySelector('iframe')) {
    return
  }

  const iframe = document.createElement('iframe')

  iframe.allow =
    'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
  iframe.allowFullscreen = true
  iframe.className = 'absolute inset-0 size-full border-0'
  iframe.dataset.testid = IFRAME_TEST_ID
  iframe.referrerPolicy = 'strict-origin-when-cross-origin'
  iframe.src = buildFcaEmbedSrc(isReducedMotionPreferred())
  iframe.tabIndex = -1
  iframe.title = EMBED_TITLE
  iframe.addEventListener(
    'load',
    () => {
      fcaDialog()?.focus({ preventScroll: true })
    },
    { once: true },
  )
  host.append(iframe)
}

function isReducedMotionPreferred() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function mountFca(dismiss?: () => void) {
  const dialog = fcaDialog()

  dismissFca = dismiss

  if (!dialog) {
    return
  }

  bindDialog(dialog)
  injectIframe()

  if (!dialog.open) {
    dialog.showModal()
  }

  dialog.focus({ preventScroll: true })
}

function onDialogClose() {
  removeIframe()
  dismissFca?.()
}

function removeIframe() {
  embedHost()?.querySelector('iframe')?.remove()
}

function fcaDialog() {
  return document.querySelector<HTMLDialogElement>(`[${DIALOG_ATTR}]`)
}

function unmountFca() {
  const dialog = fcaDialog()

  removeIframe()

  if (dialog?.open) {
    dialog.close()
  }
}

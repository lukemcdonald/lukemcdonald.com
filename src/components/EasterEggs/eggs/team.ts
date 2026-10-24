import { bindDialogBackdropClose } from '@/utils/dialog'

const DIALOG_ATTR = 'data-team-dialog'
const EMBED_ATTR = 'data-team-embed'
const EMBED_SRC = 'https://www.youtube-nocookie.com/embed/wM0if-w6PEs'
const EMBED_TITLE = 'FCA All Abilities camp at Camp Courageous'
const IFRAME_TEST_ID = 'team-egg-iframe'
const SEQUENCE = ['KeyT', 'KeyE', 'KeyA', 'KeyM'] as const
const TEAM_ID = 'team'

export const teamEgg = {
  cycle: false,
  dismissOnEscape: true,
  hint: 'Camp still keeps a seat for every athlete.',
  id: TEAM_ID,
  onActivate: (...args: [boolean?, (() => void)?]) => {
    mountTeam(args[1])
  },
  onDismiss: unmountTeam,
  persist: false,
  sequence: SEQUENCE,
  soundOff: 'close',
  soundOn: 'success',
} as const

let boundDialog: HTMLDialogElement | undefined
let dismissTeam: (() => void) | undefined

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
  iframe.src = EMBED_SRC
  iframe.title = EMBED_TITLE
  host.append(iframe)
}

function mountTeam(dismiss?: () => void) {
  const dialog = teamDialog()

  dismissTeam = dismiss

  if (!dialog) {
    return
  }

  bindDialog(dialog)
  injectIframe()

  if (!dialog.open) {
    dialog.showModal()
  }
}

function onDialogClose() {
  removeIframe()
  dismissTeam?.()
}

function removeIframe() {
  embedHost()?.querySelector('iframe')?.remove()
}

function teamDialog() {
  return document.querySelector<HTMLDialogElement>(`[${DIALOG_ATTR}]`)
}

function unmountTeam() {
  const dialog = teamDialog()

  removeIframe()

  if (dialog?.open) {
    dialog.close()
  }
}

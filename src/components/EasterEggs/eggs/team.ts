const DIALOG_ATTR = 'data-team-dialog'
const EMBED_ATTR = 'data-team-embed'
const EMBED_SRC = 'https://www.youtube-nocookie.com/embed/wM0if-w6PEs'
const EMBED_TITLE = 'FCA All Abilities camp at Camp Courageous'
const IFRAME_TEST_ID = 'team-egg-iframe'
const SEQUENCE = ['KeyT', 'KeyE', 'KeyA', 'KeyM'] as const
const TEAM_ID = 'team'

export const teamEgg = {
  dismissOnEscape: true,
  hint: 'Camp still keeps a seat for every athlete.',
  id: TEAM_ID,
  onActivate: mountTeam,
  onDismiss: unmountTeam,
  sequence: SEQUENCE,
  soundOff: 'close',
  soundOn: 'success',
} as const

let boundDialog: HTMLDialogElement | undefined
let pointerStartedOnDialog = false

function bindDialog(dialog: HTMLDialogElement) {
  if (boundDialog === dialog) {
    return
  }

  boundDialog = dialog
  dialog.addEventListener('click', onDialogClick)
  dialog.addEventListener('close', onDialogClose)
  dialog.addEventListener('pointerdown', onDialogPointerDown)
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

function isDialogTarget(event: Event) {
  return event.target === teamDialog()
}

function isTeamActive() {
  return document.documentElement.getAttribute('data-easter-egg') === TEAM_ID
}

function mountTeam() {
  const dialog = teamDialog()

  if (!dialog) {
    return
  }

  bindDialog(dialog)
  injectIframe()

  if (!dialog.open) {
    dialog.showModal()
  }
}

function onDialogClick(event: MouseEvent) {
  if (pointerStartedOnDialog && isDialogTarget(event)) {
    teamDialog()?.close()
  }
}

function onDialogClose() {
  removeIframe()

  if (!isTeamActive()) {
    return
  }

  void import('../easter-eggs').then(({ toggleEasterEgg }) => {
    toggleEasterEgg(TEAM_ID)
  })
}

function onDialogPointerDown(event: PointerEvent) {
  pointerStartedOnDialog = isDialogTarget(event)
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

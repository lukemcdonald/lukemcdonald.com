import { isIgnoredEggKey } from './keys'

const queued: string[] = []

let loading: Promise<void> | undefined
let ready = false

function loadEggs() {
  loading ??= import('./easter-eggs').then(({ applyEasterEggCode, initializeEasterEggs }) => {
    const buffered = queued.splice(0)

    initializeEasterEggs()
    ready = true

    for (const code of buffered) {
      applyEasterEggCode(code)
    }
  })

  return loading
}

function onKeydown(event: KeyboardEvent) {
  if (ready) {
    return
  }

  void loadEggs()

  if (event.key === 'Escape' || isIgnoredEggKey(event)) {
    return
  }

  queued.push(event.code)
}

document.addEventListener('keydown', onKeydown)

if (document.documentElement.getAttribute('data-easter-egg')) {
  void loadEggs()
}

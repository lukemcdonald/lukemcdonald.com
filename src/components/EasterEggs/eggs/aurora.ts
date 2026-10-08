const FIREFLY_ATTR = 'data-aurora-firefly'

const FIREFLIES = [
  { blink: '3.1s', delay: '0s', drift: '11s', left: '12%', path: 'a', top: '86%' },
  { blink: '2.4s', delay: '0.6s', drift: '13s', left: '28%', path: 'b', top: '93%' },
  { blink: '3.8s', delay: '1.4s', drift: '9s', left: '47%', path: 'c', top: '95%' },
  { blink: '2.7s', delay: '0.3s', drift: '14s', left: '63%', path: 'a', top: '88%' },
  { blink: '3.4s', delay: '1.1s', drift: '10s', left: '81%', path: 'b', top: '91%' },
] as const

const KONAMI_SEQUENCE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'KeyB',
  'KeyA',
] as const

export const auroraEgg = {
  id: 'aurora',
  onActivate: mountAuroraFireflies,
  onDismiss: unmountAuroraFireflies,
  sequence: KONAMI_SEQUENCE,
  soundOff: 'close',
  soundOn: 'success',
} as const

function mountAuroraFireflies() {
  if (document.querySelector(`[${FIREFLY_ATTR}]`)) {
    return
  }

  for (const firefly of FIREFLIES) {
    const node = document.createElement('span')

    node.setAttribute(FIREFLY_ATTR, firefly.path)
    node.setAttribute('aria-hidden', 'true')
    node.style.left = firefly.left
    node.style.setProperty('--aurora-firefly-blink', firefly.blink)
    node.style.setProperty('--aurora-firefly-delay', firefly.delay)
    node.style.setProperty('--aurora-firefly-drift', firefly.drift)
    node.style.top = firefly.top
    document.body.append(node)
  }
}

function unmountAuroraFireflies() {
  document.querySelectorAll(`[${FIREFLY_ATTR}]`).forEach((node) => {
    node.remove()
  })
}

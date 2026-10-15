const LAMP_ATTR = 'data-lamp-verse'
const POS_VAR = '--lamp-pos'
const TEMPLATE_ATTR = 'data-lamp-template'

export const lampEgg = {
  dismissOnEscape: true,
  id: 'lamp',
  onActivate: mountLamp,
  onDismiss: unmountLamp,
  sequence: ['KeyL'],
  soundOff: 'close',
  soundOn: 'success',
} as const

let listening = false

export function lampPos(x: number, y: number) {
  return `${x}px ${y}px`
}

function bindPointer() {
  if (listening) {
    return
  }

  listening = true
  document.addEventListener('pointerdown', onPointer)
  document.addEventListener('pointermove', onPointer)
}

function lampRoot() {
  return document.documentElement
}

function mountLamp() {
  mountVerse()
  bindPointer()
}

function mountVerse() {
  if (document.querySelector(`[${LAMP_ATTR}]`)) {
    return
  }

  const template = document.querySelector<HTMLTemplateElement>(`[${TEMPLATE_ATTR}]`)
  const node = template?.content.firstElementChild?.cloneNode(true)

  if (!(node instanceof HTMLElement)) {
    return
  }

  document.body.append(node)
}

function onPointer(event: PointerEvent) {
  if (prefersReducedMotion()) {
    return
  }

  lampRoot().style.setProperty(POS_VAR, lampPos(event.clientX, event.clientY))
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function unbindPointer() {
  if (!listening) {
    return
  }

  listening = false
  document.removeEventListener('pointerdown', onPointer)
  document.removeEventListener('pointermove', onPointer)
}

function unmountLamp() {
  unbindPointer()
  lampRoot().style.removeProperty(POS_VAR)
  document.querySelectorAll(`[${LAMP_ATTR}]`).forEach((node) => {
    node.remove()
  })
}

import type { Verse } from '@/features/verse/verse.types'

import { FALLBACK_VERSE, VERSE_ENDPOINT } from '@/features/verse/verse.constants'
import { isVerse } from '@/features/verse/verse.utils'

const LAMP_ATTR = 'data-lamp'
const POS_VAR = '--lamp-pos'
const SEQUENCE = ['KeyS', 'KeyE', 'KeyL', 'KeyA', 'KeyH'] as const
const TEMPLATE_ATTR = 'data-lamp-template'

export const lampEgg = {
  dismissOnEscape: true,
  hint: 'A verse waits in the dark.',
  id: 'lamp',
  onActivate: mountLamp,
  onDismiss: unmountLamp,
  sequence: SEQUENCE,
  soundOff: 'close',
  soundOn: 'success',
} as const

let listening = false

export function applyLampVerse(root: HTMLElement, verse: Verse) {
  const holder = root.querySelector('[data-lamp-verse]')
  const reference = holder?.querySelector('cite')
  const text = holder?.querySelector('p')

  holder?.removeAttribute('aria-busy')

  if (reference) {
    reference.textContent = verse.reference
  }

  if (text) {
    text.textContent = verse.text
  }
}

export function formatLampPosition(x: number, y: number) {
  return `${x}px ${y}px`
}

export async function loadLampVerse(fetchFn: typeof fetch = globalThis.fetch): Promise<Verse> {
  try {
    const response = await fetchFn(VERSE_ENDPOINT)

    if (!response.ok) {
      return FALLBACK_VERSE
    }

    const payload: unknown = await response.json()

    if (!isVerse(payload)) {
      return FALLBACK_VERSE
    }

    return payload
  } catch {
    return FALLBACK_VERSE
  }
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
  return document.querySelector<HTMLElement>(`[${LAMP_ATTR}]`)
}

async function mountLamp() {
  const { loadEggStyles } = await import('../load-egg-styles')

  await loadEggStyles('aurora')

  const root = mountVerse()

  if (root) {
    void loadLampVerse().then((verse) => {
      applyLampVerse(root, verse)
    })
  }

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

  return node
}

function onPointer(event: PointerEvent) {
  lampRoot()?.style.setProperty(POS_VAR, formatLampPosition(event.clientX, event.clientY))
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
  document.querySelectorAll(`[${LAMP_ATTR}]`).forEach((node) => {
    node.remove()
  })
}

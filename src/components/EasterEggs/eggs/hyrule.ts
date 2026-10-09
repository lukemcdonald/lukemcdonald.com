import { getSoundPreference } from '@/components/Sound/utils'
import { SOUND_CONFIG } from '@/configs/sound'

const CREST_MARKUP =
  '<svg aria-hidden="true" viewBox="0 0 20 24"><polygon points="10,0 18,8 2,8"/><polygon points="10,7 18,15 2,15"/><polygon points="10,14 18,22 2,22"/></svg>'
const FILTER_MARKUP =
  '<svg aria-hidden="true" height="0" width="0"><filter id="hyrule-pixel" x="0" y="0" width="100%" height="100%"><feFlood x="2" y="2" height="1" width="1"/><feComposite width="4" height="4"/><feTile result="a"/><feComposite in="SourceGraphic" in2="a" operator="in"/><feMorphology operator="dilate" radius="2"/></filter></svg>'
const HEART_MARKUP =
  '<svg aria-hidden="true" shape-rendering="crispEdges" viewBox="0 0 9 8"><path d="M1 1h2v1h1v1h1V2h1V1h2v1h1v2H8v1H7v1H6v1H5v1H4V6H3V5H2V4H1V3H0V2h1z"/></svg>'
const JINGLE = [
  { delay: 0, duration: 0.12, frequency: 415.3 },
  { delay: 90, duration: 0.12, frequency: 523.25 },
  { delay: 180, duration: 0.14, frequency: 659.25 },
  { delay: 280, duration: 0.28, frequency: 830.61 },
] as const
const MELODY = ['ArrowLeft', 'ArrowDown', 'KeyA', 'ArrowRight', 'ArrowUp', 'ArrowRight'] as const

export const hyruleEgg = {
  id: 'hyrule',
  onActivate: mountHyrule,
  onDismiss: unmountHyrule,
  onInit: logHint,
  sequence: MELODY,
} as const

let audioCtx: AudioContext | undefined
let hinted = false
let listening = false

function audioContext() {
  audioCtx ??= new AudioContext()

  return audioCtx
}

function bindSlash() {
  if (listening) {
    return
  }

  listening = true
  document.addEventListener('pointerdown', onPointerDown)
}

function canPlaySound() {
  return SOUND_CONFIG.enableSounds && getSoundPreference() === 'on'
}

function logHint() {
  if (hinted) {
    return
  }

  hinted = true
  // Discovery hint for this decorative egg; keep it quiet and original.
  // eslint-disable-next-line no-console -- intentional easter-egg hint
  console.info('%cA little song still sleeps in the keys.', 'color:#3f6b46')
}

function mountHud() {
  if (document.querySelector('[data-hyrule-hud]')) {
    return
  }

  const hud = document.createElement('div')

  hud.dataset.hyruleHud = ''
  hud.innerHTML = `${FILTER_MARKUP}<div data-hyrule-hearts>${HEART_MARKUP}${HEART_MARKUP}${HEART_MARKUP}</div><div data-hyrule-crest>${CREST_MARKUP}</div>`
  hud.setAttribute('aria-hidden', 'true')
  document.body.append(hud)
}

function mountHyrule(silent = false) {
  mountHud()
  bindSlash()

  if (!silent) {
    playJingle()
  }
}

function onPointerDown(event: PointerEvent) {
  if (event.button !== 0 || prefersReducedMotion()) {
    return
  }

  slashAt(event.clientX, event.clientY)
}

function playJingle() {
  for (const note of JINGLE) {
    window.setTimeout(() => {
      playTone(note.frequency, note.duration)
    }, note.delay)
  }
}

function playTone(frequency: number, duration: number) {
  if (!canPlaySound()) {
    return
  }

  const ctx = audioContext()
  const gain = ctx.createGain()
  const now = ctx.currentTime
  const oscillator = ctx.createOscillator()

  void ctx.resume()
  oscillator.type = 'triangle'
  oscillator.frequency.value = frequency
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(0.07, now + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)
  oscillator.connect(gain)
  gain.connect(ctx.destination)
  oscillator.start(now)
  oscillator.stop(now + duration)
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function slashAt(x: number, y: number) {
  const slash = document.createElement('span')

  slash.dataset.hyruleSlash = ''
  slash.setAttribute('aria-hidden', 'true')
  slash.style.left = `${x}px`
  slash.style.top = `${y}px`
  slash.addEventListener('animationend', () => slash.remove(), { once: true })
  document.body.append(slash)
}

function unbindSlash() {
  if (!listening) {
    return
  }

  listening = false
  document.removeEventListener('pointerdown', onPointerDown)
}

function unmountHyrule() {
  unbindSlash()
  document.querySelectorAll('[data-hyrule-hud], [data-hyrule-slash]').forEach((node) => {
    node.remove()
  })
}

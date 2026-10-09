import { getSoundPreference } from '@/components/Sound/utils'
import { SOUND_CONFIG } from '@/configs/sound'

const BLADE_COUNT = 40
const BLADE_MARKUP =
  '<svg aria-hidden="true" viewBox="0 0 8 32"><path d="M4 32C1.8 21 1.2 11 4 0C6.8 11 6.2 21 4 32"/></svg>'
const GROW_MS = 8000
const NOTES: Record<string, number> = {
  ArrowDown: 440,
  ArrowLeft: 392,
  ArrowRight: 587.33,
  ArrowUp: 659.25,
  KeyA: 523.25,
}
const RUPEE_CHANCE = 0.2
const RUPEE_KEY = 'ocarina:rupees'
const RUPEE_MARKUP =
  '<svg aria-hidden="true" viewBox="0 0 16 22"><polygon points="8,1 15,7.5 8,21 1,7.5"/><polygon fill="white" opacity="0.32" points="8,1 12,7.5 8,11 4,7.5"/></svg>'
const SLASH_RADIUS = 44

const MELODY = ['ArrowLeft', 'ArrowDown', 'KeyA', 'ArrowRight', 'ArrowUp', 'ArrowRight'] as const

export const ocarinaEgg = {
  id: 'ocarina',
  onActivate: mountOcarina,
  onDismiss: unmountOcarina,
  onInit: logHint,
  onKey: playOcarinaNote,
  sequence: MELODY,
} as const

let audioCtx: AudioContext | undefined
let dragging = false
let hinted = false
let listening = false
let resizeTimer: ReturnType<typeof setTimeout> | undefined
let rupeeCount = 0

function audioContext() {
  audioCtx ??= new AudioContext()

  return audioCtx
}

function bindScene() {
  if (listening) {
    return
  }

  listening = true
  document.addEventListener('pointerdown', onPointerDown)
  document.addEventListener('pointermove', onPointerMove)
  document.addEventListener('pointerup', onPointerUp)
  window.addEventListener('resize', remountMeadows)
}

function canPlaySound() {
  return SOUND_CONFIG.enableSounds && getSoundPreference() === 'on'
}

function createBlade() {
  const blade = document.createElement('span')

  blade.dataset.ocarinaBlade = ''
  blade.innerHTML = BLADE_MARKUP
  blade.style.bottom = `${rand(0, 16)}%`
  blade.style.height = `${rand(34, 78)}%`
  blade.style.left = `${rand(3, 95)}%`
  blade.style.rotate = `${rand(-20, 20)}deg`
  blade.style.setProperty('--blade-tone', rand(0.28, 0.82).toFixed(2))
  blade.style.width = `${rand(7, 13)}px`

  return blade
}

function createMeadow(grass: Element) {
  const meadow = document.createElement('div')

  meadow.dataset.ocarinaMeadow = ''
  meadow.setAttribute('aria-hidden', 'true')
  placeMeadow(meadow, grass)

  for (let index = 0; index < BLADE_COUNT; index += 1) {
    meadow.append(createBlade())
  }

  return meadow
}

function createRupee(x: number, y: number) {
  const rupee = document.createElement('span')

  rupee.dataset.ocarinaRupee = ''
  rupee.innerHTML = RUPEE_MARKUP
  rupee.setAttribute('aria-hidden', 'true')
  rupee.style.left = `${x}px`
  rupee.style.top = `${y}px`

  return rupee
}

function cutBlade(blade: HTMLElement, x: number, y: number) {
  blade.dataset.cut = ''
  blade.style.setProperty('--fall-rot', `${rand(-60, 60)}deg`)
  blade.style.setProperty('--fall-x', `${rand(-28, 28)}px`)
  window.setTimeout(() => growBlade(blade), GROW_MS)

  if (Math.random() < RUPEE_CHANCE) {
    spawnRupee(x, y)
  }
}

function distance(blade: HTMLElement, x: number, y: number) {
  const box = blade.getBoundingClientRect()
  const dx = x - (box.left + box.width / 2)
  const dy = y - (box.top + box.height / 2)

  return Math.hypot(dx, dy)
}

function growBlade(blade: HTMLElement) {
  if (!blade.isConnected) {
    return
  }

  delete blade.dataset.cut
  blade.dataset.growing = ''
  blade.style.removeProperty('--fall-rot')
  blade.style.removeProperty('--fall-x')
  window.setTimeout(() => {
    delete blade.dataset.growing
  }, 480)
}

function incrementRupees() {
  rupeeCount += 1
  writeRupeeCount(rupeeCount)
  updateCounter()
}

function isInside(start: number, end: number, value: number) {
  return value >= start && value <= end
}

function isInteractiveHit(target: Element) {
  return Boolean(target.closest('.site, a, button, input, textarea, select'))
}

function isSlashTarget(event: PointerEvent) {
  if (!(event.target instanceof Element)) {
    return false
  }

  if (event.target.closest('[data-ocarina-blade]')) {
    return true
  }

  if (isInteractiveHit(event.target)) {
    return false
  }

  return meadowContains(event.clientX, event.clientY)
}

function meadowContains(x: number, y: number) {
  for (const meadow of document.querySelectorAll('[data-ocarina-meadow]')) {
    if (pointInBox(meadow.getBoundingClientRect(), x, y)) {
      return true
    }
  }

  return false
}

function pointInBox(box: DOMRectReadOnly, x: number, y: number) {
  if (!isInside(box.left, box.right, x)) {
    return false
  }

  return isInside(box.top, box.bottom, y)
}

function logHint() {
  if (hinted) {
    return
  }

  hinted = true
  // Discovery hint for this decorative egg; keep it quiet and original.
  // eslint-disable-next-line no-console -- intentional easter-egg hint
  console.info('%cA little song still sleeps in the grass.', 'color:#4d7a57')
}

function mountCounter() {
  if (document.querySelector('[data-ocarina-wallet]')) {
    return
  }

  rupeeCount = readRupeeCount()

  const wallet = document.createElement('div')

  wallet.dataset.ocarinaWallet = ''
  wallet.innerHTML = `${RUPEE_MARKUP}<span data-ocarina-count></span>`
  wallet.setAttribute('aria-hidden', 'true')
  document.body.append(wallet)
  updateCounter()
}

/** Grass art is one compound path in an img, so cutting uses overlay blades. */
function mountMeadows() {
  if (document.querySelector('[data-ocarina-meadow]')) {
    return
  }

  for (const grass of document.querySelectorAll('[data-grass] img')) {
    if (grass.getClientRects().length === 0) {
      continue
    }

    document.body.append(createMeadow(grass))
  }
}

function mountOcarina() {
  mountMeadows()
  mountCounter()
  bindScene()
}

function onPointerDown(event: PointerEvent) {
  if (!isSlashTarget(event)) {
    return
  }

  dragging = true
  slashAt(event.clientX, event.clientY)
}

function onPointerMove(event: PointerEvent) {
  if (!dragging) {
    return
  }

  slashAt(event.clientX, event.clientY)
}

function onPointerUp() {
  dragging = false
}

function placeMeadow(meadow: HTMLElement, grass: Element) {
  const box = grass.getBoundingClientRect()

  meadow.style.height = `${box.height}px`
  meadow.style.left = `${box.left}px`
  meadow.style.top = `${box.top}px`
  meadow.style.width = `${box.width}px`
}

function playOcarinaNote(code: string) {
  const frequency = NOTES[code]

  if (!frequency) {
    return
  }

  playTone(frequency)
}

function playRupeeChime() {
  playTone(784, 0.14)
  window.setTimeout(() => {
    playTone(1175, 0.18)
  }, 88)
}

function playTone(frequency: number, duration = 0.3) {
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
  gain.gain.exponentialRampToValueAtTime(0.06, now + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)
  oscillator.connect(gain)
  gain.connect(ctx.destination)
  oscillator.start(now)
  oscillator.stop(now + duration)
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function parseRupeeCount(stored: string | null) {
  const count = Number.parseInt(stored ?? '0', 10)

  if (!Number.isFinite(count) || count < 1) {
    return 0
  }

  return count
}

function readRupeeCount() {
  try {
    return parseRupeeCount(localStorage.getItem(RUPEE_KEY))
  } catch {
    return 0
  }
}

function remountMeadows() {
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => {
    removeMeadows()
    mountMeadows()
  }, 140)
}

function removeMeadows() {
  document.querySelectorAll('[data-ocarina-meadow]').forEach((node) => {
    node.remove()
  })
}

function slashAt(x: number, y: number) {
  for (const node of document.querySelectorAll('[data-ocarina-blade]:not([data-cut])')) {
    if (!(node instanceof HTMLElement)) {
      continue
    }

    if (distance(node, x, y) > SLASH_RADIUS) {
      continue
    }

    cutBlade(node, x, y)
  }
}

function spawnRupee(x: number, y: number) {
  const rupee = createRupee(x, y)

  document.body.append(rupee)
  incrementRupees()
  playRupeeChime()
  window.setTimeout(() => rupee.remove(), 900)
}

function unbindScene() {
  if (!listening) {
    return
  }

  listening = false
  dragging = false
  clearTimeout(resizeTimer)
  document.removeEventListener('pointerdown', onPointerDown)
  document.removeEventListener('pointermove', onPointerMove)
  document.removeEventListener('pointerup', onPointerUp)
  window.removeEventListener('resize', remountMeadows)
}

function unmountOcarina() {
  unbindScene()
  removeMeadows()
  document.querySelectorAll('[data-ocarina-wallet], [data-ocarina-rupee]').forEach((node) => {
    node.remove()
  })
}

function updateCounter() {
  const count = document.querySelector('[data-ocarina-count]')

  if (count) {
    count.textContent = String(rupeeCount)
  }
}

function writeRupeeCount(count: number) {
  try {
    localStorage.setItem(RUPEE_KEY, String(count))
  } catch {
    return
  }
}

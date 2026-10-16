import { FONT_PAIRING_CSS_SCRIPT_ID, FONT_PAIRINGS } from './pairings'

export function buildFontPairingStyleId(pairing: string) {
  return `font-pairing-${pairing}`
}

export function loadAllFontPairings() {
  const cssByPairing = readPairingFontCss()

  for (const pairing of FONT_PAIRINGS.toSorted()) {
    injectFontPairingCss(pairing, cssByPairing[pairing] ?? '')
  }
}

export function loadFontPairing(pairing: string) {
  injectFontPairingCss(pairing, readPairingFontCss()[pairing] ?? '')
}

function injectFontPairingCss(pairing: string, css: string) {
  const id = buildFontPairingStyleId(pairing)

  if (!css || document.getElementById(id)) {
    return
  }

  const style = document.createElement('style')

  style.id = id
  style.textContent = css
  document.head.append(style)
}

function readPairingFontCss(): Record<string, string> {
  const node = document.getElementById(FONT_PAIRING_CSS_SCRIPT_ID)

  if (!node?.textContent) {
    return {}
  }

  try {
    const parsed: unknown = JSON.parse(node.textContent)

    if (!parsed || typeof parsed !== 'object') {
      return {}
    }

    return Object.fromEntries(
      Object.entries(parsed).filter((entry): entry is [string, string] => {
        return typeof entry[1] === 'string'
      }),
    )
  } catch {
    return {}
  }
}

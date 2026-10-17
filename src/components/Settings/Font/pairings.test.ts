import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import {
  FONT_PAIRING_CONFIGS,
  FONT_PAIRING_HEADING_SELECTOR,
  fontPairingCss,
  fontPairingFacesCss,
  pairingFamilyCssVariables,
} from './pairings.ts'

function pairingConfig(id: string) {
  const pairing = FONT_PAIRING_CONFIGS.find((item) => item.id === id)

  assert.ok(pairing)

  return pairing
}

describe('FONT_PAIRING_HEADING_SELECTOR', () => {
  test('keeps pairing heading weight off eyebrow labels', () => {
    assert.equal(FONT_PAIRING_HEADING_SELECTOR, ':is(h1, h2, h3, h4, h5, h6):not(.eyebrow)')
  })
})

describe('fontPairingCss', () => {
  test('maps heading, sans, and UI tokens on every pairing', () => {
    const css = fontPairingCss()

    for (const pairing of FONT_PAIRING_CONFIGS) {
      assert.match(css, new RegExp(`\\[data-font='${pairing.id}'\\]`))
      assert.match(css, new RegExp(`--font-heading: var\\(${pairing.heading.cssVariable}\\)`))
      assert.match(css, new RegExp(`--font-sans: var\\(${pairing.body.cssVariable}\\)`))
      assert.match(css, new RegExp(`--font-ui: var\\(${pairing.nav.cssVariable}\\)`))
    }
  })

  test('keeps heading weight declarations off eyebrow labels', () => {
    const css = fontPairingCss()

    for (const pairing of FONT_PAIRING_CONFIGS) {
      assert.ok(css.includes(`[data-font='${pairing.id}'] ${FONT_PAIRING_HEADING_SELECTOR}`))
    }

    assert.doesNotMatch(css, /:is\(h1, h2, h3, h4, h5, h6\) \{/)
  })
})

describe('fontPairingFacesCss', () => {
  test('maps each pairing to concatenated family css with sorted keys', () => {
    assert.deepEqual(
      fontPairingFacesCss((cssVariable) => {
        return `${cssVariable};`
      }),
      {
        live: '--font-lora;--font-source-sans-3;',
        play: '--font-fredoka;--font-nunito;',
        work: '--font-ibm-plex-sans;--font-space-grotesk;',
      },
    )
  })
})

describe('pairingFamilyCssVariables', () => {
  test('returns unique css variables in alphabetical order', () => {
    assert.deepEqual(pairingFamilyCssVariables(pairingConfig('work')), [
      '--font-ibm-plex-sans',
      '--font-space-grotesk',
    ])
  })
})

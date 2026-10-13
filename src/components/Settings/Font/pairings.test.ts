import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import {
  FONT_PAIRING_CONFIGS,
  FONT_PAIRINGS,
  FONT_SOURCE_FAMILIES,
  fontPairingCss,
} from './pairings.ts'

describe('FONT_PAIRINGS', () => {
  test('lists Work, Play, then Live', () => {
    assert.deepEqual(FONT_PAIRINGS, ['work', 'play', 'live'])
  })

  test('keeps id, label, heading, body, and nav on each pairing', () => {
    for (const pairing of FONT_PAIRING_CONFIGS) {
      assert.equal(typeof pairing.id, 'string')
      assert.equal(typeof pairing.label, 'string')
      assert.equal(typeof pairing.heading.name, 'string')
      assert.equal(typeof pairing.body.name, 'string')
      assert.equal(typeof pairing.nav.name, 'string')
      assert.equal(typeof pairing.heading.cssVariable, 'string')
      assert.equal(typeof pairing.body.cssVariable, 'string')
      assert.equal(typeof pairing.nav.cssVariable, 'string')
    }
  })
})

describe('FONT_SOURCE_FAMILIES', () => {
  test('dedupes families and sorts by css variable', () => {
    const cssVariables = FONT_SOURCE_FAMILIES.map((family) => family.cssVariable)

    assert.deepEqual(cssVariables, [...cssVariables].toSorted())
    assert.equal(new Set(cssVariables).size, cssVariables.length)
  })
})

describe('fontPairingCss', () => {
  test('emits heading, body, and nav variables for each pairing', () => {
    const css = fontPairingCss()

    for (const pairing of FONT_PAIRING_CONFIGS) {
      assert.match(css, new RegExp(`\\[data-font='${pairing.id}'\\]`))
      assert.match(css, new RegExp(`--font-heading: var\\(${pairing.heading.cssVariable}\\)`))
      assert.match(css, new RegExp(`--font-sans: var\\(${pairing.body.cssVariable}\\)`))
      assert.match(css, new RegExp(`--font-ui: var\\(${pairing.nav.cssVariable}\\)`))
    }
  })
})

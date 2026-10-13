import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { FONT_PAIRINGS, fontPairingCss } from './pairings.ts'

describe('fontPairingCss', () => {
  test('emits a document and preview rule for each pairing', () => {
    const css = fontPairingCss()

    for (const pairing of FONT_PAIRINGS) {
      assert.match(css, new RegExp(`\\[data-font='${pairing}'\\]`))
      assert.match(css, new RegExp(`\\[data-font-preview='${pairing}'\\]`))
    }
  })
})

import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { FONT_PAIRING_CONFIGS, fontPairingFacesCss, pairingFamilyCssVariables } from './pairings.ts'

function pairingConfig(id: string) {
  const pairing = FONT_PAIRING_CONFIGS.find((item) => item.id === id)

  assert.ok(pairing)

  return pairing
}

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

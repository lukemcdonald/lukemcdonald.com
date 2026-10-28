import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { formatSoundToggleLabel } from './sound.ts'
import { initializeSound, playSound } from './utils.ts'

describe('formatSoundToggleLabel', () => {
  test('describes the next action and current state', () => {
    assert.deepEqual(formatSoundToggleLabel(false), {
      label: 'Sounds off',
      pressed: 'false',
      toggle: 'Enable interaction sounds',
    })
    assert.deepEqual(formatSoundToggleLabel(true), {
      label: 'Sounds on',
      pressed: 'true',
      toggle: 'Disable interaction sounds',
    })
  })
})

describe('initializeSound', () => {
  test('no-ops without a window', () => {
    assert.doesNotThrow(() => {
      initializeSound()
    })
  })
})

describe('playSound', () => {
  test('no-ops without a window', () => {
    assert.doesNotThrow(() => {
      playSound('open')
    })
  })
})

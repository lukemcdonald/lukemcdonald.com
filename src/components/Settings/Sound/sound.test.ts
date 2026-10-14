import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { getSoundToggleCopy } from './sound.ts'
import { playSound } from './utils.ts'

describe('getSoundToggleCopy', () => {
  test('describes the next action and current state', () => {
    assert.deepEqual(getSoundToggleCopy(false), {
      label: 'Sounds off',
      pressed: 'false',
      toggle: 'Enable interaction sounds',
    })
    assert.deepEqual(getSoundToggleCopy(true), {
      label: 'Sounds on',
      pressed: 'true',
      toggle: 'Disable interaction sounds',
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

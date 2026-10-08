import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { EASTER_EGG_DURATION_MS, EASTER_EGG_DURATION_REDUCED_MS } from './constants.ts'
import {
  eggDurationMs,
  eggSoundName,
  shouldPersistEgg,
  shouldReplaceActiveEgg,
  shouldScheduleHide,
} from './lifecycle.ts'

describe('eggDurationMs', () => {
  test('uses the reduced duration when motion is reduced', () => {
    assert.equal(eggDurationMs(9000, true), EASTER_EGG_DURATION_REDUCED_MS)
  })

  test('uses the egg duration, then the default', () => {
    assert.equal(eggDurationMs(9000, false), 9000)
    assert.equal(eggDurationMs(undefined, false), EASTER_EGG_DURATION_MS)
  })
})

describe('eggSoundName', () => {
  test('skips sound while silent or unset', () => {
    assert.equal(eggSoundName(true, 'success'), undefined)
    assert.equal(eggSoundName(false, undefined), undefined)
  })

  test('returns the sound when the user triggered the change', () => {
    assert.equal(eggSoundName(false, 'close'), 'close')
  })
})

describe('egg lifecycle flags', () => {
  test('persists toggle eggs and hides timed eggs', () => {
    assert.equal(shouldPersistEgg('toggle'), true)
    assert.equal(shouldPersistEgg('timed'), false)
    assert.equal(shouldScheduleHide('timed'), true)
    assert.equal(shouldScheduleHide('toggle'), false)
  })

  test('replaces only when a different egg is already active', () => {
    assert.equal(shouldReplaceActiveEgg(undefined, 'aurora'), false)
    assert.equal(shouldReplaceActiveEgg('aurora', 'aurora'), false)
    assert.equal(shouldReplaceActiveEgg('aurora', 'burst'), true)
  })
})

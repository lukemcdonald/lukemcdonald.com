import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { lampEgg, lampPos } from './lamp.ts'

describe('lampEgg', () => {
  test('is cycle-only and dismisses on escape', () => {
    assert.equal(lampEgg.dismissOnEscape, true)
    assert.equal(lampEgg.id, 'lamp')
    assert.deepEqual(lampEgg.sequence, [])
  })
})

describe('lampPos', () => {
  test('formats the pointer as one CSS value', () => {
    assert.equal(lampPos(12, 40), '12px 40px')
  })
})

import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { BADGE_CLASS } from './badge.ts'

describe('BADGE_CLASS', () => {
  test('keeps the original error badge classes', () => {
    assert.equal(
      BADGE_CLASS,
      'px-1 py-px font-sans text-sm font-medium uppercase rounded-xs text-primary-900 bg-primary-500',
    )
  })
})

import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { wrapIndex } from './wrap-index.ts'

describe('wrapIndex', () => {
  test('starts at an end when nothing is active', () => {
    assert.equal(wrapIndex(-1, 1, 3), 0)
    assert.equal(wrapIndex(-1, -1, 3), 2)
  })

  test('wraps within the list', () => {
    assert.equal(wrapIndex(0, -1, 3), 2)
    assert.equal(wrapIndex(2, 1, 3), 0)
    assert.equal(wrapIndex(1, 1, 3), 2)
  })

  test('returns -1 for an empty list', () => {
    assert.equal(wrapIndex(0, 1, 0), -1)
  })
})

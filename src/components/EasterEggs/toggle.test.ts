import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { resolveEggActivation } from './toggle.ts'

describe('resolveEggActivation', () => {
  test('activates when nothing is playing', () => {
    assert.equal(resolveEggActivation(undefined, { id: 'aurora', mode: 'toggle' }), 'activate')
    assert.equal(resolveEggActivation(undefined, { id: 'burst', mode: 'timed' }), 'activate')
  })

  test('toggles the same persistent egg off', () => {
    assert.equal(resolveEggActivation('aurora', { id: 'aurora', mode: 'toggle' }), 'deactivate')
  })

  test('restarts a timed egg that is already playing', () => {
    assert.equal(resolveEggActivation('burst', { id: 'burst', mode: 'timed' }), 'activate')
  })

  test('replaces a different active egg', () => {
    assert.equal(resolveEggActivation('aurora', { id: 'burst', mode: 'timed' }), 'replace')
    assert.equal(resolveEggActivation('burst', { id: 'aurora', mode: 'toggle' }), 'replace')
  })
})

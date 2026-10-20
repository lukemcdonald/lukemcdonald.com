import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { EASTER_EGG_IDS, getEasterEggCatalog } from './easter-eggs.ts'

describe('getEasterEggCatalog', () => {
  test('returns names and hints without codes', () => {
    const catalog = getEasterEggCatalog()

    assert.deepEqual(
      catalog.map((secret) => secret.id),
      [...EASTER_EGG_IDS],
    )
    assert.equal(
      catalog.every((secret) => !('sequence' in secret)),
      true,
    )
    assert.equal(
      catalog.some((secret) => secret.hint.length === 0),
      false,
    )
  })
})

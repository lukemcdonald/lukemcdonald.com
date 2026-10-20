import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { getEasterEggCatalog } from './easter-eggs.ts'
import { auroraEgg } from './eggs/aurora.ts'
import { hyruleEgg } from './eggs/hyrule.ts'
import { lampEgg } from './eggs/lamp.ts'

const SOLUTION_LEAKS = [
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'KeyA',
  'KeyB',
  'konami',
  'sequence',
]

describe('getEasterEggCatalog', () => {
  test('returns names and hints without codes or solutions', () => {
    const catalog = getEasterEggCatalog()
    const serialized = JSON.stringify(catalog)

    assert.deepEqual(
      catalog.map((secret) => secret.id),
      ['aurora', 'hyrule', 'lamp'],
    )
    assert.equal(
      catalog.every((secret) => !('sequence' in secret)),
      true,
    )
    assert.equal(
      catalog.some((secret) => secret.hint.length === 0),
      false,
    )

    const leaked = SOLUTION_LEAKS.filter((token) =>
      serialized.toLowerCase().includes(token.toLowerCase()),
    )

    assert.deepEqual(leaked, [])
  })
})

describe('easter egg sequences', () => {
  test('stay on the egg modules, not the catalog', () => {
    assert.notEqual(auroraEgg.sequence.length, 0)
    assert.notEqual(hyruleEgg.sequence.length, 0)
    assert.deepEqual(lampEgg.sequence, [])
  })
})

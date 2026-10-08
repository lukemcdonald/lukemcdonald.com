import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { GRASS_IDS, pickGrassId } from './utils.ts'

describe('pickGrassId', () => {
  test('returns a defined id from the grass set', () => {
    for (let i = 0; i < 50; i++) {
      const id = pickGrassId()

      assert.equal(typeof id, 'string')
      assert.equal(GRASS_IDS.includes(id), true)
    }
  })

  test('never returns undefined or the excluded id', () => {
    for (const excludeId of GRASS_IDS) {
      for (let i = 0; i < 50; i++) {
        const id = pickGrassId({ excludeId })

        assert.notEqual(id, undefined)
        assert.notEqual(id, excludeId)
        assert.equal(GRASS_IDS.includes(id), true)
      }
    }
  })

  test('indexes into the filtered pool so the last slot is valid', () => {
    const id = pickGrassId({
      excludeId: '1',
      random: () => 0.999,
    })

    assert.equal(id, '4')
  })

  test('uses the first remaining id when random is zero', () => {
    const id = pickGrassId({
      excludeId: '1',
      random: () => 0,
    })

    assert.equal(id, '2')
  })
})

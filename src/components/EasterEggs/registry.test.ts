import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { EASTER_EGG_CONFIG } from './config.ts'
import { auroraEgg, KONAMI_SEQUENCE } from './eggs/aurora/index.ts'
import { EASTER_EGGS } from './registry.ts'

describe('easter egg registry', () => {
  test('registers aurora as a toggle egg on the Konami sequence', () => {
    assert.equal(EASTER_EGGS.includes(auroraEgg), true)
    assert.equal(auroraEgg.id, 'aurora')
    assert.equal(auroraEgg.mode, 'toggle')
    assert.deepEqual(auroraEgg.trigger, { codes: KONAMI_SEQUENCE, type: 'sequence' })
  })

  test('defaults the picker to the aurora egg', () => {
    assert.deepEqual(EASTER_EGG_CONFIG, { staticId: 'aurora', strategy: 'static' })
  })
})

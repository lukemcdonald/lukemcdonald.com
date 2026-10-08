import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { EASTER_EGG_CONFIG } from './config.ts'
import { auroraEgg } from './eggs/aurora/index.ts'
import { EASTER_EGGS } from './registry.ts'

describe('easter egg registry', () => {
  test('registers aurora as a toggle egg on the Konami sequence', () => {
    assert.equal(EASTER_EGGS.includes(auroraEgg), true)
    assert.equal(auroraEgg.id, 'aurora')
    assert.equal(auroraEgg.mode, 'toggle')
    assert.deepEqual(auroraEgg.trigger, {
      codes: [
        'ArrowUp',
        'ArrowUp',
        'ArrowDown',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
        'ArrowLeft',
        'ArrowRight',
        'KeyB',
        'KeyA',
      ],
      type: 'sequence',
    })
  })

  test('static picker id is a registered egg', () => {
    assert.equal(
      EASTER_EGGS.some((egg) => egg.id === EASTER_EGG_CONFIG.staticId),
      true,
    )
  })
})

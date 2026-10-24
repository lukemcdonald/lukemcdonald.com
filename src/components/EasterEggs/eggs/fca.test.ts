import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { buildFcaEmbedSrc } from './fca.ts'

describe('buildFcaEmbedSrc', () => {
  test('autoplays unless reduced motion is preferred', () => {
    assert.match(buildFcaEmbedSrc(), /wM0if-w6PEs/)
    assert.match(buildFcaEmbedSrc(), /autoplay=1/)
    assert.match(buildFcaEmbedSrc(), /playsinline=1/)
    assert.match(buildFcaEmbedSrc(), /rel=0/)
    assert.equal(buildFcaEmbedSrc(true).includes('autoplay='), false)
    assert.match(buildFcaEmbedSrc(true), /playsinline=1/)
    assert.match(buildFcaEmbedSrc(true), /rel=0/)
  })
})

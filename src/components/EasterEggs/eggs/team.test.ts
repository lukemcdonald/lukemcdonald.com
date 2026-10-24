import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { buildTeamEmbedSrc } from './team.ts'

describe('buildTeamEmbedSrc', () => {
  test('autoplays unless reduced motion is preferred', () => {
    assert.match(buildTeamEmbedSrc(), /wM0if-w6PEs/)
    assert.match(buildTeamEmbedSrc(), /autoplay=1/)
    assert.match(buildTeamEmbedSrc(), /playsinline=1/)
    assert.match(buildTeamEmbedSrc(), /rel=0/)
    assert.equal(buildTeamEmbedSrc(true).includes('autoplay='), false)
    assert.match(buildTeamEmbedSrc(true), /playsinline=1/)
    assert.match(buildTeamEmbedSrc(true), /rel=0/)
  })
})

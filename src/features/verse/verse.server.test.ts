import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { getTodayVerse } from './verse.server.ts'
import { FALLBACK_VERSE } from './verse.utils.ts'

describe('getTodayVerse', () => {
  test('returns the fallback verse until the YouVersion fetch is wired', async () => {
    assert.equal(await getTodayVerse(), FALLBACK_VERSE)
  })
})

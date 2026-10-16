import assert from 'node:assert/strict'
import { afterEach, describe, mock, test } from 'node:test'

import { FALLBACK_VERSE, VERSE_ENDPOINT, youVersionVerseUrl } from '@/features/verse/verse.utils'

import { lampEgg, lampPos, loadLampVerse } from './lamp.ts'

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    status,
  })
}

describe('lampEgg', () => {
  test('is cycle-only and dismisses on escape', () => {
    assert.equal(lampEgg.dismissOnEscape, true)
    assert.equal(lampEgg.id, 'lamp')
    assert.deepEqual(lampEgg.sequence, [])
  })
})

describe('lampPos', () => {
  test('formats the pointer as one CSS value', () => {
    assert.equal(lampPos(12, 40), '12px 40px')
  })
})

describe('loadLampVerse', () => {
  afterEach(() => {
    mock.restoreAll()
  })

  test('returns the endpoint verse when the payload is valid', async () => {
    const verse = {
      reference: 'John 3:16',
      source: 'api',
      text: 'For God so loved the world that He gave His one and only Son.',
      url: youVersionVerseUrl('JHN.3.16'),
    }
    const fetchMock = mock.fn(async (input: RequestInfo | URL) => {
      assert.equal(String(input), VERSE_ENDPOINT)

      return jsonResponse(verse)
    })

    assert.deepEqual(await loadLampVerse(fetchMock), verse)
    assert.equal(fetchMock.mock.calls.length, 1)
  })

  test('returns the fallback when the endpoint fails', async () => {
    const fetchMock = mock.fn(async () => {
      return new Response('nope', { status: 500 })
    })

    assert.equal(await loadLampVerse(fetchMock), FALLBACK_VERSE)
  })
})

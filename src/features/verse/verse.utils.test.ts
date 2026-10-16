import assert from 'node:assert/strict'
import { afterEach, describe, mock, test } from 'node:test'

import {
  dayOfYear,
  FALLBACK_VERSE,
  fetchTodayVerse,
  isVerse,
  secondsUntilUtcMidnight,
  verseCacheControl,
  verseCacheHeaders,
  verseLead,
  YOUVERSION_API_ORIGIN,
  YOUVERSION_APP_KEY_HEADER,
  YOUVERSION_BSB_ID,
  youVersionVerseUrl,
} from './verse.utils.ts'

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    status,
  })
}

function requestHeaders(call: { arguments: readonly unknown[] }) {
  const init = call.arguments[1] as RequestInit | undefined

  return init?.headers as Record<string, string> | undefined
}

function requestUrl(call: { arguments: readonly unknown[] }) {
  return String(call.arguments[0])
}

describe('youVersionVerseUrl', () => {
  test('builds a BSB bible.com link from USFM', () => {
    assert.equal(
      youVersionVerseUrl('PSA.119.105'),
      `https://www.bible.com/bible/${YOUVERSION_BSB_ID}/PSA.119.105.BSB`,
    )
  })
})

describe('FALLBACK_VERSE', () => {
  test('uses the BSB wording for Psalm 119:105', () => {
    assert.deepEqual(FALLBACK_VERSE, {
      reference: 'Psalm 119:105',
      source: 'fallback',
      text: 'Your word is a lamp to my feet and a light to my path.',
      url: youVersionVerseUrl('PSA.119.105'),
    })
  })
})

describe('dayOfYear', () => {
  test('counts from January 1 including leap days', () => {
    assert.equal(dayOfYear(new Date('2026-01-01T00:00:00Z')), 1)
    assert.equal(dayOfYear(new Date('2025-12-31T12:00:00Z')), 365)
    assert.equal(dayOfYear(new Date('2024-12-31T12:00:00Z')), 366)
  })
})

describe('isVerse', () => {
  test('accepts a complete verse payload', () => {
    assert.equal(isVerse(FALLBACK_VERSE), true)
  })

  test('rejects a partial payload', () => {
    assert.equal(isVerse({ reference: 'John 3:16', text: 'For God so loved the world.' }), false)
  })
})

describe('secondsUntilUtcMidnight', () => {
  test('counts seconds remaining in the UTC day', () => {
    assert.equal(secondsUntilUtcMidnight(new Date('2026-01-15T00:00:00Z')), 86_400)
    assert.equal(secondsUntilUtcMidnight(new Date('2026-01-15T23:00:00Z')), 3_600)
  })
})

describe('verseCacheControl', () => {
  test('caps s-maxage at four hours and stays fresh until midnight', () => {
    assert.equal(
      verseCacheControl(new Date('2026-01-15T10:00:00Z')),
      'public, s-maxage=14400, stale-while-revalidate=50400',
    )
    assert.equal(
      verseCacheControl(new Date('2026-01-15T23:00:00Z')),
      'public, s-maxage=3600, stale-while-revalidate=3600',
    )
  })
})

describe('verseLead', () => {
  test('uses today copy for an API verse and fallback copy otherwise', () => {
    assert.equal(verseLead('api'), "Here's today's verse.")
    assert.equal(verseLead('fallback'), "Here's a verse.")
  })
})

describe('verseCacheHeaders', () => {
  test('sets Cache-Control and a durable CDN header', () => {
    assert.deepEqual(verseCacheHeaders(new Date('2026-01-15T23:00:00Z')), {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=3600',
      'CDN-Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=3600, durable',
    })
  })
})

describe('fetchTodayVerse', () => {
  afterEach(() => {
    mock.restoreAll()
  })

  test('returns the fallback when the app key is missing', async () => {
    const fetchMock = mock.fn(async () => {
      return new Response('unused', { status: 500 })
    })

    const verse = await fetchTodayVerse({ fetch: fetchMock })

    assert.equal(verse, FALLBACK_VERSE)
    assert.equal(verse.source, 'fallback')
    assert.equal(fetchMock.mock.calls.length, 0)
  })

  test('loads the YouVersion verse of the day in BSB', async () => {
    const fetchMock = mock.fn(async (url: string) => {
      if (String(url).includes('/verse-of-the-days/')) {
        return jsonResponse({ day: 15, passage_id: 'JHN.3.16' })
      }

      return jsonResponse({
        content: 'For God so loved the world that He gave His one and only Son.',
        id: 'JHN.3.16',
        reference: 'John 3:16',
      })
    })

    assert.deepEqual(
      await fetchTodayVerse({
        appKey: 'test-key',
        fetch: fetchMock,
        now: new Date('2026-01-15T12:00:00Z'),
      }),
      {
        reference: 'John 3:16',
        source: 'api',
        text: 'For God so loved the world that He gave His one and only Son.',
        url: youVersionVerseUrl('JHN.3.16'),
      },
    )

    const calls = fetchMock.mock.calls
    const votdCall = calls[0]
    const passageCall = calls[1]

    assert.equal(calls.length, 2)
    assert.ok(votdCall)
    assert.ok(passageCall)
    assert.equal(requestUrl(votdCall), `${YOUVERSION_API_ORIGIN}/verse-of-the-days/15`)
    assert.equal(
      requestUrl(passageCall),
      `${YOUVERSION_API_ORIGIN}/bibles/${YOUVERSION_BSB_ID}/passages/JHN.3.16`,
    )
    assert.equal(requestHeaders(votdCall)?.[YOUVERSION_APP_KEY_HEADER], 'test-key')
    assert.equal(requestHeaders(passageCall)?.[YOUVERSION_APP_KEY_HEADER], 'test-key')
  })

  test('returns the fallback when a YouVersion request fails', async () => {
    const fetchMock = mock.fn(async () => {
      return new Response('nope', { status: 500 })
    })

    assert.equal(await fetchTodayVerse({ appKey: 'test-key', fetch: fetchMock }), FALLBACK_VERSE)
  })

  test('returns the fallback when the payload is missing a passage', async () => {
    const fetchMock = mock.fn(async () => {
      return jsonResponse({ day: 1 })
    })

    assert.equal(await fetchTodayVerse({ appKey: 'test-key', fetch: fetchMock }), FALLBACK_VERSE)
  })
})

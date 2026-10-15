import type { Verse } from './verse.types'

export const YOUVERSION_API_ORIGIN = 'https://api.youversion.com/v1'
export const YOUVERSION_APP_KEY_HEADER = 'X-YVP-App-Key'
export const YOUVERSION_BSB_ID = 3034

const DAY_MS = 86_400_000
const REQUEST_TIMEOUT_MS = 8_000

export function youVersionVerseUrl(usfm: string, version = 'BSB') {
  return `https://www.bible.com/bible/${YOUVERSION_BSB_ID}/${usfm}.${version}`
}

export const FALLBACK_VERSE: Verse = {
  reference: 'Psalm 119:105',
  text: 'Your word is a lamp to my feet and a light to my path.',
  url: youVersionVerseUrl('PSA.119.105'),
}

export function dayOfYear(date: Date) {
  const year = date.getUTCFullYear()
  const start = Date.UTC(year, 0, 1)
  const current = Date.UTC(year, date.getUTCMonth(), date.getUTCDate())

  return Math.floor((current - start) / DAY_MS) + 1
}

type VerseFetch = (url: string, init?: RequestInit) => Promise<Response>

export async function fetchTodayVerse(
  options: {
    appKey?: string
    fetch?: VerseFetch
    now?: Date
  } = {},
): Promise<Verse> {
  const { appKey, fetch: fetchFn = globalThis.fetch, now = new Date() } = options

  if (!appKey) {
    return FALLBACK_VERSE
  }

  try {
    return await loadYouVersionVerse(appKey, fetchFn, now)
  } catch {
    return FALLBACK_VERSE
  }
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return
  }

  return value as Record<string, unknown>
}

function readPassage(value: unknown): { content: string; reference: string } | undefined {
  const record = asRecord(value)
  const content = record?.content
  const reference = record?.reference

  if (typeof content !== 'string' || content.trim() === '') {
    return
  }

  if (typeof reference !== 'string' || reference.trim() === '') {
    return
  }

  return {
    content: content.trim(),
    reference: reference.trim(),
  }
}

function readPassageId(value: unknown): string | undefined {
  const passageId = asRecord(value)?.passage_id

  if (typeof passageId !== 'string' || passageId.trim() === '') {
    return
  }

  return passageId.trim()
}

async function requestJson(fetchFn: VerseFetch, url: string, appKey: string) {
  const response = await fetchFn(url, {
    headers: {
      Accept: 'application/json',
      [YOUVERSION_APP_KEY_HEADER]: appKey,
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })

  if (!response.ok) {
    throw new Error(String(response.status))
  }

  return response.json() as Promise<unknown>
}

async function loadYouVersionVerse(appKey: string, fetchFn: VerseFetch, now: Date) {
  const passageId = readPassageId(
    await requestJson(
      fetchFn,
      `${YOUVERSION_API_ORIGIN}/verse-of-the-days/${dayOfYear(now)}`,
      appKey,
    ),
  )

  if (!passageId) {
    throw new Error('missing passage_id')
  }

  const passage = readPassage(
    await requestJson(
      fetchFn,
      `${YOUVERSION_API_ORIGIN}/bibles/${YOUVERSION_BSB_ID}/passages/${passageId}`,
      appKey,
    ),
  )

  if (!passage) {
    throw new Error('missing passage')
  }

  return {
    reference: passage.reference,
    text: passage.content,
    url: youVersionVerseUrl(passageId),
  }
}

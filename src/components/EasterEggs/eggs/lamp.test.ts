import assert from 'node:assert/strict'
import { afterEach, describe, mock, test } from 'node:test'

import { FALLBACK_VERSE, VERSE_ENDPOINT } from '@/features/verse/verse.constants'
import { toYouVersionVerseUrl } from '@/features/verse/verse.utils'

import { applyLampVerse, lampEgg, loadLampVerse, toLampPos } from './lamp.ts'

describe('applyLampVerse', () => {
  test('writes the verse and clears the loading state', () => {
    const reference = { textContent: '' }
    const text = { textContent: 'Loading verse' }
    let busy = true
    const holder = {
      querySelector(selector: string) {
        if (selector === 'cite') {
          return reference
        }

        if (selector === 'p') {
          return text
        }

        return null
      },
      removeAttribute(name: string) {
        if (name === 'aria-busy') {
          busy = false
        }
      },
    }
    const root = {
      querySelector(selector: string) {
        if (selector === '[data-lamp-verse]') {
          return holder
        }

        return null
      },
    } as unknown as HTMLElement

    applyLampVerse(root, FALLBACK_VERSE)

    assert.equal(busy, false)
    assert.equal(reference.textContent, FALLBACK_VERSE.reference)
    assert.equal(text.textContent, FALLBACK_VERSE.text)
  })
})

describe('lampEgg', () => {
  test('is cycle-only and dismisses on escape', () => {
    assert.equal(lampEgg.dismissOnEscape, true)
    assert.equal(lampEgg.id, 'lamp')
    assert.deepEqual(lampEgg.sequence, [])
  })
})

describe('toLampPos', () => {
  test('formats the pointer as one CSS value', () => {
    assert.equal(toLampPos(12, 40), '12px 40px')
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
      url: toYouVersionVerseUrl('JHN.3.16'),
    }
    const fetchMock = mock.fn(async (input: RequestInfo | URL) => {
      assert.equal(String(input), VERSE_ENDPOINT)

      return new Response(JSON.stringify(verse), {
        headers: { 'Content-Type': 'application/json' },
      })
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

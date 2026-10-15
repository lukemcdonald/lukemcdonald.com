import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { FALLBACK_VERSE, YOUVERSION_BSB_ID, youVersionVerseUrl } from './verse.utils.ts'

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
      text: 'Your word is a lamp to my feet and a light to my path.',
      url: youVersionVerseUrl('PSA.119.105'),
    })
  })
})

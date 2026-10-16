import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { parseContentId, toPageHref, toPagePath } from './content.ts'

const ORIGIN = 'https://lukemcdonald.com'

describe('toPageHref', () => {
  test('builds absolute URLs, using / for the home page', () => {
    assert.equal(toPageHref('index', ORIGIN), `${ORIGIN}/`)
    assert.equal(toPageHref('tread-talks', ORIGIN), `${ORIGIN}/tread-talks`)
    assert.equal(toPageHref('i-am-a/christian', ORIGIN), `${ORIGIN}/i-am-a/christian`)
  })
})

describe('toPagePath', () => {
  test('maps index to / and other ids to slash-prefixed paths', () => {
    assert.equal(toPagePath('index'), '/')
    assert.equal(toPagePath('tread-talks'), '/tread-talks')
    assert.equal(toPagePath('i-am-a/christian'), '/i-am-a/christian')
  })
})

describe('parseContentId', () => {
  test('treats a single segment as a top-level section', () => {
    assert.deepEqual(parseContentId('basics.yaml'), {
      isTopLevel: true,
      itemId: '',
      section: 'basics',
    })
  })

  test('splits nested ids into section and item', () => {
    assert.deepEqual(parseContentId('experience/zenbusiness.yaml'), {
      isTopLevel: false,
      itemId: 'zenbusiness',
      section: 'experience',
    })
  })

  test('keeps nested paths after the section', () => {
    assert.deepEqual(parseContentId('experience/nested/item.yml'), {
      isTopLevel: false,
      itemId: 'nested/item',
      section: 'experience',
    })
  })
})

import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { pageHref, pagePath, parseContentId } from './content.ts'

const ORIGIN = 'https://lukemcdonald.com'

describe('pageHref', () => {
  test('builds absolute URLs, using / for the home page', () => {
    assert.equal(pageHref('index', ORIGIN), `${ORIGIN}/`)
    assert.equal(pageHref('tread-talks', ORIGIN), `${ORIGIN}/tread-talks`)
    assert.equal(pageHref('i-am-a/christian', ORIGIN), `${ORIGIN}/i-am-a/christian`)
  })
})

describe('pagePath', () => {
  test('maps index to / and other ids to slash-prefixed paths', () => {
    assert.equal(pagePath('index'), '/')
    assert.equal(pagePath('tread-talks'), '/tread-talks')
    assert.equal(pagePath('i-am-a/christian'), '/i-am-a/christian')
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

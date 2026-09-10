import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { getEntryImageTransitionName, toPageHref } from './pages.images.ts'

describe('getEntryImageTransitionName', () => {
  test('uses the filename from an image metadata src', () => {
    assert.equal(
      getEntryImageTransitionName({ src: '/src/assets/images/luke-baptism.jpg' }),
      'entry-image-luke-baptism',
    )
  })

  test('uses the filename from a public path', () => {
    assert.equal(
      getEntryImageTransitionName({ src: '/images/not-found.jpg' }),
      'entry-image-not-found',
    )
  })

  test('strips characters that are invalid in view-transition names', () => {
    assert.equal(
      getEntryImageTransitionName({ src: '/assets/luke and kids (1).jpg' }),
      'entry-image-luke-and-kids-1',
    )
  })
})

describe('toPageHref', () => {
  test('maps the index page to the site root', () => {
    assert.equal(toPageHref('index'), '/')
  })

  test('prefixes other page ids', () => {
    assert.equal(toPageHref('i-am-a/christian'), '/i-am-a/christian')
  })
})

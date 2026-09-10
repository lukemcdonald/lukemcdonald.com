import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { toPageHref } from './pages.images.ts'

describe('toPageHref', () => {
  test('maps the index page to the site root', () => {
    assert.equal(toPageHref('index'), '/')
  })

  test('prefixes other page ids', () => {
    assert.equal(toPageHref('i-am-a/christian'), '/i-am-a/christian')
  })
})

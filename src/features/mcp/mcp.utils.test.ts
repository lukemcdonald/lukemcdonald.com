import type { McpPageEntry } from './mcp.tools.ts'

import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import {
  errorResult,
  jsonResult,
  normalizePageId,
  pageDescription,
  pageHref,
  toPagePayload,
} from './mcp.utils.ts'

const ORIGIN = 'https://lukemcdonald.com'

function page(
  id: string,
  extra: {
    body?: string
    description?: string
    seoDescription?: string
    title?: string
  } = {},
): McpPageEntry {
  return {
    body: extra.body,
    data: {
      description: extra.description,
      seo: extra.seoDescription ? { description: extra.seoDescription } : undefined,
      title: extra.title ?? id,
    },
    id,
  }
}

describe('errorResult', () => {
  test('returns an isError tool result with the message', () => {
    assert.deepEqual(errorResult('Unknown page: missing'), {
      content: [{ text: 'Unknown page: missing', type: 'text' }],
      isError: true,
    })
  })
})

describe('jsonResult', () => {
  test('stringifies the payload as pretty-printed JSON text', () => {
    assert.deepEqual(jsonResult({ id: 'index', title: 'Greetings' }), {
      content: [
        {
          text: '{\n  "id": "index",\n  "title": "Greetings"\n}',
          type: 'text',
        },
      ],
    })
  })
})

describe('normalizePageId', () => {
  test('normalizes slugs, paths, and URLs to page ids', () => {
    assert.equal(normalizePageId('tread-talks'), 'tread-talks')
    assert.equal(normalizePageId('/tread-talks'), 'tread-talks')
    assert.equal(normalizePageId(`${ORIGIN}/tread-talks`), 'tread-talks')
    assert.equal(normalizePageId('/i-am-a/christian/'), 'i-am-a/christian')
  })

  test('maps home paths to index', () => {
    assert.equal(normalizePageId('/'), 'index')
    assert.equal(normalizePageId(''), 'index')
    assert.equal(normalizePageId('index'), 'index')
    assert.equal(normalizePageId(`${ORIGIN}/`), 'index')
  })
})

describe('pageDescription', () => {
  test('prefers SEO description over frontmatter description', () => {
    assert.equal(
      pageDescription(
        page('index', {
          description: 'Frontmatter summary.',
          seoDescription: 'SEO summary.',
        }),
      ),
      'SEO summary.',
    )
  })

  test('falls back to frontmatter description, then empty string', () => {
    assert.equal(pageDescription(page('tread-talks', { description: 'Sermons.' })), 'Sermons.')
    assert.equal(pageDescription(page('tread-talks')), '')
  })
})

describe('pageHref', () => {
  test('builds absolute URLs, using / for the home page', () => {
    assert.equal(pageHref('index', ORIGIN), `${ORIGIN}/`)
    assert.equal(pageHref('tread-talks', ORIGIN), `${ORIGIN}/tread-talks`)
    assert.equal(pageHref('i-am-a/christian', ORIGIN), `${ORIGIN}/i-am-a/christian`)
  })
})

describe('toPagePayload', () => {
  test('returns body, description, id, title, and url', () => {
    assert.deepEqual(
      toPagePayload(
        page('tread-talks', {
          body: '  Talks body.  ',
          description: 'Sermons.',
          title: 'TREAD Talks',
        }),
        ORIGIN,
      ),
      {
        body: 'Talks body.',
        description: 'Sermons.',
        id: 'tread-talks',
        title: 'TREAD Talks',
        url: `${ORIGIN}/tread-talks`,
      },
    )
  })
})

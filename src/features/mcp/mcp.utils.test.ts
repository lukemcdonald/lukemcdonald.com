import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { GLOBAL_CONFIG } from '@/configs/global'

import { normalizePageId, toErrorResult, toJsonResult } from './mcp.utils.ts'

const ORIGIN = GLOBAL_CONFIG.site.origin

describe('toErrorResult', () => {
  test('returns an isError tool result with the message', () => {
    assert.deepEqual(toErrorResult('Unknown page: missing'), {
      content: [{ text: 'Unknown page: missing', type: 'text' }],
      isError: true,
    })
  })
})

describe('toJsonResult', () => {
  test('stringifies the payload as pretty-printed JSON text', () => {
    assert.deepEqual(toJsonResult({ id: 'index', title: 'Greetings' }), {
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

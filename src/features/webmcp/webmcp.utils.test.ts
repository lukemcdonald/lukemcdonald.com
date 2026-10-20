import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { toPagePath } from '@/utils/content.ts'

import { toWebMcpPages } from './webmcp.utils.ts'

describe('toWebMcpPages', () => {
  test('prepends Home from the index page path and keeps an existing home', () => {
    const home = { id: 'index' }
    const homePage = { href: toPagePath(home.id), name: 'Home' }
    const resume = { href: '/resume', name: 'Resume' }

    assert.deepEqual(toWebMcpPages([resume], home), [homePage, resume])
    assert.deepEqual(toWebMcpPages([homePage, resume], home), [homePage, resume])
    assert.deepEqual(toWebMcpPages([resume]), [resume])
  })
})

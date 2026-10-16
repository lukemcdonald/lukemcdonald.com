import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { toCommandPaletteNavItems } from './nav-items.ts'

describe('toCommandPaletteNavItems', () => {
  test('flattens shared nav groups so new pages appear in group order', () => {
    assert.deepEqual(
      toCommandPaletteNavItems([
        { links: [{ href: '/resume', name: 'Resume' }], name: 'Work' },
        { links: [{ href: '/tread-talks', name: 'TREAD Talks' }], name: 'Play' },
        {
          links: [
            { href: '/i-am-a/christian', name: 'Christian' },
            { href: '/i-am-a/new-page', name: 'New Page' },
          ],
          name: 'Live',
        },
      ]),
      [
        { href: '/resume', name: 'Resume' },
        { href: '/tread-talks', name: 'TREAD Talks' },
        { href: '/i-am-a/christian', name: 'Christian' },
        { href: '/i-am-a/new-page', name: 'New Page' },
      ],
    )
  })
})

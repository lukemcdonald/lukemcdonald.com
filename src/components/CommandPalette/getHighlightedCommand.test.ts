import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { getHighlightedCommand } from './getHighlightedCommand.ts'

const navItems = [
  { href: '/resume', name: 'Resume' },
  { href: '/i-am-a/christian', name: 'Christian' },
  { href: '/i-am-a/coach', name: 'Coach' },
]

describe('getHighlightedCommand', () => {
  test('returns nothing for an empty query', () => {
    assert.equal(getHighlightedCommand(navItems, ''), undefined)
    assert.equal(getHighlightedCommand(navItems, '   '), undefined)
  })

  test('prefers the first matching nav item', () => {
    assert.deepEqual(getHighlightedCommand(navItems, 'c'), {
      href: '/i-am-a/christian',
      type: 'nav',
    })
  })

  test('matches a theme color when no nav item matches', () => {
    assert.deepEqual(getHighlightedCommand(navItems, 'blue'), {
      color: 'blue',
      type: 'color',
    })
  })

  test('matches appearance after colors', () => {
    assert.deepEqual(getHighlightedCommand(navItems, 'd'), {
      color: 'default',
      type: 'color',
    })
    assert.deepEqual(getHighlightedCommand(navItems, 'dark'), {
      mode: 'dark',
      type: 'mode',
    })
  })

  test('matches sound when no earlier command matches', () => {
    assert.deepEqual(getHighlightedCommand(navItems, 'sound'), {
      type: 'sound',
    })
  })
})

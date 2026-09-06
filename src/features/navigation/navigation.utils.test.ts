import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { buildNavigationGroups, PLAY_LINKS, toLiveLinks, WORK_LINKS } from './navigation.utils.ts'

describe('toLiveLinks', () => {
  test('maps published pages to href and title', () => {
    assert.deepEqual(
      toLiveLinks([
        { data: { title: 'Christian' }, id: 'i-am-a/christian' },
        { data: { title: 'Coach' }, id: 'i-am-a/coach' },
      ]),
      [
        { href: '/i-am-a/christian', name: 'Christian' },
        { href: '/i-am-a/coach', name: 'Coach' },
      ],
    )
  })
})

describe('buildNavigationGroups', () => {
  const liveLinks = [
    { href: '/i-am-a/christian', name: 'Christian' },
    { href: '/i-am-a/husband', name: 'Husband' },
    { href: '/i-am-a/father', name: 'Father' },
    { href: '/i-am-a/coach', name: 'Coach' },
  ]

  test('returns Work, Play, then Live in that order', () => {
    assert.deepEqual(
      buildNavigationGroups(liveLinks).map((group) => group.name),
      ['Work', 'Play', 'Live'],
    )
  })

  test('keeps Work and Play static and Live from published pages', () => {
    assert.deepEqual(buildNavigationGroups(liveLinks), [
      { links: WORK_LINKS, name: 'Work' },
      { links: PLAY_LINKS, name: 'Play' },
      { links: liveLinks, name: 'Live' },
    ])
  })

  test('flattens to the same destination order as Cmd+K', () => {
    assert.deepEqual(
      buildNavigationGroups(liveLinks).flatMap((group) => group.links),
      [...WORK_LINKS, ...PLAY_LINKS, ...liveLinks],
    )
  })
})

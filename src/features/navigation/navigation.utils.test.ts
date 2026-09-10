import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import {
  buildNavigationGroups,
  getInternalPrefetchHrefs,
  PLAY_LINKS,
  toLiveLinks,
  WORK_LINKS,
} from './navigation.utils.ts'

const liveLinks = [
  { href: '/i-am-a/christian', name: 'Christian' },
  { href: '/i-am-a/husband', name: 'Husband' },
  { href: '/i-am-a/father', name: 'Father' },
  { href: '/i-am-a/coach', name: 'Coach' },
]

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

describe('getInternalPrefetchHrefs', () => {
  test('includes the home page and every internal nav destination', () => {
    assert.deepEqual(getInternalPrefetchHrefs(buildNavigationGroups(liveLinks)), [
      '/',
      '/i-am-a/christian',
      '/i-am-a/coach',
      '/i-am-a/father',
      '/i-am-a/husband',
      '/resume',
      '/tread-talks',
    ])
  })

  test('skips external destinations', () => {
    assert.deepEqual(
      getInternalPrefetchHrefs([
        {
          links: [
            { href: '/resume', name: 'Resume' },
            { href: 'https://gettreadtalks.com/', name: 'TREAD Talks' },
          ],
          name: 'Work',
        },
      ]),
      ['/', '/resume'],
    )
  })
})

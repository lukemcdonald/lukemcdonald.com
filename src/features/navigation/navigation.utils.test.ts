import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import {
  buildNavigationGroups,
  getExternalLinkAttrs,
  isExternalHref,
  PLAY_LINKS,
  toLiveLinks,
  toNavMenuId,
  WORK_LINKS,
} from './navigation.utils.ts'

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

describe('isExternalHref', () => {
  test('treats http(s) URLs as external', () => {
    assert.equal(isExternalHref('https://gettreadtalks.com'), true)
    assert.equal(isExternalHref('http://example.com'), true)
  })

  test('treats site paths as internal', () => {
    assert.equal(isExternalHref('/resume'), false)
    assert.equal(isExternalHref('/i-am-a/father'), false)
  })
})

describe('getExternalLinkAttrs', () => {
  test('adds blank target and rel for external hrefs', () => {
    assert.deepEqual(getExternalLinkAttrs('https://gettreadtalks.com'), {
      rel: 'noopener noreferrer',
      target: '_blank',
    })
  })

  test('returns an empty object for internal hrefs', () => {
    assert.deepEqual(getExternalLinkAttrs('/resume'), {})
  })
})

describe('toNavMenuId', () => {
  test('prefixes a slugified group name', () => {
    assert.equal(toNavMenuId('Work'), 'nav-menu-work')
    assert.equal(toNavMenuId('Play'), 'nav-menu-play')
    assert.equal(toNavMenuId('Live'), 'nav-menu-live')
  })

  test('collapses extra characters into a single hyphen', () => {
    assert.equal(toNavMenuId('  TREAD Talks  '), 'nav-menu-tread-talks')
  })
})

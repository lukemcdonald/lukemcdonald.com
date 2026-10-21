import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import {
  buildNavigationGroups,
  isExternalHref,
  RESUME_LINK,
  toExternalLinkAttrs,
  toHrefTestId,
  toNavMenuId,
  toPaletteNavGroupId,
  toTestIdSlug,
} from './navigation.utils.ts'

describe('buildNavigationGroups', () => {
  const pages = [
    { data: { navGroup: 'live' as const, title: 'Christian' }, id: 'i-am-a/christian' },
    { data: { navGroup: 'live' as const, title: 'Husband' }, id: 'i-am-a/husband' },
    { data: { navGroup: 'live' as const, title: 'Father' }, id: 'i-am-a/father' },
    { data: { navGroup: 'live' as const, title: 'Coach' }, id: 'i-am-a/coach' },
    { data: { navGroup: 'play' as const, title: 'TREAD Talks' }, id: 'tread-talks' },
    { data: { title: 'Greetings' }, id: 'index' },
  ]

  test('returns Work, Play, then Live in that order', () => {
    assert.deepEqual(
      buildNavigationGroups(pages).map((group) => group.name),
      ['Work', 'Play', 'Live'],
    )
  })

  test('keeps Resume in Work and groups pages by navGroup', () => {
    assert.deepEqual(buildNavigationGroups(pages), [
      { links: [RESUME_LINK], name: 'Work' },
      { links: [{ href: '/tread-talks', name: 'TREAD Talks' }], name: 'Play' },
      {
        links: [
          { href: '/i-am-a/christian', name: 'Christian' },
          { href: '/i-am-a/husband', name: 'Husband' },
          { href: '/i-am-a/father', name: 'Father' },
          { href: '/i-am-a/coach', name: 'Coach' },
        ],
        name: 'Live',
      },
    ])
  })

  test('places Resume first in Work before navGroup pages', () => {
    assert.deepEqual(
      buildNavigationGroups([
        ...pages,
        { data: { navGroup: 'work' as const, title: 'Consulting' }, id: 'consulting' },
      ])[0],
      {
        links: [RESUME_LINK, { href: '/consulting', name: 'Consulting' }],
        name: 'Work',
      },
    )
  })

  test('includes hideFromMenu pages by default', () => {
    assert.deepEqual(
      buildNavigationGroups([
        ...pages,
        {
          data: { hideFromMenu: true, navGroup: 'work' as const, title: 'Cedaro' },
          id: 'work/cedaro',
        },
      ])[0],
      {
        links: [RESUME_LINK, { href: '/work/cedaro', name: 'Cedaro' }],
        name: 'Work',
      },
    )
  })

  test('omits hideFromMenu pages when building the menu', () => {
    assert.deepEqual(
      buildNavigationGroups(
        [
          ...pages,
          {
            data: { hideFromMenu: true, navGroup: 'work' as const, title: 'Cedaro' },
            id: 'work/cedaro',
          },
          { data: { navGroup: 'work' as const, title: 'Consulting' }, id: 'consulting' },
        ],
        { forMenu: true },
      )[0],
      {
        links: [RESUME_LINK, { href: '/consulting', name: 'Consulting' }],
        name: 'Work',
      },
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

describe('toExternalLinkAttrs', () => {
  test('adds blank target and rel for external hrefs', () => {
    assert.deepEqual(toExternalLinkAttrs('https://gettreadtalks.com'), {
      rel: 'noopener noreferrer',
      target: '_blank',
    })
  })

  test('returns an empty object for internal hrefs', () => {
    assert.deepEqual(toExternalLinkAttrs('/resume'), {})
  })
})

describe('toHrefTestId', () => {
  test('prefixes a slugified href', () => {
    assert.equal(toHrefTestId('nav-link', '/resume'), 'nav-link-resume')
    assert.equal(
      toHrefTestId('greeting-link', '/i-am-a/christian'),
      'greeting-link-i-am-a--christian',
    )
  })

  test('uses home when the href slugs to empty', () => {
    assert.equal(toHrefTestId('nav-link', '/'), 'nav-link-home')
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

describe('toPaletteNavGroupId', () => {
  test('prefixes a slugified group name', () => {
    assert.equal(toPaletteNavGroupId('Work'), 'command-palette-nav-work')
    assert.equal(toPaletteNavGroupId('Play'), 'command-palette-nav-play')
    assert.equal(toPaletteNavGroupId('Live'), 'command-palette-nav-live')
  })
})

describe('toTestIdSlug', () => {
  test('strips a leading slash, lowercases, and hyphenates', () => {
    assert.equal(toTestIdSlug('/i-am-a/christian'), 'i-am-a--christian')
    assert.equal(toTestIdSlug('  TREAD Talks  '), 'tread-talks')
  })

  test('keeps path separators distinct from hyphens in the slug', () => {
    assert.equal(toTestIdSlug('/a/foo/bar'), 'a--foo--bar')
    assert.equal(toTestIdSlug('/a/foo-bar'), 'a--foo-bar')
    assert.notEqual(toTestIdSlug('/a/foo/bar'), toTestIdSlug('/a/foo-bar'))
  })
})

import type { OgMetaTag } from 'astro-og-kit'

import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { GLOBAL_CONFIG } from '@/configs/global'

import { og } from './og.ts'

function content(tags: OgMetaTag[], key: string) {
  const tag = tags.find((entry) => {
    if ('property' in entry) {
      return entry.property === key
    }

    return entry.name === key
  })

  return tag?.content
}

describe('og.meta image override', () => {
  const origin = GLOBAL_CONFIG.site.origin

  test('resolves a root-relative seo.ogImage against the site origin', () => {
    const tags = og.meta({
      image: '/custom-share.jpg',
      site: origin,
      title: 'About',
      url: '/about',
    })

    assert.equal(content(tags, 'og:image'), `${origin}/custom-share.jpg`)
    assert.equal(content(tags, 'twitter:image'), `${origin}/custom-share.jpg`)
  })

  test('resolves a relative seo.ogImage against the site origin', () => {
    const tags = og.meta({
      image: 'custom-share.jpg',
      site: origin,
      title: 'About',
      url: '/about',
    })

    assert.equal(content(tags, 'og:image'), `${origin}/custom-share.jpg`)
    assert.equal(content(tags, 'twitter:image'), `${origin}/custom-share.jpg`)
  })
})

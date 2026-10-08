import type { SeoMeta } from './types.ts'

import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { GLOBAL_CONFIG } from '@/configs/global'

import { buildSocialMetaTags } from './social.ts'

const origin = GLOBAL_CONFIG.site.origin
const defaultImage = `${origin}/og-image.jpg`

function meta(overrides: Partial<SeoMeta> = {}): SeoMeta {
  return {
    canonicalUrl: '/about',
    title: 'About',
    ...overrides,
  }
}

describe('buildSocialMetaTags', () => {
  test('sets og:type to website for page content', () => {
    const tags = buildSocialMetaTags(meta({ contentType: 'page' }))

    assert.equal(tags['og:type'], 'website')
  })

  test('defaults og:type to website', () => {
    const tags = buildSocialMetaTags(meta())

    assert.equal(tags['og:type'], 'website')
  })

  test('sets og:type to article for article and blog content', () => {
    assert.equal(buildSocialMetaTags(meta({ contentType: 'article' }))['og:type'], 'article')
    assert.equal(buildSocialMetaTags(meta({ contentType: 'blog' }))['og:type'], 'article')
  })

  test('falls back to the default og image when ogImage is omitted', () => {
    const tags = buildSocialMetaTags(meta())

    assert.equal(tags['og:image'], defaultImage)
    assert.equal(tags['twitter:image'], defaultImage)
  })

  test('uses ogImage when provided', () => {
    const ogImage = `${origin}/custom-share.jpg`
    const tags = buildSocialMetaTags(meta({ ogImage }))

    assert.equal(tags['og:image'], ogImage)
    assert.equal(tags['twitter:image'], ogImage)
  })

  test('makes og:url and twitter:url absolute from a relative canonical path', () => {
    const tags = buildSocialMetaTags(meta({ canonicalUrl: '/resume' }))
    const url = new URL('/resume', origin).toString()

    assert.equal(tags['og:url'], url)
    assert.equal(tags['twitter:url'], url)
  })

  test('keeps an absolute canonical URL', () => {
    const canonicalUrl = `${origin}/i-am-a/coach`
    const tags = buildSocialMetaTags(meta({ canonicalUrl }))

    assert.equal(tags['og:url'], canonicalUrl)
    assert.equal(tags['twitter:url'], canonicalUrl)
  })

  test('accepts a canonical URL instance', () => {
    const canonicalUrl = new URL('/about', origin)
    const tags = buildSocialMetaTags(meta({ canonicalUrl }))

    assert.equal(tags['og:url'], canonicalUrl.toString())
    assert.equal(tags['twitter:url'], canonicalUrl.toString())
  })

  test('leaves url tags undefined when canonicalUrl is omitted', () => {
    const tags = buildSocialMetaTags({ title: 'About' })

    assert.equal(tags['og:url'], undefined)
    assert.equal(tags['twitter:url'], undefined)
  })

  test('leaves description keys undefined when omitted', () => {
    const tags = buildSocialMetaTags(meta())

    assert.equal(tags['og:description'], undefined)
    assert.equal(tags['twitter:description'], undefined)
  })

  test('copies description onto og and twitter keys', () => {
    const description = 'A short summary for sharing.'
    const tags = buildSocialMetaTags(meta({ description }))

    assert.equal(tags['og:description'], description)
    assert.equal(tags['twitter:description'], description)
  })

  test('copies title onto og and twitter keys', () => {
    const tags = buildSocialMetaTags(meta({ title: 'TREAD Talks' }))

    assert.equal(tags['og:title'], 'TREAD Talks')
    assert.equal(tags['twitter:title'], 'TREAD Talks')
  })

  test('sets site name, twitter card, and default image for a normal page', () => {
    const tags = buildSocialMetaTags(
      meta({
        canonicalUrl: '/i-am-a/father',
        contentType: 'page',
        description: 'A page about fatherhood.',
        title: 'Father',
      }),
    )
    const url = new URL('/i-am-a/father', origin).toString()

    assert.deepEqual(tags, {
      'og:description': 'A page about fatherhood.',
      'og:image': defaultImage,
      'og:site_name': GLOBAL_CONFIG.name,
      'og:title': 'Father',
      'og:type': 'website',
      'og:url': url,
      'twitter:card': 'summary_large_image',
      'twitter:description': 'A page about fatherhood.',
      'twitter:image': defaultImage,
      'twitter:title': 'Father',
      'twitter:url': url,
    })
  })

  test('builds resume page social tags as a website', () => {
    const description = `The resume of ${GLOBAL_CONFIG.name}, Full-Stack Developer.`
    const tags = buildSocialMetaTags(
      meta({
        canonicalUrl: '/resume',
        contentType: 'page',
        description,
        title: 'Resume',
      }),
    )

    assert.equal(tags['og:type'], 'website')
    assert.equal(tags['og:title'], 'Resume')
    assert.equal(tags['og:description'], description)
    assert.equal(tags['og:url'], new URL('/resume', origin).toString())
    assert.equal(tags['og:image'], defaultImage)
    assert.equal(tags['twitter:card'], 'summary_large_image')
  })
})

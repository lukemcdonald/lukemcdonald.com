import type { SeoMeta } from './types.ts'

import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { GLOBAL_CONFIG } from '@/configs/global'

import { buildGraphJsonLd } from './schema.ts'

type PageJsonLd = {
  '@id'?: string
  '@type'?: string
  author?: unknown
  dateModified?: string
  datePublished?: string
  description?: string
  headline?: string
  inLanguage?: string
  isPartOf?: unknown
  name?: string
  publisher?: unknown
  url?: string
}

function graph(meta: SeoMeta) {
  return buildGraphJsonLd(meta)
}

function meta(overrides: Partial<SeoMeta> = {}): SeoMeta {
  return {
    canonicalUrl: '/about',
    title: 'About',
    ...overrides,
  }
}

function origin() {
  return GLOBAL_CONFIG.site.origin
}

function pageNode(meta: SeoMeta) {
  return graph(meta)['@graph'][1] as PageJsonLd
}

function personId() {
  return `${origin()}/#person`
}

function personNode(meta: SeoMeta) {
  return graph(meta)['@graph'][2]
}

function personRef() {
  return { '@id': personId() }
}

function websiteNode(meta: SeoMeta) {
  return graph(meta)['@graph'][0]
}

describe('buildGraphJsonLd', () => {
  test('returns a three-node @graph of WebSite, page, then Person', () => {
    const jsonLd = graph(meta())
    const [website, page, person] = jsonLd['@graph']

    assert.equal(jsonLd['@context'], 'https://schema.org')
    assert.equal(jsonLd['@graph'].length, 3)
    assert.equal(website['@type'], 'WebSite')
    assert.equal(page['@type'], 'WebPage')
    assert.equal(person['@type'], 'Person')
  })

  test('website node uses the site origin and name', () => {
    const website = websiteNode(meta())

    assert.deepEqual(website, {
      '@context': 'https://schema.org',
      '@id': origin(),
      '@type': 'WebSite',
      alternateName: new URL(origin()).hostname,
      name: GLOBAL_CONFIG.name,
      url: origin(),
    })
  })
})

describe('Person JSON-LD', () => {
  test('describes Luke McDonald with profile sameAs links', () => {
    const person = personNode(meta())

    assert.deepEqual(person, {
      '@context': 'https://schema.org',
      '@id': personId(),
      '@type': 'Person',
      name: GLOBAL_CONFIG.author.name,
      sameAs: GLOBAL_CONFIG.author.profiles.map((profile) => {
        return profile.url
      }),
      url: origin(),
    })
  })
})

describe('page JSON-LD', () => {
  test('maps page type to WebPage with publisher and no author', () => {
    const page = pageNode(
      meta({
        author: { name: GLOBAL_CONFIG.author.name, url: GLOBAL_CONFIG.author.url },
        contentType: 'page',
      }),
    )

    assert.equal(page['@type'], 'WebPage')
    assert.deepEqual(page.publisher, personRef())
    assert.equal('author' in page, false)
  })

  test('defaults contentType to page', () => {
    const page = pageNode(meta())

    assert.equal(page['@type'], 'WebPage')
    assert.ok(page.publisher)
    assert.equal('author' in page, false)
  })

  test('maps article type to Article with the Person as author and publisher', () => {
    const page = pageNode(meta({ contentType: 'article' }))

    assert.equal(page['@type'], 'Article')
    assert.deepEqual(page.author, [personRef()])
    assert.deepEqual(page.publisher, personRef())
  })

  test('maps blog type to BlogPosting with the Person as author and publisher', () => {
    const page = pageNode(meta({ contentType: 'blog' }))

    assert.equal(page['@type'], 'BlogPosting')
    assert.deepEqual(page.author, [personRef()])
    assert.deepEqual(page.publisher, personRef())
  })

  test('derives @id and url from a relative canonical path', () => {
    const page = pageNode(meta({ canonicalUrl: '/resume' }))
    const url = new URL('/resume', origin()).toString()

    assert.equal(page['@id'], url)
    assert.equal(page.url, url)
  })

  test('keeps an absolute canonical URL', () => {
    const canonicalUrl = `${origin()}/i-am-a/father`
    const page = pageNode(meta({ canonicalUrl }))

    assert.equal(page['@id'], canonicalUrl)
    assert.equal(page.url, canonicalUrl)
  })

  test('accepts a canonical URL instance', () => {
    const canonicalUrl = new URL('/about', origin())
    const page = pageNode(meta({ canonicalUrl }))

    assert.equal(page['@id'], canonicalUrl.toString())
    assert.equal(page.url, canonicalUrl.toString())
  })

  test('omits @id and leaves url undefined when canonicalUrl is missing', () => {
    const page = pageNode({ title: 'About' })

    assert.equal('@id' in page, false)
    assert.equal(page.url, undefined)
  })

  test('sets headline and name from the title', () => {
    const page = pageNode(meta({ title: 'TREAD Talks' }))

    assert.equal(page.headline, 'TREAD Talks')
    assert.equal(page.name, 'TREAD Talks')
  })

  test('includes description when provided', () => {
    const page = pageNode(meta({ description: 'A short summary.' }))

    assert.equal(page.description, 'A short summary.')
  })

  test('leaves description undefined when omitted', () => {
    const page = pageNode(meta())

    assert.equal(page.description, undefined)
  })

  test('includes datePublished and dateModified only when dates are given', () => {
    const pubDate = new Date('2024-01-15T00:00:00.000Z')
    const modDate = new Date('2024-06-01T00:00:00.000Z')
    const withDates = pageNode(meta({ modDate, pubDate }))
    const withoutDates = pageNode(meta())

    assert.equal(withDates.datePublished, pubDate.toISOString())
    assert.equal(withDates.dateModified, modDate.toISOString())
    assert.equal('datePublished' in withoutDates, false)
    assert.equal('dateModified' in withoutDates, false)
  })

  test('includes only the date fields that are provided', () => {
    const pubDate = new Date('2023-03-01T00:00:00.000Z')
    const publishedOnly = pageNode(meta({ pubDate }))
    const modifiedOnly = pageNode(meta({ modDate: pubDate }))

    assert.equal(publishedOnly.datePublished, pubDate.toISOString())
    assert.equal('dateModified' in publishedOnly, false)
    assert.equal(modifiedOnly.dateModified, pubDate.toISOString())
    assert.equal('datePublished' in modifiedOnly, false)
  })

  test('uses meta.lang when provided', () => {
    const page = pageNode(meta({ lang: 'es' }))

    assert.equal(page.inLanguage, 'es')
  })

  test('falls back to the site language when lang is omitted', () => {
    const page = pageNode(meta())

    assert.equal(page.inLanguage, GLOBAL_CONFIG.lang)
  })

  test('marks the page as part of the website', () => {
    const page = pageNode(meta())

    assert.deepEqual(page.isPartOf, { '@id': origin() })
  })

  test('builds resume page metadata as a WebPage', () => {
    const description = `The resume of ${GLOBAL_CONFIG.name}, Full-Stack Developer.`
    const page = pageNode(
      meta({
        canonicalUrl: '/resume',
        contentType: 'page',
        description,
        title: 'Resume',
      }),
    )
    const url = new URL('/resume', origin()).toString()

    assert.equal(page['@type'], 'WebPage')
    assert.equal(page['@id'], url)
    assert.equal(page.url, url)
    assert.equal(page.description, description)
    assert.equal(page.headline, 'Resume')
    assert.equal('author' in page, false)
    assert.ok(page.publisher)
  })
})

import type { SeoMeta } from './types.ts'

import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { GLOBAL_CONFIG } from '@/configs/global'

import { buildGraphJsonLd } from './schema.ts'

type GraphNode = Record<string, unknown>

type PersonJsonLd = {
  '@id'?: string
  '@type'?: string
  description?: string
  email?: string
  image?: string
  jobTitle?: string
  name?: string
  sameAs?: string[]
  url?: string
}

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

function collectDefinedIds(nodes: GraphNode[]) {
  return new Set(
    nodes.flatMap((node) => {
      return typeof node['@id'] === 'string' ? [node['@id']] : []
    }),
  )
}

function collectIdRefs(value: unknown, refs: string[] = []) {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectIdRefs(item, refs)
    }

    return refs
  }

  if (!value || typeof value !== 'object') {
    return refs
  }

  const record = value as GraphNode
  const keys = Object.keys(record)

  if (keys.length === 1 && keys[0] === '@id' && typeof record['@id'] === 'string') {
    refs.push(record['@id'])

    return refs
  }

  for (const nested of Object.values(record)) {
    collectIdRefs(nested, refs)
  }

  return refs
}

function graph(meta: SeoMeta, person?: Parameters<typeof buildGraphJsonLd>[1]) {
  return buildGraphJsonLd(meta, person)
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

function personNode(meta: SeoMeta, person?: Parameters<typeof buildGraphJsonLd>[1]) {
  return graph(meta, person)['@graph'][2] as PersonJsonLd
}

function personRef() {
  return { '@id': personId() }
}

function websiteId() {
  return `${origin()}/#website`
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

  test('keeps @context on the graph only', () => {
    const jsonLd = graph(meta())

    assert.equal(jsonLd['@context'], 'https://schema.org')

    for (const node of jsonLd['@graph']) {
      assert.equal('@context' in node, false)
    }
  })

  test('every @id reference resolves within the graph', () => {
    const jsonLd = graph(meta())
    const nodes = jsonLd['@graph'] as GraphNode[]
    const defined = collectDefinedIds(nodes)
    const refs = collectIdRefs(nodes)

    assert.ok(refs.length > 0)

    for (const id of refs) {
      assert.ok(defined.has(id), id)
    }
  })

  test('website node uses a distinct @id and points publisher at Person', () => {
    const website = websiteNode(meta())

    assert.deepEqual(website, {
      '@id': websiteId(),
      '@type': 'WebSite',
      alternateName: new URL(origin()).hostname,
      name: GLOBAL_CONFIG.name,
      publisher: personRef(),
      url: origin(),
    })
  })
})

describe('Person JSON-LD', () => {
  test('describes Luke McDonald from site data', () => {
    const person = personNode(meta())

    assert.deepEqual(person, {
      '@id': personId(),
      '@type': 'Person',
      email: GLOBAL_CONFIG.author.email,
      name: GLOBAL_CONFIG.author.name,
      sameAs: GLOBAL_CONFIG.author.profiles.map((profile) => {
        return profile.url
      }),
      url: origin(),
    })
  })

  test('includes jobTitle, image, and description when provided', () => {
    const fields = {
      description: 'A short summary.',
      image: `${origin()}/headshot.jpg`,
      jobTitle: 'Engineer',
    }
    const person = personNode(meta(), fields)

    assert.equal(person.description, fields.description)
    assert.equal(person.image, fields.image)
    assert.equal(person.jobTitle, fields.jobTitle)
  })

  test('omits jobTitle, image, and description when they are not provided', () => {
    const person = personNode(meta())

    assert.equal('description' in person, false)
    assert.equal('image' in person, false)
    assert.equal('jobTitle' in person, false)
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

  test('marks the page as part of the website node', () => {
    const page = pageNode(meta())

    assert.deepEqual(page.isPartOf, { '@id': websiteId() })
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

import type { SeoContentType, SeoMeta } from './types'

import { GLOBAL_CONFIG } from '@/configs/global'

type SchemaType = 'Article' | 'BlogPosting' | 'WebPage'

const CONTENT_TYPE_MAP: Record<SeoContentType, SchemaType> = {
  article: 'Article',
  blog: 'BlogPosting',
  page: 'WebPage',
} as const

function personId() {
  return `${GLOBAL_CONFIG.site.origin}/#person`
}

function personRef() {
  return { '@id': personId() }
}

function buildPersonJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@id': personId(),
    '@type': 'Person',
    name: GLOBAL_CONFIG.author.name,
    sameAs: GLOBAL_CONFIG.author.profiles.map((profile) => {
      return profile.url
    }),
    url: GLOBAL_CONFIG.author.url,
  }
}

function buildWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@id': GLOBAL_CONFIG.site.origin,
    '@type': 'WebSite',
    alternateName: new URL(GLOBAL_CONFIG.site.origin).hostname,
    name: GLOBAL_CONFIG.name,
    url: GLOBAL_CONFIG.site.origin,
  }
}

function buildPageJsonLd(meta: SeoMeta) {
  const { canonicalUrl, contentType = 'page', description, modDate, pubDate, title } = meta

  const type = CONTENT_TYPE_MAP[contentType]
  const isArticleOrBlog = type === 'Article' || type === 'BlogPosting'
  const person = personRef()
  const url = canonicalUrl ? new URL(canonicalUrl, GLOBAL_CONFIG.site.origin).toString() : undefined

  const base = {
    '@context': 'https://schema.org',
    '@type': type,
    ...(url && { '@id': url }),
    description,
    headline: title,
    inLanguage: meta.lang ?? GLOBAL_CONFIG.lang ?? 'en',
    isPartOf: { '@id': GLOBAL_CONFIG.site.origin },
    name: title,
    url,
    ...(modDate && { dateModified: modDate.toISOString() }),
    ...(pubDate && { datePublished: pubDate.toISOString() }),
  } as const

  if (isArticleOrBlog) {
    return {
      ...base,
      author: [person],
      publisher: person,
    }
  }

  return { ...base, publisher: person }
}

export function buildGraphJsonLd(meta: SeoMeta) {
  return {
    '@context': 'https://schema.org',
    '@graph': [buildWebsiteJsonLd(), buildPageJsonLd(meta), buildPersonJsonLd()],
  }
}

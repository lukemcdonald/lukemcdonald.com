import type { GLOBAL_CONFIG } from '@/configs/global'

export type ContentType = 'article' | 'blog' | 'page'

export interface MetaData {
  author?: {
    name: string
    url?: string
  }
  canonicalUrl?: string
  contentType?: ContentType
  description?: string
  dir?: string
  lang?: string
  modDatetime?: Date | null
  ogImage?: string
  pubDatetime?: Date
  title: string
}

export interface StructuredData {
  '@context': string
  '@type': string
  author?: Array<{
    '@type': string
    name: string
    url?: string
  }>
  dateModified?: string
  datePublished?: string
  description?: string
  headline?: string
  name?: string
  publisher?: {
    '@type': string
    name: string
    url: string
  }
  url?: string
}

export function getSchemaType(type: ContentType): string {
  switch (type) {
    case 'article':
      return 'Article'
    case 'blog':
      return 'BlogPosting'
    case 'page':
    default:
      return 'WebPage'
  }
}

export function createStructuredData(meta: MetaData, config: typeof GLOBAL_CONFIG): StructuredData {
  const {
    author,
    canonicalUrl,
    contentType = 'page',
    description,
    modDatetime,
    pubDatetime,
    title,
  } = meta

  const structuredData: StructuredData = {
    '@context': 'https://schema.org',
    '@type': getSchemaType(contentType),
    description,
    headline: title,
    name: title,
    url: canonicalUrl?.toString(),
    ...(modDatetime && { dateModified: modDatetime.toISOString() }),
    ...(pubDatetime && { datePublished: pubDatetime.toISOString() }),
  }

  // Add author for articles and blog posts
  if ((contentType === 'article' || contentType === 'blog') && typeof author === 'object') {
    structuredData.author = [
      {
        '@type': 'Person',
        name: author.name,
        ...(author.url && { url: author.url }),
      },
    ]
  }

  // Add publisher for pages
  if (contentType === 'page') {
    structuredData.publisher = {
      '@type': 'Organization',
      name: config.name,
      url: config.site.origin,
    }
  }

  return structuredData
}

// Generate social image URL
export function getSocialImageURL(ogImage?: string, siteUrl?: string): string {
  return ogImage || `${siteUrl}/og-image.jpg`
}

// Create meta tags for social media
export function createSocialMetaTags(meta: MetaData, site: typeof GLOBAL_CONFIG) {
  const { canonicalUrl, description, ogImage, title } = meta
  const socialImageURL = getSocialImageURL(ogImage, site.site.origin)

  return {
    // Open Graph / Facebook
    'og:description': description,
    'og:image': socialImageURL,
    'og:site_name': site.name,
    'og:title': title,
    'og:type': 'website',
    'og:url': canonicalUrl?.toString(),

    // Twitter
    'twitter:card': 'summary_large_image',
    'twitter:description': description,
    'twitter:image': socialImageURL,
    'twitter:title': title,
    'twitter:url': canonicalUrl?.toString(),
  }
}

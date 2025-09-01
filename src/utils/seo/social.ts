import type { SeoContentType, SeoMeta } from './types'

import { GLOBAL_CONFIG } from '@/configs/global'

const OG_TYPE_MAP: Record<SeoContentType, string> = {
  article: 'article',
  blog: 'article',
  page: 'website',
} as const

function getSocialImageUrl(ogImage?: string, siteUrl?: string): string {
  return ogImage || `${siteUrl}/og-image.jpg`
}

export function buildSocialMetaTags(meta: SeoMeta) {
  const { canonicalUrl, contentType = 'page', description, ogImage, title } = meta
  const socialImageUrl = getSocialImageUrl(ogImage, GLOBAL_CONFIG.site.origin)
  const ogType = OG_TYPE_MAP[contentType]
  const absoluteCanonical = canonicalUrl
    ? new URL(canonicalUrl, GLOBAL_CONFIG.site.origin).toString()
    : undefined

  return {
    // Open Graph / Facebook
    'og:description': description,
    'og:image': socialImageUrl,
    'og:site_name': GLOBAL_CONFIG.name,
    'og:title': title,
    'og:type': ogType,
    'og:url': absoluteCanonical,

    // Twitter
    'twitter:card': 'summary_large_image',
    'twitter:description': description,
    'twitter:image': socialImageUrl,
    'twitter:title': title,
    'twitter:url': absoluteCanonical,
  }
}

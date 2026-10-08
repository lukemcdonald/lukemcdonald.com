import type { SeoContentType, SeoMeta } from './types'

import { GLOBAL_CONFIG } from '@/configs/global'
import { DEFAULT_OG_IMAGE_PATH, OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH } from '@/utils/og'

const OG_TYPE_MAP: Record<SeoContentType, string> = {
  article: 'article',
  blog: 'article',
  page: 'website',
} as const

function toAbsoluteUrl(path: string | URL, site: string | URL) {
  return new URL(path, site).toString()
}

function getSocialImageUrl(ogImage: string | undefined, site: string | URL) {
  return toAbsoluteUrl(ogImage || DEFAULT_OG_IMAGE_PATH, site)
}

export function buildSocialMetaTags(meta: SeoMeta, site: string | URL = GLOBAL_CONFIG.site.origin) {
  const { canonicalUrl, contentType = 'page', description, ogImage, title } = meta
  const socialImageUrl = getSocialImageUrl(ogImage, site)
  const ogType = OG_TYPE_MAP[contentType]
  const absoluteCanonical = canonicalUrl ? toAbsoluteUrl(canonicalUrl, site) : undefined

  return {
    // Open Graph / Facebook
    'og:description': description,
    'og:image': socialImageUrl,
    'og:image:height': String(OG_IMAGE_HEIGHT),
    'og:image:width': String(OG_IMAGE_WIDTH),
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

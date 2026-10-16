import type { SeoContentType, SeoMeta } from './types'

import { GLOBAL_CONFIG } from '@/configs/global'
import { DEFAULT_OG_IMAGE_PATH, OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH } from '@/utils/og'

const OG_TYPE_MAP: Record<SeoContentType, string> = {
  article: 'article',
  blog: 'article',
  page: 'website',
} as const

function buildAbsoluteUrl(path: string | URL, site: string | URL) {
  return new URL(path, site).toString()
}

function buildSocialImageUrl(ogImage: string | undefined, site: string | URL) {
  return buildAbsoluteUrl(ogImage || DEFAULT_OG_IMAGE_PATH, site)
}

export function buildSocialMetaTags(meta: SeoMeta, site: string | URL = GLOBAL_CONFIG.site.origin) {
  const { canonicalUrl, contentType = 'page', description, ogImage, title } = meta
  const socialImageUrl = buildSocialImageUrl(ogImage, site)
  const ogType = OG_TYPE_MAP[contentType]
  const absoluteCanonical = canonicalUrl ? buildAbsoluteUrl(canonicalUrl, site) : undefined

  return {
    'og:description': description,
    'og:image': socialImageUrl,
    'og:image:height': String(OG_IMAGE_HEIGHT),
    'og:image:width': String(OG_IMAGE_WIDTH),
    'og:site_name': GLOBAL_CONFIG.name,
    'og:title': title,
    'og:type': ogType,
    'og:url': absoluteCanonical,
    'twitter:card': 'summary_large_image',
    'twitter:description': description,
    'twitter:image': socialImageUrl,
    'twitter:title': title,
    'twitter:url': absoluteCanonical,
  }
}

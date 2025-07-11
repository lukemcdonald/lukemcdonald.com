/**
 * Sitemap URLs configuration
 */

export const SITEMAP_ROUTES = [
  '/',
  '/i-am-a/christian',
  '/i-am-a/coach',
  '/i-am-a/father',
  '/i-am-a/husband',
] as const

export type SitemapRoute = (typeof SITEMAP_ROUTES)[number]

import type { APIRoute } from 'astro'

const createRobotsTxt = (sitemapURL: URL) => `
User-agent: *
Allow: /
Disallow: /api/
Disallow: /dev/

Sitemap: ${sitemapURL.href}
`

export const GET: APIRoute = ({ site }) => {
  const sitemapURL = new URL('sitemap-index.xml', site)
  return new Response(createRobotsTxt(sitemapURL))
}

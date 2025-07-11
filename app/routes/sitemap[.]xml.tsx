import { SITE_URL } from '#app/constants/config'
import { SITEMAP_ROUTES } from '#app/constants/sitemap'

export const loader = async () => {
  const urlEntries = SITEMAP_ROUTES.map((url: string) => {
    const fullUrl = `${SITE_URL}${url === '/' ? '' : encodeURI(url)}`
    return `<url><loc>${fullUrl}</loc></url>`
  }).join('')

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`

  return new Response(sitemap, {
    headers: { 'Content-Type': 'application/xml' },
  })
}

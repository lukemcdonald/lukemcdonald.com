import type { APIRoute } from 'astro'

import { getEntry } from 'astro:content'

import { GLOBAL_CONFIG } from '@/configs/global'
import { toPageSeo } from '@/features/pages/pages.utils'

export const prerender = true

export const GET: APIRoute = async () => {
  const page = await getEntry('pages', 'index')

  if (!page) {
    return new Response(null, { status: 404 })
  }

  const body = JSON.stringify({
    background_color: GLOBAL_CONFIG.backgroundColor,
    description: toPageSeo(page).description,
    display: 'standalone',
    icons: [
      {
        sizes: '192x192',
        src: '/icons/icon-192.png',
        type: 'image/png',
      },
      {
        sizes: '512x512',
        src: '/icons/icon-512.png',
        type: 'image/png',
      },
      {
        purpose: 'maskable',
        sizes: '512x512',
        src: '/icons/icon-512-maskable.png',
        type: 'image/png',
      },
    ],
    name: GLOBAL_CONFIG.name,
    short_name: GLOBAL_CONFIG.name,
    start_url: '/',
    theme_color: GLOBAL_CONFIG.themeColor,
  })

  return new Response(body, {
    headers: {
      'Content-Type': 'application/manifest+json',
    },
  })
}

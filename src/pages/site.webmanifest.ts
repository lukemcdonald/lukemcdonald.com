import type { APIRoute } from 'astro'

import { GLOBAL_CONFIG } from '@/configs/global'

export const prerender = true

export const GET: APIRoute = () => {
  const body = JSON.stringify({
    background_color: GLOBAL_CONFIG.themeColor,
    description: GLOBAL_CONFIG.description,
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

import type { APIRoute } from 'astro'

import { getTodayVerse } from '@/features/verse/verse.server'
import { verseCacheHeaders } from '@/features/verse/verse.utils'

export const prerender = false

export const GET: APIRoute = async () => {
  const verse = await getTodayVerse()

  return new Response(JSON.stringify(verse), {
    headers: {
      ...verseCacheHeaders(),
      'Content-Type': 'application/json',
    },
  })
}

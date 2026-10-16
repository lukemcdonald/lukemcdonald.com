import type { APIRoute } from 'astro'

import { loadTodayVerse } from '@/features/verse/verse.server'
import { buildVerseCacheHeaders } from '@/features/verse/verse.utils'

export const prerender = false

export const GET: APIRoute = async () => {
  const verse = await loadTodayVerse()

  return new Response(JSON.stringify(verse), {
    headers: {
      ...buildVerseCacheHeaders(),
      'Content-Type': 'application/json',
    },
  })
}

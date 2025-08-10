import type { APIRoute } from 'astro'

import { getResumeData } from '@/features/resume/resume.server'

export const GET: APIRoute = async () => {
  const result = await getResumeData()

  return new Response(JSON.stringify(result), {
    headers: {
      // 30 minutes, 1 week, 30 days
      'Cache-Control': 'public, max-age=1800, s-maxage=604800, stale-while-revalidate=2592000',
      'Content-Type': 'application/json',
    },
  })
}

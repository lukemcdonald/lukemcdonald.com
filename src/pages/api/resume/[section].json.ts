import type { APIRoute } from 'astro'

import { getResumeSection } from '@/features/resume/resume.server'

/**
 * Returns a JSON payload for a given resume section.
 *
 * @param params - The route parameters
 * @returns A JSON payload for the given resume section
 */
export const GET: APIRoute = async ({ params }) => {
  const { section } = params

  if (!section) {
    return new Response(null, { status: 400 })
  }

  const payload = await getResumeSection(section)

  if (payload === null) {
    return new Response(null, { status: 404 })
  }

  return new Response(JSON.stringify(payload), {
    headers: {
      // 30 minutes, 1 week, 30 days
      'Cache-Control': 'public, max-age=1800, s-maxage=604800, stale-while-revalidate=2592000',
      'Content-Type': 'application/json',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  })
}

import type { APIRoute } from 'astro'

import { getCollection } from 'astro:content'

import { getResumeSection } from '@/features/resume/resume.server'
import { parseContentId } from '@/utils/content'

/**
 * Required by Astro for dynamic routes.
 * Returns a list of all resume sections to generate static paths at build time.
 */
export async function getStaticPaths() {
  const entries = await getCollection('resume')
  const sections = new Set<string>()

  for (const entry of entries) {
    const { section } = parseContentId(entry.id)

    if (section) {
      sections.add(section)
    }
  }

  return Array.from(sections).map((section) => ({
    params: { section },
  }))
}

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

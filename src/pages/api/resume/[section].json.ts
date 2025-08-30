import type { APIRoute } from 'astro'

import { getCollection, getEntry } from 'astro:content'

import { parseContentId, stripDataExtension } from '@/utils/content'
import { getDateKey, sortByDateDesc } from '@/utils/dates'

/**
 * Returns a list of all resume sections.
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
  const { section: sectionId } = params

  if (!sectionId) {
    return new Response(null, { status: 400 })
  }

  // Try exact top-level entry first (e.g., resume/experience.yaml)
  const topLevel = await getEntry('resume', sectionId)

  // Also collect any nested entries (e.g., resume/experience/*.yaml)
  const all = await getCollection('resume')

  const nested = all
    .map((e) => ({ data: e.data, key: stripDataExtension(e.id) }))
    .filter((e) => e.key.startsWith(sectionId + '/'))
    .map((e) => ({ id: e.key.slice(sectionId.length + 1), ...e.data }))

  let payload: unknown

  if (nested.length > 0) {
    payload = sortByDateDesc(nested, getDateKey)
  } else if (topLevel) {
    payload = topLevel.data
  } else {
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

import type { APIRoute } from 'astro'

import { getCollection, getEntry } from 'astro:content'

import {
  getDateKey,
  parseContentId,
  sortByDateDesc,
  stripDataExtension,
} from '@/utils/content/normalize'

export async function getStaticPaths() {
  const entries = await getCollection('resume')
  const sections = new Set<string>()
  for (const entry of entries) {
    const { section } = parseContentId(entry.id)
    if (section) sections.add(section)
  }
  return Array.from(sections).map((section) => ({
    params: { section },
  }))
}

export const GET: APIRoute = async ({ params }) => {
  const { section: sectionId } = params

  if (!sectionId) {
    return new Response(null, { status: 400 })
  }

  // Try exact top-level entry first (e.g., resume/experience.json)
  const topLevel = await getEntry('resume', sectionId)

  // Also collect any nested entries (e.g., resume/experience/*.yaml)
  const all = await getCollection('resume')
  const nested = all
    .map((e) => ({ data: e.data, key: stripDataExtension(e.id) }))
    .filter((e) => e.key.startsWith(sectionId + '/'))
    .map((e) => ({ id: e.key.slice(sectionId.length + 1), ...e.data }))

  // date key extraction is shared via getDateKey

  let payload: unknown
  if (nested.length > 0) {
    // Sort nested by date/startDate desc if present
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
    },
  })
}

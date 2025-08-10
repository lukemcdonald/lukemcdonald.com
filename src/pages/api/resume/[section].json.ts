import type { APIRoute } from 'astro'
import { getCollection, getEntry } from 'astro:content'

export async function getStaticPaths() {
  const entries = await getCollection('resume')
  const sections = new Set<string>()
  for (const entry of entries) {
    const id = entry.id.replace(/\.(json|ya?ml)$/i, '')
    const first = id.split('/')[0]
    sections.add(first)
  }
  return Array.from(sections).map((section) => ({
    params: { id: section },
  }))
}

export const GET: APIRoute = async ({ params }) => {
  const { id: sectionId } = params

  if (!sectionId) {
    return new Response(null, { status: 400 })
  }

  // Try exact top-level entry first (e.g., resume/experience.json)
  const topLevel = await getEntry('resume', sectionId)

  // Also collect any nested entries (e.g., resume/experience/*.yaml)
  const all = await getCollection('resume')
  const normalizeId = (id: string) => id.replace(/\.(json|ya?ml)$/i, '')
  const nested = all
    .map((e) => ({ key: normalizeId(e.id), data: e.data }))
    .filter((e) => e.key.startsWith(sectionId + '/'))
    .map((e) => ({
      id: e.key.slice(sectionId.length + 1),
      ...e.data,
    }))

  const getDateLike = (obj: unknown): string => {
    if (obj && typeof obj === 'object') {
      const anyObj = obj as Record<string, unknown>
      return String(anyObj.date || anyObj.startDate || '')
    }
    return ''
  }

  let payload: unknown
  if (nested.length > 0) {
    // Sort nested by date/startDate desc if present
    payload = nested.sort((a, b) => {
      const ad = getDateLike(a)
      const bd = getDateLike(b)
      return (
        ad < bd ? 1
        : ad > bd ? -1
        : 0
      )
    })
  } else if (topLevel) {
    payload = topLevel.data
  } else {
    return new Response(null, { status: 404 })
  }

  return new Response(JSON.stringify(payload), {
    headers: {
      'Content-Type': 'application/json',
      // 30 minutes, 1 week, 30 days
      'Cache-Control': 'public, max-age=1800, s-maxage=604800, stale-while-revalidate=2592000',
    },
  })
}

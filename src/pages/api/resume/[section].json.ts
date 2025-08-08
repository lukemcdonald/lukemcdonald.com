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
  return Array.from(sections).map((section) => ({ params: { section } }))
}

export const GET: APIRoute = async ({ params }) => {
  const section = params?.section
  if (!section) return new Response(null, { status: 400 })

  // Try exact top-level entry first (e.g., resume/work.json)
  const topLevel = await getEntry('resume', section)

  // Also collect any nested entries (e.g., resume/work/*.yaml)
  const all = await getCollection('resume')
  const normalizeId = (id: string) => id.replace(/\.(json|ya?ml)$/i, '')
  const nested = all
    .map((e) => ({ key: normalizeId(e.id), data: e.data }))
    .filter((e) => e.key.startsWith(section + '/'))
    .map((e) => ({
      id: e.key.slice(section.length + 1),
      ...(typeof e.data === 'object' ? e.data : { value: e.data }),
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
    headers: { 'Content-Type': 'application/json' },
  })
}

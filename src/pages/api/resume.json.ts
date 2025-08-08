import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'

// Aggregate all entries in the `resume` collection into a single JSON object
export const GET: APIRoute = async () => {
  const entries = await getCollection('resume')

  // Group by top-level key. Files directly under `resume/` become fields.
  // Files under a subdirectory (e.g. `work/zenbusiness`) become an array under that key.
  const result: Record<string, unknown> = {}

  for (const entry of entries) {
    const id = entry.id.replace(/\.(json|ya?ml)$/i, '')
    const parts = id.split('/')
    if (parts.length === 1) {
      result[parts[0]] = entry.data
    } else {
      const [section, ...rest] = parts
      const itemId = rest.join('/')
      const arr = (result[section] as Array<unknown>) || []
      const next = [
        ...arr,
        {
          id: itemId,
          ...(entry.data && typeof entry.data === 'object' ? entry.data : { value: entry.data }),
        },
      ]
      result[section] = next
    }
  }

  // Optional: sort arrays with a date or startDate field descending
  for (const [key, value] of Object.entries(result)) {
    if (Array.isArray(value)) {
      result[key] = [...value].sort((a: any, b: any) => {
        const ad = a?.date || a?.startDate || ''
        const bd = b?.date || b?.startDate || ''
        return (
          ad < bd ? 1
          : ad > bd ? -1
          : 0
        )
      })
    }
  }

  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' },
  })
}

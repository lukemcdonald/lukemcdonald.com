import type { ResumeData } from '@/features/resume/resume.types'
import { getCollection } from 'astro:content'

type Dateable = { date?: string; startDate?: string }

/**
 * Aggregates all entries in the `resume` collection into a single JSON object.
 * - Top-level files (e.g. `basics.yaml`) become fields on the root object
 * - Nested files (e.g. `experience/zenbusiness.yaml`) become array items under their section
 * - Arrays are sorted by `date` or `startDate` descending when present
 */
export async function getResumeData(): Promise<ResumeData> {
  const entries = await getCollection('resume')

  const result: Record<string, unknown> = {}

  for (const entry of entries) {
    const id = entry.id.replace(/\.(json|ya?ml)$/i, '')
    const parts = id.split('/')
    if (parts.length === 1) {
      result[parts[0]] = entry.data
    } else {
      const [section, ...rest] = parts
      const itemId = rest.join('/')
      const existing = (result[section] as Array<unknown>) || []
      const next = [
        ...existing,
        {
          id: itemId,
          ...(entry.data && typeof entry.data === 'object' ? entry.data : { value: entry.data }),
        },
      ]
      result[section] = next
    }
  }

  for (const [key, value] of Object.entries(result)) {
    if (Array.isArray(value)) {
      result[key] = [...value].sort((a: unknown, b: unknown) => {
        const ad = (a as Dateable).date || (a as Dateable).startDate || ''
        const bd = (b as Dateable).date || (b as Dateable).startDate || ''
        return (
          ad < bd ? 1
          : ad > bd ? -1
          : 0
        )
      })
    }
  }

  return result as unknown as ResumeData
}

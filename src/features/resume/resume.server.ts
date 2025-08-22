import type { ResumeData } from '@/features/resume/resume.types'

import { getCollection } from 'astro:content'

import { parseContentId, sortByDateDesc } from '@/utils/content/normalize'

/**
 * Aggregates all entries in the `resume` collection into a single JSON object.
 *
 * - Top-level files (e.g. `basics.yaml`) become fields on the root object
 * - Nested files (e.g. `experience/zenbusiness.yaml`) become array items under their section
 * - Arrays are sorted by `date` or `startDate` descending when present
 */
export async function getResumeData(): Promise<ResumeData> {
  const entries = await getCollection('resume')

  const result: Record<string, unknown> = {}

  for (const entry of entries) {
    const { isTopLevel, itemId, section } = parseContentId(entry.id)

    if (isTopLevel) {
      result[section] = entry.data
      continue
    }

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

  for (const [key, value] of Object.entries(result)) {
    if (Array.isArray(value)) {
      result[key] = sortByDateDesc(value)
    }
  }

  return result as unknown as ResumeData
}

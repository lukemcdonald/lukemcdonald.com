import type { ResumeData } from '@/features/resume/resume.types'

import { getCollection, getEntry } from 'astro:content'

import { parseContentId } from '@/utils/content'
import { getDateKey, sortByDateDesc, sortExperienceByEndDate } from '@/utils/dates'

/**
 * Aggregates all entries in the `resume` collection into a single JSON object.
 *
 * - Top-level files (e.g. `basics.yaml`) become fields on the root object
 * - Nested files (e.g. `experience/zenbusiness.yaml`) become array items under their section
 * - Arrays are sorted by `date` or `startDate` descending when present
 * - Experience items are sorted by `endDate` with "Present" positions first, then by endDate descending
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
      // Use custom sorting for experience items
      if (key === 'experience') {
        result[key] = sortExperienceByEndDate(value as ResumeData['experience'])
      } else {
        result[key] = sortByDateDesc(value)
      }
    }
  }

  return result as unknown as ResumeData
}

/**
 * Gets a specific resume section by section ID.
 *
 * - Returns top-level entry data if section is a single file (e.g., `basics.yaml`)
 * - Returns array of nested entries if section has nested files (e.g., `experience/*.yaml`)
 * - Only sorts arrays when items have date fields (`date` or `startDate`)
 * - Experience items are sorted by `endDate` with "Present" positions first, then by endDate descending
 * - Returns null if section doesn't exist
 *
 * @param sectionId - The section ID to retrieve
 * @returns The section data (object, array, or null)
 */
export async function getResumeSection(sectionId: string) {
  // Try exact top-level entry first (e.g., resume/experience.yaml)
  const topLevel = await getEntry('resume', sectionId)

  // Collect all entries and filter for this section
  const allEntries = await getCollection('resume')

  const nestedEntries = allEntries
    // Map to the expected shape
    .map((entry) => ({
      data: entry.data,
      parsed: parseContentId(entry.id),
    }))
    // Filter for nested entries in the specified section
    .filter((entry) => {
      const { isTopLevel, section } = entry.parsed
      return !isTopLevel && section === sectionId
    })
    // Map to the expected shape
    .map((entry) => {
      const itemId = entry.parsed.itemId
      const isDataObject = entry.data && typeof entry.data === 'object'
      return { id: itemId, ...(isDataObject ? entry.data : { value: entry.data }) }
    })

  // If we have nested entries, return them (sorted if they have dates)
  if (nestedEntries.length > 0) {
    // Use custom sorting for experience items
    if (sectionId === 'experience') {
      return sortExperienceByEndDate(nestedEntries as ResumeData['experience'])
    }
    const hasDates = nestedEntries.some((item) => getDateKey(item) !== '')
    return hasDates ? sortByDateDesc(nestedEntries, getDateKey) : nestedEntries
  }

  // Otherwise return top-level entry data if it exists
  if (topLevel) {
    return topLevel.data
  }

  return null
}

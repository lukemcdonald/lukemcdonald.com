import type { ResumeData } from './resume.types'
import type { CollectionEntry } from 'astro:content'

import { parseContentId } from '@/utils/content'
import { sortByDateDesc, sortExperienceByEndDate } from '@/utils/dates'

type ResumeEntry = CollectionEntry<'resume'>

function getEntryFields(data: unknown) {
  if (data && typeof data === 'object') {
    return data as Record<string, unknown>
  }

  return { value: data }
}

function assignResumeEntry(result: Record<string, unknown>, entry: ResumeEntry) {
  const { isTopLevel, itemId, section } = parseContentId(entry.id)

  if (isTopLevel) {
    result[section] = entry.data
    return
  }

  const existing = Array.isArray(result[section]) ? result[section] : []
  const fields = getEntryFields(entry.data)

  result[section] = [...existing, { id: itemId, ...fields }]
}

function sortResumeValue(key: string, value: unknown) {
  if (!Array.isArray(value)) {
    return value
  }

  if (key === 'experience') {
    return sortExperienceByEndDate(value as ResumeData['experience'])
  }

  return sortByDateDesc(value)
}

export function assembleResumeData(entries: ResumeEntry[]): ResumeData {
  const result: Record<string, unknown> = {}

  for (const entry of entries) {
    assignResumeEntry(result, entry)
  }

  for (const [key, value] of Object.entries(result)) {
    result[key] = sortResumeValue(key, value)
  }

  return result as unknown as ResumeData
}

export function pickResumeSection(data: ResumeData, sectionId: string) {
  if (!Object.hasOwn(data, sectionId)) {
    return null
  }

  return data[sectionId as keyof ResumeData]
}

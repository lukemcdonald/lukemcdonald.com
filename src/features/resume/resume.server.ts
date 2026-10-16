import type { ResumeData } from './resume.types'

import { getCollection } from 'astro:content'

import { buildResumeData, pickResumeSection } from './resume.utils'

export async function loadResumeData(): Promise<ResumeData> {
  const entries = await getCollection('resume')

  return buildResumeData(entries)
}

export async function loadResumeSection(sectionId: string) {
  const data = await loadResumeData()

  return pickResumeSection(data, sectionId)
}

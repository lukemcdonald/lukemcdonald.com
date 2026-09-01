import type { ResumeData } from './resume.types'

import { getCollection } from 'astro:content'

import { assembleResumeData, pickResumeSection } from './resume.utils'

export async function getResumeData(): Promise<ResumeData> {
  const entries = await getCollection('resume')

  return assembleResumeData(entries)
}

export async function getResumeSection(sectionId: string) {
  const data = await getResumeData()

  return pickResumeSection(data, sectionId)
}

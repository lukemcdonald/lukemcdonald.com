import type { PersonSchemaFields } from './schema'

import { getEntry } from 'astro:content'

import { GLOBAL_CONFIG } from '@/configs/global'
import { toPageSeo } from '@/features/pages/pages.utils'
import { loadResumeData } from '@/features/resume/resume.server'

export async function loadPersonSchemaFields(): Promise<PersonSchemaFields> {
  const home = await getEntry('pages', 'index')
  const resume = await loadResumeData()
  const description = (home ? toPageSeo(home).description : undefined) || resume.basics.intro
  const imageSrc = home?.data.image?.src

  return {
    description,
    image: imageSrc ? new URL(imageSrc, GLOBAL_CONFIG.site.origin).href : undefined,
    jobTitle: resume.basics.label,
  }
}

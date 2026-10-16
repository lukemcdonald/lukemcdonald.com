import type { APIRoute } from 'astro'

import { GLOBAL_CONFIG } from '@/configs/global'
import { getPublishedPages } from '@/features/pages/pages.server'
import { getResumeData } from '@/features/resume/resume.server'
import { createLlmsTxt } from '@/utils/llms-txt'

export const GET: APIRoute = async ({ site }) => {
  const pages = await getPublishedPages({ sortBy: 'order' })
  const resume = await getResumeData()
  const body = createLlmsTxt({
    name: GLOBAL_CONFIG.name,
    origin: site ?? GLOBAL_CONFIG.site.origin,
    pages,
    resume,
  })

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}

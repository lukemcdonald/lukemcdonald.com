import type { APIRoute } from 'astro'

import { GLOBAL_CONFIG } from '@/configs/global'
import { loadPublishedPages } from '@/features/pages/pages.server'
import { loadResumeData } from '@/features/resume/resume.server'
import { createLlmsTxt } from '@/utils/llms-txt'

export const GET: APIRoute = async ({ site }) => {
  const pages = await loadPublishedPages({ sortBy: 'order' })
  const resume = await loadResumeData()
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

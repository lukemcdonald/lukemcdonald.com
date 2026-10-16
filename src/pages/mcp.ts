import type { APIRoute } from 'astro'

import { GLOBAL_CONFIG } from '@/configs/global'
import { createSiteMcpHandler, handleMcpRequest } from '@/features/mcp/mcp.server'
import { getPublishedPages } from '@/features/pages/pages.server'
import { getResumeData } from '@/features/resume/resume.server'
import { getTodayVerse } from '@/features/verse/verse.server'

export const prerender = false

const mcpHandler = createSiteMcpHandler({
  getContact: () => GLOBAL_CONFIG.author,
  getPublishedPages,
  getResumeData,
  getTodayVerse,
  origin: GLOBAL_CONFIG.site.origin,
})

export const ALL: APIRoute = async ({ request }) => {
  return handleMcpRequest(request, mcpHandler)
}

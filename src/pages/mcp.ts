import type { APIRoute } from 'astro'

import { createSiteMcpHandler, handleMcpRequest } from '@/features/mcp/mcp.server'
import { getPublishedPages } from '@/features/pages/pages.server'
import { getResumeData } from '@/features/resume/resume.server'

export const prerender = false

const mcpHandler = createSiteMcpHandler({
  loadPublishedPages: getPublishedPages,
  loadResumeData: getResumeData,
})

export const ALL: APIRoute = async ({ request }) => {
  return handleMcpRequest(request, mcpHandler)
}

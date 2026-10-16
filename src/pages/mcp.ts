import type { APIRoute } from 'astro'

import { createSiteMcpHandler, handleMcpRequest } from '@/features/mcp/mcp.server'
import { loadPublishedPages } from '@/features/pages/pages.server'
import { loadResumeData } from '@/features/resume/resume.server'

export const prerender = false

const mcpHandler = createSiteMcpHandler({
  loadPublishedPages,
  loadResumeData,
})

export const ALL: APIRoute = async ({ request }) => {
  return handleMcpRequest(request, mcpHandler)
}

import type { APIRoute } from 'astro'

import { getResumeData } from '@/features/resume/resume.server'

export const GET: APIRoute = async () => {
  const result = await getResumeData()

  return new Response(JSON.stringify(result))
}

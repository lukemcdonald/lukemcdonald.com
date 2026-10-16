import type { APIRoute } from 'astro'

import { loadResumeData } from '@/features/resume/resume.server'

export const GET: APIRoute = async () => {
  const result = await loadResumeData()

  return new Response(JSON.stringify(result), {
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

import { z } from 'astro:content'

/**
 * Resume collection schema.
 * Accepts any YAML shape so sections can be arrays or objects.
 */
export function createResumeSchema() {
  return z.any()
}

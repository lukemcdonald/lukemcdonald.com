import { glob } from 'astro/loaders'
import { defineCollection } from 'astro:content'

import { createPagesSchema } from '@/features/pages/pages.schema'
import { createResumeSchema } from '@/features/resume/resume.schema'

const pagesCollection = defineCollection({
  loader: glob({
    base: './src/content/pages',
    pattern: '**/[^_]*.{md,mdx}',
  }),
  schema: ({ image }) => createPagesSchema(image),
})

const resumeCollection = defineCollection({
  loader: glob({
    base: './src/content/resume',
    pattern: '**/[^_]*.yaml',
  }),
  schema: createResumeSchema(),
})

export const collections = {
  pages: pagesCollection,
  resume: resumeCollection,
}

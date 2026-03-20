import { glob } from 'astro/loaders'
import { defineCollection } from 'astro:content'

import { createPagesSchema } from '@/features/pages/pages.schema'
import { createResumeSchema } from '@/features/resume/resume.schema'
import { getCollectionMeta } from '@/utils/collections'

const pages = getCollectionMeta('pages')
const resume = getCollectionMeta('resume')

const pagesCollection = defineCollection({
  loader: glob({
    base: `./${pages.path}`,
    pattern: '**/[^_]*.{md,mdx}',
  }),
  schema: ({ image }) => createPagesSchema(image),
})

const resumeCollection = defineCollection({
  loader: glob({
    base: `./${resume.path}`,
    pattern: '**/[^_]*.yaml',
  }),
  schema: createResumeSchema(),
})

export const collections = {
  [pages.id]: pagesCollection,
  [resume.id]: resumeCollection,
}

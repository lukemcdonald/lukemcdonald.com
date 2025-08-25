import { glob } from 'astro/loaders'
import { defineCollection, z } from 'astro:content'

import { getCollectionMeta } from '@/utils/collections'

const pages = getCollectionMeta('pages')
const resume = getCollectionMeta('resume')

const createPagesCollection = function () {
  return defineCollection({
    loader: glob({
      base: `./${pages.path}`,
      pattern: '**/[^_]*.{md,mdx}',
    }),
    schema: ({ image }) =>
      z.object({
        description: z.string().optional(),
        draft: z.boolean().default(false),
        image: image().optional(),
        imageAlt: z.string().optional(),
        modDatetime: z.date().optional(),
        order: z.number().optional(),
        pubDatetime: z.date().optional(),
        seo: z
          .object({
            description: z.string().optional(),
            ogImage: z.string().optional(),
            title: z.string().optional(),
          })
          .optional(),
        subtitle: z.string().optional(),
        title: z.string(),
      }),
  })
}

const pagesCollection = createPagesCollection()
const resumeCollection = defineCollection({
  loader: glob({
    base: `./${resume.path}`,
    pattern: '**/[^_]*.yaml',
  }),
  // Accept any YAML shape so sections can be arrays or objects
  schema: z.any(),
})

export const collections = {
  [pages.id]: pagesCollection,
  [resume.id]: resumeCollection,
}

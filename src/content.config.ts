import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'
import { getCollectionMeta } from '@/utils/collections'

const pages = getCollectionMeta('pages')
const resume = getCollectionMeta('resume')

const createPagesCollection = function () {
  return defineCollection({
    loader: glob({
      pattern: '**/[^_]*.{md,mdx}',
      base: `./${pages.path}`,
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
        subtitle: z.string().optional(),
        title: z.string(),
        seo: z
          .object({
            title: z.string().optional(),
            description: z.string().optional(),
            ogImage: z.string().optional(),
          })
          .optional(),
      }),
  })
}

const pagesCollection = createPagesCollection()
const resumeCollection = defineCollection({
  loader: glob({
    pattern: '**/[^_]*.yaml',
    base: `./${resume.path}`,
  }),
  // Accept any YAML shape so sections can be arrays or objects
  schema: z.any(),
})

export const collections = {
  [pages.id]: pagesCollection,
  [resume.id]: resumeCollection,
}

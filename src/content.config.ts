import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'
import { getCollectionNameByKey, getCollectionPath } from '@/utils/collections'

const createPagesCollection = function () {
  const collectionPath = getCollectionPath('pages')
  return defineCollection({
    loader: glob({
      pattern: '**/[^_]*.{md,mdx}',
      base: `./${collectionPath}`,
    }),
    schema: () =>
      z.object({
        description: z.string().optional(),
        draft: z.boolean().default(false),
        image: z.string().optional(),
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

export const collections = {
  [getCollectionNameByKey('pages')]: pagesCollection,
}

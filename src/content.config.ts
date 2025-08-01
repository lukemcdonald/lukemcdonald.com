import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'
import { getCollectionNameByKey, getCollectionPath } from './utils/collections'

const contentSchema = {
  description: z.string().optional(),
  draft: z.boolean().default(false),
  image: z.string().optional(),
  imageAlt: z.string().optional(),
  modDatetime: z.date().optional(),
  pubDatetime: z.date().optional(),
  subtitle: z.string().optional(),
  title: z.string(),
}

function createMainCollection() {
  const collectionPath = getCollectionPath('main')
  return defineCollection({
    loader: glob({
      pattern: '**/[^_]*.{md,mdx}',
      base: `./${collectionPath}`,
    }),
    schema: () =>
      z.object({
        ...contentSchema,
      }),
  })
}

function createIdentityCollection() {
  const collectionPath = getCollectionPath('identity')
  return defineCollection({
    loader: glob({
      pattern: '**/[^_]*.{md,mdx}',
      base: `./${collectionPath}`,
      // generateId: (options) => options.data.title as unknown as string,
    }),
    schema: () =>
      z.object({
        ...contentSchema,
      }),
  })
}

const mainCollection = createMainCollection()
const identityCollection = createIdentityCollection()

export const collections = {
  [getCollectionNameByKey('main')]: mainCollection,
  [getCollectionNameByKey('identity')]: identityCollection,
}

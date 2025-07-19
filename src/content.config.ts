import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'
import { CONTENT_PATHS } from './config'
import { getCollectionNameByKey } from './utils/collections'

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
  return defineCollection({
    loader: glob({
      pattern: '**/[^_]*.md',
      base: `./${CONTENT_PATHS.main}`,
    }),
    schema: () =>
      z.object({
        ...contentSchema,
      }),
  })
}

function createIdentityCollection() {
  return defineCollection({
    loader: glob({
      pattern: '**/[^_]*.md',
      base: `./${CONTENT_PATHS.identity}`,
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

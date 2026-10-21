import type { ImageMetadata } from 'astro'

import { z } from 'astro/zod'

export function createPagesSchema(image: () => z.ZodType<ImageMetadata>) {
  return z
    .object({
      date: z.coerce.date().optional(),
      description: z.string().optional(),
      draft: z.boolean().default(false),
      hideFromMenu: z.boolean().optional(),
      image: image().optional(),
      imageAlt: z.string().optional(),
      navGroup: z.enum(['live', 'play', 'work']).optional(),
      order: z.number().optional(),
      seo: z
        .object({
          description: z.string().optional(),
          ogImage: z.string().optional(),
          title: z.string().optional(),
        })
        .optional(),
      subtitle: z.string().optional(),
      title: z.string(),
      updated: z.coerce.date().optional(),
    })
    .transform((data) => ({
      ...data,
      modDate: data.updated,
      pubDate: data.date,
    }))
}

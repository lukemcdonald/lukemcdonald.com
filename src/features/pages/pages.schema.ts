import { z } from 'astro:content'

export function createPagesSchema(image: () => z.ZodTypeAny) {
  return z
    .object({
      date: z.coerce.date().optional(),
      description: z.string().optional(),
      draft: z.boolean().default(false),
      image: image().optional(),
      imageAlt: z.string().optional(),
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

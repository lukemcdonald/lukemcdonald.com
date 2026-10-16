import { z } from 'astro/zod'

/**
 * Date string validator that accepts ISO date strings (YYYY-MM or YYYY-MM-DD)
 */
const dateStringSchema = z.string().regex(/^\d{4}-\d{2}(-\d{2})?$/, {
  message: 'Date must be in YYYY-MM or YYYY-MM-DD format',
})

/**
 * End date validator that accepts date strings, 'present' (case-insensitive), or null
 */
const endDateSchema = z
  .union([
    dateStringSchema,
    z.string().refine((val) => val.toLowerCase() === 'present', {
      message: 'End date must be a date string or "present"',
    }),
    z.null(),
  ])
  .optional()

/**
 * Experience item schema
 */
const experienceSchema = z.object({
  company: z.string(),
  endDate: endDateSchema,
  highlights: z.array(z.string()).optional(),
  location: z.string().optional(),
  position: z.string(),
  startDate: dateStringSchema,
  summary: z.string().optional(),
  website: z.url().optional(),
})

/**
 * Education item schema
 */
const educationSchema = z.object({
  area: z.string().optional(),
  institution: z.string(),
  studyType: z.string().optional(),
})

/**
 * Award item schema
 */
const awardSchema = z.object({
  date: dateStringSchema.optional(),
  description: z.string().optional(),
  org: z.string().optional(),
  title: z.string(),
})

/**
 * Community item schema.
 * Strict so award items with date/org cannot match this branch and lose fields.
 */
const communitySchema = z
  .object({
    description: z.string().optional(),
    title: z.string(),
  })
  .strict()

/**
 * Location schema for basics
 */
const locationSchema = z.object({
  city: z.string().optional(),
  region: z.string().optional(),
})

/**
 * Basics schema
 */
const basicsSchema = z.object({
  intro: z.string().optional(),
  label: z.string().optional(),
  location: locationSchema.optional(),
  phone: z.string().optional(),
})

const skillCategorySchema = z.object({
  category: z.string(),
  items: z.array(z.string()),
})

/**
 * Resume collection schema.
 * Validates all possible resume entry shapes:
 * - Experience items (single object)
 * - Education items (array or single object)
 * - Award items (array or single object)
 * - Basics (single object)
 * - Skills (array of categories with skill lists)
 * - Community items (array)
 * - Personal (array of strings)
 */
export function createResumeSchema() {
  return z.union([
    experienceSchema,
    educationSchema,
    awardSchema,
    basicsSchema,
    z.array(skillCategorySchema),
    z.array(educationSchema),
    z.array(communitySchema),
    z.array(awardSchema),
    z.array(z.string()),
  ])
}

/** Assembled resume document. Section keys are the get_resume enum. */
export const resumeDataSchema = z.object({
  awards: z.array(awardSchema),
  basics: basicsSchema.extend({
    email: z.string().optional(),
    name: z.string(),
    profiles: z
      .array(
        z.object({
          network: z.string(),
          url: z.string(),
          username: z.string(),
        }),
      )
      .optional(),
    website: z.string().optional(),
  }),
  community: z.array(communitySchema),
  education: z.array(educationSchema),
  experience: z.array(experienceSchema.extend({ id: z.string().optional() })),
  personal: z.array(z.string()),
  skills: z.array(skillCategorySchema),
})

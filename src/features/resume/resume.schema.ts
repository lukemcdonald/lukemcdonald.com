import { z } from 'astro:content'

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
  image: z.string().optional(),
  location: z.string().optional(),
  position: z.string(),
  startDate: dateStringSchema,
  summary: z.string().optional(),
  website: z.string().url().optional(),
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
 * Profile schema for basics
 */
const profileSchema = z.object({
  network: z.string(),
  url: z.string().url(),
  username: z.string(),
})

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
  email: z.string().email().optional(),
  intro: z.string().optional(),
  label: z.string().optional(),
  location: locationSchema.optional(),
  name: z.string(),
  phone: z.string().optional(),
  profiles: z.array(profileSchema).optional(),
  website: z.string().url().optional(),
})

/**
 * Resume collection schema.
 * Validates all possible resume entry shapes:
 * - Experience items (single object)
 * - Education items (array or single object)
 * - Award items (array or single object)
 * - Basics (single object)
 * - Skills (array of strings)
 * - Personal (array of strings)
 */
export function createResumeSchema() {
  return z.union([
    experienceSchema,
    educationSchema,
    awardSchema,
    basicsSchema,
    z.array(educationSchema),
    z.array(awardSchema),
    z.array(z.string()),
  ])
}

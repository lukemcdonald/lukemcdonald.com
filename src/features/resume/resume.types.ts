import type { resumeDataSchema } from './resume.schema'
import type { z } from 'astro/zod'

export type ResumeData = z.infer<typeof resumeDataSchema>
export type AwardItem = ResumeData['awards'][number]
export type BasicsItem = ResumeData['basics']
export type CommunityItem = ResumeData['community'][number]
export type EducationItem = ResumeData['education'][number]
export type ExperienceItem = ResumeData['experience'][number]
export type SkillCategory = ResumeData['skills'][number]

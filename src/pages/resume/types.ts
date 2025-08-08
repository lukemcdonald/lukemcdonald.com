import type { CollectionEntry } from 'astro:content'

export type AwardsData = CollectionEntry<'resume'>['data']['awards']
export type BasicsData = CollectionEntry<'resume'>['data']['basics']
export type EducationData = CollectionEntry<'resume'>['data']['education']
export type ExperienceData = CollectionEntry<'resume'>['data']['experience']
export type PersonalData = CollectionEntry<'resume'>['data']['personal']
export type SkillsData = CollectionEntry<'resume'>['data']['skills']

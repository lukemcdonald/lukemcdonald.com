import type { CollectionEntry } from 'astro:content'

export type BasicsData = CollectionEntry<'resume'>['data']['basics']
export type SkillsData = CollectionEntry<'resume'>['data']['skills']
export type WorkData = CollectionEntry<'resume'>['data']['work']
export type AwardsData = CollectionEntry<'resume'>['data']['awards']
export type EducationData = CollectionEntry<'resume'>['data']['education']
export type PersonalData = CollectionEntry<'resume'>['data']['personal']

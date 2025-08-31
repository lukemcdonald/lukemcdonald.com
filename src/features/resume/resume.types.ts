export interface AwardItem {
  date?: string
  org?: string
  title: string
}

export interface BasicsItem {
  email?: string
  intro?: string
  label?: string
  name: string
  website?: string
}

export interface EducationItem {
  area?: string
  institution: string
  studyType?: string
}

export interface LinkItem {
  label?: string
  url: string
}

export interface ExperienceItem {
  company: string
  endDate?: string | null
  highlights?: string[]
  position: string
  startDate: string
  summary?: string
  website?: string
  links?: LinkItem[]
}

export interface ResumeData {
  awards: AwardItem[]
  basics: BasicsItem
  education: EducationItem[]
  experience: ExperienceItem[]
  personal: string[]
  skills: string[]
}

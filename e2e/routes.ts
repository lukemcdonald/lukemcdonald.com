export const THEMES = ['dark', 'light'] as const

export type SiteTheme = (typeof THEMES)[number]

export const ROUTES = [
  { id: 'home', path: '/' },
  { id: 'resume', path: '/resume' },
  { id: 'tread-talks', path: '/tread-talks' },
  { id: 'christian', path: '/i-am-a/christian' },
  { id: 'husband', path: '/i-am-a/husband' },
  { id: 'father', path: '/i-am-a/father' },
  { id: 'coach', path: '/i-am-a/coach' },
] as const

export type SiteRoute = (typeof ROUTES)[number]

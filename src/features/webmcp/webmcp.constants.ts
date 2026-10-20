export const FONT_PAIRING_VALUES = ['live', 'play', 'work'] as const

export const SECRET_IDS = ['aurora', 'hyrule', 'lamp'] as const

export const SITE_PAGE_PATHS = [
  '/',
  '/i-am-a/christian',
  '/i-am-a/coach',
  '/i-am-a/father',
  '/i-am-a/husband',
  '/resume',
  '/tread-talks',
] as const

export const SITE_PAGE_TITLES = {
  '/': 'Home',
  '/i-am-a/christian': 'Christian',
  '/i-am-a/coach': 'Coach',
  '/i-am-a/father': 'Father',
  '/i-am-a/husband': 'Husband',
  '/resume': 'Resume',
  '/tread-talks': 'TREAD Talks',
} as const satisfies Record<(typeof SITE_PAGE_PATHS)[number], string>

export const THEME_COLOR_VALUES = [
  'blue',
  'default',
  'emerald',
  'orange',
  'purple',
  'yellow',
] as const

export const THEME_MODE_VALUES = ['dark', 'light', 'system'] as const

export const WEBMCP_OUTPUT_MAX = 1500

export type FontPairingValue = (typeof FONT_PAIRING_VALUES)[number]
export type SecretId = (typeof SECRET_IDS)[number]
export type SitePagePath = (typeof SITE_PAGE_PATHS)[number]

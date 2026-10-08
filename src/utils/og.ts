export const DEFAULT_OG_IMAGE_PATH = '/og/index.png'
export const OG_IMAGE_HEIGHT = 630
export const OG_IMAGE_MARK = 'lukemcdonald.com'
export const OG_IMAGE_WIDTH = 1200
export const OG_PHOTO_WIDTH = 520

export type OgImageInput = {
  mark?: string
  photoDataUri?: string
  title: string
}

export type OgImageSource = {
  src: string
}

const BACKGROUND = '#122023'
const FOREGROUND = '#f4f3ec'
const MUTED = '#c6c6bd'

const LOGO_PATHS = [
  'm0 0 18 12v66h42v18H0V0Z',
  'M96 96H78V33.572L48.083 53.45 36 45.45V23.875l12.083 8.014L96 0v96Z',
] as const

const TITLE_LINE_HEIGHT = 88
const TITLE_MAX_CHARS = 18
const TITLE_MAX_CHARS_WITH_PHOTO = 12
const TITLE_MAX_LINES = 3

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function wrapTitle(title: string, maxChars: number) {
  const words = title.trim().split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const next = current ? `${current} ${word}` : word

    if (next.length > maxChars && current) {
      lines.push(current)
      current = word
      continue
    }

    current = next
  }

  if (current) {
    lines.push(current)
  }

  if (lines.length <= TITLE_MAX_LINES) {
    return lines
  }

  const visible = lines.slice(0, TITLE_MAX_LINES)
  visible[TITLE_MAX_LINES - 1] = `${visible[TITLE_MAX_LINES - 1].replace(/\s+\S+$/, '')}…`

  return visible
}

export function getOgImagePath(pathname: string) {
  const trimmed = pathname.replace(/\/+$/, '')
  const slug = trimmed === '' || trimmed === '/' ? 'index' : trimmed.replace(/^\/+/, '')

  return `/og/${slug}.png`
}

export function buildOgSvg({ mark = OG_IMAGE_MARK, photoDataUri, title }: OgImageInput) {
  const hasPhoto = Boolean(photoDataUri)
  const lines = wrapTitle(title, hasPhoto ? TITLE_MAX_CHARS_WITH_PHOTO : TITLE_MAX_CHARS)
  const titleStartY = 318 - ((lines.length - 1) * TITLE_LINE_HEIGHT) / 2
  const titleMarkup = lines
    .map((line, index) => {
      const y = titleStartY + index * TITLE_LINE_HEIGHT

      return `<tspan x="96" y="${y}">${escapeXml(line)}</tspan>`
    })
    .join('')
  const logoMarkup = LOGO_PATHS.map((d) => `<path d="${d}" />`).join('')
  const photoMarkup =
    photoDataUri ?
      `<image href="${photoDataUri}" x="${OG_IMAGE_WIDTH - OG_PHOTO_WIDTH}" y="0" width="${OG_PHOTO_WIDTH}" height="${OG_IMAGE_HEIGHT}" preserveAspectRatio="xMidYMid slice" />`
    : ''

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${OG_IMAGE_WIDTH}" height="${OG_IMAGE_HEIGHT}" viewBox="0 0 ${OG_IMAGE_WIDTH} ${OG_IMAGE_HEIGHT}">
  <rect width="${OG_IMAGE_WIDTH}" height="${OG_IMAGE_HEIGHT}" fill="${BACKGROUND}" />
  ${photoMarkup}
  <rect x="0" y="0" width="12" height="${OG_IMAGE_HEIGHT}" fill="${MUTED}" />
  <g transform="translate(96 80) scale(0.75)" fill="${FOREGROUND}">${logoMarkup}</g>
  <text font-family="Inter" font-size="76" font-weight="600" fill="${FOREGROUND}">${titleMarkup}</text>
  <text x="96" y="534" font-family="Inter" font-size="28" font-weight="600" fill="${MUTED}">${escapeXml(mark)}</text>
</svg>`
}

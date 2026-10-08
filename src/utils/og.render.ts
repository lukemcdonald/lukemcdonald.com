import type { OgImageInput, OgImageSource } from './og'

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { basename, extname, join } from 'node:path'

import { Resvg } from '@resvg/resvg-js'

import { buildOgSvg, OG_IMAGE_WIDTH } from './og'

const INTER_FONT_PATH = join(process.cwd(), 'src/assets/fonts/inter/Inter-SemiBold.ttf')
const PAGE_IMAGE_DIR = join(process.cwd(), 'src/assets/images')

function getInterFontPath() {
  if (!existsSync(INTER_FONT_PATH)) {
    throw new Error(`OG image font not found at ${INTER_FONT_PATH}`)
  }

  return INTER_FONT_PATH
}

function toPhotoDataUri(photoPath: string) {
  const bytes = readFileSync(photoPath)
  const ext = extname(photoPath).slice(1).toLowerCase()
  const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : `image/${ext || 'jpeg'}`

  return `data:${mime};base64,${bytes.toString('base64')}`
}

export function resolveOgPhotoPath(image?: OgImageSource) {
  if (!image?.src) {
    return
  }

  const src = decodeURIComponent(image.src.split('?')[0] ?? '')
  const candidates: string[] = []

  if (src.startsWith('/@fs/')) {
    candidates.push(src.slice('/@fs'.length))
  }

  const assetMatch = src.match(/(?:^|\/)(src\/assets\/images\/[^/]+)$/)
  if (assetMatch?.[1]) {
    candidates.push(join(process.cwd(), assetMatch[1]))
  }

  const aliasMatch = src.match(/@\/(assets\/images\/[^/]+)$/)
  if (aliasMatch?.[1]) {
    candidates.push(join(process.cwd(), 'src', aliasMatch[1]))
  }

  const fileName = basename(src)
  if (fileName) {
    candidates.push(join(PAGE_IMAGE_DIR, fileName))

    for (const known of readdirSync(PAGE_IMAGE_DIR)) {
      const stem = known.replace(/\.[^.]+$/, '')

      if (fileName === known || fileName.startsWith(`${stem}.`)) {
        candidates.push(join(PAGE_IMAGE_DIR, known))
      }
    }
  }

  return candidates.find((candidate) => existsSync(candidate))
}

export function renderOgPng({
  mark,
  photoPath,
  title,
}: Pick<OgImageInput, 'mark' | 'title'> & { photoPath?: string }) {
  const photoDataUri = photoPath && existsSync(photoPath) ? toPhotoDataUri(photoPath) : undefined
  const resvg = new Resvg(buildOgSvg({ mark, photoDataUri, title }), {
    fitTo: {
      mode: 'width',
      value: OG_IMAGE_WIDTH,
    },
    font: {
      defaultFontFamily: 'Inter',
      fontFiles: [getInterFontPath()],
      loadSystemFonts: false,
    },
  })

  return resvg.render().asPng()
}

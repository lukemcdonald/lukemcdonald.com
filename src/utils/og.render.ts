import { existsSync } from 'node:fs'
import { join } from 'node:path'

import { Resvg } from '@resvg/resvg-js'

import { buildOgSvg, OG_IMAGE_WIDTH, type OgImageInput } from './og'

const INTER_FONT_PATH = join(process.cwd(), 'src/assets/fonts/inter/Inter-SemiBold.ttf')

function getInterFontPath() {
  if (!existsSync(INTER_FONT_PATH)) {
    throw new Error(`OG image font not found at ${INTER_FONT_PATH}`)
  }

  return INTER_FONT_PATH
}

export function renderOgPng(input: OgImageInput) {
  const resvg = new Resvg(buildOgSvg(input), {
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

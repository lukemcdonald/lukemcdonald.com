import { fileURLToPath } from 'node:url'

import { Resvg } from '@resvg/resvg-js'

import { buildOgSvg, OG_IMAGE_WIDTH, type OgImageInput } from './og'

const INTER_FONT_PATH = fileURLToPath(
  new URL('../assets/fonts/inter/Inter-SemiBold.ttf', import.meta.url),
)

export function renderOgPng(input: OgImageInput) {
  const resvg = new Resvg(buildOgSvg(input), {
    fitTo: {
      mode: 'width',
      value: OG_IMAGE_WIDTH,
    },
    font: {
      defaultFontFamily: 'Inter',
      fontFiles: [INTER_FONT_PATH],
      loadSystemFonts: false,
    },
  })

  return resvg.render().asPng()
}

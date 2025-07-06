import { buildImageUrl, extractPublicId, setConfig } from 'cloudinary-build-url'
import invariant from 'tiny-invariant'

import type { TransformerOption } from '@cld-apis/types'

setConfig({
  cloudName: 'lukemcdonald',
})

type ImageBuilder = {
  (transformations?: TransformerOption): string
  alt: string
  id: string
}

function getImageBuilder({ alt = '', id }: { alt: string; id: string }): ImageBuilder {
  invariant(id, `Expected typeof id of string but instead got ${id}`)

  const cloudinaryId =
    typeof id === 'string' && id.includes('https://res.cloudinary.com') ? extractPublicId(id) : id

  function imageBuilder(transformations?: TransformerOption) {
    return buildImageUrl(cloudinaryId, { transformations })
  }

  imageBuilder.id = cloudinaryId
  imageBuilder.alt = alt
  return imageBuilder
}

function getImgProps(
  imageBuilder: ImageBuilder,
  {
    sizes,
    transformations,
    widths,
  }: {
    sizes: string[]
    transformations?: TransformerOption
    widths: number[]
  },
) {
  const averageSize = Math.ceil(widths.reduce((a, s) => a + s) / widths.length)

  return {
    alt: imageBuilder.alt,
    sizes: sizes.join(', '),
    src: imageBuilder({
      fetchFormat: 'auto',
      format: 'auto',
      quality: 'auto',
      ...transformations,
      resize: { width: averageSize, ...transformations?.resize },
    }),
    srcSet: widths
      .map((width) =>
        [
          imageBuilder({
            format: 'auto',
            quality: 'auto',
            ...transformations,
            resize: { width, ...transformations?.resize },
          }),
          `${width}w`,
        ].join(' '),
      )
      .join(', '),
  }
}

export { getImageBuilder, getImgProps }
export type { ImageBuilder }

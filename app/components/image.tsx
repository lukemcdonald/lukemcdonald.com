import { getImageBuilder, getImgProps } from '#app/utils/images'

import type { ImageProps } from '#app/types'

export function Image({
  alt,
  className,
  sizes = ['100vw'],
  src: id,
  widths = [],
  ...rest
}: ImageProps) {
  return (
    <img
      className={className}
      decoding="async"
      {...getImgProps(getImageBuilder({ alt, id }), {
        sizes,
        widths,
      })}
      {...rest}
    />
  )
}

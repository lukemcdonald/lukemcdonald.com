import type { colors, sizes, weights, wraps } from '@/components/Typography/Typography.tokens'
import type { HTMLAttributes } from 'astro/types'

export type ColorKey = keyof typeof colors
export type SizeKey = keyof typeof sizes
export type WeightKey = keyof typeof weights
export type WrapKey = keyof typeof wraps

export type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
export type TextTag = 'div' | 'em' | 'label' | 'p' | 'small' | 'span' | 'strong'
export type TypographyTag = HeadingTag | TextTag
export type TypographyProps<Tag extends TypographyTag> = HTMLAttributes<Tag> & {
  as?: Tag
  color?: ColorKey
  size?: SizeKey
  weight?: WeightKey
  wrap?: WrapKey
}

export type HeadingProps = TypographyProps<HeadingTag>
export type TextProps = TypographyProps<TextTag>

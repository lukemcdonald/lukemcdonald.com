import { defineOg, editorial } from 'astro-og-kit'

export const og = defineOg({
  compress: true,
  font: {
    family: 'Inter',
    files: ['src/assets/fonts/inter/Inter-SemiBold.ttf'],
    weight: 600,
  },
  footer: 'lukemcdonald.com',
  logo: {
    color: '#f4f3ec',
    src: 'src/assets/logo.svg',
    width: 72,
  },
  template: editorial({ titleLineHeight: 1.16 }),
  theme: {
    accent: '#c6c6bd',
    background: '#122023',
    foreground: '#f4f3ec',
    muted: '#c6c6bd',
  },
})

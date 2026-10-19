import { defineOg, split } from 'astro-og-kit'

export const og = defineOg({
  colors: {
    accent: '#c6c6bd',
    background: '#122023',
    foreground: '#f4f3ec',
    muted: '#c6c6bd',
  },
  font: {
    family: 'Inter',
    files: ['src/assets/fonts/inter/Inter-SemiBold.ttf'],
    weight: 600,
  },
  footer: 'lukemcdonald.com',
  logo: {
    src: 'src/assets/logo.svg',
    width: 72,
  },
  template: split({ lineHeight: 1.16 }),
})

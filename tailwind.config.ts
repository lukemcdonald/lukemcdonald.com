import typography from '@tailwindcss/typography'
import colors from 'tailwindcss/colors'

export default {
  content: ['./content/**/*.md', './app/**/*.{ts,tsx}'],
  plugins: [typography],
  theme: {
    colors: {
      black: colors.black,
      current: 'currentColor',
      error: colors.red,
      gray: colors.neutral,
      inherit: 'inherit',
      primary: {
        50: 'var(--color-primary-50)',
        100: 'var(--color-primary-100)',
        200: 'var(--color-primary-200)',
        300: 'var(--color-primary-300)',
        400: 'var(--color-primary-400)',
        500: 'var(--color-primary-500)',
        600: 'var(--color-primary-600)',
        700: 'var(--color-primary-700)',
        800: 'var(--color-primary-800)',
        900: 'var(--color-primary-900)',
      },
      transparent: 'transparent',
      white: colors.white,
    },
    extend: {
      maxHeight: {
        site: '720px',
      },
      screens: {
        lg: '1080px',
        md: '768px',
        sm: '576px',
        xs: '420px',
      },
      spacing: {
        '30vw': '30vw',
      },
      transitionDelay: {
        0: '0ms',
      },
      transitionDuration: {
        0: '0ms',
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      typography: (theme: any) => ({
        DEFAULT: {
          css: {
            a: {
              color: theme('colors.current'),
            },
          },
        },
      }),
    },
  },
  variants: {
    extend: {
      cursor: ['responsive', 'hover'],
      display: ['responsive', 'group-hover', 'last'],
      maxWidth: ['hover', 'focus', 'group-hover'],
      opacity: ['responsive', 'hover', 'focus', 'group-hover'],
      padding: ['hover', 'focus', 'group-hover'],
      transitionDelay: ['hover', 'focus', 'group-hover'],
      transitionDuration: ['hover', 'focus', 'group-hover'],
      visibility: ['responsive', 'group-hover'],
    },
  },
}

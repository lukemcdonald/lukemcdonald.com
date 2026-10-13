export type FontSourceFamily = {
  cssVariable: string
  fallbacks: string[]
  name: string
  styles: Array<'italic' | 'normal'>
  subsets: string[]
  weights: Array<number | string>
}

type HeadingFace = FontSourceFamily & {
  letterSpacing?: string
  lineHeight?: string
  opticalSizing?: 'auto'
  stretch?: string
  variationSettings?: string
  weight?: string
}

export type FontPairingConfig = {
  body: FontSourceFamily
  contentLineHeight?: string
  heading: HeadingFace
  id: string
  label: string
  nav: FontSourceFamily
}

const FONT_FAMILIES = {
  bricolageGrotesque: {
    cssVariable: '--font-bricolage-grotesque',
    fallbacks: ['sans-serif'],
    name: 'Bricolage Grotesque',
    styles: ['normal'],
    subsets: ['latin'],
    weights: ['200 800'],
  },
  fraunces: {
    cssVariable: '--font-fraunces',
    fallbacks: ['serif'],
    name: 'Fraunces',
    styles: ['normal'],
    subsets: ['latin'],
    weights: ['100 900'],
  },
  ibmPlexMono: {
    cssVariable: '--font-ibm-plex-mono',
    fallbacks: ['monospace'],
    name: 'IBM Plex Mono',
    styles: ['normal'],
    subsets: ['latin'],
    weights: [400, 600, 700],
  },
  ibmPlexSans: {
    cssVariable: '--font-ibm-plex-sans',
    fallbacks: ['sans-serif'],
    name: 'IBM Plex Sans',
    styles: ['normal'],
    subsets: ['latin'],
    weights: ['100 700'],
  },
  inter: {
    cssVariable: '--font-inter',
    fallbacks: ['sans-serif'],
    name: 'Inter',
    styles: ['normal'],
    subsets: ['latin'],
    weights: ['100 900'],
  },
  spaceMono: {
    cssVariable: '--font-space-mono',
    fallbacks: ['monospace'],
    name: 'Space Mono',
    styles: ['normal'],
    subsets: ['latin'],
    weights: [400, 700],
  },
} as const satisfies Record<string, FontSourceFamily>

/** Add or swap a pairing here; Astro Fonts and generated CSS read this list. */
export const FONT_PAIRING_CONFIGS = [
  {
    body: FONT_FAMILIES.ibmPlexSans,
    heading: {
      ...FONT_FAMILIES.ibmPlexSans,
      letterSpacing: '-0.04em',
      stretch: '85%',
      weight: '700',
    },
    id: 'work',
    label: 'Work',
    nav: FONT_FAMILIES.ibmPlexMono,
  },
  {
    body: FONT_FAMILIES.spaceMono,
    contentLineHeight: '1.5',
    heading: {
      ...FONT_FAMILIES.bricolageGrotesque,
      letterSpacing: '-0.03em',
      lineHeight: '1.15',
      opticalSizing: 'auto',
      stretch: '100%',
      weight: '800',
    },
    id: 'play',
    label: 'Play',
    nav: FONT_FAMILIES.spaceMono,
  },
  {
    body: FONT_FAMILIES.inter,
    heading: {
      ...FONT_FAMILIES.fraunces,
      opticalSizing: 'auto',
      variationSettings: "'SOFT' 70, 'WONK' 1",
    },
    id: 'live',
    label: 'Live',
    nav: FONT_FAMILIES.inter,
  },
] as const satisfies readonly FontPairingConfig[]

export const FONT_PAIRINGS = FONT_PAIRING_CONFIGS.map((pairing) => pairing.id)

export type SelectableFontPairing = (typeof FONT_PAIRING_CONFIGS)[number]['id']

export const FONT_LABELS = Object.fromEntries(
  FONT_PAIRING_CONFIGS.map((pairing) => [pairing.id, pairing.label]),
) as Record<SelectableFontPairing, string>

export const FONT_SOURCE_FAMILIES = Object.values(FONT_FAMILIES).toSorted((left, right) => {
  return left.cssVariable.localeCompare(right.cssVariable)
})

function headingDeclarations(heading: HeadingFace) {
  const declarations: string[] = []

  if (heading.letterSpacing) {
    declarations.push(`letter-spacing: ${heading.letterSpacing}`)
  }

  if (heading.lineHeight) {
    declarations.push(`line-height: ${heading.lineHeight}`)
  }

  if (heading.opticalSizing) {
    declarations.push(`font-optical-sizing: ${heading.opticalSizing}`)
  }

  if (heading.stretch) {
    declarations.push(`font-stretch: ${heading.stretch}`)
  }

  if (heading.variationSettings) {
    declarations.push(`font-variation-settings: ${heading.variationSettings}`)
  }

  if (heading.weight) {
    declarations.push(`font-weight: ${heading.weight}`)
  }

  return declarations.toSorted()
}

export function fontPairingCss() {
  return FONT_PAIRING_CONFIGS.map((pairing: FontPairingConfig) => {
    const body = `var(${pairing.body.cssVariable})`
    const heading = `var(${pairing.heading.cssVariable})`
    const nav = `var(${pairing.nav.cssVariable})`
    const rules = [
      `[data-font='${pairing.id}'] { --default-font-family: ${body}; --font-heading: ${heading}; --font-mono: ${nav}; --font-sans: ${body}; --font-ui: ${nav}; }`,
    ]
    const headingCss = headingDeclarations(pairing.heading)

    if (headingCss.length > 0) {
      rules.push(
        `[data-font='${pairing.id}'] :is(h1, h2, h3, h4, h5, h6) { ${headingCss.join('; ')}; }`,
      )
    }

    if (pairing.contentLineHeight) {
      rules.push(
        `[data-font='${pairing.id}'] .entry__content { line-height: ${pairing.contentLineHeight}; }`,
      )
    }

    return rules.join('\n')
  }).join('\n')
}

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
  fredoka: {
    cssVariable: '--font-fredoka',
    fallbacks: ['sans-serif'],
    name: 'Fredoka',
    styles: ['normal'],
    subsets: ['latin'],
    weights: ['300 700'],
  },
  ibmPlexSans: {
    cssVariable: '--font-ibm-plex-sans',
    fallbacks: ['sans-serif'],
    name: 'IBM Plex Sans',
    styles: ['normal'],
    subsets: ['latin'],
    weights: ['100 700'],
  },
  lora: {
    cssVariable: '--font-lora',
    fallbacks: ['serif'],
    name: 'Lora',
    styles: ['normal'],
    subsets: ['latin'],
    weights: ['400 700'],
  },
  nunito: {
    cssVariable: '--font-nunito',
    fallbacks: ['sans-serif'],
    name: 'Nunito',
    styles: ['normal'],
    subsets: ['latin'],
    weights: ['200 900'],
  },
  sourceSans3: {
    cssVariable: '--font-source-sans-3',
    fallbacks: ['sans-serif'],
    name: 'Source Sans 3',
    styles: ['normal'],
    subsets: ['latin'],
    weights: ['200 900'],
  },
  spaceGrotesk: {
    cssVariable: '--font-space-grotesk',
    fallbacks: ['sans-serif'],
    name: 'Space Grotesk',
    styles: ['normal'],
    subsets: ['latin'],
    weights: ['300 700'],
  },
} as const satisfies Record<string, FontSourceFamily>

/** Add or swap a pairing here; Astro Fonts and generated CSS read this list. */
export const FONT_PAIRING_CONFIGS = [
  {
    body: FONT_FAMILIES.ibmPlexSans,
    heading: {
      ...FONT_FAMILIES.spaceGrotesk,
      weight: '700',
    },
    id: 'work',
    label: 'Work',
    nav: FONT_FAMILIES.ibmPlexSans,
  },
  {
    body: FONT_FAMILIES.nunito,
    heading: {
      ...FONT_FAMILIES.fredoka,
      weight: '700',
    },
    id: 'play',
    label: 'Play',
    nav: FONT_FAMILIES.nunito,
  },
  {
    body: FONT_FAMILIES.sourceSans3,
    heading: {
      ...FONT_FAMILIES.lora,
      weight: '700',
    },
    id: 'live',
    label: 'Live',
    nav: FONT_FAMILIES.sourceSans3,
  },
] as const satisfies readonly FontPairingConfig[]

export const FONT_PAIRINGS = FONT_PAIRING_CONFIGS.map((pairing) => pairing.id)

export type SelectableFontPairing = (typeof FONT_PAIRING_CONFIGS)[number]['id']

export const FONT_SOURCE_FAMILIES = Object.values(FONT_FAMILIES).toSorted((left, right) => {
  return left.cssVariable.localeCompare(right.cssVariable)
})

function headingDeclarations(heading: HeadingFace, includeLineHeight = true) {
  const declarations: string[] = []

  if (heading.letterSpacing) {
    declarations.push(`letter-spacing: ${heading.letterSpacing}`)
  }

  if (includeLineHeight && heading.lineHeight) {
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

function fontPreviewCss() {
  return FONT_PAIRING_CONFIGS.map((pairing: FontPairingConfig) => {
    const declarations = [
      `font-family: var(${pairing.heading.cssVariable})`,
      ...headingDeclarations(pairing.heading, false),
    ].toSorted()

    return `[data-preference-options]:popover-open [data-font-preview='${pairing.id}'] { ${declarations.join('; ')}; }`
  }).join('\n')
}

export function fontPairingCss() {
  const documentCss = FONT_PAIRING_CONFIGS.map((pairing: FontPairingConfig) => {
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

  return `${documentCss}\n${fontPreviewCss()}`
}

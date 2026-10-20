import { toPagePath } from '@/utils/content'

export type FontPairingChoiceSource = {
  body: { name: string }
  heading: { name: string }
  id: string
  label: string
  nav: { name: string }
}

export type StringChoice = {
  const: string
  description?: string
  title: string
}

export type WebMcpPage = {
  href: string
  name: string
}

export type WebMcpSecret = {
  hint: string
  id: string
  name: string
}

function formatFontPairingDescription(config: FontPairingChoiceSource) {
  const heading = `Headings: ${config.heading.name}`
  const bodyNav =
    config.body.name === config.nav.name ?
      `Body and nav: ${config.body.name}`
    : `Body: ${config.body.name}. Nav: ${config.nav.name}`

  return `${heading}. ${bodyNav}.`
}

function hasDistinctName(secret: { id: string; name: string }) {
  return secret.name.toLowerCase() !== secret.id.toLowerCase()
}

function toStringChoice(value: string, title: string, description?: string): StringChoice {
  if (description === undefined) {
    return {
      const: value,
      title,
    }
  }

  return {
    const: value,
    description,
    title,
  }
}

export function toFontPairingChoices(configs: readonly FontPairingChoiceSource[]) {
  return configs.map((config) => {
    return toStringChoice(config.id, config.label, formatFontPairingDescription(config))
  })
}

export function toHomePage(page: { id: string }): WebMcpPage {
  return {
    href: toPagePath(page.id),
    name: 'Home',
  }
}

export function toPageChoices(pages: readonly WebMcpPage[]) {
  return pages.map((page) => {
    return toStringChoice(page.href, page.name)
  })
}

export function toSecretNameProperty(
  description: string,
  secrets: readonly { id: string; name: string }[],
) {
  const values = secrets.map((secret) => {
    return secret.id
  })

  if (
    secrets.some((secret) => {
      return hasDistinctName(secret)
    })
  ) {
    return toStringChoiceProperty(
      description,
      secrets.map((secret) => {
        return toStringChoice(secret.id, secret.name)
      }),
    )
  }

  return toStringEnumProperty(description, values)
}

export function toStringChoiceProperty(description: string, choices: readonly StringChoice[]) {
  return {
    description,
    oneOf: [...choices],
    type: 'string' as const,
  }
}

export function toStringEnumProperty<T extends readonly string[]>(description: string, values: T) {
  return {
    description,
    enum: values,
    type: 'string' as const,
  }
}

export function toWebMcpPages(
  palettePages: readonly WebMcpPage[],
  homePage: WebMcpPage,
): WebMcpPage[] {
  if (
    palettePages.some((page) => {
      return page.href === homePage.href
    })
  ) {
    return [...palettePages]
  }

  return [homePage, ...palettePages]
}

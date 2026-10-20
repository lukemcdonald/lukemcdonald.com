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
  description: string
  title: string
  type: 'string'
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

  return `${config.label}. ${heading}. ${bodyNav}.`
}

export function toFontPairingChoices(configs: readonly FontPairingChoiceSource[]) {
  return configs.map((config) => {
    return toStringChoice(config.id, config.label, formatFontPairingDescription(config))
  })
}

export function toHomePage(page: { data: { title: string }; id: string }): WebMcpPage {
  return {
    href: toPagePath(page.id),
    name: page.data.title,
  }
}

export function toLabeledChoices(values: readonly string[], labels: Record<string, string>) {
  return values.map((value) => {
    return toStringChoice(value, labels[value] ?? value)
  })
}

export function toPageChoices(pages: readonly WebMcpPage[]) {
  return pages.map((page) => {
    return toStringChoice(page.href, page.name, `${page.name} (${page.href})`)
  })
}

export function toSecretChoices(secrets: readonly WebMcpSecret[]) {
  return secrets.map((secret) => {
    return toStringChoice(secret.id, secret.name, secret.hint)
  })
}

function toStringChoice(value: string, title: string, description = title): StringChoice {
  return {
    const: value,
    description,
    title,
    type: 'string',
  }
}

export function toStringEnumProperty(description: string, choices: readonly StringChoice[]) {
  return {
    description,
    enum: choices.map((choice) => {
      return choice.const
    }),
    oneOf: [...choices],
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

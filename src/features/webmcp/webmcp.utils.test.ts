import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { getEasterEggCatalog } from '@/components/EasterEggs/easter-eggs.ts'
import { FONT_PAIRING_CONFIGS } from '@/components/Settings/Font/pairings.ts'
import { THEME_COLORS, THEME_LABELS } from '@/components/Settings/ThemeColor/constants.ts'
import { toPagePath } from '@/utils/content.ts'

import {
  toFontPairingChoices,
  toHomePage,
  toLabeledChoices,
  toPageChoices,
  toSecretChoices,
  toStringEnumProperty,
  toWebMcpPages,
} from './webmcp.utils.ts'

function assertChoice(
  property: ReturnType<typeof toStringEnumProperty>,
  value: string,
  expected: { description?: string; includes?: readonly string[]; title: string },
) {
  const choice = property.oneOf.find((entry) => {
    return entry.const === value
  })

  assert.ok(property.enum.includes(value), value)
  assert.equal(choice?.title, expected.title)

  if (expected.description !== undefined) {
    assert.equal(choice?.description, expected.description)
  }

  for (const snippet of expected.includes ?? []) {
    assert.equal((choice?.description ?? '').includes(snippet), true, snippet)
  }
}

describe('toWebMcpPages', () => {
  test('prepends a missing home page and keeps an existing one', () => {
    const home = toHomePage({ data: { title: 'Greetings' }, id: 'index' })
    const resume = { href: '/resume', name: 'Resume' }

    assert.equal(home.href, toPagePath('index'))
    assert.deepEqual(toWebMcpPages([resume], home), [home, resume])
    assert.deepEqual(toWebMcpPages([home, resume], home), [home, resume])
  })
})

describe('generated schemas', () => {
  test('reflect a different input list instead of a copied catalog', () => {
    const pairing = toStringEnumProperty(
      'Font pairing to apply.',
      toFontPairingChoices([
        {
          body: { name: 'Body Sans' },
          heading: { name: 'Display Serif' },
          id: 'spark',
          label: 'Spark',
          nav: { name: 'Nav Mono' },
        },
      ]),
    )
    const pages = toStringEnumProperty(
      'Path of the page to open.',
      toPageChoices([{ href: '/new-page', name: 'New Page' }]),
    )
    const secrets = toStringEnumProperty(
      'Name of the secret to show and mark as found.',
      toSecretChoices([{ hint: 'Look up', id: 'nova', name: 'Nova' }]),
    )

    assertChoice(pairing, 'spark', {
      includes: ['Display Serif', 'Body Sans', 'Nav Mono'],
      title: 'Spark',
    })
    assertChoice(pages, '/new-page', { title: 'New Page' })
    assertChoice(secrets, 'nova', { description: 'Look up', title: 'Nova' })
  })

  test('includes the home page from the pages collection path', () => {
    const home = toHomePage({ data: { title: 'Greetings' }, id: 'index' })
    const property = toStringEnumProperty(
      'Path of the page to open.',
      toPageChoices(toWebMcpPages([{ href: '/resume', name: 'Resume' }], home)),
    )

    assertChoice(property, toPagePath('index'), { title: home.name })
  })

  test('includes each font pairing from FONT_PAIRING_CONFIGS', () => {
    const property = toStringEnumProperty(
      'Font pairing to apply.',
      toFontPairingChoices(FONT_PAIRING_CONFIGS),
    )

    for (const pairing of FONT_PAIRING_CONFIGS) {
      assertChoice(property, pairing.id, {
        includes: [pairing.body.name, pairing.heading.name],
        title: pairing.label,
      })
    }
  })

  test('includes each secret from the egg catalog', () => {
    const catalog = getEasterEggCatalog()
    const property = toStringEnumProperty(
      'Name of the secret to show and mark as found.',
      toSecretChoices(catalog),
    )

    for (const secret of catalog) {
      assertChoice(property, secret.id, {
        description: secret.hint,
        title: secret.name,
      })
    }
  })

  test('includes each theme color label from THEME_LABELS', () => {
    const property = toStringEnumProperty(
      "One of the site's theme colors.",
      toLabeledChoices(THEME_COLORS, THEME_LABELS),
    )

    for (const color of THEME_COLORS) {
      assertChoice(property, color, { title: THEME_LABELS[color] })
    }
  })
})

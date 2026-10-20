import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { getEasterEggCatalog } from '@/components/EasterEggs/easter-eggs.ts'
import { FONT_PAIRING_CONFIGS } from '@/components/Settings/Font/pairings.ts'
import { toPagePath } from '@/utils/content.ts'

import {
  toFontPairingChoices,
  toHomePage,
  toPageChoices,
  toSecretNameProperty,
  toStringChoiceProperty,
  toStringEnumProperty,
  toWebMcpPages,
} from './webmcp.utils.ts'

type ChoiceProperty = ReturnType<typeof toStringChoiceProperty>
type EnumProperty = ReturnType<typeof toStringEnumProperty>

function assertChoice(
  property: ChoiceProperty,
  value: string,
  expected: { includes?: readonly string[]; title: string },
) {
  const choice = property.oneOf.find((entry) => {
    return entry.const === value
  })

  assert.equal('enum' in property, false)
  assert.ok(choice, value)
  assert.equal(choice.title, expected.title)

  if (expected.includes === undefined) {
    assert.equal('description' in choice, false)
    return
  }

  for (const snippet of expected.includes) {
    assert.equal((choice.description ?? '').includes(snippet), true, snippet)
  }
}

function assertEnum(property: EnumProperty, values: readonly string[]) {
  assert.equal('oneOf' in property, false)
  assert.deepEqual([...property.enum], [...values])
}

describe('toWebMcpPages', () => {
  test('prepends a missing home page labeled Home and keeps an existing one', () => {
    const home = toHomePage({ id: 'index' })
    const resume = { href: '/resume', name: 'Resume' }

    assert.equal(home.href, toPagePath('index'))
    assert.equal(home.name, 'Home')
    assert.deepEqual(toWebMcpPages([resume], home), [home, resume])
    assert.deepEqual(toWebMcpPages([home, resume], home), [home, resume])
  })
})

describe('generated schemas', () => {
  test('reflect a different input list instead of a copied catalog', () => {
    const pairing = toStringChoiceProperty(
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
    const pages = toStringChoiceProperty(
      'Path of the page to open.',
      toPageChoices([{ href: '/new-page', name: 'New Page' }]),
    )
    const secrets = toSecretNameProperty('Secret to show and mark as found.', [
      { id: 'ember', name: 'Campfire' },
    ])
    const colors = toStringEnumProperty("One of the site's theme colors.", ['spark', 'ember'])

    assertChoice(pairing, 'spark', {
      includes: ['Display Serif', 'Body Sans', 'Nav Mono'],
      title: 'Spark',
    })
    assertChoice(pages, '/new-page', { title: 'New Page' })
    assert.equal('oneOf' in secrets, true)
    if ('oneOf' in secrets) {
      assertChoice(secrets, 'ember', { title: 'Campfire' })
    }
    assertEnum(colors, ['spark', 'ember'])
  })

  test('includes the home page from the pages collection path', () => {
    const home = toHomePage({ id: 'index' })
    const property = toStringChoiceProperty(
      'Path of the page to open.',
      toPageChoices(toWebMcpPages([{ href: '/resume', name: 'Resume' }], home)),
    )

    assertChoice(property, toPagePath('index'), { title: 'Home' })
  })

  test('includes each font pairing from FONT_PAIRING_CONFIGS', () => {
    const property = toStringChoiceProperty(
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

  test('includes each secret id from the egg catalog without hints', () => {
    const catalog = getEasterEggCatalog()
    const property = toSecretNameProperty('Secret to show and mark as found.', catalog)
    const serialized = JSON.stringify(property)

    assert.equal('enum' in property, true)
    if ('enum' in property) {
      assertEnum(
        property,
        catalog.map((secret) => secret.id),
      )
    }

    for (const secret of catalog) {
      assert.equal(serialized.includes(secret.hint), false, secret.hint)
    }
  })
})

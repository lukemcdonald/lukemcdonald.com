import assert from 'node:assert/strict'
import { afterEach, before, beforeEach, describe, mock, test } from 'node:test'

import { fontPairingStyleId, loadAllFontPairings, loadFontPairing } from './load-pairing.ts'
import { FONT_PAIRING_CSS_SCRIPT_ID } from './pairings.ts'

type StyleNode = {
  id: string
  textContent: string
}

function createFontDocument(cssByPairing: Record<string, string>) {
  const styles = new Map<string, StyleNode>()
  const mockAppend = mock.fn((node: StyleNode) => {
    styles.set(node.id, node)
  })
  const mockCreateElement = mock.fn(() => {
    return { id: '', textContent: '' }
  })
  const mockGetElementById = mock.fn((id: string) => {
    if (id === FONT_PAIRING_CSS_SCRIPT_ID) {
      return { textContent: JSON.stringify(cssByPairing) }
    }

    return styles.get(id) ?? null
  })

  return { mockAppend, mockCreateElement, mockGetElementById, styles }
}

function installFontDocument({
  mockAppend,
  mockCreateElement,
  mockGetElementById,
}: ReturnType<typeof createFontDocument>) {
  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: {
      createElement: mockCreateElement,
      documentElement: {
        dataset: {},
      },
      getElementById: mockGetElementById,
      head: {
        append: mockAppend,
      },
    },
  })
}

describe('loadFontPairing', () => {
  const cssByPairing = {
    live: '.live{}',
    play: '.play{}',
    work: '.work{}',
  }
  const fontDocument = createFontDocument(cssByPairing)

  before(() => {
    installFontDocument(fontDocument)
  })

  beforeEach(() => {
    mock.method(globalThis.document, 'createElement', fontDocument.mockCreateElement)
    mock.method(globalThis.document, 'getElementById', fontDocument.mockGetElementById)
    mock.method(globalThis.document.head, 'append', fontDocument.mockAppend)
  })

  afterEach(() => {
    fontDocument.styles.clear()
    mock.restoreAll()
  })

  test('injects the pairing stylesheet once', () => {
    loadFontPairing('work')
    loadFontPairing('work')

    assert.equal(fontDocument.styles.get(fontPairingStyleId('work'))?.textContent, '.work{}')
    assert.equal(fontDocument.styles.size, 1)
  })

  test('ignores pairings that have no css', () => {
    loadFontPairing('comic-sans')

    assert.equal(fontDocument.styles.size, 0)
  })
})

describe('loadAllFontPairings', () => {
  const cssByPairing = {
    live: '.live{}',
    play: '.play{}',
    work: '.work{}',
  }
  const fontDocument = createFontDocument(cssByPairing)

  before(() => {
    installFontDocument(fontDocument)
  })

  beforeEach(() => {
    mock.method(globalThis.document, 'createElement', fontDocument.mockCreateElement)
    mock.method(globalThis.document, 'getElementById', fontDocument.mockGetElementById)
    mock.method(globalThis.document.head, 'append', fontDocument.mockAppend)
  })

  afterEach(() => {
    fontDocument.styles.clear()
    mock.restoreAll()
  })

  test('injects every pairing stylesheet', () => {
    loadAllFontPairings()

    assert.equal(fontDocument.styles.get(fontPairingStyleId('live'))?.textContent, '.live{}')
    assert.equal(fontDocument.styles.get(fontPairingStyleId('play'))?.textContent, '.play{}')
    assert.equal(fontDocument.styles.get(fontPairingStyleId('work'))?.textContent, '.work{}')
    assert.equal(fontDocument.styles.size, 3)
  })
})

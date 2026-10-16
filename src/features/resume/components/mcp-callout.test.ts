import assert from 'node:assert/strict'
import { afterEach, before, beforeEach, describe, mock, test } from 'node:test'

import {
  COPIED_BUTTON_LABEL,
  COPIED_LABEL,
  COPY_BUTTON_LABEL,
  COPY_LABEL,
  copyText,
  setCopyFeedback,
} from './mcp-callout.ts'

function createCalloutRoot() {
  const attributes = new Map<string, string>([['aria-label', COPY_BUTTON_LABEL]])
  const button = {
    getAttribute(name: string) {
      return attributes.get(name) ?? null
    },
    setAttribute(name: string, value: string) {
      attributes.set(name, value)
    },
    textContent: COPY_LABEL,
  }
  const status = { textContent: '' }

  return {
    button,
    querySelector(selector: string) {
      if (selector === '[data-mcp-copy]') {
        return button
      }

      if (selector === '[data-mcp-copy-status]') {
        return status
      }

      return null
    },
    status,
  }
}

describe('copyText', () => {
  const writeText = mock.fn(async () => {})

  before(() => {
    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: {
        clipboard: {
          writeText,
        },
      },
    })
  })

  beforeEach(() => {
    mock.method(globalThis.navigator.clipboard, 'writeText', writeText)
  })

  afterEach(() => {
    mock.restoreAll()
  })

  test('writes text to the clipboard', async () => {
    await copyText('https://lukemcdonald.com/mcp')

    assert.equal(writeText.mock.calls.length, 1)
    assert.deepEqual(writeText.mock.calls[0].arguments, ['https://lukemcdonald.com/mcp'])
  })
})

describe('setCopyFeedback', () => {
  test('shows copied button text, label, and live status', () => {
    const root = createCalloutRoot()

    setCopyFeedback(root as unknown as Element, true)

    assert.equal(root.button.textContent, COPIED_LABEL)
    assert.equal(root.button.getAttribute('aria-label'), COPIED_BUTTON_LABEL)
    assert.equal(root.status.textContent, COPIED_LABEL)
  })

  test('restores the idle copy labels', () => {
    const root = createCalloutRoot()

    setCopyFeedback(root as unknown as Element, true)
    setCopyFeedback(root as unknown as Element, false)

    assert.equal(root.button.textContent, COPY_LABEL)
    assert.equal(root.button.getAttribute('aria-label'), COPY_BUTTON_LABEL)
    assert.equal(root.status.textContent, '')
  })

  test('does nothing when the button or status is missing', () => {
    const root = {
      querySelector() {
        return null
      },
    }

    setCopyFeedback(root as unknown as Element, true)
  })
})

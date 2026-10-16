import assert from 'node:assert/strict'
import { afterEach, before, beforeEach, describe, mock, test } from 'node:test'

import {
  COPIED_BUTTON_LABEL,
  COPIED_LABEL,
  COPY_BUTTON_LABEL,
  copyText,
  setCopyFeedback,
} from './mcp-callout.ts'

function createClassList(initial: string[] = []) {
  const classes = new Set(initial)

  return {
    contains(name: string) {
      return classes.has(name)
    },
    toggle(name: string, force?: boolean) {
      const shouldAdd = force === undefined ? !classes.has(name) : force

      if (shouldAdd) {
        classes.add(name)
        return true
      }

      classes.delete(name)
      return false
    },
  }
}

function createCalloutRoot() {
  const attributes = new Map<string, string>([['aria-label', COPY_BUTTON_LABEL]])
  const doneIcon = { classList: createClassList(['hidden']) }
  const idleIcon = { classList: createClassList() }
  const status = {
    classList: createClassList(['hidden']),
    textContent: '',
  }
  const button = {
    getAttribute(name: string) {
      return attributes.get(name) ?? null
    },
    setAttribute(name: string, value: string) {
      attributes.set(name, value)
    },
  }

  return {
    button,
    doneIcon,
    idleIcon,
    querySelector(selector: string) {
      if (selector === '[data-mcp-copy]') {
        return button
      }

      if (selector === '[data-mcp-copy-icon="done"]') {
        return doneIcon
      }

      if (selector === '[data-mcp-copy-icon="idle"]') {
        return idleIcon
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
  test('shows copied label, live status, and swaps icons', () => {
    const root = createCalloutRoot()

    setCopyFeedback(root as unknown as Element, true)

    assert.equal(root.button.getAttribute('aria-label'), COPIED_BUTTON_LABEL)
    assert.equal(root.status.textContent, COPIED_LABEL)
    assert.equal(root.status.classList.contains('hidden'), false)
    assert.equal(root.idleIcon.classList.contains('hidden'), true)
    assert.equal(root.doneIcon.classList.contains('hidden'), false)
  })

  test('restores the idle copy labels and icons', () => {
    const root = createCalloutRoot()

    setCopyFeedback(root as unknown as Element, true)
    setCopyFeedback(root as unknown as Element, false)

    assert.equal(root.button.getAttribute('aria-label'), COPY_BUTTON_LABEL)
    assert.equal(root.status.textContent, '')
    assert.equal(root.status.classList.contains('hidden'), true)
    assert.equal(root.idleIcon.classList.contains('hidden'), false)
    assert.equal(root.doneIcon.classList.contains('hidden'), true)
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

import type { WebMcpToolDeps } from './webmcp.tools.ts'

import assert from 'node:assert/strict'
import { afterEach, describe, mock, test } from 'node:test'

import { createWebMcpDeps, registerWebMcpTools, resetWebMcpRegistration } from './webmcp.ts'

function createDeps(): WebMcpToolDeps {
  return createWebMcpDeps({
    navigate: mock.fn(),
    pages: [{ href: '/resume', name: 'Resume' }],
  })
}

function installDocument(value: unknown) {
  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value,
  })
}

describe('registerWebMcpTools', () => {
  afterEach(() => {
    resetWebMcpRegistration()
    mock.restoreAll()
    Reflect.deleteProperty(globalThis, 'document')
  })

  test('does nothing when modelContext is missing', async () => {
    installDocument({})

    await assert.doesNotReject(async () => {
      await registerWebMcpTools(createDeps())
    })
  })

  test('does nothing when registerTool is missing', async () => {
    installDocument({ modelContext: {} })

    await assert.doesNotReject(async () => {
      await registerWebMcpTools(createDeps())
    })
  })

  test('registers palette tools once when the API is present', async () => {
    const names: string[] = []
    const mockRegisterTool = mock.fn(async (tool: { name: string }) => {
      names.push(tool.name)
    })

    installDocument({
      modelContext: {
        registerTool: mockRegisterTool,
      },
    })

    const deps = createDeps()

    await registerWebMcpTools(deps)
    await registerWebMcpTools(deps)

    assert.equal(mockRegisterTool.mock.calls.length, 6)
    assert.deepEqual(names.toSorted(), [
      'find_secret',
      'list_secrets',
      'navigate_to_page',
      'set_font_pairing',
      'set_theme',
      'toggle_sound',
    ])
  })
})

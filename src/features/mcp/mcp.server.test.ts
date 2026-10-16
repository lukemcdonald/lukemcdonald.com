import type { McpToolDeps } from './mcp.tools.ts'

import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { FALLBACK_VERSE } from '@/features/verse/verse.constants'

import { CORS_HEADERS, createSiteMcpHandler, handleMcpRequest } from './mcp.server.ts'

const ORIGIN = 'https://lukemcdonald.com'

const deps: McpToolDeps = {
  getContact: () => ({
    email: 'luke@example.com',
    name: 'Luke McDonald',
    profiles: [
      { network: 'GitHub', url: 'https://github.com/lukemcdonald', username: 'lukemcdonald' },
    ],
    url: ORIGIN,
  }),
  getPublishedPages: async () => [
    {
      body: 'Home body.',
      data: { description: 'Hello from home.', title: 'Greetings' },
      id: 'index',
    },
  ],
  getResumeData: async () => ({
    awards: [],
    basics: { name: 'Luke McDonald' },
    community: [],
    education: [],
    experience: [],
    personal: [],
    skills: [],
  }),
  getTodayVerse: async () => FALLBACK_VERSE,
  origin: ORIGIN,
}

function parseMcpJson(body: string) {
  const trimmed = body.trim()

  if (trimmed.startsWith('{')) {
    return JSON.parse(trimmed) as Record<string, unknown>
  }

  const dataLine = trimmed.split('\n').find((line) => {
    return line.startsWith('data: ')
  })

  if (!dataLine) {
    throw new Error(`Unexpected MCP response: ${body}`)
  }

  return JSON.parse(dataLine.slice('data: '.length)) as Record<string, unknown>
}

async function mcpRpc(
  mcpHandler: ReturnType<typeof createSiteMcpHandler>,
  message: Record<string, unknown>,
) {
  const response = await handleMcpRequest(
    new Request('https://lukemcdonald.com/mcp', {
      body: JSON.stringify(message),
      headers: {
        Accept: 'application/json, text/event-stream',
        'Content-Type': 'application/json',
      },
      method: 'POST',
    }),
    mcpHandler,
  )
  const payload = parseMcpJson(await response.text())

  return { payload, response }
}

describe('handleMcpRequest', () => {
  test('answers OPTIONS with CORS headers', async () => {
    const response = await handleMcpRequest(
      new Request('https://lukemcdonald.com/mcp', { method: 'OPTIONS' }),
      createSiteMcpHandler(deps),
    )

    assert.equal(response.status, 204)
    assert.equal(response.headers.get('Access-Control-Allow-Origin'), '*')
    assert.equal(
      response.headers.get('Access-Control-Allow-Methods'),
      CORS_HEADERS['Access-Control-Allow-Methods'],
    )
  })

  test('adds CORS headers to MCP responses', async () => {
    const { response } = await mcpRpc(createSiteMcpHandler(deps), {
      id: 1,
      jsonrpc: '2.0',
      method: 'ping',
    })

    assert.equal(response.headers.get('Access-Control-Allow-Origin'), '*')
  })
})

describe('createSiteMcpHandler', () => {
  test('initialize, tools/list, and tools/call return site content', async () => {
    const mcpHandler = createSiteMcpHandler(deps)

    const initialize = await mcpRpc(mcpHandler, {
      id: 1,
      jsonrpc: '2.0',
      method: 'initialize',
      params: {
        capabilities: {},
        clientInfo: { name: 'mcp.server.test', version: '0.0.1' },
        protocolVersion: '2025-03-26',
      },
    })
    const initializeResult = initialize.payload.result as {
      serverInfo: { name: string }
    }

    assert.equal(initialize.payload.jsonrpc, '2.0')
    assert.equal(initializeResult.serverInfo.name, 'lukemcdonald.com')

    const listed = await mcpRpc(mcpHandler, {
      id: 2,
      jsonrpc: '2.0',
      method: 'tools/list',
    })
    const tools = (listed.payload.result as { tools: Array<{ name: string }> }).tools.map(
      (tool) => {
        return tool.name
      },
    )

    assert.deepEqual(tools.sort(), [
      'get_contact',
      'get_page',
      'get_resume',
      'get_verse_of_the_day',
      'list_pages',
    ])

    const called = await mcpRpc(mcpHandler, {
      id: 3,
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        arguments: {},
        name: 'get_contact',
      },
    })
    const content = (called.payload.result as { content: Array<{ text: string }> }).content[0]
    const contact = JSON.parse(content?.text ?? '{}') as { email: string; name: string }

    assert.equal(contact.email, 'luke@example.com')
    assert.equal(contact.name, 'Luke McDonald')
  })

  test('get_verse_of_the_day falls back when the loader throws', async () => {
    const mcpHandler = createSiteMcpHandler({
      ...deps,
      getTodayVerse: async () => {
        throw new Error('YouVersion unavailable')
      },
    })
    const called = await mcpRpc(mcpHandler, {
      id: 1,
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        arguments: {},
        name: 'get_verse_of_the_day',
      },
    })
    const content = (called.payload.result as { content: Array<{ text: string }> }).content[0]
    const verse = JSON.parse(content?.text ?? '{}') as { source: string; text: string }

    assert.equal(verse.source, 'fallback')
    assert.equal(verse.text, FALLBACK_VERSE.text)
  })
})

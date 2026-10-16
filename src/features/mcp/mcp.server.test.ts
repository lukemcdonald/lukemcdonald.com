import type { McpToolDeps } from './mcp.tools.ts'

import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { PAGE_SLUG_MAX } from './mcp.constants.ts'
import { createSiteMcpHandler, handleMcpRequest } from './mcp.server.ts'

const ORIGIN = 'https://lukemcdonald.com'

const deps: McpToolDeps = {
  author: {
    email: 'luke@example.com',
    name: 'Luke McDonald',
    profiles: [
      { network: 'GitHub', url: 'https://github.com/lukemcdonald', username: 'lukemcdonald' },
    ],
    url: ORIGIN,
  },
  getPublishedPages: async () => [
    {
      body: 'Home body.',
      data: {
        seo: { description: "I'm Luke, a Christian, husband, father and wrestling coach." },
        title: 'Greetings',
      },
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
    assert.equal(response.headers.get('Access-Control-Allow-Methods'), 'OPTIONS, POST')
  })

  test('returns 405 with Allow on GET', async () => {
    const response = await handleMcpRequest(
      new Request('https://lukemcdonald.com/mcp', { method: 'GET' }),
      createSiteMcpHandler(deps),
    )

    assert.equal(response.status, 405)
    assert.equal(response.headers.get('Allow'), 'OPTIONS, POST')
    assert.equal(response.headers.get('Access-Control-Allow-Origin'), '*')
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
      instructions: string
      serverInfo: { name: string }
    }

    assert.equal(initialize.payload.jsonrpc, '2.0')
    assert.equal(initializeResult.serverInfo.name, 'lukemcdonald.com')
    assert.match(initializeResult.instructions, /get_profile/)
    assert.match(initializeResult.instructions, /get_resume/)
    assert.match(initializeResult.instructions, /list_pages/)
    assert.match(initializeResult.instructions, /get_page/)

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

    assert.deepEqual(tools.sort(), ['get_page', 'get_profile', 'get_resume', 'list_pages'])

    const called = await mcpRpc(mcpHandler, {
      id: 3,
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        arguments: {},
        name: 'get_profile',
      },
    })
    const content = (called.payload.result as { content: Array<{ text: string }> }).content[0]
    const profile = JSON.parse(content?.text ?? '{}') as {
      email: string
      name: string
      summary: string
    }

    assert.equal(profile.email, 'luke@example.com')
    assert.equal(profile.name, 'Luke McDonald')
    assert.equal(profile.summary, "I'm Luke, a Christian, husband, father and wrestling coach.")
  })

  test('rejects a slug longer than 200 characters', async () => {
    const called = await mcpRpc(createSiteMcpHandler(deps), {
      id: 1,
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        arguments: { slug: 'a'.repeat(PAGE_SLUG_MAX + 1) },
        name: 'get_page',
      },
    })
    const result = called.payload.result as { content: Array<{ text: string }>; isError?: boolean }

    assert.equal(result.isError, true)
    assert.match(result.content[0]?.text ?? '', /200/)
  })
})

import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { GLOBAL_CONFIG } from '@/configs/global'

import { MCP_PATH, MCP_URL } from './mcp.constants.ts'

describe('MCP_URL', () => {
  test('joins the shared site origin and MCP path', () => {
    assert.equal(MCP_PATH, '/mcp')
    assert.equal(MCP_URL, `${GLOBAL_CONFIG.site.origin}${MCP_PATH}`)
  })
})

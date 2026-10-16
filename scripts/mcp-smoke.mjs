const MCP_URL = process.env.MCP_URL ?? 'http://127.0.0.1:3000/mcp'

function parseMcpJson(body) {
  const trimmed = body.trim()

  if (trimmed.startsWith('{')) {
    return JSON.parse(trimmed)
  }

  const dataLine = trimmed.split('\n').find((line) => line.startsWith('data: '))

  if (!dataLine) {
    throw new Error(`Unexpected MCP response: ${body}`)
  }

  return JSON.parse(dataLine.slice('data: '.length))
}

async function rpc(id, method, params) {
  const response = await fetch(MCP_URL, {
    body: JSON.stringify({
      id,
      jsonrpc: '2.0',
      method,
      params,
    }),
    headers: {
      Accept: 'application/json, text/event-stream',
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })
  const payload = parseMcpJson(await response.text())

  return {
    payload,
    status: response.status,
  }
}

const initialize = await rpc(1, 'initialize', {
  capabilities: {},
  clientInfo: { name: 'mcp-smoke', version: '0.0.1' },
  protocolVersion: '2025-03-26',
})
const toolsList = await rpc(2, 'tools/list')
const toolsCall = await rpc(3, 'tools/call', {
  arguments: {},
  name: 'get_contact',
})

if (initialize.payload.error || toolsList.payload.error || toolsCall.payload.error) {
  console.error(
    JSON.stringify(
      {
        initialize: initialize.payload,
        toolsCall: toolsCall.payload,
        toolsList: toolsList.payload,
      },
      null,
      2,
    ),
  )
  process.exit(1)
}

console.log(
  JSON.stringify(
    {
      initialize: initialize.payload,
      toolsCall: toolsCall.payload,
      toolsList: toolsList.payload,
    },
    null,
    2,
  ),
)

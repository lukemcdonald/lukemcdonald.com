import assert from 'node:assert/strict'
import { afterEach, describe, mock, test } from 'node:test'

import { config, triggerDailyRebuild } from './index.ts'

const BUILD_HOOK_URL = 'https://api.netlify.com/build_hooks/test'

describe('config', () => {
  test('schedules a daily run at 10:00 UTC', () => {
    assert.deepEqual(config, { schedule: '0 10 * * *' })
  })
})

describe('triggerDailyRebuild', () => {
  afterEach(() => {
    mock.restoreAll()
  })

  test('logs and skips when NETLIFY_BUILD_HOOK_URL is unset', async () => {
    const fetchMock = mock.fn(async () => {
      return new Response('ok')
    })
    const log = { info: mock.fn() }

    const response = await triggerDailyRebuild({
      env: {},
      fetch: fetchMock,
      log,
    })

    assert.equal(response.status, 200)
    assert.equal(await response.text(), 'skipped')
    assert.equal(fetchMock.mock.calls.length, 0)
    assert.equal(log.info.mock.calls.length, 1)
  })

  test('POSTs to the build hook URL', async () => {
    const fetchMock = mock.fn(async () => {
      return new Response('ok', { status: 200 })
    })

    const response = await triggerDailyRebuild({
      env: { NETLIFY_BUILD_HOOK_URL: BUILD_HOOK_URL },
      fetch: fetchMock,
    })

    const call = fetchMock.mock.calls[0]

    assert.equal(response.status, 200)
    assert.equal(fetchMock.mock.calls.length, 1)
    assert.ok(call)
    assert.equal(call.arguments[0], BUILD_HOOK_URL)
    assert.deepEqual(call.arguments[1], { method: 'POST' })
  })

  test('throws when the build hook request fails', async () => {
    const fetchMock = mock.fn(async () => {
      return new Response('nope', { status: 500 })
    })

    await assert.rejects(async () => {
      await triggerDailyRebuild({
        env: { NETLIFY_BUILD_HOOK_URL: BUILD_HOOK_URL },
        fetch: fetchMock,
      })
    }, /Build hook failed with 500/)
  })
})

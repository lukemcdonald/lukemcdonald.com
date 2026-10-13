import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, test } from 'node:test'

import { CLOUDFLARE_WEB_ANALYTICS, getCloudflareBeaconConfig } from './analytics.ts'

const REDIRECTS = readFileSync(new URL('../../public/_redirects', import.meta.url), 'utf8')

describe('getCloudflareBeaconConfig', () => {
  test('sends RUM to the first-party proxy path', () => {
    assert.deepEqual(getCloudflareBeaconConfig('site-token'), {
      send: { to: CLOUDFLARE_WEB_ANALYTICS.rumPath },
      token: 'site-token',
    })
  })
})

describe('CLOUDFLARE_WEB_ANALYTICS', () => {
  test('Netlify proxies match the first-party analytics paths', () => {
    assert.match(
      REDIRECTS,
      new RegExp(
        `^${CLOUDFLARE_WEB_ANALYTICS.scriptPath}\\s+${CLOUDFLARE_WEB_ANALYTICS.scriptProxy}\\s+200$`,
        'm',
      ),
    )
    assert.match(
      REDIRECTS,
      new RegExp(
        `^${CLOUDFLARE_WEB_ANALYTICS.rumPath}\\s+${CLOUDFLARE_WEB_ANALYTICS.rumProxy}\\s+200$`,
        'm',
      ),
    )
  })
})

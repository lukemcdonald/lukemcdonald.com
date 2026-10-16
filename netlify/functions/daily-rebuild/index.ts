type DailyRebuildOptions = {
  env?: NodeJS.ProcessEnv
  fetch?: typeof fetch
  log?: Pick<Console, 'info'>
}

/** Daily at 10:00 UTC (~5am CT) so the YouVersion verse of the day stays current. */
export const config = {
  schedule: '0 10 * * *',
}

export async function triggerDailyRebuild({
  env = process.env,
  fetch: fetchFn = globalThis.fetch,
  log = console,
}: DailyRebuildOptions = {}) {
  const buildHookUrl = env.NETLIFY_BUILD_HOOK_URL

  if (!buildHookUrl) {
    log.info('NETLIFY_BUILD_HOOK_URL is unset; skipping scheduled rebuild')

    return new Response('skipped', { status: 200 })
  }

  const response = await fetchFn(buildHookUrl, { method: 'POST' })

  if (!response.ok) {
    throw new Error(`Build hook failed with ${response.status}`)
  }

  return response
}

export default async function dailyRebuild() {
  return triggerDailyRebuild()
}

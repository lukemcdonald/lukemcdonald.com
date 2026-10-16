import type { Verse } from './verse.types'

import { YVP_APP_KEY } from 'astro:env/server'

import { fetchTodayVerse } from './verse.utils'

export async function loadTodayVerse(): Promise<Verse> {
  return fetchTodayVerse({ appKey: YVP_APP_KEY })
}

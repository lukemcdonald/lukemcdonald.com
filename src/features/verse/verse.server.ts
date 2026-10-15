import type { Verse } from './verse.types'

import { FALLBACK_VERSE } from './verse.utils'

/**
 * Swap this body to fetch YouVersion's VOTD at build time via `YVP_APP_KEY`
 * (`astro:env/server`, secret). Keep `{ reference, text, url }`; never call from client.
 */
export async function getTodayVerse(): Promise<Verse> {
  return FALLBACK_VERSE
}

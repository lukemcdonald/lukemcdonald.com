import type { Verse } from './verse.types'

export const LOADING_VERSE_LABEL = 'Loading verse'
export const VERSE_ENDPOINT = '/api/verse.json'
export const YOUVERSION_API_ORIGIN = 'https://api.youversion.com/v1'
export const YOUVERSION_APP_KEY_HEADER = 'X-YVP-App-Key'
export const YOUVERSION_BSB_ID = 3034

export const FALLBACK_VERSE: Verse = {
  reference: 'Psalm 119:105',
  source: 'fallback',
  text: 'Your word is a lamp to my feet and a light to my path.',
  url: `https://www.bible.com/bible/${YOUVERSION_BSB_ID}/PSA.119.105.BSB`,
}

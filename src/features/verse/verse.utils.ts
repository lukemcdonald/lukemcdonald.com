import type { Verse } from './verse.types'

export const YOUVERSION_BSB_ID = 3034

export function youVersionVerseUrl(usfm: string, version = 'BSB') {
  return `https://www.bible.com/bible/${YOUVERSION_BSB_ID}/${usfm}.${version}`
}

export const FALLBACK_VERSE: Verse = {
  reference: 'Psalm 119:105',
  text: 'Your word is a lamp to my feet and a light to my path.',
  url: youVersionVerseUrl('PSA.119.105'),
}

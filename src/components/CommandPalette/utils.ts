import type { CommandPaletteEggItem } from './types'

export const SECRETS_PAGE = 'secrets'
export const SECRETS_SHORTCUT_LABEL = '⌘.'

export function getFoundEggs(eggs: readonly CommandPaletteEggItem[], foundIds: readonly string[]) {
  return eggs.filter((egg) => foundIds.includes(egg.id))
}

export function getPaletteEmptyMessage(page?: string) {
  if (page === SECRETS_PAGE) {
    return 'No matching secrets'
  }

  return 'No matching pages'
}

export function getSecretsFooterLabel(foundCount: number, totalCount: number) {
  if (foundCount >= totalCount) {
    return 'All secrets found'
  }

  return `Secrets ${foundCount}/${totalCount}`
}

export function getSecretsProgressLabel(foundCount: number, totalCount: number) {
  if (foundCount >= totalCount) {
    return 'All secrets found'
  }

  return `Secrets: ${foundCount} of ${totalCount} found`
}

export function isPaletteBackKey(event: KeyboardEvent, search: string) {
  return event.key === 'Escape' || (event.key === 'Backspace' && !search)
}

export function isSecretsShortcut(event: KeyboardEvent) {
  return (event.ctrlKey || event.metaKey) && event.key === '.'
}

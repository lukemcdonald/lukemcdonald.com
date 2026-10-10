import type { RefObject } from 'react'

import { Command } from 'cmdk'
import { Search } from 'lucide-react'

import { PALETTE_CHROME } from './chrome'

type CommandPaletteSearchProps = {
  onQueryChange: (query: string) => void
  query: string
  searchInputRef: RefObject<HTMLInputElement | null>
}

export function CommandPaletteSearch({
  onQueryChange,
  query,
  searchInputRef,
}: CommandPaletteSearchProps) {
  return (
    <div className={`flex items-center border-b px-4 ${PALETTE_CHROME.border}`}>
      <Search
        aria-hidden="true"
        className={`h-5 w-5 ${PALETTE_CHROME.muted}`}
      />
      <Command.Input
        ref={searchInputRef}
        aria-label="Search"
        data-testid="command-palette-input"
        placeholder="Search..."
        value={query}
        onValueChange={onQueryChange}
      />
      <kbd className={`${PALETTE_CHROME.kbd} ${PALETTE_CHROME.border} ${PALETTE_CHROME.muted}`}>
        ESC
      </kbd>
    </div>
  )
}

import type { CommandPaletteNavItem } from './types'
import type { HighlightedCommand } from './utils'
import type { RefObject } from 'react'

import { PALETTE_CHROME } from './chrome'
import { CommandPaletteNav } from './CommandPaletteNav'
import { CommandPaletteSearch } from './CommandPaletteSearch'

type CommandPaletteMainProps = {
  highlightedCommand: HighlightedCommand | undefined
  highlightedHref?: string
  items: CommandPaletteNavItem[]
  onEnter: () => void
  onNavigate: () => void
  onQueryChange: (query: string) => void
  searchInputRef: RefObject<HTMLInputElement | null>
  searchQuery: string
}

export function CommandPaletteMain({
  highlightedCommand,
  highlightedHref,
  items,
  onEnter,
  onNavigate,
  onQueryChange,
  searchInputRef,
  searchQuery,
}: CommandPaletteMainProps) {
  return (
    <>
      <CommandPaletteSearch
        onEnter={onEnter}
        onQueryChange={onQueryChange}
        query={searchQuery}
        searchInputRef={searchInputRef}
      />

      <div className={PALETTE_CHROME.list}>
        {items.length > 0 ?
          <CommandPaletteNav
            highlightedHref={highlightedHref}
            items={items}
            onNavigate={onNavigate}
          />
        : <p
            className={`py-6 text-center text-sm ${PALETTE_CHROME.muted}`}
            role="status"
          >
            {highlightedCommand ? 'Press Enter to apply' : 'No matching pages'}
          </p>
        }
      </div>
    </>
  )
}

import type { RefObject } from 'react'

import { Search } from 'lucide-react'

import { PALETTE_CHROME } from './chrome'

type CommandPaletteSearchProps = {
  onEnter: () => void
  onQueryChange: (query: string) => void
  query: string
  searchInputRef: RefObject<HTMLInputElement | null>
}

export function CommandPaletteSearch({
  onEnter,
  onQueryChange,
  query,
  searchInputRef,
}: CommandPaletteSearchProps) {
  return (
    <div className={`flex items-center border-b px-4 ${PALETTE_CHROME.border}`}>
      <Search className={`h-5 w-5 ${PALETTE_CHROME.muted}`} />
      <input
        ref={searchInputRef}
        autoComplete="off"
        className={`w-full border-0 bg-transparent px-4 py-4 outline-none focus:ring-0 ${PALETTE_CHROME.ink} ${PALETTE_CHROME.placeholder}`}
        placeholder="Search navigation..."
        type="text"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key !== 'Enter') {
            return
          }

          event.preventDefault()
          onEnter()
        }}
      />
      <kbd
        className={`hidden rounded border px-2 py-1 text-xs sm:inline-block ${PALETTE_CHROME.border} ${PALETTE_CHROME.muted}`}
      >
        ESC
      </kbd>
    </div>
  )
}

import type { RefObject } from 'react'

import { Search } from 'lucide-react'

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
    <div className="flex items-center border-b border-primary-200 px-4 dark:border-primary-700">
      <Search className="h-5 w-5 text-primary-700 dark:text-primary-500" />
      <input
        ref={searchInputRef}
        autoComplete="off"
        className="w-full border-0 bg-transparent px-4 py-4 text-primary-900 outline-none placeholder:text-primary-700 focus:ring-0 dark:text-primary-100 dark:placeholder:text-primary-500"
        placeholder="Search navigation..."
        type="text"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
      />
      <kbd className="hidden rounded border border-primary-300 px-2 py-1 text-xs text-primary-800 sm:inline-block dark:border-primary-600 dark:text-primary-400">
        ESC
      </kbd>
    </div>
  )
}

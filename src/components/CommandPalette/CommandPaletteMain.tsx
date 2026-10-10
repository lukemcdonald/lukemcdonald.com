import type { CommandPaletteNavItem } from './types'
import type { HighlightedCommand } from './utils'

import { PALETTE_CHROME } from './chrome'
import { CommandPaletteNav } from './CommandPaletteNav'

type CommandPaletteMainProps = {
  highlightedCommand: HighlightedCommand | undefined
  highlightedHref?: string
  items: CommandPaletteNavItem[]
  onNavigate: () => void
}

export function CommandPaletteMain({
  highlightedCommand,
  highlightedHref,
  items,
  onNavigate,
}: CommandPaletteMainProps) {
  return (
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
  )
}

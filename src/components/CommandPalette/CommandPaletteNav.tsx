import type { CommandPaletteNavItem } from './types'

import { HOVER_NAV_CUE_PROPS } from '@/components/Sound'

import { PALETTE_CHROME } from './chrome'
import { CommandPaletteSection } from './CommandPaletteSection'

type CommandPaletteNavProps = {
  highlightedHref?: string
  items: CommandPaletteNavItem[]
  onNavigate: () => void
}

export function CommandPaletteNav({ highlightedHref, items, onNavigate }: CommandPaletteNavProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <CommandPaletteSection
      className="mb-6"
      title="Navigation"
    >
      <div className="space-y-1">
        {items.map((item) => {
          const isHighlighted = item.href === highlightedHref

          return (
            <a
              key={item.href}
              className={`block rounded-lg px-3 py-2 text-sm transition-colors ${PALETTE_CHROME.ink} ${
                isHighlighted ? PALETTE_CHROME.activeFill : PALETTE_CHROME.hoverFill
              }`}
              href={item.href}
              onClick={onNavigate}
              {...HOVER_NAV_CUE_PROPS}
            >
              {item.name}
            </a>
          )
        })}
      </div>
    </CommandPaletteSection>
  )
}

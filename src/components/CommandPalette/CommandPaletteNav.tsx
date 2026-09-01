import type { CommandPaletteNavItem } from './types'

import { HOVER_NAV_CUE_PROPS } from '@/components/Sound'

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
              className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                isHighlighted ?
                  'bg-primary-100 text-primary-900 dark:bg-primary-800 dark:text-primary-100'
                : 'text-primary-900 hover:bg-primary-100 dark:text-primary-100 dark:hover:bg-primary-800'
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

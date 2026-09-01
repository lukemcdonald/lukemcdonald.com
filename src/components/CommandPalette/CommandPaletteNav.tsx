import type { CommandPaletteNavItem } from './types'

import { TICK_CUE_PROPS } from '@/components/Sound'

import { CommandPaletteSection } from './CommandPaletteSection'

type CommandPaletteNavProps = {
  items: CommandPaletteNavItem[]
  onNavigate: () => void
}

export function CommandPaletteNav({ items, onNavigate }: CommandPaletteNavProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <CommandPaletteSection
      className="mb-6"
      title="Navigation"
    >
      <div className="space-y-1">
        {items.map((item) => (
          <a
            key={item.href}
            className="block rounded-lg px-3 py-2 text-sm text-primary-900 transition-colors hover:bg-primary-100 dark:text-primary-100 dark:hover:bg-primary-800"
            href={item.href}
            onClick={onNavigate}
            {...TICK_CUE_PROPS}
          >
            {item.name}
          </a>
        ))}
      </div>
    </CommandPaletteSection>
  )
}

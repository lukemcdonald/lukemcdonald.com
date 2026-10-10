import type { CommandPaletteNavItem } from './types'

import { Command } from 'cmdk'

import { HOVER_NAV_CUE_PROPS } from '@/components/Sound'
import { toHrefTestId } from '@/features/navigation/navigation.utils'

import { PALETTE_CHROME } from './chrome'
import { CommandPaletteSection } from './CommandPaletteSection'

type CommandPaletteNavProps = {
  items: CommandPaletteNavItem[]
  onNavigate: (href: string) => void
}

export function CommandPaletteNav({ items, onNavigate }: CommandPaletteNavProps) {
  return (
    <CommandPaletteSection title="Navigation">
      {items.map((item) => {
        return (
          <Command.Item
            key={item.href}
            className={`${PALETTE_CHROME.item} ${PALETTE_CHROME.ink} ${PALETTE_CHROME.hoverFill} ${PALETTE_CHROME.selectedFill}`}
            data-testid={toHrefTestId('command-palette-item', item.href)}
            value={item.name}
            onSelect={() => onNavigate(item.href)}
            {...HOVER_NAV_CUE_PROPS}
          >
            {item.name}
          </Command.Item>
        )
      })}
    </CommandPaletteSection>
  )
}

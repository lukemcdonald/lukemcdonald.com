import type { CommandPaletteEggItem } from './types'

import { Command } from 'cmdk'

import { TOGGLE_CUE_PROPS } from '@/components/Sound'

import { PALETTE_CHROME } from './chrome'
import { CommandPaletteSection } from './CommandPaletteSection'

type CommandPaletteSecretsProps = {
  activeId?: string
  foundEggs: readonly CommandPaletteEggItem[]
  onToggle: (id: string) => void
  title: string
}

export function CommandPaletteSecrets({
  activeId,
  foundEggs,
  onToggle,
  title,
}: CommandPaletteSecretsProps) {
  return (
    <CommandPaletteSection
      data-testid="command-palette-secrets"
      forceMount
      title={title}
    >
      {foundEggs.map((egg) => {
        const isActive = egg.id === activeId

        return (
          <Command.Item
            key={egg.id}
            className={`${PALETTE_CHROME.item} ${PALETTE_CHROME.ink} ${
              isActive ? PALETTE_CHROME.activeFill : PALETTE_CHROME.hoverFill
            } ${PALETTE_CHROME.selectedFill}`}
            value={egg.name}
            onSelect={() => onToggle(egg.id)}
            {...TOGGLE_CUE_PROPS}
          >
            {egg.name}
          </Command.Item>
        )
      })}
    </CommandPaletteSection>
  )
}

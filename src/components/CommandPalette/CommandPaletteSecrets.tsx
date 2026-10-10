import type { CommandPaletteEggItem } from './types'

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
    <div
      className={PALETTE_CHROME.list}
      data-testid="command-palette-secrets"
    >
      <CommandPaletteSection title={title}>
        {foundEggs.map((egg) => {
          const isActive = egg.id === activeId

          return (
            <button
              key={egg.id}
              aria-pressed={isActive}
              className={`-mx-2 block w-full rounded-lg px-2 py-1.5 text-left text-base transition-colors ${PALETTE_CHROME.ink} ${
                isActive ? PALETTE_CHROME.activeFill : PALETTE_CHROME.hoverFill
              }`}
              type="button"
              onClick={() => onToggle(egg.id)}
              {...TOGGLE_CUE_PROPS}
            >
              {egg.name}
            </button>
          )
        })}
      </CommandPaletteSection>
    </div>
  )
}

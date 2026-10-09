import type { CommandPaletteEggItem } from './types'

import { TOGGLE_CUE_PROPS } from '@/components/Sound'

import { PALETTE_CHROME } from './chrome'
import { CommandPaletteSection } from './CommandPaletteSection'

type CommandPaletteSecretsProps = {
  activeId?: string
  foundEggs: readonly CommandPaletteEggItem[]
  highlightedId?: string
  onToggle: (id: string) => void
  progressLabel: string
  showProgress: boolean
}

export function CommandPaletteSecrets({
  activeId,
  foundEggs,
  highlightedId,
  onToggle,
  progressLabel,
  showProgress,
}: CommandPaletteSecretsProps) {
  return (
    <CommandPaletteSection title="Secrets">
      {showProgress ?
        <p className={`-mx-2 px-2 py-1.5 text-base ${PALETTE_CHROME.muted}`}>{progressLabel}</p>
      : null}
      {foundEggs.map((egg) => {
        const isActive = egg.id === activeId
        const isHighlighted = egg.id === highlightedId

        return (
          <button
            key={egg.id}
            aria-pressed={isActive}
            className={`-mx-2 block w-full rounded-lg px-2 py-1.5 text-left text-base transition-colors ${PALETTE_CHROME.ink} ${
              isActive || isHighlighted ? PALETTE_CHROME.activeFill : PALETTE_CHROME.hoverFill
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
  )
}

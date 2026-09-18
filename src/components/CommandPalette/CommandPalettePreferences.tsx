import type { HighlightedCommand } from './utils'

import { SoundToggle } from '@/components/Sound'
import { ThemeColorPicker } from '@/components/ThemeColor'
import { ThemeModePicker } from '@/components/ThemeMode'

import { PALETTE_CHROME } from './chrome'

type CommandPalettePreferencesProps = {
  highlightedCommand: HighlightedCommand | undefined
  isOpen: boolean
  preferenceEpoch: number
}

export function CommandPalettePreferences({
  highlightedCommand,
  isOpen,
  preferenceEpoch,
}: CommandPalettePreferencesProps) {
  const command = highlightedCommand ?? { type: 'none' as const }

  return (
    <div className={`flex items-center gap-2 border-t px-3 py-2 ${PALETTE_CHROME.border}`}>
      <ThemeColorPicker
        highlightedColor={command.type === 'color' ? command.color : undefined}
        isOpen={isOpen}
        preferenceEpoch={preferenceEpoch}
      />
      <div className="flex shrink-0 items-center gap-1">
        <span
          aria-hidden="true"
          className={`mr-1 h-5 border-l ${PALETTE_CHROME.border}`}
        />
        <ThemeModePicker
          highlightedMode={command.type === 'mode' ? command.mode : undefined}
          isOpen={isOpen}
          preferenceEpoch={preferenceEpoch}
        />
        <span
          aria-hidden="true"
          className={`h-5 border-l ${PALETTE_CHROME.border}`}
        />
        <SoundToggle
          isHighlighted={command.type === 'sound'}
          isOpen={isOpen}
          preferenceEpoch={preferenceEpoch}
        />
      </div>
    </div>
  )
}

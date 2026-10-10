import { GlassPicker } from '@/components/Glass/Glass'
import { SoundToggle } from '@/components/Sound'
import { ThemeColorPicker } from '@/components/ThemeColor'
import { ThemeModePicker } from '@/components/ThemeMode'

import { PALETTE_CHROME } from './chrome'

type CommandPalettePreferencesProps = {
  isOpen: boolean
  preferenceEpoch: number
}

export function CommandPalettePreferences({
  isOpen,
  preferenceEpoch,
}: CommandPalettePreferencesProps) {
  return (
    <div className={`flex items-center gap-2 border-t px-3 py-2 ${PALETTE_CHROME.border}`}>
      <ThemeColorPicker
        isOpen={isOpen}
        preferenceEpoch={preferenceEpoch}
      />
      <div className="flex shrink-0 items-center gap-1">
        <span
          aria-hidden="true"
          className={`mr-1 h-5 border-l ${PALETTE_CHROME.border}`}
        />
        <GlassPicker isOpen={isOpen} />
        <ThemeModePicker
          isOpen={isOpen}
          preferenceEpoch={preferenceEpoch}
        />
        <span
          aria-hidden="true"
          className={`h-5 border-l ${PALETTE_CHROME.border}`}
        />
        <SoundToggle
          isOpen={isOpen}
          preferenceEpoch={preferenceEpoch}
        />
      </div>
    </div>
  )
}

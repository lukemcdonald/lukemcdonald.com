import type { SoundPreference } from './types'

import { Volume2, VolumeX } from 'lucide-react'
import { useEffect, useState } from 'react'

import { PALETTE_CHROME } from '@/components/CommandPalette/chrome'
import { getSoundPreference, toggleSoundPreference } from './utils'

type SoundToggleProps = {
  isHighlighted?: boolean
  isOpen?: boolean
  preferenceEpoch?: number
}

export function SoundToggle({ isHighlighted = false, isOpen, preferenceEpoch }: SoundToggleProps) {
  const [preference, setPreference] = useState<SoundPreference>('off')

  // Read the stored preference after mount (not as a lazy useState
  // initializer) so server-rendered markup and the client's initial
  // hydration pass agree — the same reason ThemeModePicker does this
  // in a useEffect rather than at construction time.
  useEffect(() => {
    if (isOpen === false) {
      return
    }

    setPreference(getSoundPreference())
  }, [isOpen, preferenceEpoch])

  const handleClick = () => {
    setPreference(toggleSoundPreference())
  }

  const isOn = preference === 'on'
  const Icon = isOn ? Volume2 : VolumeX

  return (
    <button
      aria-label={isOn ? 'Disable interaction sounds' : 'Enable interaction sounds'}
      aria-pressed={isOn}
      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${PALETTE_CHROME.focusRing} ${PALETTE_CHROME.ink} ${
        isHighlighted ? PALETTE_CHROME.activeFill : PALETTE_CHROME.hoverFill
      }`}
      type="button"
      onClick={handleClick}
    >
      <Icon className="h-5 w-5" />
      {isOn ? 'Sounds on' : 'Sounds off'}
    </button>
  )
}

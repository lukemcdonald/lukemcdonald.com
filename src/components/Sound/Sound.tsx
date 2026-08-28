import type { SoundPreference } from './types'

import { play } from 'cuelume'
import { Volume2, VolumeX } from 'lucide-react'
import { useEffect, useState } from 'react'

import { getSoundPreference, setSoundPreference } from './utils'

export function SoundToggle() {
  const [preference, setPreference] = useState<SoundPreference>('off')

  // Read the stored preference after mount (not as a lazy useState
  // initializer) so server-rendered markup and the client's initial
  // hydration pass agree — the same reason ThemeModePicker does this
  // in a useEffect rather than at construction time.
  useEffect(() => {
    setPreference(getSoundPreference())
  }, [])

  const handleClick = () => {
    const next: SoundPreference = preference === 'on' ? 'off' : 'on'

    // Apply the preference first, then play imperatively (not via
    // data-cuelume-toggle) — play() is a no-op once disabled, so this
    // sequencing is correct on both the enabling and disabling click.
    setSoundPreference(next)
    play('toggle')
    setPreference(next)
  }

  const isOn = preference === 'on'
  const Icon = isOn ? Volume2 : VolumeX

  return (
    <button
      aria-label={isOn ? 'Disable interaction sounds' : 'Enable interaction sounds'}
      aria-pressed={isOn}
      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${
        isOn ?
          'bg-primary-100 text-primary-900 dark:bg-primary-800 dark:text-primary-100'
        : 'text-primary-700 hover:bg-primary-100 dark:text-primary-300 dark:hover:bg-primary-800'
      }`}
      data-cuelume-hover="tick"
      type="button"
      onClick={handleClick}
    >
      <Icon className="h-5 w-5" />
      {isOn ? 'Sounds on' : 'Sounds off'}
    </button>
  )
}

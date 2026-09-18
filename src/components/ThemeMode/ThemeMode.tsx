import type { ThemeMode } from './types'

import { useEffect, useState } from 'react'

import { PreferencePicker } from '@/components/PreferencePicker'

import { MODE_LABELS, THEME_MODES } from './constants'
import { MODE_ICONS } from './icons'
import { getThemeMode, setThemeMode } from './utils'

type ThemeModePickerProps = {
  highlightedMode?: ThemeMode
  isOpen?: boolean
  preferenceEpoch?: number
}

export function ThemeModePicker({
  highlightedMode,
  isOpen,
  preferenceEpoch,
}: ThemeModePickerProps) {
  const [selectedMode, setSelectedMode] = useState<ThemeMode>('system')

  useEffect(() => {
    if (isOpen === false) {
      return
    }

    setSelectedMode(getThemeMode())
  }, [isOpen, preferenceEpoch])

  const handleModeChange = (mode: ThemeMode) => {
    setThemeMode(mode)
    setSelectedMode(mode)
  }

  const SelectedIcon = MODE_ICONS[selectedMode]

  return (
    <PreferencePicker
      highlightedValue={highlightedMode}
      icon={
        <SelectedIcon
          aria-hidden="true"
          className="h-5 w-5"
        />
      }
      label={`Appearance: ${MODE_LABELS[selectedMode]}`}
      options={THEME_MODES.map((mode) => {
        const Icon = MODE_ICONS[mode]

        return {
          icon: (
            <Icon
              aria-hidden="true"
              className="h-5 w-5"
            />
          ),
          label: MODE_LABELS[mode],
          value: mode,
        }
      })}
      value={selectedMode}
      onChange={handleModeChange}
    />
  )
}

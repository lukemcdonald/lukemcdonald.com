import type { ThemeMode } from './types'

import { useEffect, useState } from 'react'

import { TOGGLE_CUE_PROPS } from '@/components/Sound'

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

  return (
    <div className="flex flex-wrap gap-2">
      {THEME_MODES.map((mode) => {
        const Icon = MODE_ICONS[mode]
        const isHighlighted = mode === highlightedMode
        const isSelected = selectedMode === mode

        return (
          <button
            key={mode}
            aria-label={`Select ${MODE_LABELS[mode]} mode`}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-800 dark:focus-visible:ring-primary-400 ${
              isHighlighted || isSelected ?
                'bg-primary-200 text-primary-900 dark:bg-primary-800 dark:text-primary-100'
              : 'text-primary-900 hover:bg-primary-200 dark:text-primary-100 dark:hover:bg-primary-800'
            }`}
            type="button"
            onClick={() => handleModeChange(mode)}
            {...TOGGLE_CUE_PROPS}
          >
            <Icon className="h-5 w-5" />
            {MODE_LABELS[mode]}
          </button>
        )
      })}
    </div>
  )
}

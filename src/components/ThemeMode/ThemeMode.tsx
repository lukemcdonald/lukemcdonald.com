import type { ThemeMode } from './types'

import { useEffect, useState } from 'react'

import { MODE_ICONS, MODE_LABELS, THEME_MODES } from './constants'
import { getThemeMode, setThemeMode } from './utils'

export function ThemeModePicker() {
  const [selectedMode, setSelectedMode] = useState<ThemeMode>('system')

  useEffect(() => {
    setSelectedMode(getThemeMode())
  }, [])

  const handleModeChange = (mode: ThemeMode) => {
    setThemeMode(mode)
    setSelectedMode(mode)
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {THEME_MODES.map((mode) => {
        const Icon = MODE_ICONS[mode]

        return (
          <button
            key={mode}
            aria-label={`Select ${MODE_LABELS[mode]} mode`}
            className={`flex flex-col items-center gap-2 rounded-lg p-3 transition-colors focus:outline-hidden focus:ring-2 focus:ring-primary-500 ${
              selectedMode === mode
                ? 'bg-primary-200 text-primary-900 dark:bg-primary-700 dark:text-primary-100'
                : 'text-primary-700 hover:bg-primary-100 dark:text-primary-300 dark:hover:bg-primary-800'
            }`}
            type="button"
            onClick={() => handleModeChange(mode)}
          >
            <Icon className="h-6 w-6" />
            <span className="text-xs">{MODE_LABELS[mode]}</span>
          </button>
        )
      })}
    </div>
  )
}

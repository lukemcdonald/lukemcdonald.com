import type { ThemeMode } from './types'

import { useEffect, useState } from 'react'

import { TICK_CUE_PROPS } from '@/components/Sound'

import { MODE_LABELS, THEME_MODES } from './constants'
import { MODE_ICONS } from './icons'
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
    <div className="flex flex-wrap gap-2">
      {THEME_MODES.map((mode) => {
        const Icon = MODE_ICONS[mode]
        const isSelected = selectedMode === mode

        return (
          <button
            key={mode}
            aria-label={`Select ${MODE_LABELS[mode]} mode`}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${
              isSelected ?
                'bg-primary-100 text-primary-900 dark:bg-primary-800 dark:text-primary-100'
              : 'text-primary-700 hover:bg-primary-100 dark:text-primary-300 dark:hover:bg-primary-800'
            }`}
            type="button"
            onClick={() => handleModeChange(mode)}
            {...TICK_CUE_PROPS}
          >
            <Icon className="h-5 w-5" />
            {MODE_LABELS[mode]}
          </button>
        )
      })}
    </div>
  )
}

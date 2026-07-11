import type { ThemeColor } from './types'

import { useEffect, useState } from 'react'

import { PRESS_CUE_PROPS } from '@/components/Sound'

import { THEME_COLORS, THEME_GRADIENTS, THEME_LABELS } from './constants'
import { getThemeColor, setThemeColor } from './utils'

export function ThemeColorPicker() {
  const [selectedColor, setSelectedColor] = useState<ThemeColor>('default')

  useEffect(() => {
    setSelectedColor(getThemeColor())
  }, [])

  const handleColorChange = (color: ThemeColor) => {
    setThemeColor(color)
    setSelectedColor(color)
  }

  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
      {THEME_COLORS.map((color) => (
        <button
          key={color}
          aria-label={`Select ${THEME_LABELS[color]} theme`}
          className="group relative flex flex-col items-center gap-2 rounded-lg p-3 transition-colors hover:bg-primary-100 focus:outline-hidden focus:ring-2 focus:ring-primary-500 dark:hover:bg-primary-800"
          type="button"
          onClick={() => handleColorChange(color)}
          {...PRESS_CUE_PROPS}
        >
          <div
            className={`h-10 w-10 rounded-full border-2 transition-all ${
              selectedColor === color
                ? 'border-primary-900 ring-2 ring-primary-500 ring-offset-2 dark:border-primary-100'
                : 'border-primary-300 dark:border-primary-600'
            }`}
            data-cuelume-hover="droplet"
            data-theme={color === 'default' ? undefined : color}
            style={{
              background: THEME_GRADIENTS[color],
            }}
          />
          <span className="text-xs text-primary-700 dark:text-primary-300">
            {THEME_LABELS[color]}
          </span>
        </button>
      ))}
    </div>
  )
}

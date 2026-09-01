import type { ThemeColor } from './types'

import { Check } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { PRESS_CUE_PROPS } from '@/components/Sound'

import { SWATCH_DARK_VAR, SWATCH_LIGHT_VAR, THEME_COLORS, THEME_LABELS } from './constants'
import { getThemeColor, setThemeColor } from './utils'

interface SwatchShades {
  dark: string
  light: string
}

type ThemeColorPickerProps = {
  highlightedColor?: ThemeColor
  isOpen?: boolean
  preferenceEpoch?: number
}

export function ThemeColorPicker({
  highlightedColor,
  isOpen,
  preferenceEpoch,
}: ThemeColorPickerProps) {
  const [selectedColor, setSelectedColor] = useState<ThemeColor>('default')
  const [resolvedColors, setResolvedColors] = useState<Partial<Record<ThemeColor, SwatchShades>>>(
    {},
  )
  const buttonRefs = useRef<Partial<Record<ThemeColor, HTMLButtonElement | null>>>({})

  useEffect(() => {
    if (isOpen === false) {
      return
    }

    setSelectedColor(getThemeColor())
  }, [isOpen, preferenceEpoch])

  useEffect(() => {
    // This picker persists across Astro view transitions (see Header.astro's
    // `transition:persist`), and re-reading the `[data-theme]`-scoped CSS
    // custom properties on these buttons after a page swap has been
    // observed to resolve stale (all swatches collapsing to the active
    // theme's colors). Snapshot each swatch's resolved colors once, up
    // front, so painting never depends on re-reading the cascade later.
    const resolved: Partial<Record<ThemeColor, SwatchShades>> = {}

    for (const color of THEME_COLORS) {
      const button = buttonRefs.current[color]

      if (!button) continue

      const styles = getComputedStyle(button)

      resolved[color] = {
        dark: styles.getPropertyValue('--color-primary-800').trim(),
        light: styles.getPropertyValue('--color-primary-400').trim(),
      }
    }

    setResolvedColors(resolved)
  }, [])

  const handleColorChange = (color: ThemeColor) => {
    setThemeColor(color)
    setSelectedColor(color)
  }

  return (
    <div className="grid grid-cols-4 gap-4 px-2 sm:grid-cols-7">
      {THEME_COLORS.map((color) => {
        const isHighlighted = color === highlightedColor
        const isSelected = selectedColor === color
        const { dark, light } = resolvedColors[color] ?? {
          dark: SWATCH_DARK_VAR,
          light: SWATCH_LIGHT_VAR,
        }

        return (
          <button
            key={color}
            ref={(el) => {
              buttonRefs.current[color] = el
            }}
            aria-label={`Select ${THEME_LABELS[color]} theme`}
            className={`relative h-10 w-full transition-opacity hover:opacity-80 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${
              isHighlighted ? 'ring-2 ring-primary-500 ring-offset-2' : ''
            }`}
            data-cuelume-hover="droplet"
            data-theme={color}
            style={{
              background: `linear-gradient(135deg, ${light} 50%, ${dark} 50%)`,
            }}
            title={THEME_LABELS[color]}
            type="button"
            onClick={() => handleColorChange(color)}
            {...PRESS_CUE_PROPS}
          >
            {isSelected && (
              <span
                className="absolute inset-0 m-auto flex h-5 w-5 items-center justify-center rounded-full"
                style={{ backgroundColor: dark }}
              >
                <Check
                  className="h-3 w-3"
                  strokeWidth={3}
                  style={{ color: light }}
                />
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

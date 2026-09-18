import type { ThemeColor } from './types'
import type { CSSProperties } from 'react'

import { Check } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { PALETTE_CHROME } from '@/components/CommandPalette/chrome'
import { TOGGLE_CUE_PROPS } from '@/components/Sound'
import { applyThemeColor } from '@/utils/theme'

import { THEME_COLORS, THEME_LABELS } from './constants'
import { ThemeLandscape } from './ThemeLandscape'
import { getThemeColor, setThemeColor } from './utils'

type LandscapeStyle = CSSProperties & { [key: `--landscape-${string}`]: string }

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
  const [resolvedColors, setResolvedColors] = useState<Partial<Record<ThemeColor, LandscapeStyle>>>(
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
    const resolved: Partial<Record<ThemeColor, LandscapeStyle>> = {}

    for (const color of THEME_COLORS) {
      const button = buttonRefs.current[color]

      if (!button) {
        continue
      }

      const styles = getComputedStyle(button)

      resolved[color] = {
        '--landscape-dark': styles.getPropertyValue('--color-primary-800').trim(),
        '--landscape-front': styles.getPropertyValue('--color-primary-500').trim(),
        '--landscape-middle': styles.getPropertyValue('--color-primary-600').trim(),
        '--landscape-ridge': styles.getPropertyValue('--color-primary-700').trim(),
        '--landscape-shadow': styles.getPropertyValue('--color-primary-900').trim(),
        '--landscape-sky': styles.getPropertyValue('--color-primary-400').trim(),
      }
    }

    setResolvedColors(resolved)

    return () => applyThemeColor(getThemeColor())
  }, [])

  const handleColorChange = (color: ThemeColor) => {
    setThemeColor(color)
    setSelectedColor(color)
  }

  return (
    <div
      aria-label="Theme colors"
      className="flex min-w-0 gap-1 overflow-x-auto overscroll-x-contain p-1"
      role="group"
    >
      {THEME_COLORS.map((color) => {
        const isHighlighted = color === highlightedColor
        const isSelected = selectedColor === color

        return (
          <button
            key={color}
            ref={(el) => {
              buttonRefs.current[color] = el
            }}
            aria-label={`Select ${THEME_LABELS[color]} theme`}
            aria-pressed={isSelected}
            className={`relative h-11 w-14 shrink-0 rounded-lg p-1 transition-colors ${PALETTE_CHROME.focusRing} ${
              isSelected || isHighlighted ? PALETTE_CHROME.swatchRing : PALETTE_CHROME.hoverFill
            }`}
            data-theme={color}
            style={resolvedColors[color]}
            title={THEME_LABELS[color]}
            type="button"
            onBlur={() => applyThemeColor(getThemeColor())}
            onClick={() => handleColorChange(color)}
            onFocus={(event) => {
              event.currentTarget.scrollIntoView({ block: 'nearest', inline: 'nearest' })
              applyThemeColor(color)
            }}
            onMouseEnter={() => applyThemeColor(color)}
            onMouseLeave={() => applyThemeColor(getThemeColor())}
            {...TOGGLE_CUE_PROPS}
          >
            <span className="block h-full overflow-hidden rounded-md">
              <ThemeLandscape />
            </span>
            {isSelected && (
              <span className="absolute right-1 bottom-1 flex h-4 w-4 items-center justify-center rounded-full bg-white text-black shadow-sm">
                <Check
                  className="h-2.5 w-2.5"
                  strokeWidth={3}
                />
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

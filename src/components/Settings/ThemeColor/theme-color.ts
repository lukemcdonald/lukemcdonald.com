import { PALETTE_CHROME } from '@/components/CommandPalette/chrome'
import { getThemeColor, isThemeColor, setThemeColor } from '@/components/ThemeColor/utils'
import { toggleClasses } from '@/utils/toggle-classes'

import { afterSettingChange, type SettingChange } from '../picker'

const LANDSCAPE_VARS = [
  ['--landscape-dark', '--color-primary-800'],
  ['--landscape-front', '--color-primary-500'],
  ['--landscape-middle', '--color-primary-600'],
  ['--landscape-ridge', '--color-primary-700'],
  ['--landscape-shadow', '--color-primary-900'],
  ['--landscape-sky', '--color-primary-400'],
] as const

export function applyThemeColorSelection(value: string): boolean {
  if (!isThemeColor(value)) {
    return false
  }

  setThemeColor(value)

  return true
}

export function snapshotThemeLandscapes(root: Element) {
  root.querySelectorAll<HTMLElement>('[data-theme-swatch]').forEach((button) => {
    const styles = getComputedStyle(button)

    for (const [target, source] of LANDSCAPE_VARS) {
      button.style.setProperty(target, styles.getPropertyValue(source).trim())
    }
  })
}

export function syncThemeColor(root: Element, highlightedColor?: string) {
  const selected = getThemeColor()
  const select = root.querySelector<HTMLSelectElement>('[data-settings-select="color"]')

  if (select) {
    select.value = selected
  }

  root.querySelectorAll<HTMLButtonElement>('[data-theme-swatch]').forEach((button) => {
    const color = button.dataset.theme
    const isSelected = color === selected
    const isHighlighted = color === highlightedColor

    button.setAttribute('aria-pressed', isSelected ? 'true' : 'false')
    button.querySelector('[data-theme-check]')?.classList.toggle('hidden', !isSelected)
    button.querySelector('[data-theme-check]')?.classList.toggle('flex', isSelected)
    toggleClasses(button, PALETTE_CHROME.swatchRing, isSelected || isHighlighted)
    toggleClasses(button, PALETTE_CHROME.hoverFill, !isSelected && !isHighlighted)
  })
}

export function bindThemeColor(root: Element, { onChange, signal }: SettingChange) {
  const sync = () => syncThemeColor(root)

  root.querySelectorAll<HTMLButtonElement>('[data-theme-swatch]').forEach((button) => {
    button.addEventListener(
      'click',
      () => {
        const color = button.dataset.theme

        if (!color || !applyThemeColorSelection(color)) {
          return
        }

        afterSettingChange(onChange, sync)
      },
      { signal },
    )
    button.addEventListener(
      'focus',
      () => {
        button.scrollIntoView({ block: 'nearest', inline: 'nearest' })
      },
      { signal },
    )
  })

  root.querySelector<HTMLSelectElement>('[data-settings-select="color"]')?.addEventListener(
    'change',
    (event) => {
      if (!(event.currentTarget instanceof HTMLSelectElement)) {
        return
      }

      applyThemeColorSelection(event.currentTarget.value)
      afterSettingChange(onChange, sync)
    },
    { signal },
  )
}

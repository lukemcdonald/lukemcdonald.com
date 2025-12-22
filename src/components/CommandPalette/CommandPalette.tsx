import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { useEffect, useState } from 'react'

import Moon from '@/components/Icons/Moon'
import Palette from '@/components/Icons/Palette'
import Search from '@/components/Icons/Search'
import Sun from '@/components/Icons/Sun'
import SunMoon from '@/components/Icons/SunMoon'
import {
  getStoredThemeColor,
  getStoredThemeMode,
  setThemeColor,
  setThemeMode,
  THEME_COLORS,
  type ThemeColor,
  type ThemeMode,
} from '@/utils/theme'

export interface NavItem {
  href: string
  name: string
}

export interface CommandPaletteProps {
  navigationItems?: NavItem[]
}

const THEME_LABELS: Record<ThemeColor, string> = {
  blue: 'Blue',
  default: 'Default',
  green: 'Green',
  neon: 'Neon',
  orange: 'Orange',
  purple: 'Purple',
  yellow: 'Yellow',
}

const MODE_ICONS: Record<ThemeMode, typeof Sun> = {
  dark: Moon,
  light: Sun,
  system: SunMoon,
}

const MODE_LABELS: Record<ThemeMode, string> = {
  dark: 'Dark',
  light: 'Light',
  system: 'System',
}

export default function CommandPalette({ navigationItems = [] }: CommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedThemeColor, setSelectedThemeColor] = useState<ThemeColor>('default')
  const [selectedMode, setSelectedMode] = useState<ThemeMode>('system')

  // Load current theme settings
  useEffect(() => {
    setSelectedThemeColor(getStoredThemeColor())
    setSelectedMode(getStoredThemeMode())
  }, [])

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Filter navigation items based on search
  const filteredNavItems = navigationItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleThemeColorChange = (color: ThemeColor) => {
    setThemeColor(color)
    setSelectedThemeColor(color)
  }

  const handleModeChange = (mode: ThemeMode) => {
    setThemeMode(mode)
    setSelectedMode(mode)
  }

  const handleClose = () => {
    setIsOpen(false)
    setSearchQuery('')
  }

  return (
    <>
      <button
        aria-label="Open command palette"
        className="rounded-md bg-black/0 px-2.5 py-2 text-base font-semibold tracking-wide text-primary-900 uppercase hover:bg-black/5 focus:outline-hidden sm:px-3"
        type="button"
        onClick={() => setIsOpen(true)}
      >
        ⌘K
      </button>

      <Dialog
        as="div"
        className="relative z-50"
        open={isOpen}
        onClose={handleClose}
      >
        <DialogBackdrop
          className="fixed inset-0 bg-black/30 backdrop-blur-xs transition-opacity data-closed:opacity-0"
          transition
        />

        <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20">
          <div className="flex min-h-full items-start justify-center">
            <DialogPanel
              className="relative w-full max-w-2xl transform rounded-xl bg-white shadow-2xl transition-all data-closed:scale-95 data-closed:opacity-0 dark:bg-primary-900"
              transition
            >
              {/* Search Input */}
              <div className="flex items-center border-b border-primary-200 px-4 dark:border-primary-700">
                <Search className="h-5 w-5 text-primary-400 dark:text-primary-500" />
                <input
                  autoComplete="off"
                  className="w-full border-0 bg-transparent px-4 py-4 text-primary-900 outline-none placeholder:text-primary-400 focus:ring-0 dark:text-primary-100 dark:placeholder:text-primary-500"
                  placeholder="Search navigation..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <kbd className="hidden rounded border border-primary-300 px-2 py-1 text-xs text-primary-600 sm:inline-block dark:border-primary-600 dark:text-primary-400">
                  ESC
                </kbd>
              </div>

              <div className="max-h-96 overflow-y-auto p-4">
                {/* Navigation Section */}
                {filteredNavItems.length > 0 && (
                  <div className="mb-6">
                    <DialogTitle className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-primary-500 dark:text-primary-400">
                      Navigation
                    </DialogTitle>
                    <div className="space-y-1">
                      {filteredNavItems.map((item) => (
                        <a
                          key={item.href}
                          className="block rounded-lg px-3 py-2 text-sm text-primary-900 transition-colors hover:bg-primary-100 dark:text-primary-100 dark:hover:bg-primary-800"
                          href={item.href}
                          onClick={handleClose}
                        >
                          {item.name}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Theme Colors Section */}
                <div className="mb-6">
                  <DialogTitle className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-primary-500 dark:text-primary-400">
                    Theme Color
                  </DialogTitle>
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                    {THEME_COLORS.map((color) => (
                      <button
                        key={color}
                        aria-label={`Select ${THEME_LABELS[color]} theme`}
                        className="group relative flex flex-col items-center gap-2 rounded-lg p-3 transition-colors hover:bg-primary-100 focus:outline-hidden focus:ring-2 focus:ring-primary-500 dark:hover:bg-primary-800"
                        type="button"
                        onClick={() => handleThemeColorChange(color)}
                      >
                        <div
                          className={`h-10 w-10 rounded-full border-2 transition-all ${
                            selectedThemeColor === color
                              ? 'border-primary-900 ring-2 ring-primary-500 ring-offset-2 dark:border-primary-100'
                              : 'border-primary-300 dark:border-primary-600'
                          }`}
                          data-theme={color === 'default' ? undefined : color}
                          style={{
                            background:
                              color === 'default'
                                ? 'linear-gradient(135deg, oklch(73.7% 0.019 106) 0%, oklch(32.7% 0.052 117) 100%)'
                                : color === 'blue'
                                  ? 'linear-gradient(135deg, oklch(73.7% 0.055 250) 0%, oklch(32.7% 0.085 240) 100%)'
                                  : color === 'purple'
                                    ? 'linear-gradient(135deg, oklch(73.7% 0.07 305) 0%, oklch(32.7% 0.085 320) 100%)'
                                    : color === 'yellow'
                                      ? 'linear-gradient(135deg, oklch(73.7% 0.075 91) 0%, oklch(32.7% 0.065 80) 100%)'
                                      : color === 'green'
                                        ? 'linear-gradient(135deg, oklch(73.7% 0.08 128) 0%, oklch(32.7% 0.07 140) 100%)'
                                        : color === 'orange'
                                          ? 'linear-gradient(135deg, oklch(73.7% 0.08 44) 0%, oklch(32.7% 0.07 25) 100%)'
                                          : 'linear-gradient(135deg, oklch(93.27% 0.227 122.42) 0%, oklch(45.93% 0.112 130) 100%)',
                          }}
                        />
                        <span className="text-xs text-primary-700 dark:text-primary-300">
                          {THEME_LABELS[color]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Appearance Mode Section */}
                <div>
                  <DialogTitle className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-primary-500 dark:text-primary-400">
                    Appearance
                  </DialogTitle>
                  <div className="grid grid-cols-3 gap-2">
                    {(['light', 'dark', 'system'] as ThemeMode[]).map((mode) => {
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
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-primary-200 px-4 py-3 text-xs text-primary-500 dark:border-primary-700 dark:text-primary-400">
                <div className="flex items-center justify-between">
                  <span>Press ESC to close</span>
                  <span className="hidden sm:inline">⌘K to toggle</span>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  )
}

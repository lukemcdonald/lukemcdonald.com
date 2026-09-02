import type { CommandPaletteProps } from './types'

import { play } from 'cuelume'
import { useState } from 'react'

import { SoundToggle } from '@/components/Sound'
import { toggleSoundPreference } from '@/components/Sound/utils'
import { ThemeColorPicker } from '@/components/ThemeColor'
import { setThemeColor } from '@/components/ThemeColor/utils'
import { ThemeModePicker } from '@/components/ThemeMode'
import { setThemeMode } from '@/components/ThemeMode/utils'

import { CommandPaletteDialog } from './CommandPaletteDialog'
import { CommandPaletteNav } from './CommandPaletteNav'
import { CommandPaletteSearch } from './CommandPaletteSearch'
import { CommandPaletteSection } from './CommandPaletteSection'
import { CommandPaletteTrigger } from './CommandPaletteTrigger'
import { useCommandPalette } from './useCommandPalette'
import { applyHighlightedCommand, getHighlightedCommand } from './utils'

export function CommandPalette({ navigationItems = [] }: CommandPaletteProps) {
  const { close, isOpen, open, searchInputRef, searchQuery, setSearchQuery } = useCommandPalette()
  const [preferenceEpoch, setPreferenceEpoch] = useState(0)

  const filteredNavItems = navigationItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )
  const highlightedCommand = getHighlightedCommand(navigationItems, searchQuery)
  const highlightedHref = highlightedCommand?.type === 'nav' ? highlightedCommand.href : undefined

  const syncPreferences = () => {
    setPreferenceEpoch((epoch) => epoch + 1)
  }

  const toggleSound = () => {
    toggleSoundPreference()
  }

  const selectHighlightedItem = () => {
    if (highlightedCommand?.type === 'color' || highlightedCommand?.type === 'mode') {
      play('toggle')
    }

    applyHighlightedCommand(
      {
        close: () => close({ silent: true }),
        navigate: (href) => {
          window.location.assign(href)
        },
        onPreferenceApplied: syncPreferences,
        setThemeColor,
        setThemeMode,
        toggleSound,
      },
      highlightedCommand,
    )
  }

  return (
    <>
      <CommandPaletteTrigger onOpen={open} />

      <CommandPaletteDialog
        onClose={() => close()}
        open={isOpen}
        searchInputRef={searchInputRef}
      >
        <CommandPaletteSearch
          onEnter={selectHighlightedItem}
          onQueryChange={setSearchQuery}
          query={searchQuery}
          searchInputRef={searchInputRef}
        />

        <div className="max-h-96 overflow-y-auto p-4">
          {filteredNavItems.length > 0 && (
            <CommandPaletteNav
              highlightedHref={highlightedHref}
              items={filteredNavItems}
              onNavigate={() => close({ silent: true })}
            />
          )}

          <CommandPaletteSection
            className="mb-5"
            title="Theme Color"
          >
            <ThemeColorPicker
              highlightedColor={
                highlightedCommand?.type === 'color' ? highlightedCommand.color : undefined
              }
              isOpen={isOpen}
              preferenceEpoch={preferenceEpoch}
            />
          </CommandPaletteSection>

          <div className="flex flex-wrap gap-x-10 gap-y-6">
            <CommandPaletteSection title="Appearance">
              <ThemeModePicker
                highlightedMode={
                  highlightedCommand?.type === 'mode' ? highlightedCommand.mode : undefined
                }
                isOpen={isOpen}
                preferenceEpoch={preferenceEpoch}
              />
            </CommandPaletteSection>
            <CommandPaletteSection title="Sound">
              <SoundToggle
                isHighlighted={highlightedCommand?.type === 'sound'}
                isOpen={isOpen}
                preferenceEpoch={preferenceEpoch}
              />
            </CommandPaletteSection>
          </div>
        </div>
      </CommandPaletteDialog>
    </>
  )
}

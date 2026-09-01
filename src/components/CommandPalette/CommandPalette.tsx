import type { CommandPaletteProps } from './types'

import { play } from 'cuelume'
import { useState } from 'react'

import { SoundToggle } from '@/components/Sound'
import { getSoundPreference, setSoundPreference } from '@/components/Sound/utils'
import { ThemeColorPicker } from '@/components/ThemeColor'
import { setThemeColor } from '@/components/ThemeColor/utils'
import { ThemeModePicker } from '@/components/ThemeMode'
import { setThemeMode } from '@/components/ThemeMode/utils'

import { CommandPaletteDialog } from './CommandPaletteDialog'
import { CommandPaletteNav } from './CommandPaletteNav'
import { CommandPaletteSearch } from './CommandPaletteSearch'
import { CommandPaletteSection } from './CommandPaletteSection'
import { CommandPaletteTrigger } from './CommandPaletteTrigger'
import { getHighlightedCommand } from './getHighlightedCommand'
import { useCommandPalette } from './useCommandPalette'

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

  const selectHighlightedItem = () => {
    if (!highlightedCommand) {
      return
    }

    if (highlightedCommand.type === 'nav') {
      close()
      window.location.assign(highlightedCommand.href)
      return
    }

    if (highlightedCommand.type === 'color') {
      setThemeColor(highlightedCommand.color)
      syncPreferences()
      return
    }

    if (highlightedCommand.type === 'mode') {
      setThemeMode(highlightedCommand.mode)
      syncPreferences()
      return
    }

    const nextSound = getSoundPreference() === 'on' ? 'off' : 'on'

    setSoundPreference(nextSound)
    play('toggle')
    syncPreferences()
  }

  return (
    <>
      <CommandPaletteTrigger onOpen={open} />
      <CommandPaletteDialog
        onClose={close}
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
          <CommandPaletteNav
            highlightedHref={highlightedHref}
            items={filteredNavItems}
            onNavigate={close}
          />
          <CommandPaletteSection
            className="mb-6"
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

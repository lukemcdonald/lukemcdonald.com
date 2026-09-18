import type { CommandPaletteProps } from './types'

import { navigate } from 'astro:transitions/client'
import { play } from 'cuelume'
import { useState } from 'react'

import { toggleSoundPreference } from '@/components/Sound/utils'
import { setThemeColor } from '@/components/ThemeColor/utils'
import { setThemeMode } from '@/components/ThemeMode/utils'

import { PALETTE_CHROME } from './chrome'
import { CommandPaletteDialog } from './CommandPaletteDialog'
import { CommandPaletteNav } from './CommandPaletteNav'
import { CommandPalettePreferences } from './CommandPalettePreferences'
import { CommandPaletteSearch } from './CommandPaletteSearch'
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
          navigate(href)
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

        <div className="max-h-[min(26rem,60dvh)] overflow-y-auto p-4">
          {filteredNavItems.length > 0 ?
            <CommandPaletteNav
              highlightedHref={highlightedHref}
              items={filteredNavItems}
              onNavigate={() => close({ silent: true })}
            />
          : <p className={`py-6 text-center text-sm ${PALETTE_CHROME.muted}`}>
              {highlightedCommand ? 'Press Enter to apply' : 'No matching pages'}
            </p>
          }
        </div>

        <CommandPalettePreferences
          highlightedCommand={highlightedCommand}
          isOpen={isOpen}
          preferenceEpoch={preferenceEpoch}
        />
      </CommandPaletteDialog>
    </>
  )
}

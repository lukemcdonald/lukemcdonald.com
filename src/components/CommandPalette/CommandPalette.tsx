import type { CommandPaletteProps } from './types'

import { navigate } from 'astro:transitions/client'
import { play } from 'cuelume'
import { useLayoutEffect, useState } from 'react'

import {
  getActiveEasterEggId,
  getEasterEggs,
  getFoundEasterEggIds,
  toggleEasterEgg,
} from '@/components/EasterEggs/easter-eggs'
import { toggleSoundPreference } from '@/components/Sound/utils'
import { setThemeColor } from '@/components/ThemeColor/utils'
import { setThemeMode } from '@/components/ThemeMode/utils'

import { PALETTE_CHROME } from './chrome'
import { CommandPaletteDialog } from './CommandPaletteDialog'
import { CommandPaletteNav } from './CommandPaletteNav'
import { CommandPalettePreferences } from './CommandPalettePreferences'
import { CommandPaletteSearch } from './CommandPaletteSearch'
import { CommandPaletteSecrets } from './CommandPaletteSecrets'
import { CommandPaletteTrigger } from './CommandPaletteTrigger'
import { useCommandPalette } from './useCommandPalette'
import { applyHighlightedCommand, getHighlightedCommand, getVisibleSecrets } from './utils'

export function CommandPalette({ navigationItems = [] }: CommandPaletteProps) {
  const { close, isOpen, open, searchInputRef, searchQuery, setSearchQuery } = useCommandPalette()
  const [preferenceEpoch, setPreferenceEpoch] = useState(0)
  const { activeEggId, foundEggIds } = useFoundEggs(isOpen, preferenceEpoch)
  const secrets = getVisibleSecrets(getEasterEggs(), foundEggIds, searchQuery)
  const filteredNavItems = navigationItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )
  const highlightedCommand = getHighlightedCommand(navigationItems, searchQuery, secrets.foundEggs)
  const highlightedEggId = highlightedCommand?.type === 'egg' ? highlightedCommand.eggId : undefined
  const highlightedHref = highlightedCommand?.type === 'nav' ? highlightedCommand.href : undefined
  const showNav = filteredNavItems.length > 0
  const showEmpty = !showNav && !secrets.showSecrets

  const syncPreferences = () => {
    setPreferenceEpoch((epoch) => epoch + 1)
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
        toggleEgg: toggleEasterEgg,
        toggleSound: toggleSoundPreference,
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

        <div className="max-h-[min(26rem,60dvh)] space-y-4 overflow-y-auto p-4">
          {showNav ?
            <CommandPaletteNav
              highlightedHref={highlightedHref}
              items={filteredNavItems}
              onNavigate={() => close({ silent: true })}
            />
          : null}

          {secrets.showSecrets ?
            <CommandPaletteSecrets
              activeId={activeEggId}
              foundEggs={secrets.visibleFoundEggs}
              highlightedId={highlightedEggId}
              onToggle={(id) => {
                toggleEasterEgg(id)
                syncPreferences()
              }}
              progressLabel={secrets.progressLabel}
              showProgress={secrets.showProgress}
            />
          : null}

          {showEmpty ?
            <p className={`py-6 text-center text-sm ${PALETTE_CHROME.muted}`}>
              {highlightedCommand ? 'Press Enter to apply' : 'No matching pages'}
            </p>
          : null}
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

function useFoundEggs(isOpen: boolean, preferenceEpoch: number) {
  const [activeEggId, setActiveEggId] = useState<string>()
  const [foundEggIds, setFoundEggIds] = useState<readonly string[]>([])

  useLayoutEffect(() => {
    setActiveEggId(getActiveEasterEggId())
    setFoundEggIds(getFoundEasterEggIds())
  }, [isOpen, preferenceEpoch])

  return { activeEggId, foundEggIds }
}

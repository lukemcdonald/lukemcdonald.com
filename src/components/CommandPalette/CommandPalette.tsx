import type { CommandPaletteProps } from './types'

import { navigate } from 'astro:transitions/client'
import { play } from 'cuelume'
import { useEffect, useLayoutEffect, useState } from 'react'

import {
  getActiveEasterEggId,
  getEasterEggs,
  getFoundEasterEggIds,
  toggleEasterEgg,
} from '@/components/EasterEggs/easter-eggs'
import { toggleSoundPreference } from '@/components/Sound/utils'
import { setThemeColor } from '@/components/ThemeColor/utils'
import { setThemeMode } from '@/components/ThemeMode/utils'

import { CommandPaletteDialog } from './CommandPaletteDialog'
import { CommandPaletteMain } from './CommandPaletteMain'
import { CommandPalettePreferences } from './CommandPalettePreferences'
import { CommandPaletteSearch } from './CommandPaletteSearch'
import { CommandPaletteSecrets } from './CommandPaletteSecrets'
import { CommandPaletteSecretsFooter } from './CommandPaletteSecretsFooter'
import { CommandPaletteTrigger } from './CommandPaletteTrigger'
import { useCommandPalette } from './useCommandPalette'
import {
  applyHighlightedCommand,
  getFoundEggs,
  getHighlightedCommand,
  getSecretsFooterLabel,
  getSecretsProgressLabel,
  isPaletteBackKey,
  isSecretsShortcut,
  SECRETS_PAGE,
} from './utils'

export function CommandPalette({ navigationItems = [] }: CommandPaletteProps) {
  const { close, isOpen, open, searchInputRef, searchQuery, setSearchQuery } = useCommandPalette()
  const [pages, setPages] = useState<string[]>([])
  const [preferenceEpoch, setPreferenceEpoch] = useState(0)
  const { activeEggId, foundEggIds } = useFoundEggs(isOpen, preferenceEpoch)
  const page = pages[pages.length - 1]
  const eggs = getEasterEggs()
  const foundEggs = getFoundEggs(eggs, foundEggIds)
  const filteredEggs = foundEggs.filter((egg) =>
    egg.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )
  const filteredNavItems = navigationItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )
  const highlightedCommand =
    page === SECRETS_PAGE ? undefined : getHighlightedCommand(navigationItems, searchQuery)
  const highlightedHref = highlightedCommand?.type === 'nav' ? highlightedCommand.href : undefined

  useEffect(() => {
    if (!isOpen) {
      setPages([])
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (isSecretsShortcut(event)) {
        event.preventDefault()
        setPages((current) => (current[current.length - 1] === SECRETS_PAGE ? [] : [SECRETS_PAGE]))
        setSearchQuery('')
        return
      }

      if (pages.length === 0 || !isPaletteBackKey(event, searchQuery)) {
        return
      }

      event.preventDefault()
      event.stopPropagation()
      setPages((current) => current.slice(0, -1))
      setSearchQuery('')
    }

    document.addEventListener('keydown', onKeyDown, true)

    return () => document.removeEventListener('keydown', onKeyDown, true)
  }, [isOpen, pages, searchQuery, setSearchQuery])

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

        {page === SECRETS_PAGE ?
          <CommandPaletteSecrets
            activeId={activeEggId}
            foundEggs={filteredEggs}
            onToggle={(id) => {
              toggleEasterEgg(id)
              syncPreferences()
            }}
            title={getSecretsProgressLabel(foundEggs.length, eggs.length)}
          />
        : <CommandPaletteMain
            highlightedCommand={highlightedCommand}
            highlightedHref={highlightedHref}
            items={filteredNavItems}
            onNavigate={() => close({ silent: true })}
          />
        }

        <CommandPalettePreferences
          highlightedCommand={highlightedCommand}
          isOpen={isOpen}
          preferenceEpoch={preferenceEpoch}
        />

        {page ? null : (
          <CommandPaletteSecretsFooter
            label={getSecretsFooterLabel(foundEggs.length, eggs.length)}
            onOpen={() => {
              setPages([SECRETS_PAGE])
              setSearchQuery('')
            }}
          />
        )}
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

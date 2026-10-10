import type { CommandPaletteProps } from './types'
import type { RefObject } from 'react'

import { navigate } from 'astro:transitions/client'
import { play } from 'cuelume'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'

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
  isSecretsShortcut,
} from './utils'

export function CommandPalette({ navigationItems = [] }: CommandPaletteProps) {
  const { close, isOpen, open, searchInputRef, searchQuery, setSearchQuery } = useCommandPalette()
  const [preferenceEpoch, setPreferenceEpoch] = useState(0)
  const secretsBackRef = useRef<HTMLButtonElement>(null)
  const { activeEggId, foundEggIds } = useFoundEggs(isOpen, preferenceEpoch)
  const { openSecrets, page, returnToMain } = usePalettePage(isOpen, searchInputRef, setSearchQuery)
  const eggs = getEasterEggs()
  const foundEggs = getFoundEggs(eggs, foundEggIds)
  const filteredNavItems = navigationItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )
  const highlightedCommand = getHighlightedCommand(navigationItems, searchQuery)
  const highlightedHref = highlightedCommand?.type === 'nav' ? highlightedCommand.href : undefined

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
        searchInputRef={page === 'secrets' ? secretsBackRef : searchInputRef}
      >
        {page === 'secrets' ?
          <CommandPaletteSecrets
            activeId={activeEggId}
            backButtonRef={secretsBackRef}
            foundEggs={foundEggs}
            onBack={returnToMain}
            onToggle={(id) => {
              toggleEasterEgg(id)
              syncPreferences()
            }}
            progressLabel={getSecretsProgressLabel(foundEggs.length, eggs.length)}
          />
        : <CommandPaletteMain
            highlightedCommand={highlightedCommand}
            highlightedHref={highlightedHref}
            items={filteredNavItems}
            onEnter={selectHighlightedItem}
            onNavigate={() => close({ silent: true })}
            onQueryChange={setSearchQuery}
            searchInputRef={searchInputRef}
            searchQuery={searchQuery}
          />
        }

        <CommandPalettePreferences
          highlightedCommand={highlightedCommand}
          isOpen={isOpen}
          preferenceEpoch={preferenceEpoch}
        />

        {page === 'main' ?
          <CommandPaletteSecretsFooter
            label={getSecretsFooterLabel(foundEggs.length, eggs.length)}
            onOpen={openSecrets}
          />
        : null}
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

function usePalettePage(
  isOpen: boolean,
  searchInputRef: RefObject<HTMLInputElement | null>,
  setSearchQuery: (query: string) => void,
) {
  const [page, setPage] = useState<'main' | 'secrets'>('main')

  useEffect(() => {
    if (isOpen) {
      return
    }

    setPage('main')
  }, [isOpen])

  useLayoutEffect(() => {
    if (!isOpen || page !== 'main') {
      return
    }

    searchInputRef.current?.focus()
  }, [isOpen, page, searchInputRef])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (isSecretsShortcut(event)) {
        event.preventDefault()
        setPage((current) => (current === 'secrets' ? 'main' : 'secrets'))
        setSearchQuery('')
        return
      }

      if (page !== 'secrets' || event.key !== 'Escape') {
        return
      }

      event.preventDefault()
      event.stopPropagation()
      setPage('main')
      setSearchQuery('')
    }

    document.addEventListener('keydown', onKeyDown, true)

    return () => document.removeEventListener('keydown', onKeyDown, true)
  }, [isOpen, page, setSearchQuery])

  return {
    openSecrets: () => {
      setPage('secrets')
      setSearchQuery('')
    },
    page,
    returnToMain: () => {
      setPage('main')
      setSearchQuery('')
    },
  }
}

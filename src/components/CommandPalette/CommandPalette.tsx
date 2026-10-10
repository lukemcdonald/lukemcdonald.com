import type { CommandPaletteProps } from './types'

import { navigate } from 'astro:transitions/client'
import { Command } from 'cmdk'
import { useEffect, useLayoutEffect, useState } from 'react'

import {
  getActiveEasterEggId,
  getEasterEggs,
  getFoundEasterEggIds,
  toggleEasterEgg,
} from '@/components/EasterEggs/easter-eggs'

import { PALETTE_CHROME } from './chrome'
import { CommandPaletteDialog } from './CommandPaletteDialog'
import { CommandPaletteNav } from './CommandPaletteNav'
import { CommandPalettePreferences } from './CommandPalettePreferences'
import { CommandPaletteSearch } from './CommandPaletteSearch'
import { CommandPaletteSecrets } from './CommandPaletteSecrets'
import { CommandPaletteSecretsFooter } from './CommandPaletteSecretsFooter'
import { CommandPaletteTrigger } from './CommandPaletteTrigger'
import { useCommandPalette } from './useCommandPalette'
import {
  getFoundEggs,
  getPaletteEmptyMessage,
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

  return (
    <>
      <CommandPaletteTrigger onOpen={open} />

      <CommandPaletteDialog
        onClose={() => close()}
        open={isOpen}
        searchInputRef={searchInputRef}
      >
        <Command label="Search">
          <CommandPaletteSearch
            onQueryChange={setSearchQuery}
            query={searchQuery}
            searchInputRef={searchInputRef}
          />

          <Command.List
            key={page ?? 'main'}
            className={PALETTE_CHROME.list}
            label="Results"
          >
            <Command.Empty className={`py-6 text-center text-sm ${PALETTE_CHROME.muted}`}>
              {getPaletteEmptyMessage(page, foundEggs.length)}
            </Command.Empty>

            {page === SECRETS_PAGE ?
              <CommandPaletteSecrets
                activeId={activeEggId}
                foundEggs={foundEggs}
                onToggle={(id) => {
                  toggleEasterEgg(id)
                  syncPreferences()
                }}
                title={getSecretsProgressLabel(foundEggs.length, eggs.length)}
              />
            : <CommandPaletteNav
                items={navigationItems}
                onNavigate={(href) => {
                  close({ silent: true })
                  navigate(href)
                }}
              />
            }
          </Command.List>
        </Command>

        <CommandPalettePreferences
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

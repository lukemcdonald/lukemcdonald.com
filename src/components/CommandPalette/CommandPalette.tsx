import type { CommandPaletteProps } from './types'

import { navigate } from 'astro:transitions/client'
import { Command } from 'cmdk'
import { useLayoutEffect, useState } from 'react'

import {
  getActiveEasterEggId,
  getEasterEggs,
  getFoundEasterEggIds,
  toggleEasterEgg,
} from '@/components/EasterEggs/easter-eggs'

import { CommandPaletteDialog } from './CommandPaletteDialog'
import { CommandPalettePreferences } from './CommandPalettePreferences'
import { CommandPaletteResults } from './CommandPaletteResults'
import { CommandPaletteSearch } from './CommandPaletteSearch'
import { CommandPaletteSecretsFooter } from './CommandPaletteSecretsFooter'
import { CommandPaletteTrigger } from './CommandPaletteTrigger'
import { useCommandPalette } from './useCommandPalette'
import { usePalettePages } from './usePalettePages'
import { getFoundEggs, getSecretsFooterLabel, getSecretsProgressLabel } from './utils'

export function CommandPalette({ navigationItems = [] }: CommandPaletteProps) {
  const { close, isOpen, open, searchInputRef, searchQuery, setSearchQuery } = useCommandPalette()
  const { openSecrets, page } = usePalettePages(isOpen, searchInputRef, searchQuery, setSearchQuery)
  const [preferenceEpoch, setPreferenceEpoch] = useState(0)
  const { activeEggId, foundEggIds } = useFoundEggs(isOpen, preferenceEpoch)
  const eggs = getEasterEggs()
  const foundEggs = getFoundEggs(eggs, foundEggIds)

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
          <CommandPaletteResults
            activeEggId={activeEggId}
            foundEggs={foundEggs}
            navigationItems={navigationItems}
            onNavigate={(href) => {
              close({ silent: true })
              navigate(href)
            }}
            onToggleEgg={(id) => {
              toggleEasterEgg(id)
              setPreferenceEpoch((epoch) => epoch + 1)
            }}
            page={page}
            progressLabel={getSecretsProgressLabel(foundEggs.length, eggs.length)}
          />
        </Command>

        <CommandPalettePreferences
          isOpen={isOpen}
          preferenceEpoch={preferenceEpoch}
        />

        {page ? null : (
          <CommandPaletteSecretsFooter
            label={getSecretsFooterLabel(foundEggs.length, eggs.length)}
            onOpen={openSecrets}
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

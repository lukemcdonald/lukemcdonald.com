import type { CommandPaletteProps } from './types'

import { SoundToggle } from '@/components/Sound'
import { ThemeColorPicker } from '@/components/ThemeColor'
import { ThemeModePicker } from '@/components/ThemeMode'

import { CommandPaletteDialog } from './CommandPaletteDialog'
import { CommandPaletteNav } from './CommandPaletteNav'
import { CommandPaletteSearch } from './CommandPaletteSearch'
import { CommandPaletteSection } from './CommandPaletteSection'
import { CommandPaletteTrigger } from './CommandPaletteTrigger'
import { useCommandPalette } from './useCommandPalette'

export function CommandPalette({ navigationItems = [] }: CommandPaletteProps) {
  const { close, isOpen, open, searchInputRef, searchQuery, setSearchQuery } = useCommandPalette()

  const filteredNavItems = navigationItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <>
      <CommandPaletteTrigger onOpen={open} />
      <CommandPaletteDialog
        onClose={close}
        open={isOpen}
        searchInputRef={searchInputRef}
      >
        <CommandPaletteSearch
          query={searchQuery}
          searchInputRef={searchInputRef}
          onQueryChange={setSearchQuery}
        />
        <div className="max-h-96 overflow-y-auto p-4">
          <CommandPaletteNav
            items={filteredNavItems}
            onNavigate={close}
          />
          <CommandPaletteSection
            className="mb-6"
            title="Theme Color"
          >
            <ThemeColorPicker />
          </CommandPaletteSection>
          <div className="flex flex-wrap gap-x-10 gap-y-6">
            <CommandPaletteSection title="Appearance">
              <ThemeModePicker />
            </CommandPaletteSection>
            <CommandPaletteSection title="Sound">
              <SoundToggle />
            </CommandPaletteSection>
          </div>
        </div>
      </CommandPaletteDialog>
    </>
  )
}

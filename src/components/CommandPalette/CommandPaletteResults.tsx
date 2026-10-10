import type { CommandPaletteEggItem, CommandPaletteNavItem } from './types'

import { Command } from 'cmdk'

import { PALETTE_CHROME } from './chrome'
import { CommandPaletteNav } from './CommandPaletteNav'
import { CommandPaletteSecrets } from './CommandPaletteSecrets'
import { getPaletteEmptyMessage, SECRETS_PAGE } from './utils'

type CommandPaletteResultsProps = {
  activeEggId?: string
  foundEggs: readonly CommandPaletteEggItem[]
  navigationItems: CommandPaletteNavItem[]
  onNavigate: (href: string) => void
  onToggleEgg: (id: string) => void
  page?: string
  progressLabel: string
}

export function CommandPaletteResults({
  activeEggId,
  foundEggs,
  navigationItems,
  onNavigate,
  onToggleEgg,
  page,
  progressLabel,
}: CommandPaletteResultsProps) {
  return (
    <Command.List
      key={page ?? 'main'}
      className={PALETTE_CHROME.list}
      label="Results"
    >
      <PalettePageItems
        activeEggId={activeEggId}
        foundEggs={foundEggs}
        navigationItems={navigationItems}
        onNavigate={onNavigate}
        onToggleEgg={onToggleEgg}
        page={page}
        progressLabel={progressLabel}
      />
      <PaletteEmpty
        foundCount={foundEggs.length}
        page={page}
      />
    </Command.List>
  )
}

function PaletteEmpty({ foundCount, page }: { foundCount: number; page?: string }) {
  if (page === SECRETS_PAGE && foundCount === 0) {
    return null
  }

  return (
    <Command.Empty className={`py-6 text-center text-sm ${PALETTE_CHROME.muted}`}>
      {getPaletteEmptyMessage(page, foundCount)}
    </Command.Empty>
  )
}

function PalettePageItems({
  activeEggId,
  foundEggs,
  navigationItems,
  onNavigate,
  onToggleEgg,
  page,
  progressLabel,
}: CommandPaletteResultsProps) {
  if (page === SECRETS_PAGE) {
    return (
      <CommandPaletteSecrets
        activeId={activeEggId}
        foundEggs={foundEggs}
        onToggle={onToggleEgg}
        title={progressLabel}
      />
    )
  }

  return (
    <CommandPaletteNav
      items={navigationItems}
      onNavigate={onNavigate}
    />
  )
}

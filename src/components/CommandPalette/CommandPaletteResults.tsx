import type { CommandPaletteEggItem, CommandPaletteNavItem } from './types'

import { Command } from 'cmdk'

import { HOVER_NAV_CUE_PROPS, TOGGLE_CUE_PROPS } from '@/components/Sound'
import { toHrefTestId } from '@/features/navigation/navigation.utils'

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
      label="Results"
    >
      {page === SECRETS_PAGE ?
        <SecretsItems
          activeEggId={activeEggId}
          foundEggs={foundEggs}
          onToggleEgg={onToggleEgg}
          progressLabel={progressLabel}
        />
      : <NavigationItems
          navigationItems={navigationItems}
          onNavigate={onNavigate}
        />
      }
      <PaletteEmpty
        foundCount={foundEggs.length}
        page={page}
      />
    </Command.List>
  )
}

function NavigationItems({
  navigationItems,
  onNavigate,
}: {
  navigationItems: CommandPaletteNavItem[]
  onNavigate: (href: string) => void
}) {
  return (
    <Command.Group
      heading="Navigation"
      value="Navigation"
    >
      {navigationItems.map((item) => {
        return (
          <Command.Item
            key={item.href}
            data-testid={toHrefTestId('command-palette-item', item.href)}
            value={item.name}
            onSelect={() => onNavigate(item.href)}
            {...HOVER_NAV_CUE_PROPS}
          >
            {item.name}
          </Command.Item>
        )
      })}
    </Command.Group>
  )
}

function PaletteEmpty({ foundCount, page }: { foundCount: number; page?: string }) {
  if (page === SECRETS_PAGE && foundCount === 0) {
    return null
  }

  return <Command.Empty aria-live="polite">{getPaletteEmptyMessage(page)}</Command.Empty>
}

function SecretsItems({
  activeEggId,
  foundEggs,
  onToggleEgg,
  progressLabel,
}: {
  activeEggId?: string
  foundEggs: readonly CommandPaletteEggItem[]
  onToggleEgg: (id: string) => void
  progressLabel: string
}) {
  return (
    <Command.Group
      data-testid="command-palette-secrets"
      forceMount
      heading={progressLabel}
      value={progressLabel}
    >
      {foundEggs.map((egg) => {
        const isActive = egg.id === activeEggId

        return (
          <Command.Item
            key={egg.id}
            data-active={isActive || undefined}
            value={egg.name}
            onSelect={() => onToggleEgg(egg.id)}
            {...TOGGLE_CUE_PROPS}
          >
            {egg.name}
            <span className="sr-only">{isActive ? 'on' : 'off'}</span>
          </Command.Item>
        )
      })}
    </Command.Group>
  )
}

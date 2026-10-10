import type { ReactNode } from 'react'

import { Command } from 'cmdk'

import { PALETTE_CHROME } from './chrome'

type CommandPaletteSectionProps = {
  children: ReactNode
  'data-testid'?: string
  forceMount?: boolean
  title: string
}

export function CommandPaletteSection({
  children,
  'data-testid': testId,
  forceMount,
  title,
}: CommandPaletteSectionProps) {
  return (
    <Command.Group
      className="[&_[cmdk-group-heading]]:mb-2"
      data-testid={testId}
      forceMount={forceMount}
      heading={
        <span className={`text-xs font-medium tracking-wider uppercase ${PALETTE_CHROME.muted}`}>
          {title}
        </span>
      }
      value={title}
    >
      {children}
    </Command.Group>
  )
}

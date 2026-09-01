import type { ReactNode } from 'react'

import { DialogTitle } from '@headlessui/react'

import { PALETTE_CHROME } from './chrome'

type CommandPaletteSectionProps = {
  children: ReactNode
  className?: string
  title: string
}

export function CommandPaletteSection({ children, className, title }: CommandPaletteSectionProps) {
  return (
    <div className={className}>
      <DialogTitle
        className={`mb-3 px-2 text-xs font-semibold tracking-wider uppercase ${PALETTE_CHROME.muted}`}
      >
        {title}
      </DialogTitle>
      {children}
    </div>
  )
}

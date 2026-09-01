import type { ReactNode } from 'react'

import { DialogTitle } from '@headlessui/react'

type CommandPaletteSectionProps = {
  children: ReactNode
  className?: string
  title: string
}

export function CommandPaletteSection({ children, className, title }: CommandPaletteSectionProps) {
  return (
    <div className={className}>
      <DialogTitle className="mb-3 px-2 text-xs font-semibold tracking-wider text-primary-800 uppercase dark:text-primary-400">
        {title}
      </DialogTitle>
      {children}
    </div>
  )
}

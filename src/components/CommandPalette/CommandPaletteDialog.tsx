import type { ReactNode, RefObject } from 'react'

import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react'

type CommandPaletteDialogProps = {
  children: ReactNode
  onClose: () => void
  open: boolean
  searchInputRef: RefObject<HTMLElement | null>
}

export function CommandPaletteDialog({
  children,
  onClose,
  open,
  searchInputRef,
}: CommandPaletteDialogProps) {
  return (
    <Dialog
      aria-label="Site navigation and preferences"
      as="div"
      className="relative z-50"
      initialFocus={searchInputRef}
      open={open}
      onClose={onClose}
    >
      <DialogBackdrop
        className="fixed inset-0 bg-transparent transition-opacity data-closed:opacity-0"
        transition
      />

      <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6">
        <div className="flex min-h-full items-center justify-center">
          <DialogPanel
            className="glass relative w-full max-w-2xl overflow-hidden rounded-xl glass-dialog"
            data-testid="command-palette"
            transition
          >
            {children}
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  )
}

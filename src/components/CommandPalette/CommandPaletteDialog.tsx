import type { ReactNode, RefObject } from 'react'

import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react'

import { PALETTE_CHROME } from './chrome'

type CommandPaletteDialogProps = {
  children: ReactNode
  onClose: () => void
  open: boolean
  searchInputRef: RefObject<HTMLInputElement | null>
}

export function CommandPaletteDialog({
  children,
  onClose,
  open,
  searchInputRef,
}: CommandPaletteDialogProps) {
  return (
    <Dialog
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
            className="relative w-full max-w-2xl transform overflow-hidden rounded-xl glass transition-all data-closed:scale-95 data-closed:opacity-0"
            transition
          >
            {children}
            <div
              className={`border-t px-4 py-3 text-xs ${PALETTE_CHROME.border} ${PALETTE_CHROME.muted}`}
            >
              <div className="flex items-center justify-between">
                <span>Press ESC to close</span>
                <span className="hidden sm:inline">⌘K to toggle</span>
              </div>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  )
}

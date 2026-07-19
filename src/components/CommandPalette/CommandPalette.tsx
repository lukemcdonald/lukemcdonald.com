import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { play } from 'cuelume'
import { Search } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { SoundToggle, TICK_CUE_PROPS } from '@/components/Sound'
import { ThemeColorPicker } from '@/components/ThemeColor'
import { ThemeModePicker } from '@/components/ThemeMode'

export interface NavItem {
  href: string
  name: string
}

export interface CommandPaletteProps {
  navigationItems?: NavItem[]
}

export default function CommandPalette({ navigationItems = [] }: CommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const isFirstRender = useRef(true)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Play a cue on open/close transitions, skipping the initial mount
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    play(isOpen ? 'chime' : 'whisper')
  }, [isOpen])

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Filter navigation items based on search
  const filteredNavItems = navigationItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleClose = () => {
    setIsOpen(false)
    setSearchQuery('')
  }

  return (
    <>
      <button
        aria-label="Open command palette"
        className="rounded-md bg-black/0 px-2.5 py-2 text-base font-semibold tracking-wide text-primary-900 uppercase hover:bg-black/5 focus:outline-hidden sm:px-3"
        type="button"
        onClick={() => setIsOpen(true)}
      >
        ⌘K
      </button>

      <Dialog
        as="div"
        className="relative z-50"
        initialFocus={searchInputRef}
        open={isOpen}
        onClose={handleClose}
      >
        <DialogBackdrop
          className="fixed inset-0 bg-black/30 backdrop-blur-xs transition-opacity data-closed:opacity-0"
          transition
        />

        <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20">
          <div className="flex min-h-full items-start justify-center">
            <DialogPanel
              className="relative w-full max-w-2xl transform rounded-xl bg-white shadow-2xl transition-all data-closed:scale-95 data-closed:opacity-0 dark:bg-primary-900"
              transition
            >
              {/* Search Input */}
              <div className="flex items-center border-b border-primary-200 px-4 dark:border-primary-700">
                <Search className="h-5 w-5 text-primary-700 dark:text-primary-500" />
                <input
                  ref={searchInputRef}
                  autoComplete="off"
                  className="w-full border-0 bg-transparent px-4 py-4 text-primary-900 outline-none placeholder:text-primary-700 focus:ring-0 dark:text-primary-100 dark:placeholder:text-primary-500"
                  placeholder="Search navigation..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <kbd className="hidden rounded border border-primary-300 px-2 py-1 text-xs text-primary-800 sm:inline-block dark:border-primary-600 dark:text-primary-400">
                  ESC
                </kbd>
              </div>

              <div className="max-h-96 overflow-y-auto p-4">
                {/* Navigation Section */}
                {filteredNavItems.length > 0 && (
                  <div className="mb-6">
                    <DialogTitle className="mb-3 px-2 text-xs font-semibold tracking-wider text-primary-800 uppercase dark:text-primary-400">
                      Navigation
                    </DialogTitle>
                    <div className="space-y-1">
                      {filteredNavItems.map((item) => (
                        <a
                          key={item.href}
                          className="block rounded-lg px-3 py-2 text-sm text-primary-900 transition-colors hover:bg-primary-100 dark:text-primary-100 dark:hover:bg-primary-800"
                          href={item.href}
                          onClick={handleClose}
                          {...TICK_CUE_PROPS}
                        >
                          {item.name}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Theme Colors Section */}
                <div className="mb-6">
                  <DialogTitle className="mb-3 px-2 text-xs font-semibold tracking-wider text-primary-800 uppercase dark:text-primary-400">
                    Theme Color
                  </DialogTitle>
                  <ThemeColorPicker />
                </div>

                {/* Appearance & Sound Sections */}
                <div className="flex flex-wrap gap-x-10 gap-y-6">
                  <div>
                    <DialogTitle className="mb-3 px-2 text-xs font-semibold tracking-wider text-primary-800 uppercase dark:text-primary-400">
                      Appearance
                    </DialogTitle>
                    <ThemeModePicker />
                  </div>

                  <div>
                    <DialogTitle className="mb-3 px-2 text-xs font-semibold tracking-wider text-primary-800 uppercase dark:text-primary-400">
                      Sound
                    </DialogTitle>
                    <SoundToggle />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-primary-200 px-4 py-3 text-xs text-primary-800 dark:border-primary-700 dark:text-primary-400">
                <div className="flex items-center justify-between">
                  <span>Press ESC to close</span>
                  <span className="hidden sm:inline">⌘K to toggle</span>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  )
}

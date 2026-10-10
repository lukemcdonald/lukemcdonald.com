import type { CommandPaletteEggItem } from './types'
import type { RefObject } from 'react'

import { DialogTitle } from '@headlessui/react'
import { ChevronLeft } from 'lucide-react'
import { useEffect } from 'react'

import { HOVER_NAV_CUE_PROPS, TOGGLE_CUE_PROPS } from '@/components/Sound'

import { PALETTE_CHROME } from './chrome'

type CommandPaletteSecretsProps = {
  activeId?: string
  backButtonRef: RefObject<HTMLButtonElement | null>
  foundEggs: readonly CommandPaletteEggItem[]
  onBack: () => void
  onToggle: (id: string) => void
  progressLabel: string
}

export function CommandPaletteSecrets({
  activeId,
  backButtonRef,
  foundEggs,
  onBack,
  onToggle,
  progressLabel,
}: CommandPaletteSecretsProps) {
  useEffect(() => {
    backButtonRef.current?.focus()
  }, [backButtonRef])

  return (
    <>
      <div className={`flex items-center border-b px-4 ${PALETTE_CHROME.border}`}>
        <button
          ref={backButtonRef}
          aria-label="Back to navigation"
          className={`-ml-2 rounded-lg p-2 transition-colors ${PALETTE_CHROME.focusRing} ${PALETTE_CHROME.ink} ${PALETTE_CHROME.hoverFill}`}
          type="button"
          onClick={onBack}
          {...HOVER_NAV_CUE_PROPS}
        >
          <ChevronLeft
            aria-hidden="true"
            className="h-5 w-5"
          />
        </button>
        <DialogTitle className={`flex-1 px-2 py-3 text-base ${PALETTE_CHROME.ink}`}>
          Secrets
        </DialogTitle>
        <kbd className={`${PALETTE_CHROME.kbd} ${PALETTE_CHROME.border} ${PALETTE_CHROME.muted}`}>
          ESC
        </kbd>
      </div>

      <div
        className={PALETTE_CHROME.list}
        data-testid="command-palette-secrets"
      >
        <p className={`-mx-2 px-2 py-1.5 text-base ${PALETTE_CHROME.muted}`}>{progressLabel}</p>
        {foundEggs.map((egg) => {
          const isActive = egg.id === activeId

          return (
            <button
              key={egg.id}
              aria-pressed={isActive}
              className={`-mx-2 block w-full rounded-lg px-2 py-1.5 text-left text-base transition-colors ${PALETTE_CHROME.ink} ${
                isActive ? PALETTE_CHROME.activeFill : PALETTE_CHROME.hoverFill
              }`}
              type="button"
              onClick={() => onToggle(egg.id)}
              {...TOGGLE_CUE_PROPS}
            >
              {egg.name}
            </button>
          )
        })}
      </div>
    </>
  )
}

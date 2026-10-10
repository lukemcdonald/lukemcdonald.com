import { PALETTE_CHROME } from './chrome'
import { SECRETS_SHORTCUT_LABEL } from './utils'

type CommandPaletteSecretsFooterProps = {
  label: string
  onOpen: () => void
}

export function CommandPaletteSecretsFooter({ label, onOpen }: CommandPaletteSecretsFooterProps) {
  return (
    <div className={`border-t px-4 py-3 ${PALETTE_CHROME.border}`}>
      <button
        className={`-mx-1 flex items-center gap-2 rounded-lg px-1 py-0.5 text-xs transition-colors ${PALETTE_CHROME.focusRing} ${PALETTE_CHROME.hoverFill} ${PALETTE_CHROME.muted}`}
        data-testid="command-palette-secrets-footer"
        type="button"
        onClick={onOpen}
      >
        <span>{label}</span>
        <kbd className={`${PALETTE_CHROME.kbd} ${PALETTE_CHROME.border} ${PALETTE_CHROME.muted}`}>
          {SECRETS_SHORTCUT_LABEL}
        </kbd>
      </button>
    </div>
  )
}

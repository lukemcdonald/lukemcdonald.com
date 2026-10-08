import { HOVER_NAV_CUE_PROPS } from '@/components/Sound'

type CommandPaletteTriggerProps = {
  onOpen: () => void
}

export function CommandPaletteTrigger({ onOpen }: CommandPaletteTriggerProps) {
  return (
    <button
      aria-label="Open command palette"
      className="hidden rounded-md bg-black/0 px-2.5 py-2 text-base font-semibold tracking-wide text-primary-900 uppercase focus-ring hover:bg-black/5 sm:px-3 [@media(hover:hover)_and_(pointer:fine)]:inline-flex"
      data-testid="command-palette-trigger"
      onClick={onOpen}
      type="button"
      {...HOVER_NAV_CUE_PROPS}
    >
      ⌘K
    </button>
  )
}

type CommandPaletteTriggerProps = {
  onOpen: () => void
}

export function CommandPaletteTrigger({ onOpen }: CommandPaletteTriggerProps) {
  return (
    <button
      aria-label="Open command palette"
      className="hidden rounded-md bg-black/0 px-2.5 py-2 text-base font-semibold tracking-wide text-primary-900 uppercase hover:bg-black/5 focus:outline-hidden sm:px-3 [@media(hover:hover)_and_(pointer:fine)]:inline-flex"
      type="button"
      onClick={onOpen}
    >
      ⌘K
    </button>
  )
}

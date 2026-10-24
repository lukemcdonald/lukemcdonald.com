export const PALETTE_CHROME = {
  activeFill: 'bg-primary-900/8 dark:bg-white/10',
  border: 'border-black/10 dark:border-white/15',
  dialog:
    'fixed inset-0 z-50 m-0 h-dvh max-h-dvh w-full max-w-none items-center justify-center border-0 bg-transparent p-4 backdrop:bg-transparent open:flex focus:outline-hidden sm:p-6',
  focusFill: 'focus:bg-primary-900/8 dark:focus:bg-white/10',
  focusRing: 'focus-ring',
  header: 'flex items-center border-b px-4',
  hoverFill: 'hover:bg-primary-900/8 dark:hover:bg-white/10',
  ink: 'text-primary-900 dark:text-white',
  kbd: 'rounded border px-1.5 py-0.5 text-[10px] leading-none',
  kbdDesktop: 'hidden sm:inline-block',
  list: 'overflow-y-auto',
  muted: 'text-black/50 dark:text-white/50',
  option:
    'group flex h-8 w-full cursor-pointer items-center gap-2 rounded-lg px-3 text-sm select-none',
  panel: 'glass relative w-full max-w-2xl overflow-hidden rounded-xl glass-dialog',
  placeholder: 'placeholder:text-black/50 dark:placeholder:text-white/50',
  swatchRing: 'ring-2 ring-black/25 dark:ring-white/40',
} as const

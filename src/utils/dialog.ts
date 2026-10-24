export function bindDialogBackdropClose(
  dialog: HTMLDialogElement,
  onBackdrop: () => void,
  signal?: AbortSignal,
) {
  let pointerStartedOnDialog = false
  const options = signal ? { signal } : undefined

  dialog.addEventListener(
    'pointerdown',
    (event) => {
      pointerStartedOnDialog = event.target === dialog
    },
    options,
  )
  dialog.addEventListener(
    'click',
    (event) => {
      if (pointerStartedOnDialog && event.target === dialog) {
        onBackdrop()
      }
    },
    options,
  )
}

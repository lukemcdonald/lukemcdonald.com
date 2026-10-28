export function isIgnoredEggKey(event: KeyboardEvent) {
  if (hasBlockingFlags(event) || hasOpenDialog()) {
    return true
  }

  return isTypingTarget(event.target)
}

function hasBlockingFlags(event: KeyboardEvent) {
  return [
    event.altKey,
    event.ctrlKey,
    event.defaultPrevented,
    event.isComposing,
    event.metaKey,
    event.repeat,
  ].some(Boolean)
}

function hasOpenDialog() {
  return Boolean(document.querySelector('dialog[open], [role="dialog"]:not(dialog)'))
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) {
    return false
  }

  if (target.closest('dialog, [role="dialog"]')) {
    return true
  }

  if (target.closest('[contenteditable]:not([contenteditable="false"])')) {
    return true
  }

  return Boolean(target.closest('input, select, textarea'))
}

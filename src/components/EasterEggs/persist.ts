import type { StorageLike } from './types'

import { EASTER_EGG_ATTRIBUTE, EASTER_EGG_STORAGE_ON, EASTER_EGG_STORAGE_PREFIX } from './constants'

export function clearStoredEasterEggs(storage: StorageLike): void {
  const keys: string[] = []

  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index)

    if (key?.startsWith(EASTER_EGG_STORAGE_PREFIX)) {
      keys.push(key)
    }
  }

  for (const key of keys) {
    storage.removeItem(key)
  }
}

export function eggStorageKey(id: string): string {
  return `${EASTER_EGG_STORAGE_PREFIX}${id}`
}

export function getEasterEggInitScript(): string {
  return `
(function() {
  try {
    const prefix = '${EASTER_EGG_STORAGE_PREFIX}';
    const on = '${EASTER_EGG_STORAGE_ON}';
    const html = document.documentElement;

    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);

      if (!key || key.indexOf(prefix) !== 0) {
        continue;
      }

      if (localStorage.getItem(key) !== on) {
        continue;
      }

      html.setAttribute('${EASTER_EGG_ATTRIBUTE}', key.slice(prefix.length));
      break;
    }
  } catch (e) {}
})();
`.trim()
}

export function getStoredEasterEggId(storage: StorageLike): string | undefined {
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index)

    if (!key?.startsWith(EASTER_EGG_STORAGE_PREFIX)) {
      continue
    }

    if (storage.getItem(key) !== EASTER_EGG_STORAGE_ON) {
      continue
    }

    return key.slice(EASTER_EGG_STORAGE_PREFIX.length)
  }

  return undefined
}

export function persistEasterEggId(storage: StorageLike, id: string): void {
  clearStoredEasterEggs(storage)
  storage.setItem(eggStorageKey(id), EASTER_EGG_STORAGE_ON)
}

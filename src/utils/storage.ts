export const STORAGE_KEYS = {
  easterEggCycle: 'easter-eggs:cycle',
  easterEggFound: 'easter-eggs:found',
  easterEggPrefix: 'easter-egg:',
  font: 'font-pairing',
  glass: 'glass-level',
  sound: 'sound-enabled',
  themeColor: 'theme-color',
  themeMode: 'theme-mode',
} as const

/** Returns null when storage is missing or blocked. */
export function getStorageItem(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export function getStorageKeys(): string[] {
  try {
    const keys: string[] = []

    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index)

      if (key) {
        keys.push(key)
      }
    }

    return keys
  } catch {
    return []
  }
}

/** No-ops when storage is missing or blocked. */
export function removeStorageItem(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    return
  }
}

/** No-ops when storage is missing or blocked. */
export function setStorageItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    return
  }
}

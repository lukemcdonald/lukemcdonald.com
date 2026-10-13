import { PALETTE_CHROME } from '@/components/CommandPalette/chrome'
import { getSoundPreference, toggleSoundPreference } from '@/components/Sound/utils'
import { toggleClasses } from '@/utils/toggle-classes'

import { afterSettingChange, type SettingChange } from '../picker'

export function getSoundToggleCopy(isOn: boolean) {
  return {
    label: isOn ? 'Sounds on' : 'Sounds off',
    pressed: isOn ? 'true' : 'false',
    toggle: isOn ? 'Disable interaction sounds' : 'Enable interaction sounds',
  }
}

export function syncSound(root: Element, highlighted = false) {
  const soundToggle = root.querySelector<HTMLButtonElement>('[data-sound-toggle]')

  if (!soundToggle) {
    return
  }

  const preference = getSoundPreference()
  const copy = getSoundToggleCopy(preference === 'on')

  soundToggle.setAttribute('aria-label', copy.toggle)
  soundToggle.setAttribute('aria-pressed', copy.pressed)
  soundToggle.title = copy.label
  soundToggle.querySelector('[data-sound-label]')?.replaceChildren(copy.label)
  soundToggle.querySelectorAll<HTMLElement>('[data-sound-icon]').forEach((icon) => {
    icon.classList.toggle('hidden', icon.dataset.soundIcon !== preference)
  })
  toggleClasses(soundToggle, PALETTE_CHROME.activeFill, highlighted)
}

export function bindSound(root: Element, { onChange, signal }: SettingChange) {
  root.querySelector<HTMLButtonElement>('[data-sound-toggle]')?.addEventListener(
    'click',
    () => {
      toggleSoundPreference()
      afterSettingChange(onChange, () => syncSound(root))
    },
    { signal },
  )
}

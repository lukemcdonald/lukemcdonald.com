import type { ReactNode } from 'react'

import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'
import { Check } from 'lucide-react'

import { PALETTE_CHROME } from '@/components/CommandPalette/chrome'
import { TOGGLE_CUE_PROPS } from '@/components/Sound'

type PreferencePickerProps<Value extends string> = {
  highlightedValue?: Value
  icon: ReactNode
  label: string
  onChange: (value: Value) => void
  options: readonly { icon: ReactNode; label: string; value: Value }[]
  value: Value
}

export function PreferencePicker<Value extends string>({
  highlightedValue,
  icon,
  label,
  onChange,
  options,
  value,
}: PreferencePickerProps<Value>) {
  return (
    <Listbox
      value={value}
      onChange={onChange}
    >
      <ListboxButton
        aria-label={label}
        className={`flex h-11 w-11 items-center justify-center rounded-lg transition-colors ${PALETTE_CHROME.focusRing} ${PALETTE_CHROME.ink} ${PALETTE_CHROME.hoverFill} ${highlightedValue ? PALETTE_CHROME.activeFill : ''}`}
        title={label}
        {...TOGGLE_CUE_PROPS}
      >
        {icon}
      </ListboxButton>
      <ListboxOptions
        anchor="top end"
        aria-label={label}
        className={`z-60 w-40 rounded-xl border bg-white p-1 shadow-lg outline-none [--anchor-gap:8px] [--anchor-padding:16px] dark:bg-primary-900 ${PALETTE_CHROME.border} ${PALETTE_CHROME.ink}`}
        modal={false}
      >
        {options.map((option) => (
          <ListboxOption
            key={option.value}
            className="group flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm select-none data-focus:bg-primary-900/8 dark:data-focus:bg-white/10"
            value={option.value}
            {...TOGGLE_CUE_PROPS}
          >
            {option.icon}
            <span className="flex-1">{option.label}</span>
            <Check
              aria-hidden="true"
              className="invisible h-4 w-4 group-data-selected:visible"
            />
          </ListboxOption>
        ))}
      </ListboxOptions>
    </Listbox>
  )
}

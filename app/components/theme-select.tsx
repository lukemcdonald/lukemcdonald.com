import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from '@headlessui/react'
import { SwatchIcon } from '@heroicons/react/24/outline'
import { Fragment, useState } from 'react'

import type { ThemeColor } from '~/hooks/use-theme'
import { getThemeColor, THEMES, useTheme } from '~/hooks/use-theme'

export function ThemeSelect() {
  const [open, setOpen] = useState(false)
  const { data, setTheme } = useTheme()

  function handleButtonToggle() {
    setOpen(!open)
  }

  function handleThemeChange(value: ThemeColor) {
    setTheme(value)
  }

  return (
    <Listbox value={data.theme} onChange={handleThemeChange}>
      <div className="theme-select relative" data-theme={data.theme.label.toLocaleLowerCase()}>
        <ListboxButton
          className="py-2 px-2 transition focus:outline-none"
          onClick={handleButtonToggle}
        >
          <SwatchIcon className="h-6 w-6 text-primary-400" style={{ color: getThemeColor(data) }} />
        </ListboxButton>

        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <ListboxOptions className="no-scrollbar absolute max-h-60 w-full overflow-auto outline-none">
            {THEMES.filter((option) => option.label !== data.theme.label).map((option) => (
              <ListboxOption
                className="relative select-none transition hover:scale-125"
                key={option.label.toLowerCase()}
                value={option}
              >
                {({ focus, selected }) => (
                  <button className="block w-full py-1 px-2" onClick={handleButtonToggle}>
                    <span
                      className="inline-block h-4 w-4 rounded-full"
                      style={{ background: getThemeColor({ ...data, theme: option }) }}
                    />
                    <span className="sr-only text-primary-400">{option.label}</span>
                  </button>
                )}
              </ListboxOption>
            ))}
          </ListboxOptions>
        </Transition>
      </div>
    </Listbox>
  )
}

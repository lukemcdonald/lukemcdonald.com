import { Fragment, useState } from 'react'

import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from '@headlessui/react'
import { SwatchIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'

import { getThemeColor, THEMES, useTheme } from '#app/hooks/use-theme'

import type { ThemeColor } from '#app/hooks/use-theme'

export function ThemeSelect() {
  const [open, setOpen] = useState(false)
  const { data, setTheme } = useTheme()
  const { mode, theme } = data || {}

  function handleButtonToggle() {
    setOpen(!open)
  }

  function handleThemeChange(value: ThemeColor) {
    setTheme(value)
  }

  return (
    <Listbox
      onChange={handleThemeChange}
      value={theme}
    >
      <div
        className="theme-select relative"
        data-theme={theme.label.toLocaleLowerCase()}
      >
        <ListboxButton
          className="px-2 py-2 transition focus:outline-none"
          onClick={handleButtonToggle}
        >
          <SwatchIcon
            className={clsx(
              'h-6 w-6',
              data.mode.value === 'light' ? 'text-primary-700' : 'lg:text-primary-400',
            )}
          />
          <span className="sr-only capitalize text-primary-400">{mode.label}</span>
        </ListboxButton>

        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <ListboxOptions
            as="ul"
            className="no-scrollbar absolute max-h-60 w-full overflow-auto outline-none"
          >
            {THEMES.filter((option) => option.label !== theme.label).map((option) => (
              <ListboxOption
                as="li"
                className="relative select-none transition hover:scale-125"
                key={option.label.toLowerCase()}
                value={option}
              >
                {() => (
                  <button
                    className="block w-full px-2 py-1"
                    onClick={handleButtonToggle}
                  >
                    <span
                      className="inline-block h-4 w-4 rounded-full"
                      style={{ background: getThemeColor({ mode, theme: option }) }}
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

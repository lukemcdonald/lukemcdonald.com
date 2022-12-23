import { Fragment, useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import clsx from 'clsx'
import { SwatchIcon } from '@heroicons/react/24/outline'
import { getThemeColor, THEMES, useTheme } from '~/hooks/use-theme'
import type { ThemeOption } from '~/types'

export function ThemeSelect() {
  const [open, setOpen] = useState(false)
  const { data, setTheme } = useTheme()

  function handleButtonToggle() {
    setOpen(!open)
  }

  function handleListBoxChange(value: ThemeOption) {
    setTheme(value)
  }

  return (
    <Listbox value={data.theme} onChange={handleListBoxChange}>
      <div className="theme-select relative">
        <Listbox.Button
          className={clsx('py-2 px-2 transition hover:scale-125', open ? 'scale-125' : '')}
          onClick={handleButtonToggle}
          data-theme={data.theme.label.toLocaleLowerCase()}
        >
          <SwatchIcon
            className="h-6 w-6 text-primary-400"
            style={{
              color: getThemeColor(data),
            }}
          />
        </Listbox.Button>

        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="no-scrollbar absolute max-h-60 w-full overflow-auto outline-none">
            {THEMES.filter((option) => option.label !== data.theme.label).map((option) => (
              <Listbox.Option key={option.label.toLowerCase()} value={option} as={Fragment}>
                {({ active, selected }) => (
                  <li className="relative select-none transition hover:scale-125">
                    <button className="block w-full py-1 px-2" onClick={handleButtonToggle}>
                      <span
                        className="inline-block h-4 w-4 rounded-full"
                        style={{
                          background: getThemeColor({ ...data, theme: option }),
                        }}
                      />
                      <span className="sr-only text-primary-400">{option.label}</span>
                    </button>
                  </li>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  )
}

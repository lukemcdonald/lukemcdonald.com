import { Fragment, useEffect, useState } from 'react'

import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from '@headlessui/react'
import clsx from 'clsx'
import { Moon as MoonIcon, Sun as SunIcon, Monitor as SystemIcon } from 'lucide-react'

import { MODES, useTheme } from '#app/hooks/use-theme'

import type { ThemeMode } from '#app/hooks/use-theme'

type ModeIconProps = { className?: string }
type ModeIcon = React.ComponentType<ModeIconProps>

function getModeIcon(mode: ThemeMode) {
  switch (mode.label) {
    case 'dark':
      return { icon: MoonIcon }
    case 'light':
      return { icon: SunIcon }
    default:
      return { icon: SystemIcon }
  }
}

export function ModeSelect() {
  const { data, setMode } = useTheme()
  const [open, setOpen] = useState(false)
  const [selectedMode, setSelectedMode] = useState<ThemeMode>(data.mode)
  const [{ icon: SelectedIcon }, setSelectedIcon] = useState<Record<'icon', ModeIcon>>(
    getModeIcon(data.mode),
  )

  useEffect(() => {
    setSelectedMode(data.mode)
    setSelectedIcon(getModeIcon(data.mode))
  }, [data])

  function handleButtonToggle() {
    setOpen(!open)
  }

  function handleModeChange(value: ThemeMode) {
    setMode(value)
    setSelectedMode(value)
    setSelectedIcon(getModeIcon(value))
  }

  return (
    <Listbox
      onChange={handleModeChange}
      value={selectedMode}
    >
      <div
        className="mode-select relative"
        data-mode={selectedMode.label}
      >
        <ListboxButton
          className="px-2 py-2 transition focus:outline-none"
          onClick={handleButtonToggle}
        >
          <SelectedIcon
            className={clsx(
              'h-6 w-6',
              selectedMode.value === 'light' ? 'text-primary-700' : 'lg:text-primary-400',
            )}
          />
          <span className="sr-only capitalize text-primary-400">{selectedMode.label}</span>
        </ListboxButton>

        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <ListboxOptions
            as="ul"
            className="no-scrollbar absolute right-0 w-28 overflow-auto rounded-lg bg-primary-300 py-1 outline-none"
          >
            {MODES.map((option) => {
              return (
                <ListboxOption
                  as="li"
                  key={option.label}
                  value={option}
                >
                  {({ focus, selected }) => {
                    const { icon: OptionIcon } = getModeIcon(option)
                    return (
                      <button
                        className={clsx(
                          'flex w-full items-center gap-2 px-3 py-2',
                          focus && !selected ? 'opacity-70' : 'opacity-100',
                          selected ? 'font-bold' : 'font-normal',
                        )}
                        onClick={handleButtonToggle}
                      >
                        <OptionIcon className="h-5 w-5" />
                        <span className="text-sm capitalize">{option.label}</span>
                      </button>
                    )
                  }}
                </ListboxOption>
              )
            })}
          </ListboxOptions>
        </Transition>
      </div>
    </Listbox>
  )
}

import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react'
import clsx from 'clsx'
import { ChevronDown as ChevronDownIcon } from 'lucide-react'

import { Link } from '#app/components/link'

import type { NavMenuProps } from '#app/types'

export function NavMenu({ as = 'div', className, link }: NavMenuProps) {
  return (
    <Menu
      as={as}
      className={clsx('relative inline-block text-left', className)}
    >
      <MenuButton className="inline-flex justify-center rounded-md bg-black bg-opacity-0 px-3 py-2 text-base uppercase tracking-wide text-primary-900 hover:bg-opacity-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
        <span>{link.name}</span>
        <ChevronDownIcon
          aria-hidden="true"
          className="mt-px h-6 w-6 text-primary-900"
        />
      </MenuButton>

      {link?.links && (
        <Transition
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <MenuItems className="absolute left-0 z-10 mt-2 w-44 origin-top-left divide-y divide-primary-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="px-1 py-1">
              {link.links.map((item) => (
                <MenuItem key={item.name}>
                  {({ focus }) => (
                    <Link
                      className={clsx(
                        focus ? 'bg-primary-200' : 'text-primary-900',
                        'group flex w-full items-center rounded px-3 py-2 text-base',
                      )}
                      showExternalIcon={true}
                      to={item.to}
                    >
                      {item.name}
                    </Link>
                  )}
                </MenuItem>
              ))}
            </div>
          </MenuItems>
        </Transition>
      )}
    </Menu>
  )
}

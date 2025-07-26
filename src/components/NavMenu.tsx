import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import clsx from 'clsx'
import { ChevronDown as ChevronDownIcon } from 'lucide-react'
import NavMenuLink from './NavMenuLink'

interface LinkItem {
  name: string
  href: string
}

interface Link {
  name: string
  links?: LinkItem[]
}

interface NavMenuProps {
  link: Link
}

const NavMenu: React.FC<NavMenuProps> = ({ link }) => {
  return (
    <Menu
      as="div"
      className="relative inline-block text-left"
    >
      <MenuButton className="inline-flex justify-center rounded-md bg-black/0 px-3 py-2 text-base tracking-wide text-primary-900 uppercase hover:bg-black/5 focus:outline-hidden">
        <span className="font-semibold">{link.name}</span>
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
          <MenuItems className="absolute left-0 z-10 mt-2 w-44 origin-top-left divide-y divide-primary-100 rounded-md bg-white shadow-lg focus:outline-hidden">
            <div className="px-1 py-1">
              {link.links.map((item: LinkItem) => (
                <MenuItem
                  key={item.href}
                  as={Fragment}
                >
                  {({ focus }: { focus: boolean }) => (
                    <NavMenuLink
                      className={clsx(
                        focus ? 'bg-primary-200' : 'text-primary-900',
                        'group flex w-full items-center rounded-sm px-3 py-2 text-base',
                      )}
                      showExternalIcon={true}
                      href={item.href}
                    >
                      {item.name}
                    </NavMenuLink>
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

export default NavMenu

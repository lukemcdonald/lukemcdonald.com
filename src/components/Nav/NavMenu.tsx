import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'

import ChevronDownIcon from '@/components/Nav/icons/ChevronDown'
import ExternalLinkIcon from '@/components/Nav/icons/ExternalLink'
import { HOVER_NAV_CUE_PROPS, TOGGLE_CUE_PROPS } from '@/components/Sound'

interface LinkItem {
  href: string
  name: string
}

interface Link {
  links?: LinkItem[]
  name: string
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
      <MenuButton
        className="inline-flex justify-center rounded-md bg-black/0 px-2.5 py-2 text-base font-semibold tracking-wide text-primary-900 uppercase hover:bg-black/5 focus:outline-hidden sm:px-3"
        {...TOGGLE_CUE_PROPS}
      >
        <span>{link.name}</span>
        <ChevronDownIcon
          aria-hidden="true"
          className="mt-px h-6 w-6 text-primary-900"
        />
      </MenuButton>

      {link?.links && (
        <MenuItems
          className="absolute right-0 z-20 w-44 rounded-md bg-white px-1 py-1 shadow-lg transition duration-100 ease-out focus:outline-none data-closed:scale-95 data-closed:opacity-0 sm:right-auto sm:-left-1.5 sm:mt-1.5"
          transition
          unmount={false}
        >
          {link.links.map((item: LinkItem) => {
            const isExternal = item.href.startsWith('http')
            return (
              <MenuItem key={item.href}>
                <a
                  className="group flex w-full items-center rounded-sm px-3 py-2 text-base text-primary-900 data-active:bg-primary-200"
                  href={item.href}
                  target={isExternal ? '_blank' : undefined}
                  rel={isExternal ? 'noopener noreferrer' : undefined}
                  {...HOVER_NAV_CUE_PROPS}
                >
                  {item.name}
                  {isExternal && (
                    <ExternalLinkIcon className="float-right ml-2 h-4 w-4 opacity-40" />
                  )}
                </a>
              </MenuItem>
            )
          })}
        </MenuItems>
      )}
    </Menu>
  )
}

export default NavMenu

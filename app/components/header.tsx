import clsx from 'clsx'

import { Link } from '#app/components/link'
import { Logo } from '#app/components/logo'
import { Nav } from '#app/components/nav'
import { NavMenu } from '#app/components/nav-menu'

import type { MenuLink } from '#app/types'

const menuLinks: MenuLink[] = [
  {
    links: [{ name: 'Resume', to: '/resume' }],
    name: 'Work',
    to: '#',
  },
  { links: [{ name: 'TREAD Talks', to: 'https://gettreadtalks.com/' }], name: 'Play', to: '#' },
  {
    links: [
      { name: 'Faith', to: '/i-am-a/christian' },
      { name: 'Marriage', to: '/i-am-a/husband' },
      { name: 'Kids', to: '/i-am-a/father' },
      { name: 'Coaching', to: '/i-am-a/coach' },
    ],
    name: 'Live',
    to: '#',
  },
]

export function Header() {
  return (
    <header
      className={clsx(
        'absolute left-0 top-0 z-50 flex w-full items-center p-5 lg:w-1/2 ',
        'site-header',
      )}
    >
      <Link
        className="group peer relative z-10 inline-flex items-center whitespace-nowrap bg-white text-white no-underline hover:shadow-lg"
        to="/"
      >
        <Logo className="h-16 w-16 bg-primary-900 fill-current p-4" />

        <h1 className="absolute left-16 flex h-16 max-w-0 items-center overflow-hidden bg-white px-0 text-xl font-bold uppercase tracking-wide text-primary-900 shadow-lg transition-all duration-150 group-hover:max-w-6xl group-hover:px-4 group-hover:duration-300">
          Luke McDonald
        </h1>
      </Link>

      <Nav className="px-4 duration-200 peer-hover:opacity-0 peer-hover:delay-0 peer-hover:duration-0">
        {menuLinks.map((menuLink) => (
          <NavMenu
            key={menuLink.name}
            link={menuLink}
          />
        ))}
      </Nav>
    </header>
  )
}

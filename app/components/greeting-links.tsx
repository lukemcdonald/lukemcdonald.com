import clsx from 'clsx'

import { Link } from '#app/components/link'

const greetingLinks = [
  { name: 'Christian', to: '/i-am-a/christian' },
  { name: 'Husband', to: '/i-am-a/husband' },
  { name: 'Father', to: '/i-am-a/father' },
  { name: 'Coach', to: '/i-am-a/coach' },
]

const linkStyles =
  'relative flex items-center rounded bg-black bg-transparent bg-opacity-0 p-1.5 pr-3 leading-none transition hover:bg-opacity-5'

const linkNumberStyles =
  'before:mr-3 before:inline-flex before:h-6 before:w-7 before:-skew-y-6 before:transform before:items-center before:justify-center before:bg-primary-900 before:text-xs before:font-semibold before:leading-none before:text-primary-500'

export function GreetingLinks() {
  return (
    <nav>
      <ol className="numbered-list inline-flex flex-col">
        {greetingLinks.map((link) => (
          <li key={link.name}>
            <Link
              className={clsx(linkStyles, linkNumberStyles)}
              prefetch="viewport"
              to={link.to}
            >
              {link.name}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  )
}

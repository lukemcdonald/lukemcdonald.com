import React from 'react'

import clsx from 'clsx'

import { Link } from '#app/components/link'

const contactLinks = [
  { name: 'Email', to: 'mailto:thelukemcdonald@gmail.com' },
  { name: 'GitHub', to: 'https://github.com/lukemcdonald' },
  { name: 'LinkedIn', to: 'https://www.linkedin.com/in/thelukemcdonald/' },
]

export function ContactInfo({ title }: { title?: string }) {
  return (
    <div
      className={clsx(
        'entry__nav',
        `bg-white px-5 py-10 text-primary-900 sm:px-10 lg:py-8 xl:py-12`,
      )}
    >
      <h1 className="mb-6 text-3xl font-normal">{title || 'Connect.'}</h1>

      <nav className="flex items-center">
        {contactLinks.map((link) => (
          <React.Fragment key={link.name}>
            <Link
              className="block border-b-2 border-transparent uppercase tracking-wide text-inherit no-underline hover:border-primary-500"
              to={link.to}
            >
              {link.name}
            </Link>
            <hr className="mx-4 block w-24 border-b last:hidden" />
          </React.Fragment>
        ))}
      </nav>
    </div>
  )
}

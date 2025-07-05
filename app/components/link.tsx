import { NavLink } from 'react-router'

import { ArrowTopRightOnSquareIcon as ExternalLinkIcon } from '@heroicons/react/20/solid'
import clsx from 'clsx'

import type { NavLinkProps } from '#app/types'

function Link({ children, className, showExternalIcon, to, ...delegated }: NavLinkProps) {
  // This example assumes that any internal link will start with exactly
  // one slash, and that anything else is external.
  const internal = /^\/(?!\/)/.test(to.toString())

  if (internal) {
    return (
      <NavLink
        to={to}
        rel="canonical"
        prefetch="intent"
        className={({ isActive }) =>
          clsx({ activeClassName: isActive, inactiveClassName: !isActive }, className)
        }
        {...delegated}
      >
        {children}
      </NavLink>
    )
  }

  // Extract only the props that are valid for anchor tags
  const { caseSensitive, end, style, ...anchorProps } = delegated

  return (
    <a href={to.toString()} className={className} {...anchorProps}>
      {children}
      {showExternalIcon && <ExternalLinkIcon className="float-right ml-2 h-4 w-4 opacity-40" />}
    </a>
  )
}

export { Link }

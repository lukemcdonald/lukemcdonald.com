import { NavLink } from 'react-router'

import clsx from 'clsx'
import { ExternalLink as ExternalLinkIcon } from 'lucide-react'

import type { NavLinkProps } from '#app/types'

function Link({
  children,
  className,
  prefetch = 'intent',
  showExternalIcon,
  to,
  ...delegated
}: NavLinkProps) {
  // This example assumes that any internal link will start with exactly
  // one slash, and that anything else is external.
  const internal = /^\/(?!\/)/.test(to.toString())

  if (internal) {
    return (
      <NavLink
        className={({ isActive }) => clsx({ 'text-primary-600': isActive }, className)}
        prefetch={prefetch}
        rel="canonical"
        to={to}
        {...delegated}
      >
        {children}
      </NavLink>
    )
  }

  // Extract only the props that are valid for anchor tags
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { caseSensitive, end, style, ...anchorProps } = delegated

  return (
    <a
      className={className}
      href={to.toString()}
      {...anchorProps}
    >
      {children}
      {showExternalIcon && <ExternalLinkIcon className="float-right ml-2 h-4 w-4 opacity-40" />}
    </a>
  )
}

export { Link }

import type { AnchorHTMLAttributes } from 'react'
import ExternalLinkIcon from '@/components/icons/ExternalLink'

interface NavMenuLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: string
  showExternalIcon?: boolean
}

const NavMenuLink: React.FC<NavMenuLinkProps> = ({
  children,
  className,
  href,
  showExternalIcon,
  ...delegated
}) => {
  const isExternal = href.startsWith('http')

  return (
    <a
      href={href}
      className={className}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      {...delegated}
    >
      {children}
      {showExternalIcon && isExternal && (
        <ExternalLinkIcon className="float-right ml-2 h-4 w-4 opacity-40" />
      )}
    </a>
  )
}

export default NavMenuLink

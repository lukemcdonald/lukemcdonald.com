import { ExternalLink as ExternalLinkIcon } from 'lucide-react'
import type { AnchorHTMLAttributes } from 'react'

interface NavMenuLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: string
  showExternalIcon?: boolean
}

const NavMenuLink: React.FC<NavMenuLinkProps> = ({
  href,
  className,
  showExternalIcon,
  children,
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

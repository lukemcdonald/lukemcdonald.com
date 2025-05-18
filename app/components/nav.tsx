import React from 'react'

interface NavProps {
  children: React.ReactNode
  className?: string
}

export function Nav({ children, className }: NavProps) {
  return <nav className={className}>{children}</nav>
}

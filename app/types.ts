import type { ReactNode, ElementType } from 'react'
import type { NavLinkProps as ReactRouterNavLinkProps } from 'react-router'

export interface RequestInfo {
  requestInfo: {
    origin: string
    pathname: string
  }
}

export interface Content {
  description: string
  draft: boolean
  html: string
  image: string
  imageAlt: string
  markdown: string
  subtitle: string
  title: string
}

export interface MenuLink {
  links?: MenuLink[]
  name: string
  to: string
}

export interface ImageProps {
  alt: string
  className?: string
  sizes?: string[]
  src: string
  style?: React.CSSProperties
  widths?: number[]
}

export interface NavLinkProps extends ReactRouterNavLinkProps {
  children?: ReactNode
  className?: string
  prefetch?: 'intent' | 'render' | 'none' | 'viewport'
  showExternalIcon?: boolean
  to: string
}

export interface NavMenuProps {
  as?: ElementType
  children?: ReactNode
  className?: string
  link: MenuLink
}

export type EntryProps = Partial<Omit<Content, 'markdown' | 'draft'>>
export type EntryHeaderProps = Omit<EntryProps, 'html' | 'image'>

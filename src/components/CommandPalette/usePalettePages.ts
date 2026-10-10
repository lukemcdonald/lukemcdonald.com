import type { RefObject } from 'react'

import { useEffect, useLayoutEffect, useState } from 'react'

import { isPaletteBackKey, isSecretsShortcut, SECRETS_PAGE } from './utils'

export function usePalettePages(
  isOpen: boolean,
  searchInputRef: RefObject<HTMLInputElement | null>,
  searchQuery: string,
  setSearchQuery: (query: string) => void,
) {
  const [pages, setPages] = useState<string[]>([])
  const page = pages[pages.length - 1]

  useEffect(() => {
    if (!isOpen) {
      setPages([])
    }
  }, [isOpen])

  useLayoutEffect(() => {
    if (!isOpen) {
      return
    }

    searchInputRef.current?.focus()
  }, [isOpen, page, searchInputRef])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (isSecretsShortcut(event)) {
        event.preventDefault()
        setPages((current) => (current[current.length - 1] === SECRETS_PAGE ? [] : [SECRETS_PAGE]))
        setSearchQuery('')
        return
      }

      if (pages.length === 0 || !isPaletteBackKey(event, searchQuery)) {
        return
      }

      event.preventDefault()
      event.stopPropagation()
      setPages((current) => current.slice(0, -1))
      setSearchQuery('')
    }

    document.addEventListener('keydown', onKeyDown, true)

    return () => document.removeEventListener('keydown', onKeyDown, true)
  }, [isOpen, pages, searchQuery, setSearchQuery])

  const openSecrets = () => {
    setPages([SECRETS_PAGE])
    setSearchQuery('')
  }

  return { openSecrets, page }
}

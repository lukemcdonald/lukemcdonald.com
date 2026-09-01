import { play } from 'cuelume'
import { useEffect, useRef, useState } from 'react'

export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const isFirstRender = useRef(true)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    play(isOpen ? 'chime' : 'whisper')
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        setIsOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const close = () => {
    setIsOpen(false)
    setSearchQuery('')
  }

  const open = () => {
    setIsOpen(true)
  }

  return {
    close,
    isOpen,
    open,
    searchInputRef,
    searchQuery,
    setSearchQuery,
  }
}

import { play } from 'cuelume'
import { useEffect, useRef, useState } from 'react'

type CloseOptions = {
  silent?: boolean
}

export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const isFirstRender = useRef(true)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const skipCloseSound = useRef(false)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    if (!isOpen && skipCloseSound.current) {
      skipCloseSound.current = false
      return
    }

    play(isOpen ? 'bloom' : 'droplet')
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

  const close = (options?: CloseOptions) => {
    if (options?.silent) {
      skipCloseSound.current = true
    }

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

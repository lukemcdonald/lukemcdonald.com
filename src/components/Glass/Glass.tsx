import type { GlassLevel } from './constants'

import { Copy } from 'lucide-react'
import { useEffect, useState } from 'react'

import { PreferencePicker } from '@/components/PreferencePicker'

import { DEFAULT_GLASS_LEVEL, GLASS_LEVELS } from './constants'
import { getGlassLevel, setGlassLevel } from './utils'

const GLASS_OPTIONS = {
  clear: {
    icon: (
      <Copy
        aria-hidden="true"
        className="h-5 w-5"
      />
    ),
    label: 'Clear',
  },
  solid: {
    icon: (
      <Copy
        aria-hidden="true"
        className="h-5 w-5 [&_rect]:fill-current"
      />
    ),
    label: 'Solid',
  },
  tinted: {
    icon: (
      <Copy
        aria-hidden="true"
        className="h-5 w-5 [&_rect]:fill-current/30"
      />
    ),
    label: 'Tinted',
  },
}

export function GlassPicker({ isOpen }: { isOpen: boolean }) {
  const [level, setLevel] = useState<GlassLevel>(DEFAULT_GLASS_LEVEL)

  useEffect(() => {
    if (isOpen) {
      setLevel(getGlassLevel())
    }
  }, [isOpen])

  return (
    <PreferencePicker
      icon={GLASS_OPTIONS[level].icon}
      label={`Glass: ${GLASS_OPTIONS[level].label}`}
      options={GLASS_LEVELS.map((value) => ({ ...GLASS_OPTIONS[value], value }))}
      value={level}
      onChange={(next) => {
        setGlassLevel(next)
        setLevel(next)
      }}
    />
  )
}

import React from 'react'
import clsx from 'clsx'

import type { EntryProps } from '~/components/entry'
import { SVG } from '../svg'
import { Mountains } from '../mountains'

// import Mountains from 'images/svgs/mountains.svg'

export default function EntryHeader({
  date,
  subtitle,
  tagline,
  title,
}: Omit<EntryProps, 'html' | 'image'>) {
  return (
    <header
      className={clsx(
        'entry__header',
        'relative overflow-hidden bg-primary-500 justify-center flex flex-col px-5 pt-32 pb-10 text-primary-900 sm:px-10 xl:py-20',
      )}
      style={{
        backgroundSize: '120%',
      }}
    >
      <div className="relative z-10">
        {tagline && (
          <div className="mb-1 text-sm font-semibold tracking-wider uppercase text-primary-800">
            {tagline}
          </div>
        )}

        <h1 className="mb-6 text-5xl font-semibold">{title}</h1>
        {subtitle && (
          <div
            className="text-lg leading-normal"
            dangerouslySetInnerHTML={{ __html: subtitle }}
          />
        )}

        {date && <div className="text-lg leading-normal">{date}</div>}
      </div>

      <Mountains className="absolute bottom-0 left-0 z-0" />
    </header>
  )
}

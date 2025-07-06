import clsx from 'clsx'

import { ContactInfo } from '#app/components/contact-info'
import { EntryBody } from '#app/components/entry-body'
import { EntryHeader } from '#app/components/entry-header'

import type { EntryProps } from '#app/types'

export function Entry({ data }: { data: EntryProps }) {
  return (
    <article
      className={clsx('entry', 'min-h-screen w-full overflow-hidden bg-primary-800', 'lg:min-h-0')}
    >
      <EntryHeader
        description={data.description}
        subtitle={data.subtitle}
        title={data.title}
      />

      <ContactInfo />

      <EntryBody
        html={data.html}
        image={data.image}
        imageAlt={data.imageAlt || data.title}
      />
    </article>
  )
}

import { ContactInfo } from '#app/components/contact-info'
import { EntryBody } from '#app/components/entry-body'
import { EntryHeader } from '#app/components/entry-header'
import clsx from 'clsx'

import type { EntryProps } from '#app/types'

export function Entry({ data }: { data: EntryProps }) {
  return (
    <article
      className={clsx('entry', 'min-h-screen w-full overflow-hidden bg-primary-800', 'lg:min-h-0')}
    >
      <EntryHeader title={data.title} subtitle={data.subtitle} description={data.description} />

      <ContactInfo />

      <EntryBody html={data.html} image={data.image} imageAlt={data.imageAlt || data.title} />
    </article>
  )
}

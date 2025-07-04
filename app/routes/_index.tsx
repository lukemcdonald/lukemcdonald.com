import { useLoaderData } from 'react-router'

import { Entry } from '#app/components/entry'
import { getContent } from '#app/modules/content'
import { enhanceMeta } from '#app/utils/meta'
import { pageNotFound } from '#app/utils/misc'

import type { LoaderFunction, MetaFunction } from 'react-router'

import type { Content, RequestInfo } from '#app/types'

interface LoaderData {
  page: Content
}

export const meta: MetaFunction<typeof loader> = ({ matches }) => {
  const parentsData = matches.flatMap((match: Record<string, any>) => match.data)
  const parentRequest = parentsData.find((data) => data.requestInfo) satisfies RequestInfo

  const meta = [
    {
      content: `I'm Luke, a christian, husband, father and wrestling coach living in beautiful Eastern Iowa. My tent making is as a full-stack developer with an eye for design.`,
      name: 'description',
    },
    {
      content: ['christian', 'coach', 'web', 'engineer', 'developer', 'react'].join(', '),
      name: 'keywords',
    },
  ]

  return enhanceMeta(meta, {
    origin: parentRequest.requestInfo?.origin,
    pathname: parentRequest.requestInfo?.pathname,
  })
}

export const loader: LoaderFunction = async ({ params }) => {
  const page = await getContent({ slug: 'index' })

  if (!page || page.draft) {
    throw pageNotFound('index')
  }

  return { page }
}

export default function Index() {
  const { page } = useLoaderData<LoaderData>()

  return <Entry data={page} />
}

import type { LoaderFunction, MetaFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import invariant from 'tiny-invariant'

import { Entry } from '~/components/entry'
import { getContent, contentExists } from '~/modules/content'
import type { Content, RequestInfo } from '~/types'
import { enhanceMeta } from '~/utils/meta'
import { pageNotFound } from '~/utils/misc'

interface LoaderData {
  page: Content
}

export const meta: MetaFunction<typeof loader> = ({ data, matches }) => {
  const parentsData = matches.flatMap((match: Record<string, any>) => match.data)
  const parentRequest = parentsData.find((data) => data.requestInfo) satisfies RequestInfo

  const meta = [
    {
      title: data?.page?.title,
    },
    {
      name: 'description',
      content: data?.page?.description,
    },
  ]

  const options = {
    origin: parentRequest.requestInfo.origin,
    pathname: parentRequest.requestInfo.pathname,
  }

  return enhanceMeta(meta, options)
}

export const loader: LoaderFunction = async ({ params, request }) => {
  invariant(params.content, 'Expected params.content')
  invariant(params.slug, 'Expected params.slug')

  const currentPath = new URL(request.url).pathname

  const exists = await contentExists({
    contentDir: params.content,
    slug: params.slug,
  })

  if (!exists) {
    throw pageNotFound(currentPath)
  }

  const page = await getContent({
    contentDir: params.content,
    slug: params.slug,
  })

  if (!page || page.draft) {
    throw pageNotFound(currentPath)
  }

  return json<LoaderData>({ page })
}

export default function ContentSlug() {
  const { page } = useLoaderData<LoaderData>()
  return <Entry data={page} />
}

import { useLoaderData } from 'react-router'

import invariant from 'tiny-invariant'

import { Entry } from '#app/components/entry'
import { getContent, contentExists } from '#app/modules/content'
import { enhanceMeta } from '#app/utils/meta'
import { pageNotFound } from '#app/utils/misc'

import type { Content, RequestInfo } from '#app/types'
import type { LoaderFunction, MetaFunction } from 'react-router'

interface LoaderData {
  page: Content
}

export const meta: MetaFunction<typeof loader> = ({ data, matches }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parentsData = matches.flatMap((match: Record<string, any>) => match.data)
  const parentRequest = parentsData.find((data) => data.requestInfo) satisfies RequestInfo

  const loaderData = data as LoaderData | undefined
  const meta = [
    {
      title: loaderData?.page?.title,
    },
    {
      content: loaderData?.page?.description,
      name: 'description',
    },
  ]

  return enhanceMeta(meta, {
    pathname: parentRequest.requestInfo?.pathname,
  })
}

export const loader: LoaderFunction = async ({ params, request }): Promise<LoaderData> => {
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

  return { page }
}

export default function ContentSlug() {
  const { page } = useLoaderData<LoaderData>()
  return <Entry data={page} />
}

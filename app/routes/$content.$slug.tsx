import type { LoaderFunction, MetaFunction } from 'react-router'
import { useLoaderData } from 'react-router'
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

  const loaderData = data as LoaderData | undefined
  const meta = [
    {
      title: loaderData?.page?.title,
    },
    {
      name: 'description',
      content: loaderData?.page?.description,
    },
  ]

  const options = {
    origin: parentRequest.requestInfo.origin,
    pathname: parentRequest.requestInfo.pathname,
  }

  return enhanceMeta(meta, options)
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

import type { APIRoute } from 'astro'

import { GLOBAL_CONFIG } from '@/configs/global'
import { getPublishedPages } from '@/features/pages/pages.server'
import { renderOgPng, resolveOgPhotoPath } from '@/utils/og.render'

export const prerender = true

export async function getStaticPaths() {
  const pages = await getPublishedPages()
  const contentPaths = pages.map((page) => {
    const isHome = page.id === 'index'
    const slug = isHome ? 'index' : page.id
    const title = isHome ? GLOBAL_CONFIG.name : page.data.title

    return {
      params: { slug },
      props: {
        image: page.data.image,
        title,
      },
    }
  })

  return [
    ...contentPaths,
    {
      params: { slug: 'resume' },
      props: { title: 'Resume' },
    },
  ]
}

export const GET: APIRoute = ({ props }) => {
  const png = renderOgPng({
    photoPath: resolveOgPhotoPath(props.image),
    title: props.title,
  })

  return new Response(Uint8Array.from(png), {
    headers: {
      'Content-Type': 'image/png',
    },
  })
}

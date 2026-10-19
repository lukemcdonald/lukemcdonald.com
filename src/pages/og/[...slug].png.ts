import { GLOBAL_CONFIG } from '@/configs/global'
import { loadPublishedPages } from '@/features/pages/pages.server'
import { og } from '@/og'

export const prerender = true

export const { GET, getStaticPaths } = og.route(async () => {
  const pages = await loadPublishedPages()
  const contentPages = pages.map((page) => {
    const isHome = page.id === 'index'

    return {
      image: page.data.image,
      pathname: isHome ? '/' : `/${page.id}`,
      title: isHome ? GLOBAL_CONFIG.name : page.data.title,
    }
  })

  return [
    ...contentPages,
    {
      pathname: '/resume',
      title: 'Resume',
    },
  ]
})

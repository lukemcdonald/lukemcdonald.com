const eggStyleUrls =
  typeof import.meta.glob === 'function' ?
    import.meta.glob<string>('./eggs/*.css', {
      import: 'default',
      query: '?url',
    })
  : {}

export async function loadEggStyles(id: string) {
  const load = eggStyleUrls[`./eggs/${id}.css`]

  if (!load) {
    return
  }

  const href = await load()

  if (document.querySelector(`link[data-egg-style="${id}"]`)) {
    return
  }

  await new Promise<void>((resolve) => {
    const link = document.createElement('link')

    link.dataset.eggStyle = id
    link.href = href
    link.rel = 'stylesheet'
    link.addEventListener('error', () => resolve(), { once: true })
    link.addEventListener('load', () => resolve(), { once: true })
    document.head.append(link)
  })
}

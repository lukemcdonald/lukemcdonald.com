declare module 'virtual:astro:assets/fonts/internal' {
  export const componentDataByCssVariable: Map<
    string,
    {
      css: string
      preloads: Array<{ type: string; url: string }>
    }
  >
}

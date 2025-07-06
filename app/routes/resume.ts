import { redirect } from 'react-router'

export const loader = () => {
  return redirect(
    'https://docs.google.com/document/d/1NopjwnwOtwKVqz33w8Glly2SKxfesS3oNKHyU8DO1jM/edit?usp=sharing',
  )
}

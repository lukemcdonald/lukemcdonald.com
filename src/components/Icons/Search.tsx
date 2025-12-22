import type { SVGProps } from 'react'

function Search(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="24"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      stroke="currentColor"
      viewBox="0 0 24 24"
      width="24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle
        cx="11"
        cy="11"
        r="8"
      />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

export default Search

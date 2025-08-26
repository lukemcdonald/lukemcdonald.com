import type { SVGProps } from 'react'

function ChevronDown(props: SVGProps<SVGSVGElement>) {
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
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

export default ChevronDown

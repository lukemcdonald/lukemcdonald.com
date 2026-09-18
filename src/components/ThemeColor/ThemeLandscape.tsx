export function ThemeLandscape() {
  return (
    <svg
      aria-hidden="true"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 300 1600 600"
    >
      <path
        d="M0 300H1600V900H0Z"
        fill="var(--landscape-sky, var(--color-primary-400))"
      />
      <path
        d="M957 450 539 900H1396Z M-60 900 398 662 816 900Z"
        fill="var(--landscape-ridge, var(--color-primary-700))"
      />
      <path
        d="M957 450 872.9 900H1396Z M337 900 398 662 816 900Z"
        fill="var(--landscape-shadow, var(--color-primary-900))"
      />
      <path
        d="M1203 546 1552 900H876Z M641 695 886 900H367Z"
        fill="var(--landscape-middle, var(--color-primary-600))"
      />
      <path
        d="M1203 546 1552 900H1162Z M587 900 641 695 886 900Z"
        fill="var(--landscape-dark, var(--color-primary-800))"
      />
      <path
        d="M1710 900 1401 632 1096 900Z M1210 900 971 687 725 900Z"
        fill="var(--landscape-front, var(--color-primary-500))"
      />
      <path
        d="M1710 900 1401 632 1365 900Z M943 900H1210L971 687Z"
        fill="var(--landscape-ridge, var(--color-primary-700))"
      />
    </svg>
  )
}

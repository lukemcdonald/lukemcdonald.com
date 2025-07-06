import { Link } from '#app/components/link'

export function GreetingLinks() {
  return (
    <div className="numbered-list">
      <Link to="/i-am-a/christian">Christian</Link>
      <Link to="/i-am-a/husband">Husband</Link>
      <Link to="/i-am-a/father">Father</Link>
      <Link to="/i-am-a/coach">Coach</Link>
    </div>
  )
}

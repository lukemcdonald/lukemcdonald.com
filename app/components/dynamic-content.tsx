import { GreetingLinks } from '#app/components/greeting-links'

// Registry of available components
const COMPONENT_REGISTRY = {
  GreetingLinks,
} as const

type ComponentName = keyof typeof COMPONENT_REGISTRY

interface DynamicContentProps {
  className?: string
  content: string
}

export function DynamicContent({ className, content }: DynamicContentProps) {
  // Check if content is a component name
  const trimmedContent = content.trim()

  if (trimmedContent in COMPONENT_REGISTRY) {
    const Component = COMPONENT_REGISTRY[trimmedContent as ComponentName]
    return (
      <div className={className}>
        <Component />
      </div>
    )
  }

  // If it's not a component name, treat it as HTML
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}

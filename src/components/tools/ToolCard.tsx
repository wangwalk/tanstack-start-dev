import { Link } from '@tanstack/react-router'

const pricingBadgeClass: Record<string, string> = {
  free: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  freemium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  paid: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  open_source: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
}

const pricingLabel: Record<string, string> = {
  free: 'Free',
  freemium: 'Freemium',
  paid: 'Paid',
  open_source: 'Open Source',
}

interface ToolCardProps {
  tool: {
    id: string
    slug: string
    name: string
    description: string | null
    logoUrl: string | null
    pricingType: string
    isFeatured: boolean
  }
  categoryName?: string
}

export function ToolCard({ tool, categoryName }: ToolCardProps) {
  return (
    <Link
      to="/tools/$slug"
      params={{ slug: tool.slug }}
      className="island-shell feature-card group flex flex-col gap-3 rounded-2xl p-4 no-underline transition hover:-translate-y-0.5"
    >
      {/* Logo + Name */}
      <div className="flex items-start gap-3">
        {tool.logoUrl ? (
          <img
            src={tool.logoUrl}
            alt={`${tool.name} logo`}
            className="h-10 w-10 shrink-0 rounded-xl object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[rgba(79,184,178,0.12)] text-lg font-bold text-[var(--lagoon-deep)]">
            {tool.name[0]}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate font-semibold text-[var(--sea-ink)] group-hover:text-[var(--lagoon-deep)]">
            {tool.name}
          </p>
          {categoryName && (
            <p className="truncate text-xs text-[var(--sea-ink-soft)]">{categoryName}</p>
          )}
        </div>
      </div>

      {/* Description */}
      {tool.description && (
        <p className="line-clamp-2 flex-1 text-sm leading-relaxed text-[var(--sea-ink-soft)]">
          {tool.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center gap-2">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${pricingBadgeClass[tool.pricingType] ?? pricingBadgeClass.free}`}
        >
          {pricingLabel[tool.pricingType] ?? tool.pricingType}
        </span>
        {tool.isFeatured && (
          <span className="text-xs text-amber-500">★ Featured</span>
        )}
      </div>
    </Link>
  )
}

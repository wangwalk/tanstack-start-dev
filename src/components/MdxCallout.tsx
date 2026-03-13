import type { ReactNode } from 'react'

export function MdxCallout({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <aside className="not-prose my-6 rounded-xl border border-border bg-card p-4">
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">{title}</p>
      <div className="text-sm leading-7 text-muted-foreground">
        {children}
      </div>
    </aside>
  )
}

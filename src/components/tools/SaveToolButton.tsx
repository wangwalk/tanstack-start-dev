import { useEffect, useState } from 'react'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Button } from '#/components/ui/button'
import { Route as RootRoute } from '#/routes/__root'
import { toggleToolSave } from '#/lib/tool-saves'

const countFormatter = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 })

interface SaveToolButtonProps {
  toolId: string
  initialIsSaved: boolean
  initialSaveCount: number
  variant?: 'card' | 'detail'
}

export function SaveToolButton({
  toolId,
  initialIsSaved,
  initialSaveCount,
  variant = 'card',
}: SaveToolButtonProps) {
  const { session } = RootRoute.useRouteContext()
  const navigate = useNavigate()
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [isSaved, setIsSaved] = useState(initialIsSaved)
  const [saveCount, setSaveCount] = useState(initialSaveCount)
  const formattedCount = countFormatter.format(saveCount)

  useEffect(() => {
    setIsSaved(initialIsSaved)
    setSaveCount(initialSaveCount)
  }, [initialIsSaved, initialSaveCount])

  async function handleToggle() {
    if (!session) {
      const redirect =
        typeof window === 'undefined'
          ? '/tools'
          : `${window.location.pathname}${window.location.search}`
      void navigate({ to: '/auth/sign-in', search: { redirect } })
      return
    }

    setIsPending(true)
    try {
      const result = await toggleToolSave({ data: { toolId } })
      setIsSaved(result.isSaved)
      setSaveCount(result.saveCount)
      toast.success(result.isSaved ? 'Saved to your dashboard' : 'Removed from saved tools')
      void router.invalidate()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to update saved tools')
    } finally {
      setIsPending(false)
    }
  }

  if (variant === 'detail') {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isPending}
        onClick={() => void handleToggle()}
        className="rounded-full border-[var(--line)] bg-[var(--surface)] text-[var(--sea-ink)] hover:border-[var(--lagoon)] hover:bg-[var(--surface)]"
      >
        {isSaved ? <BookmarkCheck className="h-4 w-4 text-[var(--lagoon-deep)]" /> : <Bookmark className="h-4 w-4" />}
        <span>{isSaved ? 'Saved' : 'Save'}</span>
        <span className="text-xs text-[var(--sea-ink-soft)]">{formattedCount}</span>
      </Button>
    )
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => void handleToggle()}
      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--sea-ink-soft)] transition hover:border-[var(--lagoon)] hover:text-[var(--lagoon-deep)] disabled:pointer-events-none disabled:opacity-50"
      aria-pressed={isSaved}
      aria-label={isSaved ? 'Remove from saved tools' : 'Save tool'}
    >
      {isSaved ? <BookmarkCheck className="h-3.5 w-3.5 text-[var(--lagoon-deep)]" /> : <Bookmark className="h-3.5 w-3.5" />}
      <span aria-hidden="true">{formattedCount}</span>
    </button>
  )
}

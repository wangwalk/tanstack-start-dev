import { useState, useTransition } from 'react'
import { subscribeNewsletter } from '#/lib/newsletter'

type Status = 'idle' | 'success' | 'error'

export default function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('idle')
    setErrorMsg('')

    startTransition(async () => {
      try {
        await subscribeNewsletter({ data: { email } })
        setStatus('success')
        setEmail('')
      } catch (err) {
        setStatus('error')
        setErrorMsg(err instanceof Error ? err.message : 'Something went wrong')
      }
    })
  }

  if (status === 'success') {
    return (
      <p className="text-sm text-[var(--sea-ink)]">
        Thanks for subscribing! Check your inbox for a confirmation.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          disabled={isPending}
          className="w-full rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--sea-ink)] placeholder:text-[var(--sea-ink-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--lagoon)]/20 disabled:opacity-50 sm:w-56"
        />
        <button
          type="submit"
          disabled={isPending || !email}
          className="rounded-lg bg-[var(--sea-ink)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? 'Subscribing…' : 'Subscribe'}
        </button>
      </div>
      {status === 'error' && (
        <p className="text-xs text-red-500" role="alert">{errorMsg}</p>
      )}
    </form>
  )
}

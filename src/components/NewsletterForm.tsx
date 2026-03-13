import { useState, useTransition } from 'react'
import { subscribeNewsletter } from '#/lib/newsletter'
import { Input } from '#/components/ui/input'
import { Button } from '#/components/ui/button'

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
      <p className="text-sm text-foreground">
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
        <Input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          disabled={isPending}
          className="w-full sm:w-56"
        />
        <Button
          type="submit"
          disabled={isPending || !email}
        >
          {isPending ? 'Subscribing…' : 'Subscribe'}
        </Button>
      </div>
      {status === 'error' && (
        <p className="text-xs text-red-500" role="alert">{errorMsg}</p>
      )}
    </form>
  )
}

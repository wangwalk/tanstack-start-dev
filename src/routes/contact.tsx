import { createFileRoute } from '@tanstack/react-router'
import { useState, useTransition } from 'react'
import { getTurnstileSiteKey } from '#/lib/turnstile'
import { sendContactMessage } from '#/lib/contact'
import TurnstileWidget from '#/components/TurnstileWidget'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { SITE_TITLE, SITE_URL } from '#/lib/site'

export const Route = createFileRoute('/contact')({
  loader: async () => getTurnstileSiteKey(),
  head: () => ({
    links: [{ rel: 'canonical', href: `${SITE_URL}/contact` }],
    meta: [
      { title: `Contact | ${SITE_TITLE}` },
      { name: 'description', content: `Get in touch with the ${SITE_TITLE} team.` },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: `${SITE_URL}/contact` },
      { property: 'og:title', content: `Contact | ${SITE_TITLE}` },
      { property: 'og:description', content: `Get in touch with the ${SITE_TITLE} team.` },
    ],
  }),
  component: ContactPage,
})

function ContactPage() {
  const { siteKey } = Route.useLoaderData()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (siteKey && !turnstileToken) {
      setError('Please complete the captcha challenge.')
      return
    }

    startTransition(async () => {
      try {
        await sendContactMessage({
          data: {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            subject: subject.trim(),
            message: message.trim(),
            turnstileToken: turnstileToken ?? '',
          },
        })
        setSuccess(true)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      }
    })
  }

  if (success) {
    return (
      <main className="page-wrap px-4 py-12">
        <section className="island-shell mx-auto max-w-lg rounded-2xl p-6 sm:p-8">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--sand)]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--lagoon)"
              strokeWidth="1.5"
              className="h-8 w-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
              />
            </svg>
          </div>
          <p className="island-kicker mb-2">Message sent</p>
          <h1 className="display-title mb-3 text-3xl font-bold text-[var(--sea-ink)]">
            Thanks for reaching out!
          </h1>
          <p className="text-base leading-7 text-[var(--sea-ink-soft)]">
            We received your message and will get back to you as soon as possible. Check your inbox
            for a confirmation email.
          </p>
        </section>
      </main>
    )
  }

  return (
    <main className="page-wrap px-4 py-12">
      <section className="island-shell mx-auto max-w-lg rounded-2xl p-6 sm:p-8">
        <p className="island-kicker mb-2">Contact</p>
        <h1 className="display-title mb-3 text-3xl font-bold text-[var(--sea-ink)]">
          Get in touch
        </h1>
        <p className="mb-8 text-base leading-7 text-[var(--sea-ink-soft)]">
          Have a question or want to work together? Fill out the form and we'll get back to you
          shortly.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="mb-1.5">
              Name
            </Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              disabled={isPending}
            />
          </div>

          <div>
            <Label htmlFor="email" className="mb-1.5">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={isPending}
            />
          </div>

          <div>
            <Label htmlFor="subject" className="mb-1.5">
              Subject
            </Label>
            <Input
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="What's this about?"
              required
              disabled={isPending}
            />
          </div>

          <div>
            <Label htmlFor="message" className="mb-1.5">
              Message
            </Label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us more…"
              required
              rows={5}
              disabled={isPending}
              className="w-full resize-none rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--sea-ink)] placeholder:text-[var(--sea-ink-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--lagoon)]/20 disabled:opacity-50"
            />
          </div>

          <TurnstileWidget
            siteKey={siteKey}
            onSuccess={setTurnstileToken}
            onExpire={() => setTurnstileToken(null)}
          />

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800/40 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={isPending}
            className="btn-brand w-full"
          >
            {isPending ? (
              <span className="inline-flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Sending…
              </span>
            ) : (
              'Send Message'
            )}
          </Button>
        </form>
      </section>
    </main>
  )
}

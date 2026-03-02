import { createServerFn } from '@tanstack/react-start'
import { Resend } from 'resend'
import { sendEmail } from '#/lib/email'
import NewsletterConfirmationEmail from '#/emails/newsletter-confirmation'
import { SITE_TITLE } from '#/lib/site'

// ---------------------------------------------------------------------------
// Provider helpers
// ---------------------------------------------------------------------------

async function resendSubscribe(email: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  const audienceId = process.env.RESEND_AUDIENCE_ID
  if (!apiKey) throw new Error('RESEND_API_KEY is not set')
  if (!audienceId) throw new Error('RESEND_AUDIENCE_ID is not set')

  const resend = new Resend(apiKey)
  const { error } = await resend.contacts.create({
    audienceId,
    email,
    unsubscribed: false,
  })
  if (error) throw new Error(error.message)
}

async function resendUnsubscribe(email: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  const audienceId = process.env.RESEND_AUDIENCE_ID
  if (!apiKey) throw new Error('RESEND_API_KEY is not set')
  if (!audienceId) throw new Error('RESEND_AUDIENCE_ID is not set')

  const resend = new Resend(apiKey)
  const { data: list, error: listError } = await resend.contacts.list({ audienceId })
  if (listError) throw new Error(listError.message)

  const contact = list?.data?.find((c) => c.email === email)
  if (!contact) return // already gone — treat as success

  const { error } = await resend.contacts.update({
    audienceId,
    id: contact.id,
    unsubscribed: true,
  })
  if (error) throw new Error(error.message)
}

async function beehiivSubscribe(email: string): Promise<void> {
  const apiKey = process.env.BEEHIIV_API_KEY
  const publicationId = process.env.BEEHIIV_PUBLICATION_ID
  if (!apiKey) throw new Error('BEEHIIV_API_KEY is not set')
  if (!publicationId) throw new Error('BEEHIIV_PUBLICATION_ID is not set')

  const res = await fetch(
    `https://api.beehiiv.com/v2/publications/${publicationId}/subscriptions`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        email,
        reactivate_existing: true,
        send_welcome_email: false,
      }),
    },
  )
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Beehiiv error ${res.status}: ${text}`)
  }
}

async function beehiivUnsubscribe(email: string): Promise<void> {
  const apiKey = process.env.BEEHIIV_API_KEY
  const publicationId = process.env.BEEHIIV_PUBLICATION_ID
  if (!apiKey) throw new Error('BEEHIIV_API_KEY is not set')
  if (!publicationId) throw new Error('BEEHIIV_PUBLICATION_ID is not set')

  const searchRes = await fetch(
    `https://api.beehiiv.com/v2/publications/${publicationId}/subscriptions?email=${encodeURIComponent(email)}&limit=1`,
    { headers: { Authorization: `Bearer ${apiKey}` } },
  )
  if (!searchRes.ok) return // not found — treat as success

  const json = (await searchRes.json()) as { data?: { id: string }[] }
  const subscriptionId = json.data?.[0]?.id
  if (!subscriptionId) return

  const res = await fetch(
    `https://api.beehiiv.com/v2/publications/${publicationId}/subscriptions/${subscriptionId}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ status: 'inactive' }),
    },
  )
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Beehiiv error ${res.status}: ${text}`)
  }
}

function getProvider(): 'resend' | 'beehiiv' {
  return process.env.NEWSLETTER_PROVIDER === 'beehiiv' ? 'beehiiv' : 'resend'
}

// ---------------------------------------------------------------------------
// Core logic — callable directly from other server-side code (e.g. auth hooks)
// ---------------------------------------------------------------------------

export async function addContact(email: string): Promise<void> {
  const provider = getProvider()
  if (provider === 'beehiiv') {
    await beehiivSubscribe(email)
  } else {
    await resendSubscribe(email)
  }

  // Confirmation email — best-effort
  await sendEmail({
    to: email,
    subject: `You're subscribed to ${SITE_TITLE}!`,
    template: NewsletterConfirmationEmail,
    props: { email },
  })
}

export async function removeContact(email: string): Promise<void> {
  const provider = getProvider()
  if (provider === 'beehiiv') {
    await beehiivUnsubscribe(email)
  } else {
    await resendUnsubscribe(email)
  }
}

// ---------------------------------------------------------------------------
// Public server functions (callable from client components)
// ---------------------------------------------------------------------------

export const subscribeNewsletter = createServerFn({ method: 'POST' })
  .inputValidator((input: { email: string }) => input)
  .handler(async ({ data }) => {
    const email = data.email.trim().toLowerCase()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Invalid email address')
    }
    await addContact(email)
    return { success: true }
  })

export const unsubscribeNewsletter = createServerFn({ method: 'POST' })
  .inputValidator((input: { email: string }) => input)
  .handler(async ({ data }) => {
    const email = data.email.trim().toLowerCase()
    if (!email) throw new Error('Email is required')
    await removeContact(email)
    return { success: true }
  })

import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { sendEmail } from '#/lib/email'
import { validateTurnstileToken } from '#/lib/turnstile'
import ContactInquiryEmail from '#/emails/contact-inquiry'
import ContactConfirmationEmail from '#/emails/contact-confirmation'
import { SITE_TITLE } from '#/lib/site'

// ---------------------------------------------------------------------------
// Rate limiting — 3 submissions per IP per hour (per Worker isolate)
// ---------------------------------------------------------------------------

interface RateLimitEntry {
  count: number
  resetAt: number
}

const rateLimitMap = new Map<string, RateLimitEntry>()
const RATE_LIMIT_MAX = 3
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour

function getClientIp(headers: Headers): string {
  return (
    headers.get('cf-connecting-ip') ??
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown'
  )
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now >= entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return { allowed: true, retryAfterMs: 0 }
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return { allowed: false, retryAfterMs: entry.resetAt - now }
  }

  entry.count++
  return { allowed: true, retryAfterMs: 0 }
}

// ---------------------------------------------------------------------------
// Server function
// ---------------------------------------------------------------------------

export type ContactInput = {
  name: string
  email: string
  subject: string
  message: string
  turnstileToken: string
}

export const sendContactMessage = createServerFn({ method: 'POST' })
  .inputValidator((input: ContactInput) => input)
  .handler(async ({ data }) => {
    const headers = getRequestHeaders()
    const ip = getClientIp(headers)

    // Rate limit check
    const { allowed, retryAfterMs } = checkRateLimit(ip)
    if (!allowed) {
      const minutes = Math.ceil(retryAfterMs / 60_000)
      throw new Error(`Too many requests. Please try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`)
    }

    // Turnstile validation
    const { success: captchaOk } = await validateTurnstileToken({
      data: { token: data.turnstileToken },
    })
    if (!captchaOk) {
      throw new Error('Captcha verification failed. Please try again.')
    }

    const contactEmail = process.env.CONTACT_EMAIL
    if (!contactEmail) {
      throw new Error('Contact email is not configured.')
    }

    const { name, email, subject, message } = data

    // Send notification to site owner
    await sendEmail({
      to: contactEmail,
      subject: `[${SITE_TITLE}] New inquiry: ${subject}`,
      template: ContactInquiryEmail,
      props: { name, email, subject, message },
      replyTo: email,
    })

    // Send confirmation to the sender (best-effort)
    await sendEmail({
      to: email,
      subject: `We received your message — ${SITE_TITLE}`,
      template: ContactConfirmationEmail,
      props: { name, subject },
    })

    return { success: true }
  })

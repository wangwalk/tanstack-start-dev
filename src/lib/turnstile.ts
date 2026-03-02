import { createServerFn } from '@tanstack/react-start'

export const getTurnstileSiteKey = createServerFn({ method: 'GET' }).handler(() => {
  return { siteKey: process.env.TURNSTILE_SITE_KEY ?? null }
})

export const validateTurnstileToken = createServerFn({ method: 'POST' })
  .inputValidator((input: { token: string }) => input)
  .handler(async ({ data }) => {
    const secretKey = process.env.TURNSTILE_SECRET_KEY
    // If no secret key configured, captcha is disabled (local dev)
    if (!secretKey) return { success: true }

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: secretKey, response: data.token }),
    })
    const result = (await response.json()) as { success: boolean }
    return { success: result.success }
  })

import { Resend } from 'resend'
import { render } from '@react-email/render'
import type { ComponentType } from 'react'
import { createElement } from 'react'

type SendEmailOptions<TProps extends Record<string, unknown>> = {
  to: string | string[]
  subject: string
  template: ComponentType<TProps>
  props: TProps
  from?: string
  replyTo?: string
}

type SendEmailResult =
  | { success: true; id: string }
  | { success: false; error: string }

const DEFAULT_FROM = 'TanStack Start <noreply@yourdomain.com>'

function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not set')
  }
  return new Resend(apiKey)
}

export async function sendEmail<TProps extends Record<string, unknown>>(
  options: SendEmailOptions<TProps>,
): Promise<SendEmailResult> {
  const { to, subject, template, props, from, replyTo } = options

  const fromAddress = from ?? process.env.RESEND_FROM ?? DEFAULT_FROM

  const html = await render(createElement(template, props))

  const resend = getResendClient()

  const { data, error } = await resend.emails.send({
    from: fromAddress,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
    replyTo,
  })

  if (error || !data) {
    return { success: false, error: error?.message ?? 'Unknown error' }
  }

  return { success: true, id: data.id }
}

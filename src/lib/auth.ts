import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { sendEmail } from '#/lib/email'
import VerificationEmail from '#/emails/verification'
import PasswordResetEmail from '#/emails/password-reset'
import { SITE_TITLE } from '#/lib/site'

import { db } from '#/db/index'
import * as schema from '#/db/schema'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      const result = await sendEmail({
        to: user.email,
        subject: `Verify your email for ${SITE_TITLE}`,
        template: VerificationEmail,
        props: {
          userName: user.name || 'there',
          verificationUrl: url,
        },
      })
      if (!result.success) {
        throw new Error(`Failed to send verification email: ${result.error}`)
      }
    },
  },
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      const result = await sendEmail({
        to: user.email,
        subject: `Reset your ${SITE_TITLE} password`,
        template: PasswordResetEmail,
        props: {
          userName: user.name || 'there',
          resetUrl: url,
        },
      })
      if (!result.success) {
        throw new Error(`Failed to send reset email: ${result.error}`)
      }
    },
  },
  plugins: [tanstackStartCookies()],
})

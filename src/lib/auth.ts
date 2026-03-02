import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { admin } from 'better-auth/plugins/admin'
import { sendEmail } from '#/lib/email'
import VerificationEmail from '#/emails/verification'
import PasswordResetEmail from '#/emails/password-reset'
import { SITE_TITLE, NEWSLETTER_AUTO_SUBSCRIBE } from '#/lib/site'

import { db } from '#/db/index'
import * as schema from '#/db/schema'

export const auth = betterAuth({
  session: {
    // Cache session in a short-lived signed cookie to avoid a DB lookup on
    // every SSR render. Keep maxAge short so that admin actions (ban, role
    // change) propagate quickly — users may remain unaffected for up to this
    // many seconds after a change is made.
    cookieCache: {
      enabled: true,
      maxAge: 60,
    },
  },
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
    autoSignInAfterVerification: true,
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
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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
  plugins: [admin(), tanstackStartCookies()],
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // Register gift credits — best-effort
          const { addRegisterGiftCredits } = await import('#/lib/credits')
          try {
            await addRegisterGiftCredits(user.id)
          } catch {
            // Best-effort — never block account creation
          }

          if (!NEWSLETTER_AUTO_SUBSCRIBE) return
          // Import lazily to avoid a circular dependency at module load time
          const { addContact } = await import('#/lib/newsletter')
          try {
            await addContact(user.email)
          } catch {
            // Auto-subscribe is best-effort — never block account creation
          }
        },
      },
    },
  },
})

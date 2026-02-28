import { betterAuth } from 'better-auth'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { sendEmail } from '#/lib/email'
import VerificationEmail from '#/emails/verification'
import PasswordResetEmail from '#/emails/password-reset'
import { SITE_TITLE } from '#/lib/site'

export const auth = betterAuth({
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: `Verify your email for ${SITE_TITLE}`,
        template: VerificationEmail,
        props: {
          userName: user.name || 'there',
          verificationUrl: url,
        },
      })
    },
  },
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: `Reset your ${SITE_TITLE} password`,
        template: PasswordResetEmail,
        props: {
          userName: user.name || 'there',
          resetUrl: url,
        },
      })
    },
  },
  plugins: [tanstackStartCookies()],
})

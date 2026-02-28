import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
  Link,
} from '@react-email/components'
import { SITE_TITLE, SITE_URL } from '#/lib/site'
import * as styles from './_styles'

export type PasswordResetEmailProps = {
  userName: string
  resetUrl: string
  expiresInMinutes?: number
}

export default function PasswordResetEmail({
  userName,
  resetUrl,
  expiresInMinutes = 60,
}: PasswordResetEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Reset your {SITE_TITLE} password</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Text style={styles.heading}>Reset your password</Text>
          <Text style={styles.paragraph}>Hi {userName},</Text>
          <Text style={styles.paragraph}>
            We received a request to reset your password. Click the button below
            to choose a new one. This link will expire in {expiresInMinutes}{' '}
            minutes.
          </Text>
          <Section style={styles.buttonContainer}>
            <Button href={resetUrl} style={styles.button}>
              Reset Password
            </Button>
          </Section>
          <Text style={styles.paragraph}>
            If you didn't request a password reset, you can safely ignore this
            email. Your password will remain unchanged.
          </Text>
          <Hr style={styles.hr} />
          <Text style={styles.footer}>
            <Link href={SITE_URL}>{SITE_TITLE}</Link>
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

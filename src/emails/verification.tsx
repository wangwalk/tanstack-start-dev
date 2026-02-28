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

export type VerificationEmailProps = {
  userName: string
  verificationUrl: string
  expiresInHours?: number
}

export default function VerificationEmail({
  userName,
  verificationUrl,
  expiresInHours = 24,
}: VerificationEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Verify your email for {SITE_TITLE}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Text style={styles.heading}>Verify your email</Text>
          <Text style={styles.paragraph}>Hi {userName},</Text>
          <Text style={styles.paragraph}>
            Please click the button below to verify your email address. This
            link will expire in {expiresInHours} hours.
          </Text>
          <Section style={styles.buttonContainer}>
            <Button href={verificationUrl} style={styles.button}>
              Verify Email
            </Button>
          </Section>
          <Text style={styles.paragraph}>
            If you didn't create an account on {SITE_TITLE}, you can safely
            ignore this email.
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

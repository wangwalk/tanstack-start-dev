import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Text,
  Hr,
  Link,
} from '@react-email/components'
import { SITE_TITLE, SITE_URL } from '#/lib/site'
import * as styles from './_styles'

export type NewsletterConfirmationEmailProps = {
  email: string
}

export default function NewsletterConfirmationEmail({
  email,
}: NewsletterConfirmationEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>You're subscribed to {SITE_TITLE} updates!</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Text style={styles.heading}>You're subscribed!</Text>
          <Text style={styles.paragraph}>
            Thanks for subscribing to {SITE_TITLE} updates. We'll send you the
            latest news, product updates, and tips directly to{' '}
            <strong>{email}</strong>.
          </Text>
          <Text style={styles.paragraph}>
            You can unsubscribe at any time by replying to any of our emails or
            visiting your account settings.
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

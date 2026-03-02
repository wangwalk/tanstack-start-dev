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

export type ContactConfirmationEmailProps = {
  name: string
  subject: string
}

export default function ContactConfirmationEmail({
  name,
  subject,
}: ContactConfirmationEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>We received your message — {SITE_TITLE}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Text style={styles.heading}>Thanks for reaching out, {name}!</Text>
          <Text style={styles.paragraph}>
            We received your message about &ldquo;{subject}&rdquo; and will get back to you as soon
            as possible.
          </Text>
          <Text style={styles.paragraph}>
            In the meantime, feel free to explore {SITE_TITLE} and let us know if anything else
            comes up.
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

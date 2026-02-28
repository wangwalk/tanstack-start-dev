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

export type PaymentFailedEmailProps = {
  userName: string
}

export default function PaymentFailedEmail({
  userName,
}: PaymentFailedEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Payment failed — please update your billing info</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Text style={styles.heading}>Payment failed</Text>
          <Text style={styles.paragraph}>Hi {userName},</Text>
          <Text style={styles.paragraph}>
            We were unable to process your latest subscription payment for{' '}
            {SITE_TITLE}. Please update your billing information to avoid any
            interruption to your service.
          </Text>
          <Section style={styles.buttonContainer}>
            <Button href={`${SITE_URL}/dashboard`} style={styles.button}>
              Update Billing Info
            </Button>
          </Section>
          <Hr style={styles.hr} />
          <Text style={styles.footer}>
            <Link href={SITE_URL}>{SITE_TITLE}</Link>
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

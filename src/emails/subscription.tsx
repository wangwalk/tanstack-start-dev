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

export type SubscriptionEmailProps = {
  userName: string
  planName: string
  amount: string
  receiptUrl?: string
  nextBillingDate?: string
}

export default function SubscriptionEmail({
  userName,
  planName,
  amount,
  receiptUrl,
  nextBillingDate,
}: SubscriptionEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>
        Subscription confirmed — {planName} on {SITE_TITLE}
      </Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Text style={styles.heading}>Subscription confirmed!</Text>
          <Text style={styles.paragraph}>Hi {userName},</Text>
          <Text style={styles.paragraph}>
            Thank you for subscribing to the <strong>{planName}</strong> plan on{' '}
            {SITE_TITLE}. Your payment of <strong>{amount}</strong> has been
            processed successfully.
          </Text>
          {nextBillingDate && (
            <Text style={styles.paragraph}>
              Your next billing date is <strong>{nextBillingDate}</strong>.
            </Text>
          )}
          {receiptUrl && (
            <Section style={styles.buttonContainer}>
              <Button href={receiptUrl} style={styles.button}>
                View Receipt
              </Button>
            </Section>
          )}
          <Hr style={styles.hr} />
          <Text style={styles.footer}>
            <Link href={SITE_URL}>{SITE_TITLE}</Link>
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

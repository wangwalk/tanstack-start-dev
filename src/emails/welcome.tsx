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

export type WelcomeEmailProps = {
  userName: string
  loginUrl?: string
}

export default function WelcomeEmail({
  userName,
  loginUrl = `${SITE_URL}/auth/sign-in`,
}: WelcomeEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Welcome to {SITE_TITLE}!</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Text style={styles.heading}>Welcome, {userName}!</Text>
          <Text style={styles.paragraph}>
            Thanks for joining {SITE_TITLE}. Your account is ready to go.
          </Text>
          <Section style={styles.buttonContainer}>
            <Button href={loginUrl} style={styles.button}>
              Get Started
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

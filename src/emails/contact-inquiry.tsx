import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Hr,
  Link,
} from '@react-email/components'
import { SITE_TITLE, SITE_URL } from '#/lib/site'
import * as styles from './_styles'

export type ContactInquiryEmailProps = {
  name: string
  email: string
  subject: string
  message: string
}

export default function ContactInquiryEmail({
  name,
  email,
  subject,
  message,
}: ContactInquiryEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>
        New contact inquiry from {name}: {subject}
      </Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Text style={styles.heading}>New Contact Inquiry</Text>
          <Text style={styles.paragraph}>
            You have received a new message via the {SITE_TITLE} contact form.
          </Text>
          <Hr style={styles.hr} />
          <Text style={{ ...styles.paragraph, fontWeight: '600' }}>From</Text>
          <Text style={styles.paragraph}>
            {name} &lt;{email}&gt;
          </Text>
          <Text style={{ ...styles.paragraph, fontWeight: '600' }}>Subject</Text>
          <Text style={styles.paragraph}>{subject}</Text>
          <Text style={{ ...styles.paragraph, fontWeight: '600' }}>Message</Text>
          <Section style={{ padding: '0 48px 16px' }}>
            <Text
              style={{
                ...styles.paragraph,
                whiteSpace: 'pre-wrap',
                backgroundColor: '#f6f9fc',
                borderRadius: '6px',
                padding: '16px',
                borderLeft: '4px solid #e6ebf1',
              }}
            >
              {message}
            </Text>
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

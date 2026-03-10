/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface EmailChangeEmailProps {
  siteName: string
  email: string
  newEmail: string
  confirmationUrl: string
}

const logoUrl = 'https://jwozuiznphqhiyctiixm.supabase.co/storage/v1/object/public/email-assets/himsols-logo.png'

export const EmailChangeEmail = ({
  siteName,
  email,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <Html lang="hi" dir="ltr">
    <Head />
    <Preview>📧 Himsols - Email Change Confirm करें</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Img src={logoUrl} alt="Himsols Logo" width="48" height="48" style={logoImg} />
          <Text style={brandName}>HIMSOLS</Text>
        </Section>
        <Heading style={h1}>Email Change Confirm करें 📧</Heading>
        <Text style={text}>
          आपने अपना email{' '}
          <Link href={`mailto:${email}`} style={linkStyle}>{email}</Link>{' '}
          से{' '}
          <Link href={`mailto:${newEmail}`} style={linkStyle}>{newEmail}</Link>{' '}
          में change करने की request की है।
        </Text>
        <Text style={text}>
          Confirm करने के लिए नीचे दिए button पर click करें:
        </Text>
        <Button style={button} href={confirmationUrl}>
          Confirm Email Change
        </Button>
        <Text style={footerNote}>
          अगर आपने यह change request नहीं की है, तो कृपया अपना account secure करें।
        </Text>
        <Section style={divider} />
        <Text style={footerBrand}>🌳 Together, let's plant a greener future!</Text>
      </Container>
    </Body>
  </Html>
)

export default EmailChangeEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }
const container = { padding: '32px 24px', maxWidth: '560px', margin: '0 auto' }
const logoSection = { textAlign: 'center' as const, marginBottom: '24px' }
const logoImg = { display: 'inline-block', verticalAlign: 'middle' }
const brandName = { fontSize: '20px', fontWeight: 'bold' as const, color: '#2e8b57', margin: '8px 0 0', textAlign: 'center' as const }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#1a3a2a', margin: '0 0 16px' }
const text = { fontSize: '15px', color: '#5a7a6a', lineHeight: '1.7', margin: '0 0 20px' }
const linkStyle = { color: '#2e8b57', textDecoration: 'underline' }
const button = { backgroundColor: '#2e8b57', color: '#ffffff', fontSize: '16px', fontWeight: '600' as const, borderRadius: '12px', padding: '14px 40px', textDecoration: 'none', display: 'inline-block' }
const footerNote = { fontSize: '13px', color: '#5a7a6a', margin: '24px 0 0' }
const divider = { borderTop: '1px solid #e0ece5', margin: '24px 0' }
const footerBrand = { fontSize: '14px', fontWeight: '600' as const, color: '#2e8b57', textAlign: 'center' as const, margin: '0' }

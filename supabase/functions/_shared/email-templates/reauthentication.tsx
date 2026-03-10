/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

const logoUrl = 'https://jwozuiznphqhiyctiixm.supabase.co/storage/v1/object/public/email-assets/himsols-logo.png'

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="hi" dir="ltr">
    <Head />
    <Preview>🔐 Himsols - Verification Code</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Img src={logoUrl} alt="Himsols Logo" width="48" height="48" style={logoImg} />
          <Text style={brandName}>HIMSOLS</Text>
        </Section>
        <Heading style={h1}>Verification Code 🔐</Heading>
        <Text style={text}>अपनी identity confirm करने के लिए नीचे दिया गया code use करें:</Text>
        <Text style={codeStyle}>{token}</Text>
        <Text style={footerNote}>
          यह code जल्द ही expire हो जाएगा। अगर आपने यह request नहीं की, तो इस email को ignore करें।
        </Text>
        <Section style={divider} />
        <Text style={footerBrand}>🌳 Together, let's plant a greener future!</Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }
const container = { padding: '32px 24px', maxWidth: '560px', margin: '0 auto' }
const logoSection = { textAlign: 'center' as const, marginBottom: '24px' }
const logoImg = { display: 'inline-block', verticalAlign: 'middle' }
const brandName = { fontSize: '20px', fontWeight: 'bold' as const, color: '#2e8b57', margin: '8px 0 0', textAlign: 'center' as const }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#1a3a2a', margin: '0 0 16px' }
const text = { fontSize: '15px', color: '#5a7a6a', lineHeight: '1.7', margin: '0 0 20px' }
const codeStyle = { fontFamily: 'Courier, monospace', fontSize: '28px', fontWeight: 'bold' as const, color: '#2e8b57', margin: '0 0 30px', letterSpacing: '4px' }
const footerNote = { fontSize: '13px', color: '#5a7a6a', margin: '24px 0 0' }
const divider = { borderTop: '1px solid #e0ece5', margin: '24px 0' }
const footerBrand = { fontSize: '14px', fontWeight: '600' as const, color: '#2e8b57', textAlign: 'center' as const, margin: '0' }

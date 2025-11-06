import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Section,
  Img,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface UserVerificationEmailProps {
  supabase_url: string
  email_action_type: string
  redirect_to: string
  token_hash: string
  token: string
  user_email: string
}

export const UserVerificationEmail = ({
  token,
  supabase_url,
  email_action_type,
  redirect_to,
  token_hash,
  user_email,
}: UserVerificationEmailProps) => (
  <Html>
    <Head />
    <Preview>Verify your email to join MedMap</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Text style={logo}>🏥 MedMap</Text>
          <Text style={tagline}>Find. Book. Heal.</Text>
        </Section>
        
        <Heading style={h1}>Welcome to MedMap!</Heading>
        
        <Text style={text}>
          Thank you for joining South Africa's leading medical booking platform. 
          We're excited to help you access quality healthcare with ease.
        </Text>
        
        <Text style={text}>
          To complete your registration, please verify your email address by clicking the button below:
        </Text>
        
        <Section style={buttonSection}>
          <Link
            href={`${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`}
            style={button}
          >
            Verify Email Address
          </Link>
        </Section>
        
        <Text style={text}>
          Or copy and paste this verification code if the button doesn't work:
        </Text>
        <Section style={codeSection}>
          <Text style={code}>{token}</Text>
        </Section>
        
        <Section style={features}>
          <Text style={featuresTitle}>What you can do with MedMap:</Text>
          <Text style={featureItem}>✅ Find verified healthcare providers across all 9 provinces</Text>
          <Text style={featureItem}>✅ Book appointments instantly with real-time availability</Text>
          <Text style={featureItem}>✅ Access transparent pricing and genuine patient reviews</Text>
          <Text style={featureItem}>✅ Manage your health records and appointments in one place</Text>
        </Section>
        
        <Text style={footer}>
          If you didn't create an account with us, you can safely ignore this email.
        </Text>
        
        <Text style={signature}>
          Best regards,<br/>
          The MedMap Team<br/>
          <Link href="https://ironledgermedmap.co.za" style={link}>ironledgermedmap.co.za</Link>
        </Text>
      </Container>
    </Body>
  </Html>
)

export default UserVerificationEmail

const main = {
  backgroundColor: '#f8fafc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '600px',
  borderRadius: '8px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
}

const logoSection = {
  textAlign: 'center' as const,
  marginBottom: '32px',
}

const logo = {
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0',
  background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
}

const tagline = {
  fontSize: '14px',
  color: '#64748b',
  margin: '4px 0 0 0',
}

const h1 = {
  color: '#1e293b',
  fontSize: '24px',
  fontWeight: 'bold',
  lineHeight: '1.4',
  margin: '0 0 24px 0',
}

const text = {
  color: '#475569',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 16px 0',
}

const buttonSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#0ea5e9',
  borderRadius: '8px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: 'bold',
  padding: '16px 32px',
  textDecoration: 'none',
  textAlign: 'center' as const,
}

const codeSection = {
  backgroundColor: '#f1f5f9',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  padding: '16px',
  margin: '16px 0',
  textAlign: 'center' as const,
}

const code = {
  color: '#1e293b',
  fontSize: '18px',
  fontWeight: 'bold',
  letterSpacing: '2px',
  margin: '0',
}

const features = {
  backgroundColor: '#f0f9ff',
  border: '1px solid #bae6fd',
  borderRadius: '8px',
  padding: '20px',
  margin: '32px 0',
}

const featuresTitle = {
  color: '#0c4a6e',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
}

const featureItem = {
  color: '#0369a1',
  fontSize: '14px',
  margin: '6px 0',
}

const footer = {
  color: '#94a3b8',
  fontSize: '14px',
  margin: '32px 0 16px 0',
}

const signature = {
  color: '#475569',
  fontSize: '14px',
  margin: '0',
}

const link = {
  color: '#0ea5e9',
  textDecoration: 'none',
}

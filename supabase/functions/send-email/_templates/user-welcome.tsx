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
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface UserWelcomeEmailProps {
  user_name: string
  user_email: string
}

export const UserWelcomeEmail = ({
  user_name,
  user_email,
}: UserWelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to MedMap - Your healthcare journey starts here!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Text style={logo}>🏥 MedMap</Text>
          <Text style={tagline}>Find. Book. Heal.</Text>
        </Section>
        
        <Heading style={h1}>Welcome aboard, {user_name}! 🎉</Heading>
        
        <Text style={text}>
          Your email has been successfully verified and your account is now active! 
          You're now part of South Africa's most trusted medical booking platform.
        </Text>
        
        <Section style={nextStepsSection}>
          <Heading style={h2}>What's next?</Heading>
          
          <Section style={stepSection}>
            <Text style={stepNumber}>1</Text>
            <div>
              <Text style={stepTitle}>Find Your Doctor</Text>
              <Text style={stepDescription}>
                Search through our network of verified healthcare providers across all 9 provinces
              </Text>
              <Link href="https://ironledgermedmap.co.za/search" style={stepLink}>
                Start Searching →
              </Link>
            </div>
          </Section>
          
          <Section style={stepSection}>
            <Text style={stepNumber}>2</Text>
            <div>
              <Text style={stepTitle}>Book Your First Appointment</Text>
              <Text style={stepDescription}>
                Choose your preferred date and time with instant confirmation
              </Text>
              <Link href="https://ironledgermedmap.co.za/search" style={stepLink}>
                Book Now →
              </Link>
            </div>
          </Section>
          
          <Section style={stepSection}>
            <Text style={stepNumber}>3</Text>
            <div>
              <Text style={stepTitle}>Consider Premium Membership</Text>
              <Text style={stepDescription}>
                Get priority booking, exclusive discounts, and enhanced features for just R39/quarter
              </Text>
              <Link href="https://ironledgermedmap.co.za/memberships" style={stepLink}>
                Learn More →
              </Link>
            </div>
          </Section>
        </Section>
        
        <Section style={supportSection}>
          <Text style={supportTitle}>Need Help?</Text>
          <Text style={supportText}>
            Our support team is here to help you every step of the way. 
            If you have any questions, don't hesitate to reach out!
          </Text>
          <Text style={supportContact}>
            📧 support@ironledgermedmap.co.za<br/>
            📞 +27 (0) 11 123-4567<br/>
            💬 Live chat available on our website
          </Text>
        </Section>
        
        <Section style={socialSection}>
          <Text style={socialTitle}>Stay Connected</Text>
          <Text style={socialText}>
            Follow us on social media for health tips, platform updates, and community stories
          </Text>
        </Section>
        
        <Text style={signature}>
          Welcome to better healthcare!<br/>
          The MedMap Team<br/>
          <Link href="https://ironledgermedmap.co.za" style={link}>ironledgermedmap.co.za</Link>
        </Text>
      </Container>
    </Body>
  </Html>
)

export default UserWelcomeEmail

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

const h2 = {
  color: '#1e293b',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 0 16px 0',
}

const text = {
  color: '#475569',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 16px 0',
}

const nextStepsSection = {
  backgroundColor: '#f0f9ff',
  border: '1px solid #bae6fd',
  borderRadius: '8px',
  padding: '24px',
  margin: '32px 0',
}

const stepSection = {
  display: 'flex',
  alignItems: 'flex-start',
  marginBottom: '20px',
  gap: '16px',
}

const stepNumber = {
  backgroundColor: '#0ea5e9',
  color: '#ffffff',
  borderRadius: '50%',
  width: '32px',
  height: '32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0',
  flexShrink: 0,
}

const stepTitle = {
  color: '#1e293b',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 4px 0',
}

const stepDescription = {
  color: '#475569',
  fontSize: '14px',
  margin: '0 0 8px 0',
}

const stepLink = {
  color: '#0ea5e9',
  fontSize: '14px',
  fontWeight: '500',
  textDecoration: 'none',
}

const supportSection = {
  backgroundColor: '#fef3c7',
  border: '1px solid #fcd34d',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
}

const supportTitle = {
  color: '#92400e',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
}

const supportText = {
  color: '#a16207',
  fontSize: '14px',
  margin: '0 0 12px 0',
}

const supportContact = {
  color: '#a16207',
  fontSize: '14px',
  margin: '0',
}

const socialSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const socialTitle = {
  color: '#1e293b',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
}

const socialText = {
  color: '#64748b',
  fontSize: '14px',
  margin: '0',
}

const signature = {
  color: '#475569',
  fontSize: '14px',
  margin: '32px 0 0 0',
  textAlign: 'center' as const,
}

const link = {
  color: '#0ea5e9',
  textDecoration: 'none',
}

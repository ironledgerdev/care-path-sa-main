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

interface DoctorApprovedEmailProps {
  doctor_name: string
  practice_name: string
  speciality: string
}

export const DoctorApprovedEmail = ({
  doctor_name,
  practice_name,
  speciality,
}: DoctorApprovedEmailProps) => (
  <Html>
    <Head />
    <Preview>🎉 Congratulations! Your practice has been approved on MedMap</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Text style={logo}>🏥 MedMap</Text>
          <Text style={tagline}>Find. Book. Heal.</Text>
        </Section>
        
        <Section style={celebrationSection}>
          <Text style={celebration}>🎉</Text>
          <Heading style={h1}>Congratulations, Dr. {doctor_name}!</Heading>
          <Text style={approvedText}>
            Your practice application has been <strong>approved</strong>! 
            Welcome to South Africa's leading healthcare network.
          </Text>
        </Section>
        
        <Section style={practiceSection}>
          <Heading style={h2}>Your Practice is Now Live</Heading>
          <Text style={practiceInfo}>
            <strong>{practice_name}</strong><br/>
            {speciality} Practice
          </Text>
          <Text style={text}>
            Your practice profile is now visible to patients across South Africa. 
            You can start receiving and managing bookings immediately.
          </Text>
        </Section>
        
        <Section style={actionsSection}>
          <Heading style={h2}>Get Started Now</Heading>
          
          <Section style={actionCard}>
            <Text style={actionIcon}>🖥️</Text>
            <div>
              <Text style={actionTitle}>Access Your Dashboard</Text>
              <Text style={actionDescription}>
                Manage appointments, update your profile, and track your practice analytics
              </Text>
              <Link href="https://ironledgermedmap.co.za/doctor" style={actionButton}>
                Go to Dashboard
              </Link>
            </div>
          </Section>
          
          <Section style={actionCard}>
            <Text style={actionIcon}>📅</Text>
            <div>
              <Text style={actionTitle}>Set Your Availability</Text>
              <Text style={actionDescription}>
                Configure your working hours and availability to start receiving bookings
              </Text>
              <Link href="https://ironledgermedmap.co.za/doctor" style={actionButton}>
                Set Schedule
              </Link>
            </div>
          </Section>
          
          <Section style={actionCard}>
            <Text style={actionIcon}>💰</Text>
            <div>
              <Text style={actionTitle}>Configure Payments</Text>
              <Text style={actionDescription}>
                Set up your payment details to receive funds from patient consultations
              </Text>
              <Link href="https://ironledgermedmap.co.za/doctor" style={actionButton}>
                Payment Setup
              </Link>
            </div>
          </Section>
        </Section>
        
        <Section style={benefitsSection}>
          <Heading style={h2}>You're Now Part of Something Special</Heading>
          <Text style={benefitItem}>🌍 Reach patients across all 9 provinces of South Africa</Text>
          <Text style={benefitItem}>⚡ Instant booking confirmations and automated scheduling</Text>
          <Text style={benefitItem}>💳 Secure payments processed within 24 hours</Text>
          <Text style={benefitItem}>📊 Advanced analytics to grow your practice</Text>
          <Text style={benefitItem}>🛡️ Comprehensive insurance and liability protection</Text>
          <Text style={benefitItem}>📞 Dedicated provider support team</Text>
        </Section>
        
        <Section style={tipsSection}>
          <Heading style={h2}>Tips for Success</Heading>
          <Text style={tipItem}>
            <strong>Complete Your Profile:</strong> Add a professional photo, detailed bio, and highlight your expertise
          </Text>
          <Text style={tipItem}>
            <strong>Set Competitive Pricing:</strong> Research similar specialists in your area for optimal pricing
          </Text>
          <Text style={tipItem}>
            <strong>Respond Quickly:</strong> Fast response times lead to higher patient satisfaction and more bookings
          </Text>
          <Text style={tipItem}>
            <strong>Maintain Quality:</strong> Excellent patient care translates to great reviews and referrals
          </Text>
        </Section>
        
        <Section style={supportSection}>
          <Text style={supportTitle}>Need Help Getting Started?</Text>
          <Text style={supportText}>
            Our dedicated provider success team is here to help you maximize your presence on our platform:
          </Text>
          <Text style={supportContact}>
            📧 providers@ironledgermedmap.co.za<br/>
            📞 +27 (0) 11 123-4567 (Provider Line)<br/>
            💬 Live chat available 8AM-6PM weekdays<br/>
            📚 Provider Knowledge Base: <Link href="#" style={link}>help.ironledgermedmap.co.za</Link>
          </Text>
        </Section>
        
        <Section style={welcomeSection}>
          <Text style={welcomeText}>
            Welcome to the MedMap family! We're excited to partner with you 
            in transforming healthcare access across South Africa.
          </Text>
        </Section>
        
        <Text style={signature}>
          Here's to your success!<br/>
          The MedMap Provider Team<br/>
          <Link href="https://ironledgermedmap.co.za/doctor" style={link}>Access Your Dashboard</Link>
        </Text>
      </Container>
    </Body>
  </Html>
)

export default DoctorApprovedEmail

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
  marginBottom: '24px',
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

const celebrationSection = {
  textAlign: 'center' as const,
  backgroundColor: '#ecfdf5',
  border: '2px solid #22c55e',
  borderRadius: '12px',
  padding: '32px 20px',
  margin: '24px 0',
}

const celebration = {
  fontSize: '48px',
  margin: '0 0 16px 0',
}

const h1 = {
  color: '#166534',
  fontSize: '28px',
  fontWeight: 'bold',
  lineHeight: '1.4',
  margin: '0 0 16px 0',
}

const approvedText = {
  color: '#15803d',
  fontSize: '18px',
  lineHeight: '1.6',
  margin: '0',
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

const practiceSection = {
  backgroundColor: '#f1f5f9',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  padding: '24px',
  margin: '32px 0',
}

const practiceInfo = {
  color: '#0ea5e9',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 16px 0',
}

const actionsSection = {
  margin: '32px 0',
}

const actionCard = {
  display: 'flex',
  alignItems: 'flex-start',
  backgroundColor: '#f0f9ff',
  border: '1px solid #bae6fd',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '16px',
  gap: '16px',
}

const actionIcon = {
  fontSize: '24px',
  margin: '0',
  flexShrink: 0,
}

const actionTitle = {
  color: '#1e293b',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
}

const actionDescription = {
  color: '#64748b',
  fontSize: '14px',
  margin: '0 0 12px 0',
}

const actionButton = {
  backgroundColor: '#0ea5e9',
  color: '#ffffff',
  borderRadius: '6px',
  fontSize: '14px',
  fontWeight: '500',
  padding: '8px 16px',
  textDecoration: 'none',
  display: 'inline-block',
}

const benefitsSection = {
  backgroundColor: '#f0fdf4',
  border: '1px solid #bbf7d0',
  borderRadius: '8px',
  padding: '24px',
  margin: '32px 0',
}

const benefitItem = {
  color: '#166534',
  fontSize: '15px',
  margin: '8px 0',
}

const tipsSection = {
  backgroundColor: '#fffbeb',
  border: '1px solid #fde68a',
  borderRadius: '8px',
  padding: '24px',
  margin: '32px 0',
}

const tipItem = {
  color: '#92400e',
  fontSize: '14px',
  margin: '12px 0',
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

const welcomeSection = {
  textAlign: 'center' as const,
  backgroundColor: '#fdf4ff',
  border: '1px solid #e9d5ff',
  borderRadius: '8px',
  padding: '24px',
  margin: '32px 0',
}

const welcomeText = {
  color: '#7c3aed',
  fontSize: '16px',
  fontStyle: 'italic',
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

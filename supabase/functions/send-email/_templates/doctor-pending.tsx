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

interface DoctorPendingEmailProps {
  doctor_name: string
  practice_name: string
  speciality: string
  license_number: string
}

export const DoctorPendingEmail = ({
  doctor_name,
  practice_name,
  speciality,
  license_number,
}: DoctorPendingEmailProps) => (
  <Html>
    <Head />
    <Preview>Your practice application is under review - MedMap</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Text style={logo}>🏥 MedMap</Text>
          <Text style={tagline}>Find. Book. Heal.</Text>
        </Section>
        
        <Heading style={h1}>Thank you for your application, Dr. {doctor_name}!</Heading>
        
        <Text style={text}>
          We've received your application to join MedMap as a healthcare provider. 
          Your practice details are currently under review by our medical verification team.
        </Text>
        
        <Section style={applicationSection}>
          <Heading style={h2}>Application Summary</Heading>
          <Section style={detailRow}>
            <Text style={detailLabel}>Practice Name:</Text>
            <Text style={detailValue}>{practice_name}</Text>
          </Section>
          <Section style={detailRow}>
            <Text style={detailLabel}>Specialty:</Text>
            <Text style={detailValue}>{speciality}</Text>
          </Section>
          <Section style={detailRow}>
            <Text style={detailLabel}>License Number:</Text>
            <Text style={detailValue}>{license_number}</Text>
          </Section>
        </Section>
        
        <Section style={processSection}>
          <Heading style={h2}>What happens next?</Heading>
          
          <Section style={stepSection}>
            <Text style={stepNumber}>1</Text>
            <div>
              <Text style={stepTitle}>Document Verification</Text>
              <Text style={stepDescription}>
                Our team will verify your medical license with the HPCSA and review your qualifications
              </Text>
            </div>
          </Section>
          
          <Section style={stepSection}>
            <Text style={stepNumber}>2</Text>
            <div>
              <Text style={stepTitle}>Practice Review</Text>
              <Text style={stepDescription}>
                We'll validate your practice information and ensure compliance with our quality standards
              </Text>
            </div>
          </Section>
          
          <Section style={stepSection}>
            <Text style={stepNumber}>3</Text>
            <div>
              <Text style={stepTitle}>Approval & Onboarding</Text>
              <Text style={stepDescription}>
                Once approved, you'll receive access to your doctor dashboard and can start accepting bookings
              </Text>
            </div>
          </Section>
        </Section>
        
        <Section style={timelineSection}>
          <Text style={timelineTitle}>⏱️ Expected Timeline</Text>
          <Text style={timelineText}>
            Most applications are processed within <strong>2-3 business days</strong>. 
            We'll notify you immediately once your application status changes.
          </Text>
        </Section>
        
        <Section style={benefitsSection}>
          <Heading style={h2}>Benefits of joining MedMap</Heading>
          <Text style={benefitItem}>✅ Reach patients across all 9 provinces of South Africa</Text>
          <Text style={benefitItem}>✅ Automated appointment scheduling and management</Text>
          <Text style={benefitItem}>✅ Secure payment processing with instant transfers</Text>
          <Text style={benefitItem}>✅ Professional practice management tools</Text>
          <Text style={benefitItem}>✅ Patient review and rating system</Text>
          <Text style={benefitItem}>✅ Marketing and visibility within our network</Text>
        </Section>
        
        <Section style={supportSection}>
          <Text style={supportTitle}>Questions about your application?</Text>
          <Text style={supportText}>
            Our provider support team is here to help:
          </Text>
          <Text style={supportContact}>
            📧 providers@ironledgermedmap.co.za<br/>
            📞 +27 (0) 11 123-4567 (Provider Line)<br/>
            💬 Live chat available 8AM-6PM weekdays
          </Text>
        </Section>
        
        <Text style={signature}>
          Thank you for choosing to partner with us!<br/>
          The MedMap Provider Team<br/>
          <Link href="https://ironledgermedmap.co.za/doctor-enrollment" style={link}>Provider Portal</Link>
        </Text>
      </Container>
    </Body>
  </Html>
)

export default DoctorPendingEmail

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
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 16px 0',
}

const text = {
  color: '#475569',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 16px 0',
}

const applicationSection = {
  backgroundColor: '#f1f5f9',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  padding: '20px',
  margin: '32px 0',
}

const detailRow = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '8px',
}

const detailLabel = {
  color: '#64748b',
  fontSize: '14px',
  fontWeight: '500',
  margin: '0',
}

const detailValue = {
  color: '#1e293b',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0',
}

const processSection = {
  margin: '32px 0',
}

const stepSection = {
  display: 'flex',
  alignItems: 'flex-start',
  marginBottom: '16px',
  gap: '12px',
}

const stepNumber = {
  backgroundColor: '#0ea5e9',
  color: '#ffffff',
  borderRadius: '50%',
  width: '24px',
  height: '24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '12px',
  fontWeight: 'bold',
  margin: '0',
  flexShrink: 0,
}

const stepTitle = {
  color: '#1e293b',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0 0 4px 0',
}

const stepDescription = {
  color: '#64748b',
  fontSize: '14px',
  margin: '0',
}

const timelineSection = {
  backgroundColor: '#ecfdf5',
  border: '1px solid #a7f3d0',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
  textAlign: 'center' as const,
}

const timelineTitle = {
  color: '#065f46',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
}

const timelineText = {
  color: '#047857',
  fontSize: '14px',
  margin: '0',
}

const benefitsSection = {
  backgroundColor: '#f0f9ff',
  border: '1px solid #bae6fd',
  borderRadius: '8px',
  padding: '20px',
  margin: '32px 0',
}

const benefitItem = {
  color: '#0369a1',
  fontSize: '14px',
  margin: '6px 0',
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

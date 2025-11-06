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

interface DoctorUnderReviewEmailProps {
  doctor_name: string
  doctor_email: string
  practice_name: string
  speciality: string
  license_number: string
}

export const DoctorUnderReviewEmail = ({
  doctor_name,
  doctor_email,
  practice_name,
  speciality,
  license_number,
}: DoctorUnderReviewEmailProps) => (
  <Html>
    <Head />
    <Preview>Your MedMap doctor application is under review</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Text style={logo}>🏥 MedMap</Text>
          <Text style={tagline}>Find. Book. Heal.</Text>
        </Section>
        
        <Heading style={h1}>Application Under Review</Heading>
        
        <Text style={greeting}>Dear Dr. {doctor_name},</Text>
        
        <Text style={text}>
          Thank you for your interest in joining MedMap! Your doctor application 
          has been successfully submitted and is currently under review by our medical 
          verification team.
        </Text>
        
        <Section style={applicationSection}>
          <Text style={sectionTitle}>📋 Application Details</Text>
          <Text style={applicationDetail}><strong>Practice Name:</strong> {practice_name}</Text>
          <Text style={applicationDetail}><strong>Speciality:</strong> {speciality}</Text>
          <Text style={applicationDetail}><strong>License Number:</strong> {license_number}</Text>
          <Text style={applicationDetail}><strong>Email:</strong> {doctor_email}</Text>
        </Section>
        
        <Section style={reviewSection}>
          <Text style={reviewTitle}>🔍 What happens next?</Text>
          
          <Section style={stepSection}>
            <Text style={stepNumber}>1</Text>
            <div>
              <Text style={stepTitle}>Document Verification</Text>
              <Text style={stepDescription}>
                Our team will verify your medical credentials, licenses, and qualifications
              </Text>
            </div>
          </Section>
          
          <Section style={stepSection}>
            <Text style={stepNumber}>2</Text>
            <div>
              <Text style={stepTitle}>Practice Validation</Text>
              <Text style={stepDescription}>
                We'll confirm your practice details and professional standing
              </Text>
            </div>
          </Section>
          
          <Section style={stepSection}>
            <Text style={stepNumber}>3</Text>
            <div>
              <Text style={stepTitle}>Final Approval</Text>
              <Text style={stepDescription}>
                Once approved, you'll receive login credentials and can start accepting bookings
              </Text>
            </div>
          </Section>
        </Section>
        
        <Section style={timelineSection}>
          <Text style={timelineTitle}>⏱️ Expected Timeline</Text>
          <Text style={timelineText}>
            Our verification process typically takes <strong>2-5 business days</strong>. 
            We'll keep you updated throughout the process and notify you immediately 
            once your application is approved.
          </Text>
        </Section>
        
        <Section style={requirementsSection}>
          <Text style={requirementsTitle}>📋 Required Documents</Text>
          <Text style={requirementsText}>
            Our team may contact you if we need any of the following documents:
          </Text>
          <Text style={requirementItem}>• Valid HPCSA registration certificate</Text>
          <Text style={requirementItem}>• Professional indemnity insurance certificate</Text>
          <Text style={requirementItem}>• Medical qualification certificates</Text>
          <Text style={requirementItem}>• Practice registration documents</Text>
          <Text style={requirementItem}>• Recent professional references</Text>
        </Section>
        
        <Section style={supportSection}>
          <Text style={supportTitle}>Questions or Need Help?</Text>
          <Text style={supportText}>
            If you have any questions about your application or the review process, 
            please don't hesitate to contact our healthcare provider support team:
          </Text>
          <Text style={supportContact}>
            📧 providers@ironledgermedmap.co.za<br/>
            📞 +27 (0) 11 123-4567 (Provider Line)<br/>
            💬 Live chat available on our website
          </Text>
        </Section>
        
        <Text style={signature}>
          Thank you for choosing to partner with us!<br/>
          <br/>
          Best regards,<br/>
          The MedMap Medical Review Team<br/>
          <Link href="https://ironledgermedmap.co.za" style={linkStyle}>ironledgermedmap.co.za</Link>
        </Text>
        
        <Text style={footer}>
          This email was sent regarding your doctor application submitted on {new Date().toLocaleDateString('en-ZA')}.<br/>
          Reference ID: DOC-{license_number}-{Date.now().toString().slice(-6)}
        </Text>
      </Container>
    </Body>
  </Html>
)

export default DoctorUnderReviewEmail

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

const greeting = {
  color: '#475569',
  fontSize: '16px',
  fontWeight: '500',
  margin: '0 0 16px 0',
}

const text = {
  color: '#475569',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 24px 0',
}

const applicationSection = {
  backgroundColor: '#f0f9ff',
  border: '1px solid #bae6fd',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
}

const sectionTitle = {
  color: '#1e293b',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
}

const applicationDetail = {
  color: '#475569',
  fontSize: '14px',
  margin: '0 0 8px 0',
}

const reviewSection = {
  backgroundColor: '#fefce8',
  border: '1px solid #fde047',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
}

const reviewTitle = {
  color: '#a16207',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 16px 0',
}

const stepSection = {
  display: 'flex',
  alignItems: 'flex-start',
  marginBottom: '16px',
  gap: '12px',
}

const stepNumber = {
  backgroundColor: '#eab308',
  color: '#ffffff',
  borderRadius: '50%',
  width: '28px',
  height: '28px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '14px',
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
  fontSize: '13px',
  margin: '0',
}

const timelineSection = {
  backgroundColor: '#f0fdf4',
  border: '1px solid #bbf7d0',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
}

const timelineTitle = {
  color: '#166534',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
}

const timelineText = {
  color: '#15803d',
  fontSize: '14px',
  margin: '0',
}

const requirementsSection = {
  backgroundColor: '#fef2f2',
  border: '1px solid #fecaca',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
}

const requirementsTitle = {
  color: '#dc2626',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
}

const requirementsText = {
  color: '#ef4444',
  fontSize: '14px',
  margin: '0 0 12px 0',
}

const requirementItem = {
  color: '#ef4444',
  fontSize: '13px',
  margin: '0 0 4px 0',
}

const supportSection = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
}

const supportTitle = {
  color: '#1e293b',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
}

const supportText = {
  color: '#475569',
  fontSize: '14px',
  margin: '0 0 12px 0',
}

const supportContact = {
  color: '#475569',
  fontSize: '14px',
  margin: '0',
}

const signature = {
  color: '#475569',
  fontSize: '14px',
  margin: '32px 0 16px 0',
  textAlign: 'center' as const,
}

const linkStyle = {
  color: '#0ea5e9',
  textDecoration: 'none',
}

const footer = {
  color: '#94a3b8',
  fontSize: '12px',
  textAlign: 'center' as const,
  margin: '24px 0 0 0',
  fontStyle: 'italic',
}

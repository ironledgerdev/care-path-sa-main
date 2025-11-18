import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Mail, Phone, MapPin } from 'lucide-react';

export default function PrivacyPolicy() {
  const handleDownloadPDF = () => {
    const link = document.createElement('a');
    link.href = '/documents/POPIA-Privacy-Policy.pdf';
    link.download = 'MedMap-POPIA-Privacy-Policy.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-medical-light to-background pt-24">
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-medical-gradient mb-4">Privacy Policy (POPIA)</h1>
          <p className="text-muted-foreground text-lg">
            Protection of Personal Information Act, 2013 (Act No. 4 of 2013)
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <Button onClick={handleDownloadPDF} className="btn-medical-primary">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>

        <div className="space-y-8">
          {/* 1. Introduction */}
          <Card className="medical-card">
            <CardHeader>
              <CardTitle>1. Introduction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                MedMap ("we", "us", "our", or "Company") operates the MedMap healthcare appointment booking platform and related services 
                ("Platform"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Platform.
              </p>
              <p>
                We are committed to protecting your personal information and respecting your privacy rights under the Protection of Personal 
                Information Act, 2013 (POPIA). Please read this Privacy Policy carefully.
              </p>
              <p className="text-sm text-muted-foreground italic">
                Last Updated: {new Date().toLocaleDateString()}
              </p>
            </CardContent>
          </Card>

          {/* 2. Information We Collect */}
          <Card className="medical-card">
            <CardHeader>
              <CardTitle>2. Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">2.1 Information You Provide Directly</h3>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li><strong>Account Registration:</strong> First name, last name, email address, password</li>
                  <li><strong>Booking Appointments:</strong> Appointment preferences, appointment date and time, patient notes (medical history or specific health concerns)</li>
                  <li><strong>Payment Information:</strong> Payment method preferences (medical aid, cash, or card), payment reference numbers from PayFast</li>
                  <li><strong>Membership Enrollment:</strong> Membership type selection, subscription preferences</li>
                  <li><strong>Doctor Enrollment:</strong> Professional credentials, practice details, banking information (for payment processing)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">2.2 Information Collected Automatically</h3>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>IP address and device identifiers</li>
                  <li>Browser type and version</li>
                  <li>Pages visited and time spent on pages</li>
                  <li>Referral source</li>
                  <li>Error logs and performance data</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">2.3 Information from Third Parties</h3>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Payment information from PayFast (payment status, transaction references)</li>
                  <li>User verification data (if applicable)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* 3. Purpose of Collection */}
          <Card className="medical-card">
            <CardHeader>
              <CardTitle>3. Purpose of Collection and Legal Basis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>We collect and process your personal information for the following purposes:</p>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li><strong>Account Management:</strong> To create and maintain your user account, authenticate your identity, and provide access to the Platform</li>
                <li><strong>Service Delivery:</strong> To facilitate appointment bookings, manage memberships, process payments, and deliver healthcare services</li>
                <li><strong>Communication:</strong> To send appointment confirmations, reminders, payment notifications, and customer support communications</li>
                <li><strong>Payment Processing:</strong> To process payments securely through our payment partner PayFast</li>
                <li><strong>Legal Compliance:</strong> To comply with applicable laws, regulations, and legal obligations</li>
                <li><strong>Service Improvement:</strong> To analyze usage patterns, troubleshoot issues, and enhance the Platform's functionality</li>
                <li><strong>Fraud Prevention:</strong> To detect and prevent fraudulent activities and unauthorized access</li>
                <li><strong>Error Monitoring:</strong> To monitor application errors and performance issues through Sentry</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-4">
                The legal basis for processing your information includes: (a) consent, (b) performance of a contract, and (c) compliance with legal obligations.
              </p>
            </CardContent>
          </Card>

          {/* 4. Information Sharing and Disclosure */}
          <Card className="medical-card">
            <CardHeader>
              <CardTitle>4. Information Sharing and Disclosure</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">4.1 Third-Party Service Providers</h3>
                <p className="text-sm mb-3">We share your information with trusted service providers who assist us in operating the Platform:</p>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-semibold">Supabase (Data Storage & Authentication)</p>
                    <p className="text-muted-foreground">Stores user accounts, appointments, and membership data. Supabase is a secure cloud database provider compliant with international data protection standards.</p>
                  </div>
                  <div>
                    <p className="font-semibold">PayFast (Payment Processing)</p>
                    <p className="text-muted-foreground">Processes payment transactions for appointments and memberships. Payment information is transmitted securely and PayFast retains only transaction data necessary for payment processing.</p>
                  </div>
                  <div>
                    <p className="font-semibold">Sentry (Error Monitoring)</p>
                    <p className="text-muted-foreground">Monitors application errors and performance. Sentry may receive error logs and usage data to help us maintain platform stability.</p>
                  </div>
                  <div>
                    <p className="font-semibold">Email Service Provider</p>
                    <p className="text-muted-foreground">Sends appointment confirmations, reminders, and notification emails on your behalf.</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">4.2 Healthcare Providers</h3>
                <p className="text-sm">
                  When you book appointments, appointment details (date, time, patient notes) are shared with the respective healthcare provider to facilitate the consultation.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">4.3 Legal Requirements</h3>
                <p className="text-sm">
                  We may disclose your information if required by law, court order, or government request, or if we reasonably believe disclosure is necessary to protect our rights or the safety of our users.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">4.4 Business Transfers</h3>
                <p className="text-sm">
                  If MedMap is involved in a merger, acquisition, or sale of assets, your personal information may be transferred as part of that transaction.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 5. Data Security */}
          <Card className="medical-card">
            <CardHeader>
              <CardTitle>5. Data Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We implement comprehensive security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>Encryption of data in transit using HTTPS/TLS protocols</li>
                <li>Secure authentication mechanisms (passwords, email verification)</li>
                <li>Role-based access control (only authorized personnel can access data)</li>
                <li>Regular security monitoring and testing</li>
                <li>Secure data storage on encrypted servers</li>
                <li>Password protection for sensitive operations</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-4">
                While we implement robust security measures, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security of your information.
              </p>
            </CardContent>
          </Card>

          {/* 6. Data Retention */}
          <Card className="medical-card">
            <CardHeader>
              <CardTitle>6. Data Retention</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this Privacy Policy:</p>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li><strong>Account Information:</strong> Retained while your account is active and for 3 years after account closure for legal and accounting purposes</li>
                <li><strong>Appointment Records:</strong> Retained for 7 years (in compliance with healthcare record-keeping practices)</li>
                <li><strong>Payment Records:</strong> Retained for 6 years as required by tax and financial regulations</li>
                <li><strong>Communication Logs:</strong> Retained for 2 years</li>
                <li><strong>Error Logs:</strong> Retained for 90 days unless legal hold requires longer retention</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-4">
                After the retention period expires, we will securely delete or anonymize your information.
              </p>
            </CardContent>
          </Card>

          {/* 7. Your Rights */}
          <Card className="medical-card">
            <CardHeader>
              <CardTitle>7. Your Rights Under POPIA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Under the Protection of Personal Information Act, 2013, you have the following rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li><strong>Right of Access:</strong> Request access to the personal information we hold about you</li>
                <li><strong>Right to Correction:</strong> Request correction of inaccurate, incomplete, or outdated information</li>
                <li><strong>Right to Deletion:</strong> Request deletion of your information (subject to legal requirements)</li>
                <li><strong>Right to Restrict Processing:</strong> Request that we limit how we use your information</li>
                <li><strong>Right to Data Portability:</strong> Request a copy of your information in a portable format</li>
                <li><strong>Right to Object:</strong> Object to certain types of processing (marketing communications, etc.)</li>
                <li><strong>Right to Lodge a Complaint:</strong> Lodge a complaint with the Information Regulator if you believe your rights have been violated</li>
              </ul>
              <p className="text-sm mt-4">
                To exercise any of these rights, please contact our Information Officer using the details provided in Section 10.
              </p>
            </CardContent>
          </Card>

          {/* 8. Cookies and Tracking */}
          <Card className="medical-card">
            <CardHeader>
              <CardTitle>8. Cookies and Tracking Technologies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Our Platform may use cookies and similar tracking technologies to enhance user experience and analyze usage patterns:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li><strong>Session Cookies:</strong> Maintain your login session and provide necessary functionality</li>
                <li><strong>Analytics:</strong> Track usage patterns to improve the Platform</li>
              </ul>
              <p className="text-sm mt-4">
                You can control cookie preferences through your browser settings. Disabling cookies may affect Platform functionality.
              </p>
            </CardContent>
          </Card>

          {/* 9. Children's Privacy */}
          <Card className="medical-card">
            <CardHeader>
              <CardTitle>9. Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                The Platform is intended for users 18 years and older. We do not knowingly collect personal information from children under 18. 
                If we become aware that we have collected information from a child, we will promptly delete such information.
              </p>
            </CardContent>
          </Card>

          {/* 10. Contact Information */}
          <Card className="medical-card">
            <CardHeader>
              <CardTitle>10. Information Officer & Contact Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                If you have questions about this Privacy Policy, wish to exercise your rights, or have privacy concerns, please contact our Information Officer:
              </p>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-medical-primary mt-0.5" />
                  <div>
                    <p className="font-semibold">Email</p>
                    <p className="text-muted-foreground">privacy@ironledgermedmap.co.za</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-medical-primary mt-0.5" />
                  <div>
                    <p className="font-semibold">Phone</p>
                    <p className="text-muted-foreground">+27 (0) XX XXX XXXX</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-medical-primary mt-0.5" />
                  <div>
                    <p className="font-semibold">Physical Address</p>
                    <p className="text-muted-foreground">South Africa</p>
                  </div>
                </div>
              </div>
              <p className="text-sm mt-4 font-semibold">
                Information Regulator of South Africa Contact:
              </p>
              <p className="text-sm text-muted-foreground">
                Website: <a href="https://www.justice.gov.za/inforeg/" className="text-medical-primary hover:underline" target="_blank" rel="noopener noreferrer">https://www.justice.gov.za/inforeg/</a>
              </p>
            </CardContent>
          </Card>

          {/* 11. Changes to Privacy Policy */}
          <Card className="medical-card">
            <CardHeader>
              <CardTitle>11. Changes to This Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We may update this Privacy Policy periodically to reflect changes in our practices or for other operational, legal, or regulatory reasons. 
                We will notify you of material changes by posting the updated Privacy Policy on the Platform and updating the "Last Updated" date.
              </p>
              <p className="text-sm">
                Your continued use of the Platform constitutes your acceptance of the updated Privacy Policy.
              </p>
            </CardContent>
          </Card>

          {/* Compliance Section */}
          <Card className="medical-card border-medical-primary/20 bg-medical-light/30">
            <CardHeader>
              <CardTitle className="text-medical-primary">POPIA Compliance Commitment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">
                MedMap is committed to complying with the Protection of Personal Information Act, 2013, and protecting your fundamental rights 
                to privacy and data protection. This Privacy Policy demonstrates our commitment to transparent, responsible data handling practices 
                and respect for your personal information.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

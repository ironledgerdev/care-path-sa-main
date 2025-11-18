import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Mail, Phone, MapPin, FileText } from 'lucide-react';

export default function PAIAManual() {
  const handleDownloadPDF = () => {
    const link = document.createElement('a');
    link.href = '/documents/PAIA-Manual.pdf';
    link.download = 'MedMap-PAIA-Manual.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-medical-light to-background pt-24">
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-medical-gradient mb-4">PAIA Manual</h1>
          <p className="text-muted-foreground text-lg">
            Promotion of Access to Information Act, 2000 (Act No. 2 of 2000)
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
              <CardTitle>1. Introduction and Purpose</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                This Manual is published in accordance with Section 51 of the Promotion of Access to Information Act, 2000 (Act No. 2 of 2000) ("PAIA"). 
                The purpose of this Manual is to provide guidance to members of the public on how to request access to information held by MedMap ("the Organization").
              </p>
              <p>
                The Manual explains the procedures for requesting access to records, the fees charged, contact details, and our commitment to transparency 
                and openness as required by PAIA.
              </p>
              <p className="text-sm text-muted-foreground italic">
                Last Updated: {new Date().toLocaleDateString()}
              </p>
            </CardContent>
          </Card>

          {/* 2. Organization Information */}
          <Card className="medical-card">
            <CardHeader>
              <CardTitle>2. Information About MedMap</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold">Organization Name</p>
                  <p className="text-muted-foreground">MedMap (Healthcare Appointment Booking Platform)</p>
                </div>
                <div>
                  <p className="font-semibold">Nature of Business</p>
                  <p className="text-muted-foreground">
                    MedMap operates a digital platform for healthcare appointment booking, facilitating connections between patients and healthcare providers. 
                    The platform enables appointment scheduling, membership management, and payment processing for healthcare services.
                  </p>
                </div>
                <div>
                  <p className="font-semibold">Address</p>
                  <p className="text-muted-foreground">South Africa</p>
                </div>
                <div>
                  <p className="font-semibold">Website</p>
                  <p className="text-muted-foreground">https://ironledgermedmap.co.za</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. Categories of Records */}
          <Card className="medical-card">
            <CardHeader>
              <CardTitle>3. Categories of Records Held</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                MedMap holds various categories of records. Access to some records may be limited due to privacy concerns, business confidentiality, 
                or other legal exemptions under PAIA.
              </p>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold">User Account Records</p>
                  <ul className="list-disc list-inside text-muted-foreground ml-2">
                    <li>User registration information (names, email addresses, contact details)</li>
                    <li>Account activity logs</li>
                    <li>User preferences and settings</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold">Appointment Records</p>
                  <ul className="list-disc list-inside text-muted-foreground ml-2">
                    <li>Appointment booking details</li>
                    <li>Appointment history and status</li>
                    <li>Patient notes (related to appointments)</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold">Membership Records</p>
                  <ul className="list-disc list-inside text-muted-foreground ml-2">
                    <li>Membership enrollment information</li>
                    <li>Membership type and benefits</li>
                    <li>Membership status and renewal information</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold">Payment Records</p>
                  <ul className="list-disc list-inside text-muted-foreground ml-2">
                    <li>Transaction records and receipts</li>
                    <li>Payment status and history</li>
                    <li>Billing records</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold">Healthcare Provider Records</p>
                  <ul className="list-disc list-inside text-muted-foreground ml-2">
                    <li>Doctor/provider enrollment information</li>
                    <li>Provider profile information</li>
                    <li>Provider availability and scheduling information</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold">System and Administrative Records</p>
                  <ul className="list-disc list-inside text-muted-foreground ml-2">
                    <li>Error logs and system monitoring data</li>
                    <li>Security and access logs</li>
                    <li>System performance and backup records</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold">Communication Records</p>
                  <ul className="list-disc list-inside text-muted-foreground ml-2">
                    <li>Customer service communications</li>
                    <li>Appointment reminders and notifications</li>
                    <li>Support emails and inquiries</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 4. Records Not Available */}
          <Card className="medical-card">
            <CardHeader>
              <CardTitle>4. Records Not Available for Inspection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                The following types of records are generally not available for inspection, as they are protected under PAIA exemptions:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li><strong>Medical Records of Third Parties:</strong> Health or personal information of other users or healthcare providers</li>
                <li><strong>Confidential Business Information:</strong> Trade secrets, proprietary algorithms, and business strategies</li>
                <li><strong>Third-Party Information:</strong> Personal information of other users (except your own)</li>
                <li><strong>System Security Information:</strong> Security vulnerabilities, system passwords, and encryption keys</li>
                <li><strong>Attorney-Client Communications:</strong> Legal advice and attorney-client privileged communications</li>
                <li><strong>Financial Records of Third Parties:</strong> Banking details and payment information of other users</li>
              </ul>
            </CardContent>
          </Card>

          {/* 5. Procedure for Requesting Access */}
          <Card className="medical-card">
            <CardHeader>
              <CardTitle>5. Procedure for Requesting Access to Records</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-3">5.1 Request Process</h3>
                <p className="text-sm mb-4">
                  To request access to information held by MedMap, follow these steps:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Complete the "Form for Requesting Access to a Record" (provided below)</li>
                  <li>Submit the completed form to our Information Officer</li>
                  <li>Include sufficient information to identify the specific record(s) you are requesting</li>
                  <li>Specify whether you want the information in physical or electronic format</li>
                  <li>Pay any applicable fees (detailed in Section 7)</li>
                </ol>
              </div>
              <div>
                <h3 className="font-semibold mb-3">5.2 Required Information in Requests</h3>
                <p className="text-sm mb-2">Your request must include:</p>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Your full name and contact details</li>
                  <li>Your email address and/or phone number</li>
                  <li>A clear description of the record(s) you are requesting</li>
                  <li>The preferred format for receiving the information (electronic, printed, etc.)</li>
                  <li>A description of why you need the information (if requesting on behalf of another party)</li>
                  <li>Proof of payment for any applicable fees</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">5.3 Request Submission</h3>
                <p className="text-sm">
                  Submit your request to our Information Officer by email or postal mail (contact details in Section 8).
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 6. Response Timeframes */}
          <Card className="medical-card">
            <CardHeader>
              <CardTitle>6. Timeframes for Response</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li><strong>Initial Response:</strong> Within 14 calendar days of receiving your request, we will confirm receipt and provide an estimated delivery date</li>
                <li><strong>Final Response:</strong> Within 30 calendar days of receiving your request, we will provide the requested information or notify you of the reasons for refusal</li>
                <li><strong>Extension Period:</strong> If the request requires extensive research, we may extend the response period for up to an additional 30 days, with written notice to you</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-4">
                The timeframe begins from the date we receive your completed request and payment of applicable fees.
              </p>
            </CardContent>
          </Card>

          {/* 7. Fees and Costs */}
          <Card className="medical-card">
            <CardHeader>
              <CardTitle>7. Fees and Costs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-3">7.1 Request Fee</h3>
                <p className="text-sm mb-3">
                  A request fee of <strong>R50.00</strong> is payable upon submission of your request. This fee covers the costs of processing and administering your request.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-3">7.2 Reproduction and Delivery Costs</h3>
                <p className="text-sm mb-3">
                  If you request a record to be reproduced or delivered, you may be charged for:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li><strong>Photocopying:</strong> R1.50 per page</li>
                  <li><strong>Printing:</strong> R1.50 per page</li>
                  <li><strong>Electronic File Preparation:</strong> R100.00 per hour (or part thereof)</li>
                  <li><strong>Postage/Courier:</strong> Actual cost incurred</li>
                  <li><strong>Data Transfer (electronic):</strong> R100.00 per GB (or part thereof)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">7.3 Fee Waiver or Reduction</h3>
                <p className="text-sm">
                  We may waive or reduce fees for individuals who can demonstrate that payment would result in undue financial hardship. 
                  Please indicate this in your request with supporting documentation.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-3">7.4 Payment Methods</h3>
                <p className="text-sm">
                  Fees should be paid via bank transfer or other methods as directed by our Information Officer. 
                  Payment details will be provided upon request submission.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 8. Information Officer Contact Details */}
          <Card className="medical-card">
            <CardHeader>
              <CardTitle>8. Information Officer Contact Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm mb-4">
                To submit requests for access to information or for general inquiries about this Manual, please contact:
              </p>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-medical-primary mt-0.5" />
                  <div>
                    <p className="font-semibold">Position</p>
                    <p className="text-muted-foreground">Information Officer</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-medical-primary mt-0.5" />
                  <div>
                    <p className="font-semibold">Email</p>
                    <p className="text-muted-foreground">paia@ironledgermedmap.co.za</p>
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
              <div className="mt-6 pt-4 border-t">
                <p className="text-sm font-semibold mb-2">Deputy Information Officer:</p>
                <p className="text-sm text-muted-foreground">
                  Contact the Information Officer if a Deputy Information Officer has not been designated.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 9. Appeal Procedure */}
          <Card className="medical-card">
            <CardHeader>
              <CardTitle>9. Appeal Procedure</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm mb-4">
                If your request is refused or partially refused, you have the right to lodge an appeal within 30 calendar days of receiving the refusal notice.
              </p>
              <div>
                <h3 className="font-semibold mb-2">9.1 Grounds for Appeal</h3>
                <p className="text-sm mb-3">You may appeal if you believe:</p>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>The refusal was unlawful or unreasonable</li>
                  <li>The information was incorrectly identified as exempt</li>
                  <li>The decision was procedurally unfair</li>
                  <li>The appropriate response timeframe was not met</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">9.2 Appeal Process</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Submit a written appeal to our Information Officer, clearly stating the grounds for your appeal</li>
                  <li>Include the original request number and any reference details</li>
                  <li>Provide supporting documentation if applicable</li>
                  <li>We will review the appeal and respond within 30 days</li>
                </ol>
              </div>
              <div>
                <h3 className="font-semibold mb-2">9.3 Further Appeal</h3>
                <p className="text-sm">
                  If you are dissatisfied with the appeal decision, you may lodge a further appeal with the Information Regulator of South Africa.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 10. Information Regulator */}
          <Card className="medical-card">
            <CardHeader>
              <CardTitle>10. Information Regulator of South Africa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm mb-4">
                If you are dissatisfied with our response or our handling of your request, you may lodge a complaint with the Information Regulator:
              </p>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold">Organization</p>
                  <p className="text-muted-foreground">Information Regulator of South Africa</p>
                </div>
                <div>
                  <p className="font-semibold">Website</p>
                  <p className="text-muted-foreground">
                    <a href="https://www.justice.gov.za/inforeg/" target="_blank" rel="noopener noreferrer" className="text-medical-primary hover:underline">
                      https://www.justice.gov.za/inforeg/
                    </a>
                  </p>
                </div>
                <div>
                  <p className="font-semibold">Email</p>
                  <p className="text-muted-foreground">complaints@inforegulator.org.za</p>
                </div>
                <div>
                  <p className="font-semibold">Physical Address</p>
                  <p className="text-muted-foreground">
                    JD House, 27 Stiemens Street<br />
                    Braamfontein, Johannesburg, 2001<br />
                    South Africa
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 11. Request Form */}
          <Card className="medical-card">
            <CardHeader>
              <CardTitle>11. Request Form Template</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm mb-4">
                Use the following template when submitting your PAIA request:
              </p>
              <div className="bg-muted p-4 rounded border text-xs space-y-3">
                <p className="font-semibold text-sm">FORM FOR REQUESTING ACCESS TO A RECORD</p>
                <div>
                  <p className="font-semibold">1. Requester Details</p>
                  <p>Name: _______________________________________________</p>
                  <p>Email: _______________________________________________</p>
                  <p>Phone: _______________________________________________</p>
                  <p>Address: _______________________________________________</p>
                </div>
                <div>
                  <p className="font-semibold">2. Details of Record Requested</p>
                  <p>Record Description: ___________________________________</p>
                  <p>Date Range (if applicable): ____________________________</p>
                  <p>Reference Numbers: ____________________________________</p>
                </div>
                <div>
                  <p className="font-semibold">3. Reason for Request</p>
                  <p>___________________________________________________</p>
                </div>
                <div>
                  <p className="font-semibold">4. Preferred Format</p>
                  <p>☐ Electronic    ☐ Printed    ☐ Other: ________________</p>
                </div>
                <div>
                  <p className="font-semibold">5. Signature</p>
                  <p>Signature: ______________ Date: ______________</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Please print this form, complete all sections, and submit it along with the request fee to our Information Officer.
              </p>
            </CardContent>
          </Card>

          {/* 12. Compliance Statement */}
          <Card className="medical-card border-medical-primary/20 bg-medical-light/30">
            <CardHeader>
              <CardTitle className="text-medical-primary">Commitment to Transparency</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">
                MedMap is committed to the principles of transparency and access to information as set out in the Promotion of Access to Information Act, 2000. 
                This Manual demonstrates our commitment to facilitating lawful access to information and supporting public participation in governance and decision-making.
              </p>
              <p className="text-sm">
                We strive to provide timely, accurate, and helpful responses to all information requests, while balancing the need to protect sensitive information 
                and the rights of individuals and third parties.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

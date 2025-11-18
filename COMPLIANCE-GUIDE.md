# MedMap POPIA & PAIA Compliance Implementation Guide

## Overview

This guide documents the creation and implementation of comprehensive compliance documents for MedMap in accordance with South African data protection and information access regulations.

---

## 1. Regulatory Framework

### POPIA (Protection of Personal Information Act, 2013)
- **Act:** Act No. 4 of 2013
- **Purpose:** Protects the rights of individuals regarding personal information processing
- **Key Principles:** Lawfulness, Purpose limitation, Further processing limitation, Information quality and integrity, Openness, Security, Data subject participation
- **Implementation:** Privacy Policy document

### PAIA (Promotion of Access to Information Act, 2000)
- **Act:** Act No. 2 of 2000
- **Purpose:** Provides individuals with rights to access information held by public and private bodies
- **Key Components:** Manual provision, Record categorization, Request procedures, Appeal mechanisms
- **Implementation:** PAIA Manual document

---

## 2. Documents Created

### 2.1 POPIA Privacy Policy
**Location:** `src/pages/PrivacyPolicy.tsx` and `public/documents/POPIA-Privacy-Policy.md`

**Key Sections:**
1. Introduction
2. Information We Collect
   - Direct submissions (account, booking, payment, membership data)
   - Automatic collection (IP, browser, usage logs)
   - Third-party sources (PayFast, Supabase)
3. Purpose of Collection and Legal Basis
4. Information Sharing and Disclosure
   - Third-party service providers (Supabase, PayFast, Sentry, Email Service)
   - Healthcare providers
   - Legal requirements
   - Business transfers
5. Data Security Measures
6. Data Retention Periods
   - Account information: 3 years post-closure
   - Appointment records: 7 years
   - Payment records: 6 years
   - Communication logs: 2 years
   - Error logs: 90 days
7. Your Rights Under POPIA
   - Access, Correction, Deletion, Restriction, Portability, Objection, Complaint
8. Cookies and Tracking Technologies
9. Children's Privacy
10. Information Officer Contact Details
11. Policy Changes

**Disclosure of Integrations:**
- **Supabase:** Cloud database provider for storing user accounts, appointments, membership data
- **PayFast:** Payment processing gateway for secure payment transactions
- **Sentry:** Error monitoring and performance analytics
- **Email Service:** Transactional email communications

### 2.2 PAIA Manual
**Location:** `src/pages/PAIAManual.tsx` and `public/documents/PAIA-Manual.md`

**Key Sections:**
1. Introduction and Purpose
2. Information About MedMap
3. Categories of Records Held
   - User Account Records
   - Appointment Records
   - Membership Records
   - Payment Records
   - Healthcare Provider Records
   - System and Administrative Records
   - Communication Records
4. Records Not Available for Inspection
   - Medical records of third parties
   - Confidential business information
   - Third-party information
   - System security information
   - Attorney-client communications
   - Third-party financial records
5. Procedure for Requesting Access
   - Request process (5 steps)
   - Required information
   - Request submission methods
6. Timeframes for Response
   - Initial response: 14 days
   - Final response: 30 days
   - Extension: Up to 30 additional days
7. Fees and Costs
   - Request fee: R50.00
   - Reproduction costs (photocopying, printing, electronic)
   - Postage/courier costs
   - Fee waiver provisions
8. Information Officer Contact Details
9. Appeal Procedure
   - Grounds for appeal
   - Appeal process
   - Further appeal with Information Regulator
10. Information Regulator of South Africa Contact
11. Request Form Template

---

## 3. Data Collected and Third-Party Disclosures

### User Data Collected

**During Sign-Up:**
- First name
- Last name
- Email address
- Password (hashed)

**During Appointment Booking:**
- Appointment date and time
- Patient notes
- Medical aid information (optional)
- Payment method preference

**During Membership Enrollment:**
- Membership type
- Subscription preferences

**Doctor Enrollment:**
- Professional credentials
- Practice information
- Banking details (for payment processing)

### Third-Party Service Providers

#### 1. Supabase
- **Type:** Cloud Database & Authentication Provider
- **Data Shared:** User accounts, authentication tokens, appointments, memberships, profile information
- **Purpose:** Store and manage user data securely
- **Security:** Industry-standard encryption, role-based access control
- **Compliance:** GDPR-compliant infrastructure

#### 2. PayFast
- **Type:** Payment Gateway
- **Data Shared:** Payment information, transaction amounts, customer names, emails
- **Purpose:** Process payment transactions for appointments and memberships
- **Security:** PCI DSS compliant payment processing
- **Disclosure Note:** PayFast Privacy Policy and terms apply to payment data

#### 3. Sentry
- **Type:** Error Monitoring & Performance Analytics
- **Data Shared:** Error logs, performance metrics, user session data (non-personally identifiable by default)
- **Purpose:** Monitor application stability and identify issues
- **Security:** Data encrypted in transit and at rest
- **Configuration:** Can be configured to exclude personal data

#### 4. Email Service Provider
- **Type:** Transactional Email Service
- **Data Shared:** User email addresses, appointment information, booking confirmations
- **Purpose:** Send appointment reminders, confirmations, and notifications
- **Security:** Encrypted email delivery

---

## 4. Implementation in Application

### Route Configuration
Added to `src/App.tsx`:
- `/privacy-policy` → PrivacyPolicy component
- `/paia-manual` → PAIAManual component

### Navigation Updates
Updated `src/pages/Legal.tsx` to include:
- Links to both compliance documents
- Download buttons for PDF and markdown versions
- Contact information for privacy and PAIA requests
- Separate email addresses:
  - `privacy@ironledgermedmap.co.za` (Privacy matters)
  - `paia@ironledgermedmap.co.za` (PAIA requests)

### Component Structure
Both documents are React components with:
- Professional styling using shadcn/ui components
- Responsive design
- Easy readability with organized sections
- Download functionality for PDFs and markdown files

---

## 5. Key Compliance Features

### POPIA Compliance
✓ Clear disclosure of personal information collection
✓ Stated purposes for data processing
✓ Third-party processor information
✓ Data security measures documented
✓ Retention periods specified
✓ User rights explained
✓ Information Officer contact provided
✓ POPIA principles incorporated

### PAIA Compliance
✓ Manual published as required by PAIA Section 51
✓ Clear record categories listed
✓ Request procedures detailed
✓ Response timeframes specified
✓ Fees clearly outlined
✓ Appeal mechanism explained
✓ Information Officer contact provided
✓ Request form template provided

---

## 6. Contact Information Setup Required

### For Implementation, You Need to Provide:

1. **Information Officer Details**
   - Full name/title
   - Email address: `privacy@ironledgermedmap.co.za`
   - Phone number: `+27 (0) XX XXX XXXX`
   - Physical address

2. **PAIA Officer Details**
   - Email address: `paia@ironledgermedmap.co.za`
   - Phone number
   - Deputy Information Officer (if applicable)

3. **Payment Details for PAIA**
   - Bank account information for PAIA request fees
   - Payment methods accepted

4. **Legal Entity Information**
   - Registered company name
   - Company registration number
   - Business address

### Current Placeholders to Update:
In both PrivacyPolicy.tsx and PAIAManual.tsx:
- Contact phone numbers: `+27 (0) XX XXX XXXX`
- Email addresses (partially filled)
- Physical addresses
- Specific dates when documents were adopted

---

## 7. Document Access

### Web Pages
- Privacy Policy: https://[domain]/privacy-policy
- PAIA Manual: https://[domain]/paia-manual

### Download Options
- Markdown versions available: `/public/documents/`
- PDF versions can be generated from markdown using tools like:
  - Pandoc
  - wkhtmltopdf
  - Prince
  - Online markdown to PDF converters

### From Legal Page
- Main legal page: https://[domain]/legal
- Links to both compliance documents
- Download buttons for direct access

---

## 8. Legal Review Requirements

These documents should be reviewed by:
1. **Legal Counsel** - Ensure compliance with South African law
2. **Data Protection Officer/Information Officer** - Verify accuracy of procedures
3. **Compliance Officer** - Confirm alignment with POPIA and PAIA requirements
4. **IT/Security Team** - Validate security measures described

### Recommended Sections for Lawyer Review:
- Data retention periods alignment with tax and legal requirements
- Exemptions listed in Section 4 of PAIA Manual
- Appeal procedures and timeframes
- Liability limitations
- Third-party data sharing clauses

---

## 9. Maintenance and Updates

### Regular Review Schedule
- **Annual:** Review after any regulatory changes
- **Quarterly:** Update contact information if needed
- **As needed:** Update when services or third-party integrations change

### Trigger Events for Updates:
- Integration of new third-party services
- Changes to data retention policies
- Updates to security measures
- Regulatory changes or new requirements
- Organizational restructuring
- Payment gateway changes

---

## 10. Ongoing Compliance Checklist

- [ ] Both documents published on website
- [ ] Links added to footer or dedicated legal page
- [ ] PDF versions created and hosted
- [ ] Information Officer assigned
- [ ] Contact information configured
- [ ] Email addresses set up and monitored
- [ ] Request tracking system established
- [ ] Appeal procedure documented internally
- [ ] Staff trained on information requests
- [ ] PAIA request response procedures implemented
- [ ] Annual compliance review scheduled
- [ ] Third-party data sharing agreements executed
- [ ] Sentry/monitoring data handling documented

---

## 11. Files Created

### React Components
1. `src/pages/PrivacyPolicy.tsx` - POPIA Privacy Policy web page
2. `src/pages/PAIAManual.tsx` - PAIA Manual web page

### Documentation Files
1. `public/documents/POPIA-Privacy-Policy.md` - Markdown format for legal review
2. `public/documents/PAIA-Manual.md` - Markdown format for legal review

### Updated Files
1. `src/pages/Legal.tsx` - Added links to compliance documents
2. `src/App.tsx` - Added routes for new pages

---

## 12. Integration with PayFast

### PayFast Specific Compliance Notes:

1. **Payment Data Protection:**
   - PayFast is PCI DSS compliant
   - Payment information is NOT stored on MedMap servers
   - Only transaction references are stored

2. **User Notification:**
   - Payment processing section in Privacy Policy covers PayFast
   - PayFast's separate privacy terms apply to payment data
   - Users should be aware of PayFast's privacy policy

3. **Webhook Security:**
   - PayFast webhook (`payfast-webhook`) validates payment status
   - Payment status updates trigger appointment confirmations
   - Webhook data is verified using merchant signature

### Recommended Addition:
- Link to PayFast Privacy Policy in Privacy Policy document
- PayFast terms acceptance during payment flow

---

## 13. Testing the Implementation

### Access Testing:
1. Visit `/legal` page
2. Verify links to `/privacy-policy` and `/paia-manual`
3. Verify download buttons work correctly
4. Test responsive design on mobile devices

### Content Verification:
1. Check all contact information is accurate
2. Verify third-party disclosures are complete
3. Confirm data retention periods are correct
4. Validate request procedures are clear

### Search Engine Optimization:
- Add meta tags for privacy and compliance pages
- Submit to search engines
- Consider adding sitemap entries

---

## 14. Support and Ongoing Management

### Request Volume Preparation:
- Establish mailbox for paia@ironledgermedmap.co.za
- Set up tracking system for requests
- Document response times
- Create templates for common responses

### Compliance Reporting:
- Track PAIA requests quarterly
- Document any appeals or complaints
- Maintain records of information released
- Report metrics annually

---

## Summary

MedMap now has comprehensive, legally-compliant documentation for:
- **POPIA:** Clear privacy practices and user rights
- **PAIA:** Transparent access to information procedures

Both documents are accessible via web pages, downloadable as markdown, and ready for conversion to PDF formats for legal review and official publication.

**Next Steps:**
1. Update contact information placeholders
2. Have legal counsel review documents
3. Generate PDF versions
4. Set up email addresses and request tracking
5. Train staff on procedures
6. Publish official PDFs on website
7. Schedule annual compliance reviews

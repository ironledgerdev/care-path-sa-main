# MedMap - Complete Tech Stack Documentation

## 1. Executive Summary

**MedMap** is a comprehensive South African healthcare appointment booking and medical services platform. It's a full-stack web application designed for patients to book appointments with doctors, manage memberships, make payments, and for healthcare providers to manage their practices and patient interactions. The platform prioritizes POPIA (Protection of Personal Information Act) and PAIA (Promotion of Access to Information Act) compliance for South African regulations.

**Organization**: Iron Ledger Medical (ironledgermedmap.co.za)
**Project ID**: be49719b-7db9-4b97-af14-04a31caaef23
**Supabase Project ID**: ualtuoghgruwxefqynfg
**Development Platform**: Lovable (Lovable.dev)

---

## 2. Technology Stack Overview

### Frontend Architecture

```
React 18.3.1 + TypeScript 5.8.3
    ↓
Vite 5.4.19 (Build Tool)
    ↓
ShadcN/UI Components + Radix UI
    ↓
Tailwind CSS 3.4.17 (Styling)
    ↓
React Router DOM 6.30.1 (Routing)
```

### Backend Architecture

```
Supabase (Firebase Alternative)
    ├─ PostgreSQL Database
    ├─ Authentication (Auth)
    ├─ Edge Functions (Deno Runtime)
    ├─ Real-time Subscriptions
    └─ Storage

Third-Party Integrations:
    ├─ PayFast (Payment Processing)
    ├─ Sentry (Error Monitoring)
    ├─ Email Service Provider
    └─ Voice/Chat Widgets
```

---

## 3. Detailed Technology Breakdown

### 3.1 Frontend Dependencies

#### Core Framework
- **React**: 18.3.1 - UI component library
- **React DOM**: 18.3.1 - DOM rendering
- **TypeScript**: 5.8.3 - Type-safe JavaScript

#### Routing & Navigation
- **React Router DOM**: 6.30.1 - Client-side routing with modern routing features

#### State Management & Data Fetching
- **TanStack React Query**: 5.83.0 - Server state management, caching, and synchronization
- **React Hook Form**: 7.61.1 - Performant form handling with validation
- **Zod**: 3.25.76 - Schema validation and TypeScript inference

#### UI Framework & Components
- **shadcn/ui**: Component library built on Radix UI and Tailwind CSS
- **Radix UI**: Accessible, unstyled component primitives
  - Accordion, Alert Dialog, Avatar, Checkbox, Collapsible, Context Menu, Dialog
  - Dropdown Menu, Hover Card, Label, Menubar, Navigation Menu, Popover
  - Progress, Radio Group, Scroll Area, Select, Separator, Slider, Slot
  - Switch, Tabs, Toggle, Toggle Group, Tooltip
- **@hookform/resolvers**: 3.10.0 - Form validation with schema libraries

#### Styling & Design
- **Tailwind CSS**: 3.4.17 - Utility-first CSS framework
- **Tailwind Merge**: 2.6.0 - Merge Tailwind CSS classes without conflicts
- **Tailwind CSS Animate**: 1.0.7 - Smooth animation utilities
- **@tailwindcss/typography**: 0.5.16 - Prose component styling
- **PostCSS**: 8.5.6 - CSS transformation plugin system
- **AutoPrefixer**: 10.4.21 - Vendor prefix generation

#### Specialized UI Components
- **Recharts**: 2.15.4 - Composable charting library for data visualization
- **Embla Carousel**: 8.6.0 - Carousel component library
- **React Window**: 2.0.0 - Virtual scrolling for large lists
- **React Resizable Panels**: 2.1.9 - Resizable panel layouts
- **Sonner**: 1.7.4 - Toast notifications library
- **cmdk**: 1.1.1 - Command menu component (accessible command palette)
- **Input OTP**: 1.4.2 - OTP input field component
- **Vaul**: 0.9.9 - Drawer component (slide-out UI)

#### Date & Time Handling
- **date-fns**: 3.6.0 - Date utility library (alternative to moment.js)
- **React Day Picker**: 8.10.1 - Date picker component

#### Theme Management
- **next-themes**: 0.3.0 - Dark/Light mode management

#### Utilities
- **clsx**: 2.1.1 - Conditional className utility
- **Class Variance Authority**: 0.7.1 - CSS-in-JS utility for component variants
- **Lucide React**: 0.462.0 - Icon library with 462+ icons
- **Lovable Tagger**: 1.1.9 - Development tool for component tagging

#### Monitoring & Error Handling
- **Sentry React**: 8.55.0 - Error tracking and performance monitoring
- **Error Boundary**: Custom React component for error handling

### 3.2 Backend Technologies

#### Supabase Stack
- **Database**: PostgreSQL with Row-Level Security (RLS)
- **Authentication**: Supabase Auth (JWT-based)
- **API**: RESTful API auto-generated from database schema
- **Real-time**: WebSocket subscriptions via Realtime extension
- **Functions**: Edge Functions (Serverless, Deno runtime)
- **Storage**: File storage for documents and images

#### Edge Functions (Deno Runtime)
Deployed serverless functions:

1. **create-booking** - Create appointment bookings with conflict checking
2. **create-payfast-payment** - Initialize PayFast payment transactions
3. **create-payfast-membership** - Create membership subscriptions
4. **payfast-webhook** - Handle PayFast payment notifications
5. **send-email** - Send transactional emails
6. **submit-doctor-enrollment** - Process doctor registration
7. **admin-data** - Retrieve admin dashboard analytics
8. **generate-admin-invite** - Create admin invitation tokens
9. **verify-admin-invite** - Validate admin invitations
10. **verify-admin-password** - Validate admin credentials
11. **realtime-token** - Generate real-time access tokens
12. **fix-admin-account** - Admin account recovery tool

#### Third-Party Services

**PayFast**
- PCI DSS compliant payment gateway
- Payment processing for appointments and memberships
- Webhook integration for payment notifications
- Currency: ZAR (South African Rand)

**Sentry**
- Error tracking and performance monitoring
- Session tracking
- Performance profiling
- Environment: Multiple (dev, staging, production)

**Email Service**
- Transactional email delivery
- Appointment confirmations
- Payment receipts
- Password reset and verification

### 3.3 Development Tools

#### Build & Development
- **Vite**: 5.4.19 - Next-generation build tool
  - Dev server on port 8080
  - Hot Module Replacement (HMR) with WebSocket support
  - SWC transformation with @vitejs/plugin-react-swc
- **@vitejs/plugin-react-swc**: 3.11.0 - Fast JSX transpilation

#### Linting & Code Quality
- **ESLint**: 9.32.0 - Code linting and style checking
- **@eslint/js**: 9.32.0 - ESLint rules
- **typescript-eslint**: 8.38.0 - TypeScript support for ESLint
- **eslint-plugin-react-hooks**: 5.2.0 - React Hooks rules
- **eslint-plugin-react-refresh**: 0.4.20 - React Fast Refresh validation

#### Type Generation
- **@types/react**: 18.3.23 - React type definitions
- **@types/react-dom**: 18.3.7 - ReactDOM type definitions
- **@types/node**: 22.16.5 - Node.js type definitions

---

## 4. Database Schema

### Core Tables

#### 1. **profiles** (User Profiles)
```
- id (UUID, PK, FK auth.users)
- email (text, unique)
- first_name (text)
- last_name (text)
- phone (text)
- role (enum: 'patient' | 'doctor' | 'admin')
- created_at (timestamp)
- updated_at (timestamp)
```

#### 2. **doctors** (Approved Healthcare Providers)
```
- id (UUID, PK)
- user_id (UUID, FK profiles)
- name (text)
- speciality (text, e.g., 'General Practice', 'Cardiology')
- city (text)
- province (text)
- practice_name (text)
- phone (text)
- email (text)
- consultation_fee (numeric, cents)
- is_available (boolean, default: true)
- medical_aid_accepted (text array)
- created_at (timestamp)
- updated_at (timestamp)
```

#### 3. **doctor_schedules** (Doctor Availability)
```
- id (UUID, PK)
- doctor_id (UUID, FK doctors)
- day_of_week (enum: Mon-Sun)
- start_time (time)
- end_time (time)
- break_start (time, nullable)
- break_end (time, nullable)
- created_at (timestamp)
- updated_at (timestamp)
```

#### 4. **bookings** (Appointment Records)
```
- id (UUID, PK)
- user_id (UUID, FK profiles)
- doctor_id (UUID, FK doctors)
- appointment_date (date)
- appointment_time (time)
- status (enum: 'pending' | 'confirmed' | 'completed' | 'cancelled')
- payment_status (enum: 'pending' | 'paid' | 'refunded')
- patient_notes (text)
- consultation_fee (numeric, cents)
- booking_fee (numeric, cents)
- total_amount (numeric, cents)
- created_at (timestamp)
- updated_at (timestamp)
```

#### 5. **memberships** (User Subscriptions)
```
- id (UUID, PK)
- user_id (UUID, FK profiles)
- membership_type (enum: 'free' | 'standard' | 'premium')
- subscription_status (enum: 'active' | 'inactive' | 'cancelled')
- free_bookings_remaining (integer)
- payfast_subscription_id (text)
- start_date (date)
- renewal_date (date)
- created_at (timestamp)
- updated_at (timestamp)
```

#### 6. **pending_doctors** (Doctor Registration Queue)
```
- id (UUID, PK)
- user_id (UUID, FK profiles)
- name (text)
- speciality (text)
- credentials (text)
- practice_info (text)
- status (enum: 'pending' | 'approved' | 'rejected')
- rejection_reason (text, nullable)
- created_at (timestamp)
- updated_at (timestamp)
```

#### 7. **system_settings** (Admin Configuration)
```
- id (UUID, PK)
- setting_key (text, unique)
- setting_value (text)
- description (text)
- created_at (timestamp)
- updated_at (timestamp)
```

### Database Features
- **Row-Level Security (RLS)**: All tables have policies for data isolation
- **Automatic Timestamps**: created_at and updated_at on all tables
- **Cascading Deletes**: Foreign keys with ON DELETE CASCADE
- **Indexes**: On frequently queried columns (user_id, doctor_id, status)

---

## 5. Application Architecture

### 5.1 Frontend Structure

```
src/
├── App.tsx                          # Main app component with routing
├── index.css                        # Global styles
├── App.css                          # App-specific styles
│
├── pages/                           # Route-based page components
│   ├── Index.tsx                    # Home page
│   ├── DoctorSearch.tsx             # Doctor search/directory
│   ├── DoctorProfile.tsx            # Individual doctor profile
│   ├── BookAppointments.tsx         # Appointment booking flow
│   ├── BookingSuccess.tsx           # Confirmation page
│   ├── BookingHistory.tsx           # User's past bookings
│   ├── Memberships.tsx              # Membership plans
│   ├── PatientDashboard.tsx         # Patient dashboard
│   ├── Profile.tsx                  # User profile management
│   ├── DoctorEnrollment.tsx         # Doctor registration form
│   ├── DoctorPortal.tsx             # Doctor dashboard
│   ├── DoctorDashboard.tsx          # Doctor's analytics
│   ├── PracticeManagement.tsx       # Doctor practice settings
│   ├── Telemedicine.tsx             # Video consultation feature
│   ├── AdminDashboard.tsx           # Admin control panel
│   ├── AdminMashauPermits.tsx       # Medical permits management
│   ├── AdminSetup.tsx               # Initial admin setup
│   ├── CreateAdminAccount.tsx       # Admin account creation
│   ├── EmailVerification.tsx        # Email verification flow
│   ├── NotificationCenter.tsx       # Notification management
│   ���── About.tsx                    # About page
│   ├── Team.tsx                     # Team information
│   ├── Contact.tsx                  # Contact form
│   ├── Support.tsx                  # Support/Help center
│   ├── Careers.tsx                  # Job listings
│   ├── Legal.tsx                    # Legal documents
│   ├── PrivacyPolicy.tsx            # POPIA compliance
│   ├── PAIAManual.tsx               # PAIA compliance
│   ├── NotFound.tsx                 # 404 page
│   └── [Testing/Debug Pages]        # Database test, Route test, etc.
│
├── components/                      # Reusable UI components
│   ├── ui/                          # shadcn/ui components
│   │   ├── accordion.tsx
│   │   ├── alert-dialog.tsx
│   │   ├── alert.tsx
│   │   ├── avatar.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── checkbox.tsx
│   │   ├── command.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── form.tsx
│   │   ├── hover-card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── menubar.tsx
│   │   ├── navigation-menu.tsx
│   │   ├── popover.tsx
│   │   ├── progress.tsx
│   │   ├── radio-group.tsx
│   │   ├── scroll-area.tsx
│   │   ├── select.tsx
│   │   ├── separator.tsx
│   │   ├── sidebar.tsx
│   │   ├── slider.tsx
│   │   ├── switch.tsx
│   │   ├── tabs.tsx
│   │   ├── textarea.tsx
│   │   ├── toast.tsx
│   │   ├── toaster.tsx
│   │   ├── toggle.tsx
│   │   ├── tooltip.tsx
│   │   └── sonner.tsx
│   │
│   ├── admin/                       # Admin-specific components
│   │   ├── AdminStats.tsx           # Dashboard statistics
│   │   ├── CreateUserTab.tsx        # User creation interface
│   │   ├── PendingDoctorsTab.tsx    # Doctor approval queue
│   │   └── AdminRoleManager.tsx     # Role management
│   │
│   ├── doctor/                      # Doctor-specific components
│   │   ├── DoctorEnrollmentForm.tsx # Doctor registration
│   │   └── DoctorCard.tsx           # Doctor display card
│   │
│   ├── notifications/               # Notification system
│   │   ├── NotificationCenter.tsx   # Notification hub
│   │   ├── NotificationItem.tsx     # Individual notification
│   │   ├── NotificationFilters.tsx  # Filter logic
│   │   └── NotificationService.tsx  # Service layer
│   │
│   ├── optimized/                   # Performance-optimized components
│   │   ├── LazyImage.tsx            # Lazy-loaded images
│   │   ├── OptimizedAdminDashboard.tsx
│   │   ├── OptimizedDoctorCard.tsx
│   │   └── [Other optimized components]
│   │
│   ├── auth/                        # Authentication components
│   │   └── AuthModal.tsx            # Login/signup modal
│   │
│   ├── ErrorBoundary.tsx            # Error handling wrapper
│   ├── Header.tsx                   # Navigation header
│   ├── HeroSection.tsx              # Landing page hero
│   ├── FloatingButtons.tsx          # Floating action buttons
│   ├── VoiceInterface.tsx           # Voice assistant feature
│   ├── LiveChatWidget.tsx           # Live chat support
│   ├── AdminGuard.tsx               # Admin route protection
│   ├── AdminAccess.tsx              # Admin access control
│   └── [Additional UI Components]
│
├── hooks/                           # Custom React hooks
│   ├── useAuth.tsx                  # Authentication state
│   ├── use-mobile.tsx               # Mobile detection
│   ├── use-toast.ts                 # Toast notifications
│   ├── useDoctorProfile.ts          # Doctor data fetching
│   ├── useBookingFlow.ts            # Booking logic
│   └── [Additional hooks]
│
├── backend/                         # Backend data layer
│   ├── client.ts                    # Supabase client exports
│   ├── functions.ts                 # Edge function helpers
│   ├── realtime.ts                  # Real-time subscriptions
│   ├── storage.ts                   # File storage operations
│   ├── repositories/                # Data access objects (DAOs)
│   │   ├── profiles.ts              # User profile operations
│   │   ├── doctors.ts               # Doctor operations
│   │   ├── bookings.ts              # Booking operations
│   │   ├── memberships.ts           # Membership operations
│   │   └── system.ts                # System settings
│   └── index.ts                     # Backend exports
│
├── integrations/                    # Third-party integrations
│   ├── sentry/
│   │   └── index.ts                 # Error monitoring
│   └── supabase/
│       ├── client.ts                # Supabase client setup
│       └── types.ts                 # Generated TypeScript types
│
├── lib/                             # Utility functions
│   └── utils.ts                     # Helpers (cn utility, etc.)
│
└── utils/                           # Application utilities
    ├── notificationService.ts       # Notification logic
    ├── bundleOptimizer.ts           # Bundle optimization
    ├── patchResizeObserver.ts       # Polyfill for ResizeObserver
    └── [Additional utilities]
```

### 5.2 Routing Structure

**Public Routes:**
- `/` - Home
- `/memberships` - Membership plans
- `/about` - About page
- `/team` - Team information
- `/legal` - Legal documents
- `/privacy-policy` - POPIA Privacy Policy
- `/paia-manual` - PAIA Manual
- `/doctor-enrollment` - Doctor registration
- `/search` - Doctor search
- `/doctor/:doctorId` - Doctor profile
- `/book/:doctorId` - Booking form
- `/telemedicine` - Video consultation
- `/support` - Support center
- `/careers` - Jobs
- `/contact` - Contact form

**Protected Routes (Authenticated):**
- `/dashboard` - Patient dashboard
- `/profile` - User profile
- `/book-appointments` - Appointment booking
- `/booking-history` - Past bookings
- `/doctor` - Doctor dashboard
- `/doctor-portal` - Doctor portal
- `/practice-management` - Practice settings
- `/bookings` - Booking management

**Admin Routes (Role-Protected):**
- `/admin` - Admin dashboard
- `/admin-setup` - Initial setup
- `/create-admin-account` - Account creation
- `/admin-mashau-permits` - Medical permits

### 5.3 State Management Strategy

**Authentication State** (useAuth Hook)
- User object (Supabase Auth)
- Session management
- Role-based access control
- Local admin session override (development)

**Server State** (React Query)
- Doctor listings with filters
- Appointment data
- Membership information
- Booking history
- Admin analytics

**UI State** (Local React State)
- Modal/dialog visibility
- Form inputs
- Loading states
- Error messages

**Persistence**
- localStorage: Auth tokens, preferences, admin flag
- Session storage: Temporary form data

---

## 6. Backend Architecture (Supabase)

### 6.1 Authentication Flow

```
User Registration/Login
    ↓
Supabase Auth (JWT tokens)
    ↓
Create/Update Profile in profiles table
    ↓
Set role (patient | doctor | admin)
    ↓
Store session in localStorage
```

### 6.2 Key Business Logic

#### Appointment Booking Process
1. User selects doctor and available slot
2. `create-booking` Edge Function invoked
3. Check for double-booking conflicts
4. Calculate fees (consultation + booking fee)
5. Apply membership discounts (premium users)
6. Create booking record with status: pending
7. Trigger payment if booking_fee > 0
8. Return booking confirmation

#### Payment Processing (PayFast Integration)
1. Initiate payment via `create-payfast-payment` Edge Function
2. Send user to PayFast payment gateway
3. PayFast webhook returns to `payfast-webhook` function
4. Webhook verifies signature and updates booking
5. Update payment_status in bookings table
6. Send confirmation email

#### Doctor Enrollment
1. Doctor fills enrollment form
2. Create record in `pending_doctors` table
3. `submit-doctor-enrollment` Edge Function processes
4. Send verification email
5. Admin reviews and approves
6. Move to `doctors` table once approved
7. Send acceptance/rejection email

#### Membership Management
1. User selects membership tier (free/standard/premium)
2. If premium: create PayFast subscription via `create-payfast-membership`
3. Store subscription details
4. Premium benefits: free_bookings_remaining counter
5. Each booking decrements counter if subscription active

#### Real-Time Features
- Doctor availability updates (WebSocket)
- Notification updates (WebSocket)
- Chat messages (WebSocket)
- Booking status changes

### 6.3 Row-Level Security (RLS) Policies

**profiles table:**
- Users can read/update own profile
- Admins can read all profiles
- Public can read basic info (first_name, last_name, email)

**doctors table:**
- Everyone can read approved doctors
- Doctors can update own record
- Admins can manage all records

**bookings table:**
- Users can read own bookings
- Doctors can read own doctor's bookings
- Admins can read all bookings

**memberships table:**
- Users can read own membership
- Admins can read all memberships

---

## 7. Edge Functions (Serverless Backend)

### Function Deployment

**Runtime:** Deno
**Format:** TypeScript
**Environment:** Supabase Edge Functions
**Configuration:** supabase/config.toml

### Function Details

#### create-booking
- **Purpose:** Create appointment booking with validations
- **Auth:** JWT required
- **Inputs:** doctor_id, appointment_date, appointment_time, patient_notes
- **Logic:**
  - Verify user authentication
  - Check doctor existence and fee
  - Prevent double-booking (ACID transaction)
  - Apply membership discounts
  - Create booking record
  - Decrement free_bookings_remaining
- **Returns:** Booking object or error

#### payfast-webhook
- **Purpose:** Handle PayFast payment notifications
- **Auth:** Signature verification (no JWT)
- **Inputs:** PayFast webhook payload
- **Logic:**
  - Verify webhook signature with merchant key
  - Update booking payment_status
  - Update subscription if applicable
  - Trigger email notification
  - Log transaction

#### create-payfast-payment
- **Purpose:** Initialize payment transaction
- **Auth:** JWT required
- **Inputs:** booking_id, amount
- **Returns:** PayFast redirect URL

#### send-email
- **Purpose:** Send transactional emails
- **Auth:** JWT required
- **Inputs:** recipient, subject, template, data
- **Sends:** Booking confirmations, password resets, etc.

#### admin-data
- **Purpose:** Retrieve admin dashboard analytics
- **Auth:** Admin role verification
- **Returns:** User counts, revenue, bookings stats, etc.

#### generate-admin-invite
- **Purpose:** Create admin invitation tokens
- **Auth:** Existing admin
- **Inputs:** email
- **Returns:** Invitation token + link

#### verify-admin-invite
- **Purpose:** Validate and process invitations
- **Inputs:** token, password
- **Creates:** Admin account from invitation

#### submit-doctor-enrollment
- **Purpose:** Process doctor registration
- **Inputs:** Doctor details
- **Creates:** pending_doctors record
- **Sends:** Verification email

---

## 8. Deployment & DevOps

### Development Environment
- **Port:** 8080
- **HMR Protocol:** WebSocket Secure (WSS)
- **Dev Server:** Vite dev server
- **Environment Variables:** .env file (Lovable managed)

### Build Process
```bash
npm run build    # Production build
npm run dev      # Development server
npm run preview  # Preview production build
npm run lint     # ESLint check
```

### Deployment
- **Frontend:** Deployed via Lovable platform (automatic)
- **Backend:** Supabase hosted (serverless)
- **Database:** Supabase PostgreSQL (managed)
- **Edge Functions:** Deployed via supabase CLI or GitHub Actions

### GitHub Actions CI/CD
- **Workflow:** Deploy Supabase admin-data Function
- **Trigger:** Push to ai_main_885320a640e6 branch
- **Secrets Required:**
  - SUPABASE_ACCESS_TOKEN
  - SUPABASE_PROJECT_REF
  - SUPABASE_SERVICE_ROLE
  - SUPABASE_URL

---

## 9. Third-Party Integrations

### PayFast (Payment Gateway)
- **Type:** PCI DSS compliant payment processor
- **Region:** South Africa (ZAR currency)
- **Integration Points:**
  - Booking payment processing
  - Membership subscription creation
  - Webhook for payment confirmations
- **Security:** Merchant key signature verification

### Sentry (Error Monitoring)
- **Type:** Real-time error tracking
- **Features:**
  - Error capture and grouping
  - Performance monitoring
  - Session replay
  - User feedback
- **Integration:** @sentry/react SDK
- **Configuration:** Via Sentry dashboard

### Email Service Provider
- **Purpose:** Transactional emails
- **Templates:**
  - Appointment confirmations
  - Payment receipts
  - Doctor enrollment notifications
  - Password resets
  - Admin invitations

### Voice Interface
- **Feature:** Voice assistant for navigation
- **Implementation:** Custom VoiceInterface component
- **Tech:** Web Audio API

### Live Chat Widget
- **Feature:** Real-time customer support
- **Implementation:** Custom LiveChatWidget component
- **Tech:** WebSocket communication

---

## 10. Key Features Implemented

### Patient Features
- ✅ Doctor search with filters (city, speciality)
- ✅ Doctor profiles and availability
- ✅ Appointment booking with conflict prevention
- ✅ Online payment via PayFast
- ✅ Booking history and cancellation
- ✅ Membership plans (free, standard, premium)
- ✅ Membership management and renewal
- ✅ Email notifications and confirmations
- ✅ User profile management
- ✅ Telemedicine video consultation support
- ✅ Appointment reminders

### Doctor Features
- ✅ Online enrollment and application
- ✅ Profile management and availability scheduling
- ✅ Appointment management
- ✅ Patient list and notes
- ✅ Booking analytics and revenue tracking
- ✅ Practice management settings
- ✅ Availability scheduling with breaks
- ✅ Medical aid acceptance management

### Admin Features
- ✅ User management (create, edit, delete)
- ✅ Doctor approval/rejection workflow
- ✅ Pending doctor review queue
- ✅ System analytics dashboard
- ✅ Revenue and booking statistics
- ✅ Medical permits (Mashau) management
- ✅ System settings configuration
- ✅ Admin invitation system
- ✅ Role-based access control

### Compliance Features
- ✅ POPIA (Privacy Act) compliance
- ✅ PAIA (Access to Information) compliance
- ✅ Privacy policy documentation
- ✅ Data retention policies
- ✅ Third-party disclosure documentation
- ✅ User rights and request procedures
- ✅ Information officer contact information
- ✅ PAIA request forms

### Technical Features
- ✅ Error boundary and error handling
- ✅ Error tracking (Sentry)
- ✅ Lazy-loaded pages for performance
- ✅ Optimized components with React.memo
- ✅ Virtual scrolling for large lists
- ✅ Image lazy loading
- ✅ Dark/light theme support
- ✅ Responsive design (mobile-first)
- ✅ Real-time notifications
- ✅ Voice interface support
- ✅ Accessibility (WCAG compliant)

---

## 11. Performance Optimizations

### Frontend Optimizations
- **Code Splitting:** Lazy-loaded route pages
- **Component Optimization:** React.memo on expensive components
- **Image Optimization:** LazyImage component with intersection observer
- **Virtual Scrolling:** React Window for large doctor lists
- **Bundle Analysis:** Bundle optimizer utility
- **CSS Optimization:** Tailwind CSS purging unused styles
- **Caching:** React Query with configurable cache times

### Backend Optimizations
- **Database Indexing:** On frequently queried columns
- **Edge Function Caching:** Response caching where applicable
- **Query Optimization:** Selective field selection
- **Rate Limiting:** At Supabase API level

---

## 12. Security Measures

### Authentication & Authorization
- JWT-based authentication (Supabase Auth)
- Row-Level Security (RLS) on all tables
- Role-based access control (RBAC)
- Protected API endpoints

### Data Protection
- Encrypted password storage (bcrypt via Supabase)
- HTTPS-only connections
- CORS configuration for API calls
- SQL injection prevention (parameterized queries)

### Third-Party Security
- PayFast signature verification
- Email verification for account creation
- Admin invitation tokens
- Webhook signature validation

### Monitoring & Logging
- Sentry error tracking
- Server-side logging
- Request monitoring
- Performance tracking

---

## 13. Compliance & Legal

### South African Regulations
- **POPIA (Protection of Personal Information Act, 2013)**
  - Privacy policy published
  - Lawful processing basis documented
  - Data retention periods specified
  - User rights implemented
- **PAIA (Promotion of Access to Information Act, 2000)**
  - PAIA manual published
  - Request procedures documented
  - Response timeframes specified
  - Appeal mechanism defined

### Data Processing
- Clear disclosure of third-party processors
- PayFast payment data handling
- Sentry error monitoring with PII exclusion
- Email service provider agreements
- Retention periods: 3-7 years depending on data type

---

## 14. Environment Variables

### Required Frontend Variables
```
VITE_SUPABASE_URL=https://[project].supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=[anon-key]
VITE_SENTRY_DSN=[sentry-dsn]
VITE_ADMIN_EMAIL=[dev-admin-email]
VITE_ADMIN_PASSWORD=[dev-admin-password]
```

### Required Backend Variables (Supabase Secrets)
```
SUPABASE_URL=[project-url]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]
PAYFAST_MERCHANT_ID=[merchant-id]
PAYFAST_MERCHANT_KEY=[merchant-key]
PAYFAST_PASSPHRASE=[passphrase]
PAYFAST_WEBHOOK_URL=[webhook-endpoint]
EMAIL_SERVICE_API_KEY=[email-key]
SMTP_HOST=[smtp-host]
SMTP_PORT=[smtp-port]
SMTP_USER=[smtp-user]
SMTP_PASS=[smtp-pass]
```

---

## 15. File Sizes & Metrics

### Build Output
- **JavaScript Bundle:** Optimized with code splitting
- **CSS:** Tailwind CSS minified (unused styles purged)
- **Images:** Lazy-loaded for performance

### Database
- **Project ID:** ualtuoghgruwxefqynfg
- **Tables:** 7 main tables + auth.users
- **Estimated Size:** Grows with bookings and user data

---

## 16. Development Workflow

### Local Development
```bash
# Clone repository
git clone [repo-url]
cd [project]

# Install dependencies
npm install

# Start dev server
npm run dev

# Visit http://localhost:8080
```

### Code Style & Standards
- **Language:** TypeScript (strict mode disabled for flexibility)
- **Linting:** ESLint with recommended config
- **Formatting:** Tailwind CSS class organization
- **Component Pattern:** Functional components with hooks

### Version Control
- **Platform:** GitHub
- **Branches:** Main branch + feature branches
- **CI/CD:** GitHub Actions for Edge Function deployment

---

## 17. Database Migrations

### Migration System
- **Tool:** Supabase migrations
- **Language:** SQL
- **Location:** supabase/migrations/
- **Applied:** On deployment via supabase CLI

### Migration Strategy
- Schema versioning with timestamps
- Idempotent migrations (CREATE TABLE IF NOT EXISTS)
- RLS policy definitions
- Index creation and optimization

---

## 18. Testing & Quality Assurance

### Testing Strategy
- Component testing (potential addition)
- Integration testing for Edge Functions
- Manual testing through UI
- Error monitoring via Sentry

### Debug Pages
- `/route-test` - Route navigation testing
- `/database-test` - Database connectivity
- `/fix-admin-account` - Admin recovery
- `/manual-admin-setup` - Manual setup tools

---

## 19. Known Constraints & Limitations

1. **Admin Authentication:** Local environment variable override for development
2. **Membership Logic:** Free bookings counter per subscription type
3. **Double Booking Prevention:** Time-slot specific, same doctor
4. **Real-time Features:** Limited by Supabase WebSocket subscriptions
5. **File Uploads:** Limited by Supabase storage tier

---

## 20. Future Enhancement Opportunities

- [ ] Video consultation integration (Jitsi/Twilio)
- [ ] SMS notifications
- [ ] Advanced analytics dashboard
- [ ] AI-powered doctor recommendations
- [ ] Insurance integration
- [ ] Mobile native apps (React Native)
- [ ] Multi-language support
- [ ] Advanced appointment scheduling (recurring, recurring patterns)
- [ ] Prescription management
- [ ] Patient health records
- [ ] Telehealth capability expansion

---

## 21. Support & Maintenance

### Contact Information
- **Privacy Matters:** privacy@ironledgermedmap.co.za
- **PAIA Requests:** paia@ironledgermedmap.co.za
- **General Support:** [support-email-to-configure]

### Regular Maintenance
- **Database Backups:** Supabase automatic backups
- **Security Updates:** NPM package updates
- **Compliance Reviews:** Annual POPIA/PAIA review
- **Performance Monitoring:** Sentry continuous monitoring

---

## 22. Summary Table

| Aspect | Technology |
|--------|------------|
| **Language** | TypeScript 5.8.3 |
| **Frontend Framework** | React 18.3.1 |
| **UI Library** | shadcn/ui + Radix UI |
| **Styling** | Tailwind CSS 3.4.17 |
| **Build Tool** | Vite 5.4.19 |
| **Routing** | React Router 6.30.1 |
| **State Management** | React Query 5.83.0 |
| **Form Handling** | React Hook Form 7.61.1 |
| **Database** | PostgreSQL (Supabase) |
| **Backend API** | Supabase REST API |
| **Serverless Functions** | Deno (Supabase Edge Functions) |
| **Authentication** | Supabase Auth (JWT) |
| **Payment Gateway** | PayFast (PCI DSS) |
| **Error Tracking** | Sentry 8.55.0 |
| **Charts/Analytics** | Recharts 2.15.4 |
| **Icons** | Lucide React 0.462.0 |
| **Notifications** | Sonner 1.7.4 + Custom system |
| **Compliance** | POPIA + PAIA (South Africa) |
| **Deployment** | Lovable (Frontend) + Supabase (Backend) |

---

**Document Version:** 1.0
**Last Updated:** 2025
**Status:** Complete & Active Development

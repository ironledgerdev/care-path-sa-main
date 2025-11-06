import React from 'npm:react@18.3.1'
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'
import { Resend } from 'npm:resend@4.0.0'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Import email templates
import { UserVerificationEmail } from './_templates/user-verification.tsx'
import { UserWelcomeEmail } from './_templates/user-welcome.tsx'
import { DoctorPendingEmail } from './_templates/doctor-pending.tsx'
import { DoctorApprovedEmail } from './_templates/doctor-approved.tsx'
import { DoctorUnderReviewEmail } from './_templates/doctor-under-review.tsx'

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('Email function called with method:', req.method);

  try {
    const body = await req.json();
    console.log('Email request body:', body);

    const { type, data: emailData } = body;

    let html = '';
    let subject = '';
    let to = '';

    switch (type) {
      case 'user_verification':
        const { user_name, user_email, verification_link } = emailData;
        html = await renderAsync(
          React.createElement(UserVerificationEmail, {
            user_name,
            user_email,
            verification_link
          })
        );
        subject = 'Verify Your MedMap Account';
        to = user_email;
        break;

      case 'doctor_under_review':
        const { doctor_name, doctor_email, practice_name, speciality, license_number } = emailData;
        html = await renderAsync(
          React.createElement(DoctorUnderReviewEmail, {
            doctor_name,
            doctor_email,
            practice_name,
            speciality,
            license_number
          })
        );
        subject = 'Your Doctor Application is Under Review - MedMap';
        to = doctor_email;
        break;

      case 'user_welcome':
        html = await renderAsync(
          React.createElement(UserWelcomeEmail, {
            user_name: emailData.user_name,
            user_email: emailData.user_email,
          })
        );
        subject = 'Welcome to MedMap! Your healthcare journey starts here';
        to = emailData.user_email;
        break;

      case 'doctor_pending':
        html = await renderAsync(
          React.createElement(DoctorPendingEmail, {
            doctor_name: emailData.doctor_name,
            practice_name: emailData.practice_name,
            speciality: emailData.speciality,
            license_number: emailData.license_number,
          })
        );
        subject = 'Your practice application is under review - MedMap';
        to = emailData.doctor_email;
        break;

      case 'doctor_approved':
        html = await renderAsync(
          React.createElement(DoctorApprovedEmail, {
            doctor_name: emailData.doctor_name,
            practice_name: emailData.practice_name,
            speciality: emailData.speciality,
          })
        );
        subject = '🎉 Congratulations! Your practice has been approved';
        to = emailData.doctor_email;
        break;

      default:
        throw new Error(`Unknown email type: ${type}`);
    }

    console.log('Sending email to:', to);

    const { error } = await resend.emails.send({
      from: 'MedMap <noreply@ironledgermedmap.co.za>',
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      throw error;
    }

    console.log('Email sent successfully');

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Email sending error:', error);
    return new Response(
      JSON.stringify({
        error: {
          message: error.message,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

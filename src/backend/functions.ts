import { supabase, SUPABASE_URL } from './client';

async function invokeWithFallback<T = any>(name: string, body?: any): Promise<T> {
  // Primary: use supabase-js invoke
  try {
    const { data, error } = await supabase.functions.invoke<T>(name, { body });
    if (error) throw error;
    return data as T;
  } catch (primaryErr: any) {
    // Fallback: direct fetch to functions domain (helps in some dev/proxy cases)
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const host = new URL(SUPABASE_URL).host; // <project>.supabase.co
      const projectRef = host.split('.')[0];
      const fnUrl = `https://${projectRef}.functions.supabase.co/${name}`;

      const resp = await fetch(fnUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!resp.ok) throw new Error(`Function ${name} failed: ${resp.status} ${resp.statusText}`);
      return (await resp.json()) as T;
    } catch (fallbackErr) {
      throw primaryErr || fallbackErr;
    }
  }
}

// Specific helpers used across the app
export const EdgeFunctions = {
  invoke: invokeWithFallback,
  adminData: () => invokeWithFallback('admin-data'),
  createBooking: (payload: any) => invokeWithFallback('create-booking', payload),
  createPayfastPayment: (payload: any) => invokeWithFallback('create-payfast-payment', payload),
  createPayfastMembership: (payload: any) => invokeWithFallback('create-payfast-membership', payload),
  submitDoctorEnrollment: (payload: any) => invokeWithFallback('submit-doctor-enrollment', payload),
  sendEmail: (payload: any) => invokeWithFallback('send-email', payload),
  verifyAdminInvite: (payload: any) => invokeWithFallback('verify-admin-invite', payload),
  verifyAdminPassword: (payload: any) => invokeWithFallback('verify-admin-password', payload),
  realtimeToken: (payload: any) => invokeWithFallback('realtime-token', payload),
  generateAdminInvite: (payload: any) => invokeWithFallback('generate-admin-invite', payload),
};

export type { };

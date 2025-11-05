#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ualtuoghgruwxefqynfg.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.argv[2];

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('ERROR: Set SUPABASE_SERVICE_ROLE_KEY environment variable to your Supabase service role key.');
  process.exit(1);
}

if (!email) {
  console.error('Usage: node scripts/make-admin.js <email>');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  try {
    // Verify profile exists
    const { data: found, error: selectError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .limit(1);

    if (selectError) {
      console.error('Select error:', selectError.message || selectError);
      process.exit(2);
    }

    if (!found || found.length === 0) {
      console.error(`No profile found for email: ${email}`);
      process.exit(3);
    }

    // Update role to admin
    const { data: updated, error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'admin', updated_at: new Date().toISOString() })
      .eq('email', email)
      .select('id');

    if (updateError) {
      console.error('Update error:', updateError.message || updateError);
      process.exit(4);
    }

    console.log('Success: updated rows =', Array.isArray(updated) ? updated.length : 0);
    if (Array.isArray(updated) && updated.length > 0) console.log('Updated IDs:', updated.map(r => r.id).join(', '));
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(5);
  }
}

main();

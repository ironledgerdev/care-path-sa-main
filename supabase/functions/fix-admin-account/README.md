# Fix Admin Account Edge Function

This Edge Function helps fix admin accounts that failed verification by bypassing Row Level Security (RLS) policies.

## Purpose

When admin account creation fails with "new row violates row-level security policy" errors, this function can:
- Create missing admin profiles
- Update existing profiles to admin role
- Bypass RLS policies using service role privileges

## Deployment

To deploy this function to your Supabase project:

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project (replace with your project reference)
supabase link --project-ref your-project-ref

# Deploy the function
supabase functions deploy fix-admin-account
```

## Usage

The function is called from the frontend fix admin account page (`/fix-admin-account`) and expects:

```json
{
  "userId": "uuid-of-user",
  "email": "user@example.com", 
  "firstName": "First",
  "lastName": "Last"
}
```

## Response

Success response:
```json
{
  "success": true,
  "message": "Admin account fixed successfully!",
  "profile": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "First", 
    "lastName": "Last",
    "role": "admin"
  }
}
```

Error response:
```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details"
}
```

## Security

- Uses SUPABASE_SERVICE_ROLE_KEY for elevated privileges
- Bypasses RLS policies to fix admin accounts
- Only accessible via POST requests
- Validates required fields before processing

## Environment Variables Required

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key with bypass RLS permissions

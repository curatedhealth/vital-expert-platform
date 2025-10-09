# 🔐 Admin Account Setup - Cloud Supabase

## Current Configuration
- **Instance**: Cloud Supabase
- **URL**: https://xazinxsiglqokwfmogyk.supabase.co
- **User Email**: hicham.naim@curated.health
- **Password**: VitalExpert2024!

## Option 1: Manual Dashboard Setup (Recommended)

1. **Go to Supabase Dashboard**
   - URL: https://supabase.com/dashboard/project/xazinxsiglqokwfmogyk
   - Login with your Supabase account

2. **Navigate to Authentication**
   - Click "Authentication" in the left sidebar
   - Click "Users" tab

3. **Find the Admin User**
   - Look for: `hicham.naim@curated.health`
   - User ID: `ff8a31ab-f431-4f0f-9229-70d8a43d78a9`

4. **Confirm Email Manually**
   - Click on the user row
   - In the user details, click "Confirm Email" or set `email_confirmed_at`
   - Set `confirmed_at` to current timestamp

5. **Set Admin Role**
   - In user metadata, add:
     ```json
     {
       "role": "super_admin",
       "is_admin": true,
       "full_name": "Hicham Naim"
     }
     ```

## Option 2: SQL Script (Run in Supabase SQL Editor)

```sql
-- Confirm email and set admin role
UPDATE auth.users 
SET 
  email_confirmed_at = NOW(),
  confirmed_at = NOW(),
  raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "super_admin", "is_admin": true, "full_name": "Hicham Naim"}'::jsonb,
  updated_at = NOW()
WHERE email = 'hicham.naim@curated.health';

-- Create admin profile
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  role,
  is_admin,
  is_active,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'hicham.naim@curated.health'),
  'hicham.naim@curated.health',
  'Hicham Naim',
  'super_admin',
  true,
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  role = 'super_admin',
  is_admin = true,
  is_active = true,
  updated_at = NOW();
```

## Option 3: Disable Email Confirmation (Temporary)

1. **Go to Authentication Settings**
   - Dashboard → Authentication → Settings
   - Turn OFF "Enable email confirmations"
   - Save changes

2. **Create New User**
   - Use the registration form at `/register`
   - Email: hicham.naim@curated.health
   - Password: VitalExpert2024!

3. **Re-enable Email Confirmation**
   - Turn back ON "Enable email confirmations"

## After Setup

Once the email is confirmed, you can:
- Login at: http://localhost:3000/login
- Email: hicham.naim@curated.health
- Password: VitalExpert2024!

## Verification

Check if the user is properly set up:
```sql
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  u.raw_user_meta_data,
  p.role,
  p.is_admin
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'hicham.naim@curated.health';
```

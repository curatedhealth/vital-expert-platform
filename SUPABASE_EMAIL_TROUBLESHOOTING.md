# 🔧 Supabase Email Troubleshooting & Admin Setup

## 🚨 Problem Identified
Supabase email module is not working - password reset emails not being received.

## 🔍 Common Causes & Solutions

### 1. **SMTP Configuration Missing**
Supabase cloud instances need SMTP configuration for emails to work.

**Check in Supabase Dashboard:**
- Go to: https://supabase.com/dashboard/project/xazinxsiglqokwfmogyk
- Navigate to: Settings → Authentication → SMTP Settings
- If empty, you need to configure SMTP

### 2. **Email Provider Issues**
- Check spam/junk folders
- Verify email address is correct
- Some email providers block automated emails

### 3. **Supabase Rate Limiting**
- Free tier has email limits
- May be hitting daily email quotas

## 🚀 **IMMEDIATE SOLUTIONS**

### Option A: Disable Email Confirmation (Fastest)
1. **Supabase Dashboard** → Authentication → Settings
2. **Turn OFF** "Enable email confirmations"
3. **Turn OFF** "Enable email change confirmations"
4. **Save** changes
5. **Create admin user** via registration form

### Option B: Use SQL to Bypass Email (Recommended)
Run this in Supabase SQL Editor:

```sql
-- First, check if user exists
SELECT id, email, email_confirmed_at FROM auth.users 
WHERE email = 'hicham.naim@curated.health';

-- If user exists, confirm email manually
UPDATE auth.users 
SET 
  email_confirmed_at = NOW(),
  confirmed_at = NOW(),
  updated_at = NOW()
WHERE email = 'hicham.naim@curated.health';

-- If user doesn't exist, create with confirmed email
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  raw_app_meta_data,
  is_super_admin,
  last_sign_in_at
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'hicham.naim@curated.health',
  crypt('VitalExpert2024!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  NOW(),
  '{"full_name": "Hicham Naim", "role": "super_admin", "is_admin": true}'::jsonb,
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  true,
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  email_confirmed_at = NOW(),
  confirmed_at = NOW(),
  updated_at = NOW();

-- Create profile
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

### Option C: Configure SMTP (For Production)
If you want emails to work properly:

1. **Get SMTP credentials** from:
   - Gmail: Use App Passwords
   - SendGrid, Mailgun, or similar service
   - Your organization's SMTP server

2. **Configure in Supabase:**
   - Dashboard → Settings → Authentication
   - Fill in SMTP settings:
     - Host: smtp.gmail.com (for Gmail)
     - Port: 587
     - Username: your-email@gmail.com
     - Password: app-password
     - Sender email: your-email@gmail.com

## 🎯 **Recommended Action**

**For immediate access, use Option B (SQL approach)** - it's the most reliable way to get your admin account working right now.

## ✅ **After Setup**

Once the SQL is run, you can:
- Login at: http://localhost:3000/login
- Email: hicham.naim@curated.health
- Password: VitalExpert2024!

## 🔍 **Verification**

Check if everything worked:
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

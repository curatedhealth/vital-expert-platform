# Server Start Instructions

## Current Status
- All background dev servers have been killed
- Port 3000 is clear and ready
- All fixes are in place:
  - CSRF protection disabled for development
  - Rate limiting disabled for development
  - Admin page instant loading
  - Superadmin access granted to hicham.naim@curated.health

## How to Start the Server (MANUAL - CORRECT WAY)

### Option 1: Using Your Terminal (Recommended)

Open a new terminal tab/window and run:

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/apps/digital-health-startup"
npm run dev
```

Leave this terminal open and visible. You'll see server logs here.

To stop: Press `Ctrl+C` in the terminal

### Option 2: Using Cursor's Integrated Terminal

1. In Cursor, open a new terminal (Cmd+` or Terminal menu)
2. Run:
```bash
cd apps/digital-health-startup
npm run dev
```

## What to Test After Server Starts

1. **Sign In Test**
   - Go to: http://localhost:3000
   - Click "Sign In" button
   - It should work now (no more background server conflicts!)
   - Use either:
     - hicham.naim@curated.health (has superadmin)
     - hicham.naim@xroadscatalyst.com (needs superadmin - see below)

2. **Knowledge Domains Test**
   - After signing in, go to: http://localhost:3000/knowledge?tab=upload
   - Click "Knowledge Domain" dropdown
   - You should see **54 knowledge domains** organized by tier:
     - Tier 1 (Core): 15 domains
     - Tier 2 (Specialized): 24 domains
     - Tier 3 (Emerging): 15 domains

3. **File Upload Test**
   - Select a knowledge domain
   - Try uploading a file
   - Should work without CSRF or rate limit errors

4. **Feedback Dashboard Test**
   - Go to: http://localhost:3000/admin/feedback-dashboard
   - Should load instantly (admin route bypass)
   - Should show charts and test data

## If You Want to Add Second Superadmin

If you want to use hicham.naim@xroadscatalyst.com as superadmin:

1. **First**, log in with that email at least once (so user record is created)
2. **Then**, go to Supabase SQL Editor: https://supabase.com/dashboard/project/xazinxsiglqokwfmogyk/sql/new
3. **Run** the SQL from `ADD_SECOND_SUPERADMIN.sql`:

```sql
DO $$
DECLARE
  v_user_id UUID;
  v_platform_tenant_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'hicham.naim@xroadscatalyst.com'
  LIMIT 1;

  IF v_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role, tenant_id)
    VALUES (v_user_id, 'superadmin', v_platform_tenant_id)
    ON CONFLICT (user_id, tenant_id)
    DO UPDATE SET role = 'superadmin';

    RAISE NOTICE 'Granted superadmin to: hicham.naim@xroadscatalyst.com';
  ELSE
    RAISE NOTICE 'User not found. Please log in first.';
  END IF;
END $$;
```

## Troubleshooting

### If Sign In Still Doesn't Work

1. Verify no other servers running:
```bash
ps aux | grep -E "npm run dev|next dev" | grep -v grep
```

2. If any servers are running, kill them:
```bash
killall -9 node npm
```

3. Clear port 3000:
```bash
lsof -ti:3000 | xargs kill -9
```

4. Start fresh:
```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/apps/digital-health-startup"
npm run dev
```

### If Knowledge Domains Don't Show

1. Make sure you're logged in with hicham.naim@curated.health (has superadmin)
2. Hard refresh browser: `Cmd+Shift+R` (Mac)
3. Check browser console for errors (F12 -> Console tab)

## Emergency Cleanup

If things get messy again, run:

```bash
"/Users/hichamnaim/Downloads/Cursor/VITAL path/KILL_ALL_SERVERS.sh"
```

This will:
- Kill all Node processes
- Kill all npm processes
- Clear port 3000
- Verify everything is clean

## Important Notes

- **NEVER** run `npm run dev &` (the `&` makes it background)
- **ALWAYS** run in foreground in a dedicated terminal
- **ONE** server at a time
- **Ctrl+C** to stop cleanly when done
- Keep the terminal visible so you can see logs

## Files Reference

- [KILL_ALL_SERVERS.sh](KILL_ALL_SERVERS.sh) - Cleanup script
- [DEV_SERVER_MANAGEMENT.md](DEV_SERVER_MANAGEMENT.md) - Detailed server management guide
- [ADD_SECOND_SUPERADMIN.sql](ADD_SECOND_SUPERADMIN.sql) - Add xroadscatalyst email as superadmin
- [SETUP_SUPERADMIN_SIMPLE.sql](SETUP_SUPERADMIN_SIMPLE.sql) - Original superadmin setup
- [SETUP_SUPERADMIN_GUIDE.md](SETUP_SUPERADMIN_GUIDE.md) - Comprehensive superadmin guide

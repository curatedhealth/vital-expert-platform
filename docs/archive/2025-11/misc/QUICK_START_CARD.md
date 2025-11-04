# Quick Start Card

## Start Server (Copy & Paste)

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/apps/digital-health-startup"
npm run dev
```

**Important**: Keep terminal open. Press `Ctrl+C` to stop when done.

---

## Test Checklist

- [ ] Server started in terminal (foreground)
- [ ] Go to http://localhost:3000
- [ ] Click "Sign In" button - should work
- [ ] Sign in with: **hicham.naim@curated.health**
- [ ] Go to http://localhost:3000/knowledge?tab=upload
- [ ] See **54 knowledge domains** in dropdown
- [ ] Try uploading a file - should work
- [ ] Go to http://localhost:3000/admin/feedback-dashboard
- [ ] See charts and data - should load instantly

---

## Emergency Commands

```bash
# Kill all servers
killall -9 node npm

# Clear port 3000
lsof -ti:3000 | xargs kill -9

# Hard refresh browser
Cmd+Shift+R (Mac)
Ctrl+Shift+F5 (Windows)
```

---

## What Was Fixed

1. ✅ Admin page instant loading
2. ✅ CSRF protection disabled (development)
3. ✅ Rate limiting disabled (development)
4. ✅ Superadmin access granted
5. ✅ 54 knowledge domains ready
6. ✅ All background servers killed
7. ✅ Port 3000 cleared

---

## Credentials

**Primary (Has Superadmin)**:
- Email: hicham.naim@curated.health
- Use this to test!

**Secondary (Optional)**:
- Email: hicham.naim@xroadscatalyst.com
- Password: mzoud@2025
- To add superadmin: Log in first, then run [ADD_SECOND_SUPERADMIN.sql](ADD_SECOND_SUPERADMIN.sql)

---

## Documentation

- [START_SERVER_INSTRUCTIONS.md](START_SERVER_INSTRUCTIONS.md) - Detailed start guide
- [SESSION_CLEANUP_COMPLETE.md](SESSION_CLEANUP_COMPLETE.md) - What was fixed
- [DEV_SERVER_MANAGEMENT.md](DEV_SERVER_MANAGEMENT.md) - Best practices
- [KILL_ALL_SERVERS.sh](KILL_ALL_SERVERS.sh) - Emergency cleanup script

---

## Current Status

- **Dev Servers Running**: 0 ✅
- **Port 3000**: Clear ✅
- **Superadmin**: Granted ✅
- **Knowledge Domains**: 54 ready ✅
- **CSRF/Rate Limit**: Disabled for dev ✅

**System is ready for manual server startup!**

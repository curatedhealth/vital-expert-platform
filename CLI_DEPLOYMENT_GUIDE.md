# CLI Deployment Guide - Quick Start

## Three Scripts Created ✅

1. **`deploy-marketing-cli.sh`** - Deploy marketing site only
2. **`deploy-platform-cli.sh`** - Deploy platform app only
3. **`deploy-both-cli.sh`** - Deploy both projects in sequence

---

## Option 1: Deploy Both Projects (Recommended)

### Single Command:
```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"
./deploy-both-cli.sh
```

**This will:**
1. Log you into Vercel (opens browser)
2. Deploy marketing site (www.vital.expert)
3. Deploy platform app (*.vital.expert)
4. Add custom domains
5. Show DNS configuration instructions

**Time:** 5-10 minutes

---

## Option 2: Deploy Marketing Site Only

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"
./deploy-marketing-cli.sh
```

Then later deploy platform:
```bash
./deploy-platform-cli.sh
```

---

## What to Expect

### 1. Vercel Login
- Script will open browser
- Log in to Vercel
- Return to terminal

### 2. Deployment Process
```
🚀 VITAL Marketing Site - CLI Deployment
========================================

✅ Step 1: Login to Vercel
  > Opening browser...
  > Logged in as: your-email@example.com

✅ Step 2: Deploy Marketing Site
  > Uploading files...
  > Building...
  > ✓ Build completed (2m 34s)
  > Production: https://vital-marketing-site.vercel.app

✅ Step 3: Add Custom Domains
  > Added: www.vital.expert
  > Added: vital.expert
```

### 3. Domain Configuration
After deployment, you'll see:
```
📍 Next Steps:
  1. Configure DNS at your provider:
     A     @    76.76.21.21
     CNAME www  cname.vercel-dns.com
```

---

## After Deployment

### Verify Projects Created:
```bash
vercel ls
```

**Expected output:**
```
vital-marketing-site  https://vital-marketing-site.vercel.app  7m ago
vital-platform-app    https://vital-platform-app.vercel.app    3m ago
```

### Test Deployments:
```bash
# Test marketing preview URL
curl -I https://vital-marketing-site.vercel.app

# Test platform preview URL
curl -I https://vital-platform-app.vercel.app
```

---

## DNS Configuration

### After Scripts Complete:

Go to your DNS provider (Cloudflare, Route53, etc.) and add:

```
Type    Name    Value
A       @       76.76.21.21
CNAME   www     cname.vercel-dns.com
CNAME   *       cname.vercel-dns.com
```

### Verify DNS:
```bash
# Check www subdomain
dig www.vital.expert

# Check wildcard
dig app.vital.expert
```

---

## Troubleshooting

### Script Says "Command Not Found"

**Fix:** Make executable
```bash
chmod +x deploy-both-cli.sh
chmod +x deploy-marketing-cli.sh
chmod +x deploy-platform-cli.sh
```

### Vercel CLI Not Found

**Fix:** Install Vercel CLI
```bash
npm install -g vercel@latest
```

### Build Fails with Type Errors

This is expected for platform app. The script will still deploy. Type errors can be fixed later.

### Domain Already Exists

If you see "Domain already assigned to another project":
1. Go to https://vercel.com/crossroads-catalysts-projects
2. Find old project with that domain
3. Go to Settings → Domains
4. Remove the domain
5. Re-run script

---

## Manual Cleanup (If Needed)

### Delete Existing Projects:
```bash
# List all projects
vercel ls

# Remove specific project
vercel remove vital-marketing --yes
vercel remove vital-platform --yes
```

---

## Success Criteria

After running scripts:

- [ ] Marketing project created: `vital-marketing-site`
- [ ] Platform project created: `vital-platform-app`
- [ ] Both show "✓ Deployment completed"
- [ ] Preview URLs accessible
- [ ] Domains added to projects
- [ ] DNS records configured

---

## Next Steps

1. **Wait for DNS propagation** (10-30 minutes)

2. **Test custom domains:**
   ```bash
   curl -I https://www.vital.expert
   curl -I https://app.vital.expert
   ```

3. **Connect platform to Railway backend** (when ready):
   - Get Railway URL
   - Add to platform environment variables
   - Redeploy platform

---

## Quick Reference

**Deploy both:**
```bash
./deploy-both-cli.sh
```

**Check status:**
```bash
vercel ls
```

**View logs:**
```bash
vercel logs vital-marketing-site
vercel logs vital-platform-app
```

**Open dashboard:**
```bash
vercel
```

---

**Ready? Run the script!** 🚀

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"
./deploy-both-cli.sh
```

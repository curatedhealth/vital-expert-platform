# Phase 1 Quick Reference - Copy & Paste Values

## Vercel Project Configuration

**Project Name:**
```
vital-marketing
```

**Root Directory:**
```
apps/digital-health-startup
```

---

## Environment Variables (Copy These Exactly)

### Variable 1
**Name:**
```
NEXT_PUBLIC_SUPABASE_URL
```
**Value:**
```
https://xazinxsiglqokwfmogyk.supabase.co
```

### Variable 2
**Name:**
```
NEXT_PUBLIC_SUPABASE_ANON_KEY
```
**Value:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2ODkzNzgsImV4cCI6MjA1MDI2NTM3OH0.5qrfkThPewEuFize6meh47xngCvg_9FRKcepFZ7IxsY
```

### Variable 3
**Name:**
```
NEXT_PUBLIC_APP_URL
```
**Value:**
```
https://vital.expert
```

### Variable 4
**Name:**
```
NODE_ENV
```
**Value:**
```
production
```

---

## Custom Domains

**Primary Domain:**
```
vital.expert
```

**WWW Subdomain:**
```
www.vital.expert
```

---

## DNS Records

**A Record:**
```
Type:  A
Name:  @
Value: 76.76.21.21
TTL:   Auto (or 3600)
```

**CNAME Record:**
```
Type:  CNAME
Name:  www
Value: cname.vercel-dns.com
TTL:   Auto (or 3600)
```

---

## Quick Links

**Vercel Dashboard:**
https://vercel.com/crossroads-catalysts-projects

**Expected Preview URL Format:**
```
https://vital-marketing-[random-id].vercel.app
```

**Final Live URL:**
```
https://vital.expert
https://www.vital.expert
```

---

## Verification Commands

After deployment, run these to verify:

```bash
# Check DNS
dig vital.expert

# Test HTTPS
curl -I https://vital.expert

# Test page loads
curl https://vital.expert | grep "VITAL Expert"
```

---

**Ready to deploy? Follow:** [PHASE1_MARKETING_CHECKLIST.md](PHASE1_MARKETING_CHECKLIST.md)

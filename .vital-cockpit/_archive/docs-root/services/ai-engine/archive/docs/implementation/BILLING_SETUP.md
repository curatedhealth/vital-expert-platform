# 💳 Google Cloud Billing Setup for Cloud Run

## Current Status

✅ **Authenticated**: `hicham.naim@curated.health`  
✅ **Project Set**: `gen-lang-client-0512887204` (VITAL)  
❌ **Billing**: Needs to be enabled

---

## Why Billing is Required

Cloud Run requires billing to be enabled, even though:
- ✅ **Free tier available**: 2 million requests/month, 360K GB-seconds/month
- ✅ **Pay only for usage**: ~$0-5/month for low traffic
- ✅ **Scales to zero**: Free when idle

---

## Step 1: Link Billing Account

**Option A: Via Command Line**

```bash
# List billing accounts
gcloud billing accounts list

# Link billing to project
gcloud billing projects link gen-lang-client-0512887204 \
  --billing-account=YOUR_BILLING_ACCOUNT_ID
```

**Option B: Via Google Cloud Console**

1. Go to: https://console.cloud.google.com/billing
2. Select your billing account
3. Click "My projects"
4. Select project: `gen-lang-client-0512887204` (VITAL)
5. Click "Link" or "Change billing"

**Option C: Create New Billing Account**

1. Go to: https://console.cloud.google.com/billing
2. Click "Create account"
3. Follow the setup wizard
4. Link to project: `gen-lang-client-0512887204`

---

## Step 2: Enable APIs (After Billing)

Once billing is linked:

```bash
export PATH=/opt/homebrew/share/google-cloud-sdk/bin:"$PATH"

# Enable Cloud Run API
gcloud services enable run.googleapis.com

# Enable Cloud Build API
gcloud services enable cloudbuild.googleapis.com
```

---

## Step 3: Deploy to Cloud Run

After billing is enabled:

```bash
cd services/ai-engine
export DOCKERHUB_USERNAME=mzouda
export GCP_PROJECT_ID=gen-lang-client-0512887204
./deploy-cloud-run.sh
```

---

## Cost Estimates

### Cloud Run Free Tier
- **2 million requests/month** (free)
- **360K GB-seconds/month** (free)
- **2 million CPU-seconds/month** (free)

### Typical Usage (Low Traffic)
- **Requests**: < 100K/month = Free
- **Compute**: < 100GB-seconds/month = Free
- **Total cost**: $0/month (stays within free tier)

### If Exceeding Free Tier
- **Requests**: $0.40 per million requests
- **CPU**: $0.00002400 per GB-second
- **Memory**: $0.00000250 per GB-second
- **Network**: $0.12 per GB egress

**Example monthly cost for moderate traffic**: $0-5/month

---

## Alternative: Use Another Project

If you prefer to use a different project:

```bash
# List projects
gcloud projects list

# Set different project
gcloud config set project OTHER_PROJECT_ID

# Check if billing is enabled
gcloud billing projects describe OTHER_PROJECT_ID
```

---

## Verify Billing Status

```bash
# Check if billing is linked
gcloud billing projects describe gen-lang-client-0512887204

# Should show:
# billingAccountName: billingAccounts/XXXXX-XXXXX-XXXXX
# billingEnabled: true
```

---

## After Billing is Enabled

1. ✅ Enable APIs (run commands above)
2. ✅ Deploy: `./deploy-cloud-run.sh`
3. ✅ Get URL: `gcloud run services describe vital-ai-engine --format="value(status.url)"`
4. ✅ Test: `curl https://YOUR_URL/health`

---

**Need help? Check Google Cloud Console: https://console.cloud.google.com/billing**


# 💳 Billing Account Status

## Current Status

✅ **Project**: `gen-lang-client-0512887204` (VITAL)  
✅ **Billing Account Linked**: `01E0EF-9592B3-5929BE`  
❌ **Billing Enabled**: `false` (disabled)

---

## Issue

The billing account is linked but **disabled**. You need to enable it in the Google Cloud Console.

---

## Solution: Enable Billing Account

### Option 1: Via Google Cloud Console (Recommended)

1. **Go to Billing**: https://console.cloud.google.com/billing
2. **Select account**: `01E0EF-9592B3-5929BE`
3. **Click "Reopen account"** or **"Enable billing"**
4. **Add payment method** if prompted
5. **Verify status** shows as "Open"

### Option 2: Check Account Status

```bash
# Check billing status
gcloud billing accounts describe 01E0EF-9592B3-5929BE
```

---

## After Enabling Billing

Once billing is enabled:

```bash
export PATH=/opt/homebrew/share/google-cloud-sdk/bin:"$PATH"

# Enable Cloud Run API
gcloud services enable run.googleapis.com

# Enable Cloud Build API  
gcloud services enable cloudbuild.googleapis.com

# Deploy to Cloud Run
cd services/ai-engine
export DOCKERHUB_USERNAME=mzouda
export GCP_PROJECT_ID=gen-lang-client-0512887204
./deploy-cloud-run.sh
```

---

## Alternative: Use a Different Project

If you want to use a project that already has billing enabled:

```bash
# List projects
gcloud projects list

# Check which projects have billing enabled
gcloud billing projects list

# Switch to a project with active billing
gcloud config set project OTHER_PROJECT_ID
```

---

## Quick Check Commands

```bash
# Check project billing status
gcloud billing projects describe gen-lang-client-0512887204

# List all billing accounts
gcloud billing accounts list

# Describe billing account
gcloud billing accounts describe 01E0EF-9592B3-5929BE
```

---

**Next Step**: Go to https://console.cloud.google.com/billing and enable/reopen your billing account.


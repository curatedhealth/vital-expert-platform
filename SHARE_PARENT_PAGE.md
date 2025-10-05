# Share VITAL Path Master Database Hub with Integration

## ✅ One-Step Solution (Shares All 12 Databases)

Instead of sharing each database individually, share the **parent page** which contains all databases:

### Step-by-Step:

1. **Open the Master Database Hub**:
   https://www.notion.so/curatedhealth/VITAL-Path-Master-Database-Hub-2753dedf9856801d8217d2db804de0af

2. **Click the "Share" button** (top-right corner)

3. **In the Share dialog**:
   - Type: `VITAL Expert Sync`
   - Or search for your integration name
   - Select it when it appears

4. **Grant "Full access" or "Can edit"** permissions

5. **Click "Invite"** or "Share"

---

## ✅ What This Does

Sharing the parent page automatically gives the integration access to:
- ✅ All 12 databases inside it
- ✅ Any future databases you add
- ✅ No need to share each database individually

---

## 📋 The 12 Databases Inside

After sharing the parent page, these will all be accessible:

1. VITAL Path - Capabilities Registry
2. VITAL Path - Agents Registry
3. VITAL Path - Organizational Functions
4. VITAL Path - Departments
5. VITAL Path - Roles
6. VITAL Path - Responsibilities
7. VITAL Path - Competencies
8. VITAL Path - Prompts Library
9. VITAL Path - Tools Registry
10. VITAL Path - Workflows
11. VITAL Path - RAG Knowledge Base
12. VITAL Path - Jobs to Be Done

---

## 🔍 Verify After Sharing

Run this command to verify:

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"
node scripts/verify-all-databases.js
```

Should show ✅ for all Notion databases!

---

## 🚀 Then Sync Data

Once verified, sync your data:

```bash
# Sync capabilities (5 records)
npm run notion:sync-to -- --table=capabilities

# Sync agents (254 records)
npm run notion:sync-to -- --table=agents
```

---

## 💡 Alternative: Via Integration Settings

If Share button doesn't work:

1. Go to: https://www.notion.so/my-integrations
2. Click "VITAL Expert Sync"
3. Find "Content capabilities" or "Select pages"
4. Click "Add pages"
5. Search for: "VITAL Path - Master Database Hub"
6. Select it (this shares all databases inside)
7. Save

---

**The key**: Share the parent page, not each database individually!

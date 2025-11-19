# 🔗 Share Notion Database with Integration

## ⚠️ Current Error

The sync script is failing because the Notion database is not shared with your integration.

**Error**: `Could not find block with ID: 282345b0-299e-8165-833e-000bf89bbd84. Make sure the relevant pages and databases are shared with your integration.`

## ✅ Fix: Share Database with Integration

### Steps:

1. **Open your Notion database**
   - Go to: https://www.notion.so/282345b0299e8034bb48c2f26d5faac6
   - Or navigate to "VITAL Expert Sync" → "Prompts" database

2. **Open the "..." menu** (top right of the database view)

3. **Click "Add connections"**

4. **Search for your integration**
   - The integration name should be something like "VITAL Prompts Sync" 
   - Or look for the integration you created at https://www.notion.so/my-integrations

5. **Click the integration** and confirm

6. **Verify it's connected**
   - You should see the integration listed under "Connections" in the database

## 🧪 Test the Connection

After sharing, run the sync again:

```bash
cd apps/digital-health-startup
pnpm sync:notion
```

## 📋 Alternative: Check Integration Name

If you can't find your integration:

1. Go to https://www.notion.so/my-integrations
2. Find or create an integration
3. Make sure it has access to the workspace
4. Copy the integration token to `.env.local` as `NOTION_TOKEN`
5. Then share the database with that integration

## 🔍 Verify Integration Access

You can test if your integration has access by running:

```bash
cd apps/digital-health-startup
node -e "
const {Client} = require('@notionhq/client');
require('dotenv').config({path: '../../.env.local'});
const notion = new Client({auth: process.env.NOTION_TOKEN});
notion.databases.retrieve({database_id: '282345b0-299e-8165-833e-000bf89bbd84'})
  .then(d => console.log('✅ Access granted!', d.title?.[0]?.plain_text))
  .catch(e => console.log('❌ No access:', e.message));
"
```

If you see "✅ Access granted!", you're all set!


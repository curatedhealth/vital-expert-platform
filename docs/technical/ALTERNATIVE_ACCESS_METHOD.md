# Alternative Method: Grant Access via Share Menu

Since "VITAL Expert Sync" isn't appearing in Connections, try this alternative method:

## Method 1: Use Share Button (Recommended)

1. **Open Capabilities Database**: https://www.notion.so/c5240705aeb741aba5244e07addc9b6c

2. **Click "Share" button** (top-right, next to the three dots)

3. **In the Share menu:**
   - Look for "Invite" or "Add people, emails, groups, or integrations"
   - Start typing: `VITAL Expert Sync`
   - OR: Look for an "Integrations" section
   - Select "VITAL Expert Sync" when it appears

4. **Grant permissions**: Make sure it has "Full access" or "Can edit"

## Method 2: Add via Integration Settings

1. **Go to integration page**: https://www.notion.so/my-integrations

2. **Click on "VITAL Expert Sync"**

3. **Find "Content Capabilities" or "Select pages" section**

4. **Click "Select pages" or "Add pages"**

5. **Search for and select:**
   - VITAL Path - Capabilities Registry
   - VITAL Path - Agents Registry
   - (And all other VITAL Path databases)

6. **Save changes**

## Method 3: Verify Workspace Association

The integration must be associated with the correct workspace:

1. Go to: https://www.notion.so/my-integrations
2. Click "VITAL Expert Sync"
3. Check "Associated workspace" - should match where your databases are
4. If wrong workspace, you may need to:
   - Delete this integration
   - Create new one in correct workspace
   - Update API key in `.env.local`

## Method 4: Check Database Location

Your databases might be in a different workspace:

1. Open the Capabilities database
2. Look at the breadcrumb at top (shows workspace/page hierarchy)
3. Note the workspace name
4. Go to https://www.notion.so/my-integrations
5. Check if "VITAL Expert Sync" is in that same workspace

## Quick Test

After trying any method above, run:

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"
node scripts/verify-all-databases.js
```

Should show ✅ for Notion if successful.

## Still Not Working?

**Last Resort: Create New Integration**

1. Go to: https://www.notion.so/my-integrations
2. Create new integration:
   - Name: `VITAL-Sync-2` (different name)
   - Type: Internal
   - Workspace: (select the workspace where your databases are)
   - Capabilities: Read, Update, Insert
3. Copy the new API token
4. Update `.env.local`:
   ```
   NOTION_API_KEY=secret_your_new_token_here
   ```
5. Try granting access again

## Debug: Check API Token

Current token info:
- Starts with: `ntn_140540747822`
- Integration: VITAL Expert Sync
- Bot ID: a3617bac-96da-44c5-b110-da5ef48e7aeb

This token MUST match an integration in the SAME workspace as your databases.

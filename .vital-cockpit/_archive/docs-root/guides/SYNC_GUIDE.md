# Notion ↔ Supabase Sync Guide

## 🔄 How Updates Flow

```
YOU EDIT IN NOTION
        ↓
   Run Sync Script
        ↓
SUPABASE DATABASE (Updated)
        ↓
  FRONTEND (Auto-updates via real-time subscriptions)
```

---

## 📝 Common Workflows

### Scenario 1: Update an Agent in Notion

**Example**: Change agent tier from "Tier 1" to "Core"

1. **Edit in Notion**:
   - Open [Agents Database](https://www.notion.so/b81d88a6dfc2491aba0c5639c6885b2c)
   - Find your agent
   - Change `Tier` field to "Core"
   - Edit any other fields (status, description, etc.)

2. **Sync to Supabase**:
   ```bash
   node scripts/sync-from-notion.js --database=agents
   ```

3. **Frontend auto-updates** - No action needed! Changes appear instantly

### Scenario 2: Update Multiple Agents

1. **Bulk edit in Notion**:
   - Select multiple agents
   - Use Notion's bulk edit features
   - Change tiers, statuses, etc.

2. **Sync all changes**:
   ```bash
   node scripts/sync-from-notion.js --database=agents
   ```

3. **Verify on frontend** - Check your agents page

### Scenario 3: Update Capabilities

1. **Edit in Notion**:
   - Open [Capabilities Database](https://www.notion.so/c5240705aeb741aba5244e07addc9b6c)
   - Update descriptions, priorities, maturity levels

2. **Sync**:
   ```bash
   node scripts/sync-from-notion.js --database=capabilities
   ```

3. **Frontend reflects changes** immediately

### Scenario 4: Sync Everything

After making many changes across databases:

```bash
node scripts/sync-from-notion.js
```

This syncs all databases at once.

---

## 🚀 Quick Reference Commands

### Sync Single Database
```bash
# Agents
node scripts/sync-from-notion.js --database=agents

# Capabilities
node scripts/sync-from-notion.js --database=capabilities

# Others (when you have data)
node scripts/sync-from-notion.js --database=org_functions
node scripts/sync-from-notion.js --database=prompts
```

### Sync All Databases
```bash
node scripts/sync-from-notion.js
```

### Sync Supabase → Notion (Push changes)
```bash
# Use when you update Supabase directly
node scripts/sync-supabase-to-notion.js --table=agents
```

---

## ⚙️ Automated Sync Options

### Option 1: Manual (Current - Recommended)
Run sync command whenever you make changes

**Pros**: Full control, no background processes
**Cons**: Manual step required

### Option 2: Scheduled (Cron Job)

Add to your crontab (`crontab -e`):

```bash
# Sync every 15 minutes
*/15 * * * * cd /Users/hichamnaim/Downloads/Cursor/VITAL\ path && node scripts/sync-from-notion.js >> /tmp/notion-sync.log 2>&1

# Sync every hour
0 * * * * cd /Users/hichamnaim/Downloads/Cursor/VITAL\ path && node scripts/sync-from-notion.js >> /tmp/notion-sync.log 2>&1
```

**Pros**: Automatic, no manual steps
**Cons**: Up to 15 min delay for changes

### Option 3: Watch Script (Real-time)

Create a watcher that syncs on Notion changes:

```bash
# Run in background
npm run sync:watch
```

**Pros**: Near real-time updates
**Cons**: Requires running process

### Option 4: Webhook (Future - Best)

Notion webhook → API endpoint → Supabase

**Pros**: Instant sync, no polling
**Cons**: Requires server setup

---

## 🔍 What Gets Synced

### Agents Database
- ✅ Name, Display Name, Description
- ✅ Tier (Core, Tier 1-3)
- ✅ Status (Active, Development, etc.)
- ✅ Model, Temperature, Max Tokens
- ✅ Domain Expertise, Medical Specialty
- ✅ Compliance flags (HIPAA, GDPR, Pharma)
- ✅ Metrics (Accuracy Score, Priority, etc.)

### Capabilities Database
- ✅ Name, Display Name, Description
- ✅ Category, Domain, Stage
- ✅ Priority, Maturity, Complexity Level
- ✅ Feature flags (Is New, Panel Recommended, Premium)
- ✅ Metrics (Usage Count, Success Rate, etc.)

### Relations (Future)
- ⏳ Agent → Capabilities links
- ⏳ Agent → Department links
- ⏳ Capability → Competencies links

---

## 🛡️ Conflict Resolution

### How Conflicts are Handled

**Rule**: Notion is the source of truth for manual edits

If same agent is edited in both:
1. Notion changes **override** Supabase
2. Last sync wins
3. No automatic merging (by design)

### Best Practices

1. **Choose your editing location**:
   - Edit in Notion for manual updates
   - Edit in Supabase for automated/system updates

2. **Avoid concurrent edits**:
   - Don't edit same agent in both places simultaneously

3. **Use Notion for bulk operations**:
   - Notion's UI is better for bulk edits
   - One sync syncs all changes

---

## 📊 Sync Status & Verification

### Check Sync Status

After syncing, verify:

1. **In Terminal**: See sync results
   ```
   ✅ Sync complete: 254 synced, 0 errors
   ```

2. **In Supabase**: Check database directly
   ```bash
   # View agents in Supabase
   psql $DATABASE_URL -c "SELECT name, tier, status FROM agents LIMIT 5;"
   ```

3. **In Frontend**: Visit agents page
   - Changes should appear immediately
   - No page refresh needed (real-time!)

### Troubleshooting

**No changes syncing?**
- Check Notion API key in `.env.local`
- Verify integration has database access
- Run with verbose logging

**Some fields not syncing?**
- Check field mapping in `sync-from-notion.js`
- Ensure field names match exactly

**Frontend not updating?**
- Check Supabase real-time is enabled
- Verify frontend subscriptions are active

---

## 🎯 Recommended Workflow

### Daily Use

1. **Morning**: Pull latest from Supabase
   ```bash
   node scripts/sync-supabase-to-notion.js
   ```

2. **During day**: Edit in Notion as needed

3. **Before testing**: Sync back to Supabase
   ```bash
   node scripts/sync-from-notion.js
   ```

4. **End of day**: Final sync
   ```bash
   node scripts/sync-from-notion.js
   ```

### For Team Collaboration

1. **Set up scheduled sync** (every 15 min)
2. **Everyone edits in Notion**
3. **Sync runs automatically**
4. **Frontend always shows latest data**

---

## 🔐 Security Notes

- ✅ Notion API key is **secret** - never commit
- ✅ Service role key is **secret** - never expose to frontend
- ✅ Sync script runs server-side only
- ✅ Frontend uses anon key (limited permissions)

---

## 📈 Future Enhancements

### Planned Features
- [ ] Real-time webhook sync
- [ ] Conflict detection UI
- [ ] Sync history/audit log
- [ ] Rollback capability
- [ ] Relation syncing
- [ ] Bi-directional relation updates

---

## 💡 Pro Tips

1. **Use Notion for bulk edits**: Better UI than Supabase
2. **Sync before demos**: Ensure data is current
3. **Check sync logs**: Review what changed
4. **Test with capabilities first**: Only 5 records
5. **Keep Notion organized**: Use views and filters

---

## 🆘 Quick Help

**Command not working?**
```bash
# Check Node version
node --version  # Should be 18+

# Check dependencies
npm list @notionhq/client @supabase/supabase-js
```

**API errors?**
```bash
# Verify API keys
echo $NOTION_API_KEY  # Should show secret_xxx
echo $SUPABASE_SERVICE_ROLE_KEY  # Should show eyJxxx
```

**Database not found?**
```bash
# Check database IDs in .env.local
cat .env.local | grep NOTION_
```

---

**Last Updated**: 2025-10-04
**Status**: Ready to use
**Current Sync Method**: Manual (run command after edits)

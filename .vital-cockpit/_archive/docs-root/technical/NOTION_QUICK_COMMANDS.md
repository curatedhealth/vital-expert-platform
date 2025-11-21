# 🚀 Notion Sync - Quick Command Reference

## Most Common Commands

### After Editing in Notion → Sync to Supabase
```bash
npm run sync
```
That's it! Frontend auto-updates via Supabase real-time.

---

## All Commands

### Sync Commands (Use These!)

```bash
# ⭐ After editing agents in Notion
npm run sync

# Or more specific:
npm run notion:sync-from

# Sync specific database only
node scripts/sync-from-notion.js --database=agents
node scripts/sync-from-notion.js --database=capabilities
```

### Push Commands (Reverse Direction)

```bash
# Push Supabase data TO Notion
npm run notion:sync-to

# Push specific table
npm run notion:sync-to -- --table=agents
npm run notion:sync-to -- --table=capabilities
```

### Export Commands

```bash
# Export all data to JSON (for backup/inspection)
npm run notion:export
```

---

## 📋 Workflow

### Daily Workflow

1. **Edit in Notion** (best UI for bulk edits)
   - Open [Agents Database](https://www.notion.so/b81d88a6dfc2491aba0c5639c6885b2c)
   - Make your changes

2. **Sync to Supabase**
   ```bash
   npm run sync
   ```

3. **Done!** Frontend updates automatically

### First-Time Setup (Already Done ✅)

- [x] All 12 databases created in Notion
- [x] API key configured
- [x] Database IDs in `.env.local`
- [ ] Grant integration access to databases ← **Do this now!**

---

## 🗂️ Database Links

Quick access to all Notion databases:

- [**Agents**](https://www.notion.so/b81d88a6dfc2491aba0c5639c6885b2c) ⭐ (254 agents)
- [**Capabilities**](https://www.notion.so/c5240705aeb741aba5244e07addc9b6c) (5 capabilities)
- [Org Functions](https://www.notion.so/15cd88a6dfc24a8f82da0a03a90c9a05)
- [Departments](https://www.notion.so/15cd88a6dfc24fe393afd5d2c0e3ec74)
- [Roles](https://www.notion.so/15cd88a6dfc24fc1a37ac5eb10b28fde)
- [Responsibilities](https://www.notion.so/15cd88a6dfc249e0a8f7c1b25da60f9b)
- [Competencies](https://www.notion.so/15cd88a6dfc2457dbf99cb7dcfc12406)
- [Prompts](https://www.notion.so/15cd88a6dfc24b21a8a3f83154c4d79f)
- [RAG Documents](https://www.notion.so/15cd88a6dfc24dc9ba78cc6a52e91f86)
- [Tools](https://www.notion.so/15cd88a6dfc24fa5a4e4c1a4fb65f4f3)
- [Workflows](https://www.notion.so/15cd88a6dfc24b99a014f52ebd5fbb7f)
- [Jobs to Be Done](https://www.notion.so/15cd88a6dfc2483d8cbbf92da2e7e7ff)

---

## ⚙️ NPM Scripts Summary

| Command | What It Does | When to Use |
|---------|--------------|-------------|
| `npm run sync` | Notion → Supabase | After editing in Notion ⭐ |
| `npm run notion:sync-from` | Same as above | Alternative command |
| `npm run notion:sync-to` | Supabase → Notion | After editing in Supabase |
| `npm run notion:export` | Export to JSON | Backup or inspection |

---

## 🎯 Common Tasks

### Update Agent Tier in Notion

1. Open [Agents Database](https://www.notion.so/b81d88a6dfc2491aba0c5639c6885b2c)
2. Find agent, change `Tier` field
3. Run: `npm run sync`
4. ✅ Frontend updates automatically

### Bulk Edit Multiple Agents

1. Select agents in Notion (checkbox)
2. Click "Edit property" → Change tier/status/etc.
3. Run: `npm run sync`
4. ✅ All changes appear on frontend

### Add New Agent in Notion

1. Click "+ New" in [Agents Database](https://www.notion.so/b81d88a6dfc2491aba0c5639c6885b2c)
2. Fill in properties
3. Run: `npm run sync`
4. ✅ New agent appears on frontend

---

## 🔍 Verification

After syncing, check:

**Terminal**: Should show success
```
✅ Sync complete: 254 synced, 0 errors
🎉 All changes synced successfully!
```

**Frontend**: Visit http://localhost:3000/agents
- Changes appear immediately
- No page refresh needed

**Supabase**: Check database (optional)
```bash
psql $DATABASE_URL -c "SELECT name, tier, status FROM agents LIMIT 5;"
```

---

## 🆘 Troubleshooting

**Error: "Could not find database"**
→ Grant integration access (see [NOTION_SETUP_COMPLETE.md](NOTION_SETUP_COMPLETE.md))

**Error: "Missing API key"**
→ Check `NOTION_API_KEY` in `.env.local`

**No changes appearing?**
→ Run `npm run sync` after editing in Notion

**Frontend not updating?**
→ Check dev server is running: `npm run dev`

---

## 📚 Full Documentation

- **Complete Guide**: [notion-setup/SYNC_GUIDE.md](notion-setup/SYNC_GUIDE.md)
- **Setup Instructions**: [NOTION_SETUP_COMPLETE.md](NOTION_SETUP_COMPLETE.md)
- **Database List**: [notion-setup/DATABASES_CREATED.md](notion-setup/DATABASES_CREATED.md)

---

## 💡 Pro Tips

1. **Always sync before demos**: `npm run sync`
2. **Use Notion for bulk edits**: Better UI than database
3. **Check sync logs**: Review what changed
4. **Frontend auto-updates**: No refresh needed
5. **Notion = source of truth**: For manual edits

---

**Last Updated**: 2025-10-04
**Integration Name**: Vital Expert Sync
**Status**: ✅ Ready to use (grant access to databases first)

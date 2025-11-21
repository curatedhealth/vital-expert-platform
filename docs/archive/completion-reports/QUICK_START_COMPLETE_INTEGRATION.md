# Quick Start: Complete MA Persona Integration

**Time Required:** 5 minutes total

---

## Current Status

✅ **DONE:** 43 Medical Affairs personas enhanced with VPANES scores
⏸️ **TODO:** Apply schema migration (30 seconds)
⏸️ **TODO:** Create JTBD mappings (2 minutes)
⏸️ **TODO:** Verify in UI (2 minutes)

---

## Step 1: Apply Schema Migration (30 seconds)

### Option A: Supabase Dashboard

1. Go to your Supabase project: https://supabase.com/dashboard
2. Click "SQL Editor" (left sidebar)
3. Click "New Query"
4. Copy and paste this:

```sql
ALTER TABLE public.jtbd_org_persona_mapping
ALTER COLUMN persona_id DROP NOT NULL;

ALTER TABLE public.jtbd_org_persona_mapping
ADD CONSTRAINT persona_reference_required
CHECK (persona_id IS NOT NULL OR persona_dh_id IS NOT NULL);
```

5. Click "Run" ▶️
6. Look for green success message

### Option B: Supabase CLI

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"
supabase db push
```

---

## Step 2: Create JTBD Mappings (2 minutes)

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"
python3 scripts/import_ma_jtbd_and_sp_mappings.py
```

**Expected output:**
```
✅ Created 170 JTBD mappings
✅ 41 personas now have JTBDs
```

---

## Step 3: Verify in UI (2 minutes)

```bash
# Start dev server (if not running)
pnpm dev

# Open personas page
open http://localhost:3000/personas
```

**Check:**
1. Filter by "Pharmaceutical" → See 43 personas ✅
2. Click "P001 - VP Medical Affairs" ✅
3. Go to "Scores" tab → See VPANES breakdown ✅
4. Go to "JTBDs" tab → See mapped jobs ✅

---

## That's It! 🎉

Your Medical Affairs personas are now fully integrated with:
- ✅ VPANES priority scoring
- ✅ JTBD mappings
- ✅ Industry filtering
- ✅ Complete profile pages

---

## Troubleshooting

**Schema migration fails?**
- Check you're using the Service Role Key (not anon key)
- Verify you have admin access to the project

**JTBD script fails?**
- Make sure schema migration was applied first
- Check `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` env vars are set

**Personas not showing in UI?**
- Check filter is set to "All Industries" or "Pharmaceutical"
- Refresh page (Cmd+R)

---

## Need More Detail?

See [SESSION_COMPLETE_FINAL_SUMMARY.md](SESSION_COMPLETE_FINAL_SUMMARY.md) for complete documentation.

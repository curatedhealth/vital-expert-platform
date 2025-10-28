# Avatar Setup Guide - Unique Icons for All 254 Agents

## Current State ❌
- ✅ **254 agents** in database
- ❌ **0 agents** have avatars (all empty)
- ❌ **Avatars table** does not exist

## Goal ✅
- Create avatars table with **150 unique icons**
- Assign unique avatar to each agent
- **Maximum 2 agents** per icon (254 agents ÷ 150 icons ≈ 1.69 agents per icon)

---

## Step 1: Create Avatars Table

### Option A: Supabase SQL Editor (Recommended)

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of:
   ```
   /Users/hichamnaim/Downloads/Cursor/VITAL path/database/sql/migrations/2025/20251027000003_create_avatars_table.sql
   ```
5. Click **Run**
6. You should see: "Success. No rows returned"

### What This Does:

- Creates `avatars` table with columns:
  - `id` (UUID primary key)
  - `name` (VARCHAR - avatar name)
  - `icon` (VARCHAR - emoji/icon)
  - `category` (VARCHAR - Healthcare, Science, Business, etc.)
  - `usage_count` (INTEGER - tracks how many agents use this avatar)

- Inserts **150 unique avatars** across 7 categories:
  - 🏥 Healthcare & Medical (30 icons)
  - 🔬 Science & Research (25 icons)
  - 💼 Business & Professional (25 icons)
  - 💻 Technology & Digital (25 icons)
  - 💬 Communication & Collaboration (20 icons)
  - ⏰ Operations & Logistics (15 icons)
  - ✅ Quality & Compliance (10 icons)

- Creates function `get_least_used_avatar()` to help distribute avatars evenly

- Creates trigger to automatically update `usage_count` when agents are assigned avatars

---

## Step 2: Assign Avatars to All Agents

### Option A: Run Assignment Script

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/apps/digital-health-startup"
node scripts/assign-unique-avatars.mjs
```

**What This Does:**
- Fetches all 150 avatars from the avatars table
- Fetches all 254 agents
- Assigns avatars in round-robin fashion:
  - Agent 1 gets Avatar 1
  - Agent 2 gets Avatar 2
  - ...
  - Agent 150 gets Avatar 150
  - Agent 151 gets Avatar 1 again (2nd use)
  - Agent 152 gets Avatar 2 again (2nd use)
  - ...
  - Agent 254 gets Avatar 104 (2nd use)

**Result:**
- First 150 agents: unique avatars (1 use each)
- Next 104 agents: reuse avatars (2 uses each)
- **No avatar used more than 2 times** ✅

### Option B: Manual SQL Assignment

If the script doesn't work, run this in Supabase SQL Editor:

```sql
-- Assign avatars to agents in round-robin fashion
WITH numbered_agents AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY name) as agent_num
  FROM public.agents
),
numbered_avatars AS (
  SELECT icon, ROW_NUMBER() OVER (ORDER BY name) as avatar_num
  FROM public.avatars
)
UPDATE public.agents
SET avatar_url = (
  SELECT icon
  FROM numbered_avatars
  WHERE avatar_num = ((agent_num - 1) % 150) + 1
)
FROM numbered_agents
WHERE agents.id = numbered_agents.id;
```

---

## Step 3: Verify Avatar Distribution

Run the check script:

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/apps/digital-health-startup"
node scripts/check-avatars.mjs
```

**Expected Output:**
```
📈 Avatar Usage Statistics:
   Total agents: 254
   Agents without avatar: 0
   Unique avatars used: 150

⚠️ Avatars used more than 2 times:
   ✅ No avatars are overused!

✅ Perfect! No avatar is used more than 2 times
```

---

## Step 4: Update Frontend to Display Avatar Icons

The agents API already fetches `avatar_url` from the database, so once avatars are assigned, they will automatically appear in the UI!

**Current Code** (already working):
- `src/app/api/agents-crud/route.ts` - Fetches `avatar_url` (line 36)
- `src/components/ui/enhanced-agent-card.tsx` - Displays avatar using `AgentAvatar` component
- `src/features/agents/components/agents-board.tsx` - Passes avatar to cards

**No code changes needed!** Just assign the avatars and refresh the page.

---

## Quick Commands

```bash
# 1. Check current state
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/apps/digital-health-startup"
node scripts/check-avatars.mjs

# 2. Assign avatars (after running SQL migration)
node scripts/assign-unique-avatars.mjs

# 3. Verify distribution
node scripts/check-avatars.mjs

# 4. Start dev server
killall -9 node 2>/dev/null
rm -rf .next
PORT=3000 npm run dev
```

---

## Avatar Categories & Examples

### 🏥 Healthcare (30 icons)
🩺 Stethoscope, 💉 Syringe, 💊 Pill, 🏥 Hospital, 🚑 Ambulance, 🔬 Microscope, 🧪 Test Tube, 🧬 DNA, 🧫 Petri Dish, ❤️ Heart, 🧠 Brain, 🫁 Lungs, 🦴 Bone, 🦷 Tooth, 👁️ Eye, 👂 Ear, 🦠 Microbe, 🩸 Blood Drop, 🌡️ Thermometer, 🩹 Bandage, 🩻 X-Ray, 🩼 Crutch, ⚕️ Medical Cross, 🥼 Lab Coat, 🥽 Safety Goggles, 😷 Face Mask, ♿ Wheelchair, 💼 Medical Bag, 📡 Med Scanner

### 🔬 Science (25 icons)
⚛️ Atom, 🧲 Magnet, 🔭 Telescope, 🛰️ Satellite, 🚀 Rocket, 💎 Crystal, 🌍 Globe, ⚗️ Flask, 🧪 Beaker, 🔥 Fire, ⚡ Lightning, 🌊 Wave, 🍃 Leaf, 🌱 Seedling, 🌳 Tree, ♻️ Recycling, ☀️ Solar, 💨 Wind, ⚙️ Gear, 🔧 Magnet Horseshoe, ☢️ Radiation, ☣️ Biohazard, ❄️ Snowflake, 🌈 Rainbow

### 💼 Business (25 icons)
💼 Briefcase, 📈 Chart Up, 📉 Chart Down, 📊 Bar Chart, 💰 Money Bag, 💵 Dollar, 💳 Credit Card, 🏦 Bank, ⚖️ Scales, 📜 Contract, ✅ Stamp, 🏆 Trophy, 🥇 Medal, 🎯 Target, 🔑 Key, 🔒 Lock, 🛡️ Shield, 🤝 Handshake, 💡 Light Bulb, 🏢 Building, 🏭 Factory, 🏛️ Office, 📽️ Presentation, 📅 Calendar

### 💻 Technology (25 icons)
💻 Computer, 📱 Laptop, 🖥️ Server, 🗄️ Database, ☁️ Cloud, 🌐 Network, 🤖 Robot, 📡 Satellite Dish, 🔋 Battery, 🔌 Plug, 📶 Signal, 📷 Camera, 📹 Video, 🖨️ Printer, 📠 Scanner, ⌨️ Keyboard, 🖱️ Mouse, 🕹️ Joystick, 🥽 VR Goggles, 💿 CD

### 💬 Communication (20 icons)
💬 Speech Bubble, 📣 Megaphone, 🔔 Bell, 📧 Email, ✉️ Envelope, 📦 Package, 📞 Telephone, 📱 Mobile Phone, 📹 Video Call, 🎤 Microphone, 🔊 Speaker, 📻 Radio, 📺 TV, 📰 Newspaper, 📚 Book, 🔖 Bookmark, 📋 Clipboard, ✏️ Pencil, 🖊️ Pen, 📝 Notepad

### ⏰ Operations (15 icons)
⏰ Clock, ⏳ Hourglass, ⏱️ Stopwatch, ⏲️ Timer, 🧭 Compass, 🗺️ Map, 📍 Pin, 🚩 Flag, ✅ Checkmark, ❌ Cross Mark, ⚠️ Warning, ℹ️ Info, ❓ Question, ❗ Exclamation, 🛠️ Tools

### ✅ Quality (10 icons)
📜 Certificate, 🏅 Badge, ⭐ Star, 💎 Diamond, 👑 Crown, 🔍 Magnifying Glass, ✅ Checklist, 📄 Document, 📁 Folder, 🗃️ Archive

---

## Troubleshooting

### Error: "Avatars table does not exist"
**Solution**: Run Step 1 first - create the avatars table in Supabase SQL Editor

### Error: "ENOENT: no such file or directory"
**Solution**: The migration file path is wrong. Copy the SQL directly from:
`/Users/hichamnaim/Downloads/Cursor/VITAL path/database/sql/migrations/2025/20251027000003_create_avatars_table.sql`

### No avatars showing in UI
**Solution**:
1. Check if avatars were assigned: `node scripts/check-avatars.mjs`
2. Clear browser cache: Cmd+Shift+R
3. Check agents API response in browser DevTools Network tab
4. Verify avatar_url is not empty in database

### Some avatars used more than 2 times
**Solution**: Re-run the assignment script, it will fix the distribution

---

## Files Created

1. **Migration SQL**: `/database/sql/migrations/2025/20251027000003_create_avatars_table.sql`
   - Creates avatars table
   - Inserts 150 unique icons
   - Sets up triggers and functions

2. **Assignment Script**: `/apps/digital-health-startup/scripts/assign-unique-avatars.mjs`
   - Assigns avatars to all agents
   - Ensures even distribution
   - Max 2 uses per avatar

3. **Check Script**: `/apps/digital-health-startup/scripts/check-avatars.mjs`
   - Analyzes current state
   - Shows distribution statistics
   - Identifies overused avatars

4. **This Guide**: `/AVATAR_SETUP_GUIDE.md`

---

**Next Steps**: Run Step 1 in Supabase SQL Editor, then run the assignment script!

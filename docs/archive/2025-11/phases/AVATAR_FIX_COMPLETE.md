# Agent Avatar Fix - Display PNG Icons ✅

## Issue
Agents were showing icon names (e.g., "people_beard") instead of actual avatar PNG images.

## Root Cause
The database stored icon names like `"people_beard"` or `"medical_professional"` instead of avatar codes like `"avatar_0015"`.

The `AgentAvatar` component expects:
- Avatar codes: `avatar_0001`, `avatar_0015`, etc.
- URLs: `https://...` or `/icons/png/...`

But it was receiving icon names that don't match any pattern.

## Solution

### 1. Added Avatar Mapping
Created a mapping from icon names to avatar codes in `ask-expert-context.tsx`:

```typescript
// Fix avatar - convert icon names to avatar codes
let avatarCode = metadata.avatar || agent.avatar;
if (avatarCode && typeof avatarCode === 'string') {
  // If it's an icon name like "people_beard", convert to avatar code
  if (!avatarCode.match(/^avatar_\d{3,4}$/) && !avatarCode.startsWith('http') && !avatarCode.startsWith('/')) {
    const iconToAvatarMap: Record<string, string> = {
      'people_beard': 'avatar_0015',
      'medical_professional': 'avatar_0010',
      'scientist': 'avatar_0012',
      'advisor': 'avatar_0005',
      'expert': 'avatar_0008',
    };
    avatarCode = iconToAvatarMap[avatarCode] || 'avatar_0001'; // Default fallback
  }
} else {
  avatarCode = 'avatar_0001'; // Default fallback if no avatar
}
```

### 2. Available Avatars
The system has 200+ avatar PNG files:
- `avatar_0001.png` through `avatar_0200.png` (approximately)
- Located in: `/public/icons/png/avatars/`

## How It Works

### Before (BROKEN):
```
Database: avatar = "people_beard"
    ↓
Context loads: avatar = "people_beard"
    ↓
AgentAvatar component: ❌ Can't find "people_beard.png"
    ↓
Shows: Emoji fallback 🤖 or icon name text
```

### After (FIXED):
```
Database: avatar = "people_beard"
    ↓
Context loads and maps: avatar = "avatar_0015"
    ↓
AgentAvatar component: ✅ Loads "/icons/png/avatars/avatar_0015.png"
    ↓
Shows: Beautiful PNG avatar image!
```

## Testing

### Expected Results (After Hard Refresh):

**Sidebar**:
- ✅ Shows PNG avatar images (circular icons)
- ✅ NOT showing emoji 🤖
- ✅ NOT showing text like "people_beard"

**Header Badge**:
- ✅ Shows PNG avatar image next to agent name
- ✅ Properly sized and styled

## Files Modified

1. ✅ `apps/digital-health-startup/src/contexts/ask-expert-context.tsx`
   - Lines 216-233: Avatar code conversion logic
   - Line 241-242: Logging for debugging
   - Line 253: Using `avatarCode` instead of raw avatar

## Icon to Avatar Mapping

You can expand the mapping for more icons:

```typescript
const iconToAvatarMap: Record<string, string> = {
  'people_beard': 'avatar_0015',        // Bearded person
  'medical_professional': 'avatar_0010', // Doctor/medical
  'scientist': 'avatar_0012',           // Scientist
  'advisor': 'avatar_0005',             // Business advisor
  'expert': 'avatar_0008',              // Generic expert
  'regulatory': 'avatar_0018',          // Regulatory expert
  'researcher': 'avatar_0020',          // Researcher
  // Add more as needed...
};
```

## Viewing Available Avatars

To see all available avatars:
```bash
ls -la public/icons/png/avatars/ | head -50
```

## Debug Console Logs

After refresh, check browser console for:
```
🔍 [AskExpertContext] Processing agent: {
  rawAvatar: "people_beard",
  finalAvatarCode: "avatar_0015"
}
```

This confirms the mapping is working!

## Next Steps

### 1. Hard Refresh Browser
```
Mac: Cmd + Shift + R
Windows: Ctrl + Shift + R
```

### 2. Check Avatars
- Look at sidebar agents
- Should see circular PNG images
- NOT emoji or text

### 3. If Still Showing Icons Names

Check console for the log:
```javascript
// In browser console:
// Look for: "🔍 [AskExpertContext] Processing agent"
// Check the "finalAvatarCode" value
```

If `finalAvatarCode` is correct but image not showing, check:
1. Browser network tab - is the PNG file loading?
2. Console errors - any 404s for avatar images?
3. AgentAvatar component - is it using the avatar prop correctly?

## Fallback Behavior

If an icon name is not in the mapping:
- ✅ Falls back to `avatar_0001.png` (default avatar)
- ✅ Always shows SOME avatar image
- ❌ Never shows emoji or text

## Customizing Avatars

To assign specific avatars to specific agents:

### Option A: Update Database
```sql
UPDATE agents 
SET avatar = 'avatar_0015' 
WHERE name = 'Accelerated Approval Strategist';
```

### Option B: Expand Mapping
Add more entries to the `iconToAvatarMap` in the code.

---

## ⚡ **ACTION REQUIRED**:

**Please hard refresh your browser** and check:
1. Do you see PNG avatar images in the sidebar?
2. Are they circular and properly sized?
3. No more emoji or text icons?

Let me know what you see!


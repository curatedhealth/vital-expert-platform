# Preventing Background Process Accumulation

## 🚨 Problem
During development, multiple `npm run dev` processes can accumulate in the background, creating shell tracking artifacts and consuming resources.

## ✅ Solution

### Option 1: Use the Helper Script (Recommended)

```bash
# Start development server (automatically kills existing ones)
./scripts/dev.sh

# Or with custom port
PORT=3001 ./scripts/dev.sh
```

**What it does**:
- Kills any existing dev server
- Cleans up port conflicts
- Starts ONE clean server
- Saves PID for easy stopping

**To stop**:
```bash
kill -9 $(cat .dev-server.pid) && rm .dev-server.pid
```

---

### Option 2: Manual Cleanup

```bash
# Kill all Node.js processes
killall -9 node

# Kill specific port
lsof -ti:3000 | xargs kill -9

# Clean caches and restart
rm -rf .next node_modules/.cache .swc
npm run dev
```

---

### Option 3: Add to package.json

```json
{
  "scripts": {
    "dev": "next dev",
    "dev:clean": "killall -9 node 2>/dev/null; rm -rf .next .swc node_modules/.cache && next dev",
    "dev:safe": "./scripts/dev.sh"
  }
}
```

Then use:
```bash
npm run dev:clean  # Clean start
npm run dev:safe   # Using helper script
```

---

## 🔧 Why This Happens

**Background bash processes** you see (210669, 439317, etc.) are **shell tracking artifacts**, not actual Node.js processes. They appear because:

1. Cursor/Claude Code runs commands with `run_in_background: true`
2. Shell keeps track even after process ends
3. Multiple dev server starts accumulate shells
4. They show in system reminders but aren't consuming resources

**Actual Node processes** are killed with `killall -9 node`.

---

## 📋 Best Practices

### DO:
✅ Use `./scripts/dev.sh` for starting dev server
✅ Kill existing servers before starting new ones
✅ Use PID files to track running servers
✅ Clean caches when switching branches

### DON'T:
❌ Run multiple `npm run dev` in background
❌ Start new server without killing old one
❌ Ignore port conflict errors
❌ Use `run_in_background: true` for dev servers

---

## 🎯 Quick Reference

```bash
# Check what's running
ps aux | grep node | grep -v grep

# Check specific port
lsof -i:3000

# Kill everything
killall -9 node

# Start clean
./scripts/dev.sh

# Stop current server
kill -9 $(cat .dev-server.pid) && rm .dev-server.pid
```

---

## 🔍 Debugging

**If you see 40+ background bash processes:**
- These are just shell tracking artifacts
- Not consuming significant resources
- Will clear when you restart Cursor/terminal

**If dev server won't start:**
```bash
# Check port
lsof -i:3000

# Kill port-specific process
lsof -ti:3000 | xargs kill -9

# Try different port
PORT=3001 npm run dev
```

**If "EADDRINUSE" error:**
```bash
# Port is already taken
lsof -ti:3000 | xargs kill -9
npm run dev
```

---

## 📝 .gitignore

Already added to `.gitignore`:
```
.dev-server.pid
```

---

**File**: `PREVENT_BACKGROUND_PROCESSES.md`
**Created**: 2025-10-03
**Helper Script**: `scripts/dev.sh`

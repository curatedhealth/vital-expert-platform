# 🚀 Dev Server Management Guide

## ⚠️ **THE PROBLEM: Multiple Background Servers**

During our session, I accidentally created **17+ background dev servers** that all tried to run on port 3000 simultaneously. This caused:
- Sign In button not working
- Pages loading incorrectly
- Port conflicts
- Unpredictable behavior

## 🔍 **How It Happened:**

Every time I used `npm run dev` with `run_in_background: true`, it created a new background process that never got cleaned up.

---

## ✅ **SOLUTION 1: Kill All Servers (Recommended)**

### Quick Command (Copy & Paste):
```bash
killall -9 node npm; lsof -ti:3000 | xargs kill -9; sleep 3
```

### Or Use the Cleanup Script:
```bash
"/Users/hichamnaim/Downloads/Cursor/VITAL path/KILL_ALL_SERVERS.sh"
```

---

## ✅ **SOLUTION 2: Proper Dev Server Management**

### **Rule #1: Always Run in Foreground**
```bash
# ✅ CORRECT - Run in terminal (foreground)
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/apps/digital-health-startup"
npm run dev
```

```bash
# ❌ WRONG - Don't run in background
npm run dev &  # The & creates background process!
```

### **Rule #2: One Server at a Time**
Before starting a new server, kill any existing ones:

```bash
# 1. Kill all Node processes
killall -9 node

# 2. Wait
sleep 2

# 3. Start ONE server
npm run dev
```

### **Rule #3: Use Ctrl+C to Stop**
When you're done, press `Ctrl+C` in the terminal to stop the server cleanly.

---

## 🔧 **Troubleshooting Commands**

### Check How Many Servers Are Running:
```bash
ps aux | grep -E "npm run dev|next dev" | grep -v grep
```

### Check What's Using Port 3000:
```bash
lsof -ti:3000
```

### Kill Specific Process by PID:
```bash
kill -9 <PID>
```

### Nuclear Option (Kill Everything):
```bash
killall -9 node npm next
lsof -ti:3000 | xargs kill -9
```

---

## 📋 **Best Practices**

### ✅ **DO:**
1. Run `npm run dev` in a dedicated terminal tab
2. Keep that terminal visible so you can see server logs
3. Use `Ctrl+C` to stop the server when done
4. Check port 3000 is free before starting: `lsof -ti:3000`

### ❌ **DON'T:**
1. Don't use `npm run dev &` (background mode)
2. Don't close terminal without stopping server (Ctrl+C first)
3. Don't start multiple servers on same port
4. Don't leave servers running overnight

---

## 🎯 **Daily Workflow**

### Morning Start:
```bash
# 1. Clean slate
killall -9 node

# 2. Go to project
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/apps/digital-health-startup"

# 3. Clean cache (optional, only if needed)
rm -rf .next

# 4. Start server
npm run dev
```

### End of Day:
```bash
# Press Ctrl+C in the terminal running npm run dev
# Or if you closed the terminal:
killall node
```

---

## 🚨 **Emergency Cleanup**

If things get messy (like today with 17 servers), run:

```bash
"/Users/hichamnaim/Downloads/Cursor/VITAL path/KILL_ALL_SERVERS.sh"
```

This will:
- Kill all Node processes
- Kill all npm processes
- Clear port 3000
- Verify everything is clean
- Tell you how to start fresh

---

## 🎓 **What I Learned (AI Assistant Notes)**

For future sessions, I should:
1. **NEVER** use `run_in_background: true` for `npm run dev`
2. Instead, tell the user to run it manually in their terminal
3. Only use background mode for short-lived commands (curl, ls, etc.)
4. Always clean up before starting new servers
5. Check for existing processes first: `ps aux | grep node`

---

## 📊 **Session Summary**

Today we had:
- **17 background dev servers** running simultaneously
- All competing for port 3000
- Causing Sign In button to fail
- Fixed by: Manual `killall -9 node` and restarting ONE server

**Lesson:** Simple is better! One terminal, one server, visible logs.

---

## 🔗 **Related Files**

- [KILL_ALL_SERVERS.sh](KILL_ALL_SERVERS.sh) - Comprehensive cleanup script
- [RESTART_SERVER_CLEAN.sh](RESTART_SERVER_CLEAN.sh) - Clean restart script
- [ALL_ISSUES_FIXED_SUMMARY.md](ALL_ISSUES_FIXED_SUMMARY.md) - Today's code fixes

---

## ✅ **Quick Reference Card**

```bash
# Check servers running
ps aux | grep node | grep -v grep

# Kill all servers
killall -9 node

# Check port 3000
lsof -ti:3000

# Clear port 3000
lsof -ti:3000 | xargs kill -9

# Start ONE server
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/apps/digital-health-startup"
npm run dev

# Stop server
# Press Ctrl+C in terminal
```

---

**Remember:** Keep it simple! One server, one terminal, foreground mode. 🎯

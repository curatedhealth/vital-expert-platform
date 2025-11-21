# Hierarchical Workflow Navigation Guide

## 🧭 Navigation Overview

Your hierarchical workflow editor now has **multiple ways to navigate** through the Process → Activity → Task → Step hierarchy!

## 📍 Navigation Methods

### 1. **"Open" Button on Nodes** (Drill Down)
Click the "Open" button on any hierarchical node to view its children:
- **Process node** → See its Activities
- **Activity node** → See its Tasks
- **Task node** → See its Steps

```
Click "Open" on Process → You're now viewing Activities
Click "Open" on Activity → You're now viewing Tasks
Click "Open" on Task → You're now viewing Steps
```

---

### 2. **Back Button** (Go Up One Level)
Located in the breadcrumbs bar at the top:
- **Back button** (with arrow) → Goes to the parent level
- Shows what level you'll go back to

```
Steps view → Click "Back" → Tasks view
Tasks view → Click "Back" → Activities view
Activities view → Click "Back" → Process view
Process view → Click "Back" → Root view
```

---

### 3. **Breadcrumb Navigation** (Jump to Any Level)
Click any breadcrumb to jump directly to that level:

```
Home > Patient Onboarding > Registration > Collect Demographics
  ↑         ↑                    ↑                ↑
Root    Process            Activity           Task
```

Click any breadcrumb to jump there instantly!

---

### 4. **Home Button** (Go to Root)
Click the "Home" button (house icon) to return to the top level instantly.

---

### 5. **Keyboard Shortcuts** ⌨️

| Key | Action |
|-----|--------|
| `Esc` | Go back one level (if in hierarchy) or clear selection (if at root) |
| `Cmd/Ctrl + 0` | Fit view to canvas |
| `Cmd/Ctrl + S` | Save workflow |
| `Cmd/Ctrl + Z` | Undo |
| `Cmd/Ctrl + Shift + Z` | Redo |

---

### 6. **Floating Navigation Helper** (Bottom-Left)
When you drill into a node, a floating helper appears showing:
- Current level and context
- Quick "Back" button
- "Home" button (if deep in hierarchy)
- Keyboard shortcut reminder

---

## 🎯 Navigation Examples

### Example 1: Navigate to Edit a Specific Step

**Goal**: Edit "Verify Identity" step in "Patient Registration" activity

1. **At Root** → Click "Open" on "Patient Onboarding" process
2. **In Process** → Click "Open" on "Patient Registration" activity
3. **In Activity** → Click "Open" on "Collect Demographics" task
4. **In Task** → Click on "Verify Identity" step to select it
5. **Properties Panel** → Edit the step properties

**To go back**:
- Press `Esc` 3 times, OR
- Click "Back" 3 times, OR
- Click "Home" to return to root

---

### Example 2: Jump Between Different Activities

**Goal**: Move from "Patient Registration" to "Medical History"

**Method 1 - Using Breadcrumbs**:
1. Currently in "Patient Registration" tasks
2. Breadcrumb shows: `Home > Patient Onboarding > Patient Registration`
3. Click "Patient Onboarding" in breadcrumb
4. Now viewing all activities
5. Click "Open" on "Medical History"

**Method 2 - Using Back Button**:
1. Currently in "Patient Registration" tasks
2. Click "Back" → Now viewing all activities
3. Click "Open" on "Medical History"

---

### Example 3: Quick Return to Root

**Goal**: Return to root from any deep level

**Method 1 - Home Button**:
- Click "Home" button (instant!)

**Method 2 - Breadcrumb**:
- Click "Home" in breadcrumbs

**Method 3 - Multiple Backs**:
- Press `Esc` multiple times until at root

---

## 🗺️ Visual Navigation Flow

```
ROOT LEVEL (All Processes)
  │
  ├─ Click "Open" on Process
  │
  ▼
PROCESS LEVEL (Activities in this Process)
  │
  ├─ Click "Open" on Activity
  │
  ▼
ACTIVITY LEVEL (Tasks in this Activity)
  │
  ├─ Click "Open" on Task
  │
  ▼
TASK LEVEL (Steps in this Task)
  │
  └─ Steps are leaf nodes (no children)

GOING BACK:

  Steps ──[Back/Esc]──> Tasks ──[Back/Esc]──> Activities ──[Back/Esc]──> Process ──[Back/Esc]──> Root
```

---

## 💡 Pro Navigation Tips

### Tip 1: Use Breadcrumbs for Long Jumps
If you're 3 levels deep and want to go to a specific level, click the breadcrumb instead of clicking "Back" multiple times.

### Tip 2: Escape Key is Your Friend
The `Esc` key intelligently:
- Goes back in hierarchy when drilled down
- Clears selection when at root
- Works as a universal "go back" button

### Tip 3: Watch the Floating Helper
The bottom-left floating helper always shows:
- Where you are
- What you're viewing
- Quick actions to navigate

### Tip 4: Context Awareness
The editor always shows only what's relevant to your current level:
- At Process level → See only Activities
- At Activity level → See only Tasks
- At Task level → See only Steps

### Tip 5: Properties Panel Navigation
You can also navigate from the Properties Panel:
- Select a parent node
- See its children listed
- Click "Open" on any child to drill into it

---

## 🎨 Visual Indicators

### Color-Coded Breadcrumbs
Each level has a color-coded badge:
- **Purple** = Process
- **Indigo** = Activity
- **Blue** = Task
- **Teal** = Step

### Breadcrumb Trail Shows Path
```
Home > [PROCESS] Patient Onboarding > [ACTIVITY] Registration > [TASK] Demographics
```

### Floating Helper Shows Context
```
┌─────────────────────────┐
│ TASK ▲                  │
│ Collect Demographics    │
│ Viewing steps           │
└─────────────────────────┘
│ ◄ Back [ACTIVITY]  🏠   │
└─────────────────────────┘
│ Press Esc to go back    │
└─────────────────────────┘
```

---

## 🔧 Navigation States

### At Root Level
- ✅ Can see all Process nodes
- ✅ Can create new Processes
- ❌ No breadcrumbs shown
- ❌ No "Back" button

### Inside a Process
- ✅ See all Activity nodes in this Process
- ✅ Breadcrumb: `Home > Process Name`
- ✅ "Back" button available
- ✅ Can create new Activities (they auto-parent to Process)

### Inside an Activity
- ✅ See all Task nodes in this Activity
- ✅ Breadcrumb: `Home > Process > Activity`
- ✅ "Back" button goes to Activities
- ✅ Can create new Tasks (they auto-parent to Activity)

### Inside a Task
- ✅ See all Step nodes in this Task
- ✅ Breadcrumb: `Home > Process > Activity > Task`
- ✅ "Back" button goes to Tasks
- ✅ Can create new Steps (they auto-parent to Task)

---

## 🚀 Quick Reference

| Want to... | Action |
|------------|--------|
| View children | Click "Open" button on node |
| Go up one level | Click "Back" or press `Esc` |
| Jump to specific level | Click breadcrumb |
| Return to root | Click "Home" |
| See where you are | Look at floating helper (bottom-left) |
| See full path | Look at breadcrumbs (top) |

---

## ❓ Troubleshooting

**Q: I can't find the "Back" button**
- A: It only appears when you're drilled into a node (breadcrumbs visible)

**Q: Pressing Esc doesn't do anything**
- A: If you're at root with no selection, Esc has no effect

**Q: I'm lost in the hierarchy**
- A: Look at the breadcrumbs or floating helper to see where you are
- Click "Home" to return to root

**Q: How do I know what level I'm at?**
- A: Check the floating helper in bottom-left
- Or check the breadcrumbs at the top
- Or look at the node types on canvas (all same level = current level)

---

## 🎓 Navigation Best Practices

1. **Use breadcrumbs for long jumps** - Faster than multiple "Back" clicks
2. **Use keyboard shortcuts** - `Esc` is quickest for going back
3. **Check floating helper** - Always shows your current context
4. **Plan your route** - Think about the path before drilling deep
5. **Use "Home" for reset** - Quick way to start over from root

---

Happy navigating! 🧭

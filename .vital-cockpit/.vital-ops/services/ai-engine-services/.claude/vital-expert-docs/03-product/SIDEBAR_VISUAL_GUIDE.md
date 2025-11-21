# Ask Expert Sidebar - Visual Guide 👀

## 🎨 Enhanced Sidebar Layout

```
┌─────────────────────────────────────┐
│ ▼ Quick Actions                     │
├─────────────────────────────────────┤
│ + New Consultation     [2 selected] │
│ ↻ Refresh                           │
│ ✨ Browse Agent Store               │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ▼ Conversations                     │
├─────────────────────────────────────┤
│ 🔍 [Search conversations...]        │
├─────────────────────────────────────┤
│ 📌 PINNED                           │
│ ┌─────────────────────────────┐    │
│ │ 📌 👤 FDA 510(k) Strategy  │⋮│   │
│ │     5 min ago        [12]  │    │
│ └─────────────────────────────┘    │
│                                     │
│ 🕐 TODAY                            │
│ ┌─────────────────────────────┐    │
│ │ 👤 Clinical Trial Design   │⋮│   │
│ │     2 hrs ago         [8]  │    │
│ └─────────────────────────────┘    │
│ ┌─────────────────────────────┐    │
│ │ 👤 Market Access Planning  │⋮│   │
│ │     3 hrs ago         [5]  │    │
│ └─────────────────────────────┘    │
│                                     │
│ 📆 YESTERDAY                        │
│ ┌─────────────────────────────┐    │
│ │ 👤 Safety Report Review    │⋮│   │
│ │     Yesterday         [15] │    │
│ └─────────────────────────────┘    │
│                                     │
│ 📅 LAST 7 DAYS                      │
│ ┌─────────────────────────────┐    │
│ │ 👤 Regulatory Submission   │⋮│   │
│ │     3 days ago         [6] │    │
│ └─────────────────────────────┘    │
│ ┌─────────────────────────────┐    │
│ │ 👤 Compliance Check        │⋮│   │
│ │     5 days ago         [3] │    │
│ └─────────────────────────────┘    │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ▼ My Agents                         │
├─────────────────────────────────────┤
│ 🔍 [Search agents...]               │
├─────────────────────────────────────┤
│ TIER 1                              │
│ ┌─────────────────────────────┐    │
│ │ ✓ 🤖 FDA Regulatory Expert │ 🗑│  │
│ └─────────────────────────────┘    │
│ ┌─────────────────────────────┐    │
│ │   🤖 Clinical Trial Designer│ +│  │
│ └─────────────────────────────┘    │
│                                     │
│ TIER 2                              │
│ ┌─────────────────────────────┐    │
│ │ ✓ 🤖 Market Access Strategist│🗑│ │
│ └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

---

## 🎯 Conversation Actions Menu

When you **hover** over any conversation, a **⋮** button appears:

```
┌──────────────────────────┐
│ 📌 👤 FDA 510(k) Strategy│⋮│ ← Hover reveals menu
│     5 min ago      [12]  │  │
└──────────────────────────┘  │
                              │
                              ▼
                    ┌──────────────┐
                    │ 📌 Pin       │
                    │ 📦 Archive   │
                    │ ─────────── │
                    │ 🗑️ Delete    │
                    └──────────────┘
```

---

## 🎨 Visual States

### **Pinned Conversation**
```
┌─────────────────────────────────┐
│ 📌 👤 Important Consultation    │← Yellow highlight
│     2 hrs ago            [8]    │
└─────────────────────────────────┘
  ↑
  Yellow left border
```

### **Active Conversation**
```
┌─────────────────────────────────┐
│ 👤 Currently Open Chat          │← Blue/Primary highlight
│     Just now             [3]    │
└─────────────────────────────────┘
  ↑
  Primary color border
```

### **Normal Conversation**
```
┌─────────────────────────────────┐
│ 👤 Regular Consultation         │
│     5 days ago           [6]    │
└─────────────────────────────────┘
```

### **With Search Active**
```
┌─────────────────────────────────┐
│ 🔍 [FDA]                        │← Search term
├─────────────────────────────────┤
│ 📌 PINNED                       │
│ ┌─────────────────────────┐    │
│ │ 📌 👤 FDA 510(k) Strategy│    │← Matches "FDA"
│ └─────────────────────────┘    │
│                                 │
│ 🕐 TODAY                        │
│ (no matches)                    │
└─────────────────────────────────┘
```

---

## 🔧 Agent Management

### **Selected Agent** (with checkmark)
```
┌─────────────────────────────────┐
│ ✓ 🤖 FDA Regulatory Expert  │🗑│
│     ↑                           │
│     Checkmark = Selected        │
└─────────────────────────────────┘
```

### **Unselected Agent** (can be added)
```
┌─────────────────────────────────┐
│   🤖 Clinical Trial Designer│ +│
│                             ↑   │
│                       Add button│
└─────────────────────────────────┘
```

### **User-Added Agent** (can be removed)
```
┌─────────────────────────────────┐
│ ✓ 🤖 My Custom Agent        │🗑│← Green highlight
│                             ↑   │
│                    Delete button│
└─────────────────────────────────┘
  ↑
  Green left border
```

---

## 💡 Interaction Patterns

### **Search Conversations**
1. Type in search box
2. Conversations filter in real-time
3. Matching conversations stay visible
4. Non-matching conversations hide
5. Group headers hide if no matches in that group

### **Pin a Conversation**
1. Hover over conversation
2. Click ⋮ button
3. Click "📌 Pin"
4. Conversation moves to **Pinned** section
5. Yellow highlight appears
6. Pin icon shows next to name

### **Archive a Conversation**
1. Hover over conversation
2. Click ⋮ button
3. Click "📦 Archive"
4. Conversation disappears from list
5. Saved in localStorage
6. Can be restored by toggling archive off

### **Select an Agent**
1. Click on agent row
2. Checkmark appears
3. Agent highlights with primary color
4. Agent is added to conversation
5. Badge shows selected count in "New Consultation"

---

## 🎨 Color System

### **Semantic Colors**
- **Yellow/Amber** → Pinned items (⚠️ Important)
- **Blue/Primary** → Selected/Active items
- **Green** → User-added items (✅ Success)
- **Red** → Destructive actions (🗑️ Delete)
- **Gray/Muted** → Secondary text & backgrounds

### **Icons & Meaning**
- **📌 Pin** → Pinned conversation
- **🕐 Clock** → Today
- **📆 Calendar** → Yesterday
- **👤 User** → Conversation/Session
- **🤖 Avatar** → Agent
- **✓ Check** → Selected
- **🗑️ Trash** → Delete
- **📦 Box** → Archive
- **+ Plus** → Add
- **🔍 Search** → Search/Find

---

## 📐 Layout Specifications

### **Spacing**
- Group headers: `py-1 px-2`
- Conversation items: `gap-2 p-2`
- Icons: `h-3 w-3` or `h-4 w-4`
- Search input: `h-8 text-xs`

### **Typography**
- Group headers: `text-xs font-semibold uppercase tracking-wider`
- Conversation titles: `text-sm font-medium`
- Timestamps: `text-xs text-muted-foreground`
- Badge numbers: `text-xs`

### **Borders & Highlights**
- Pinned: `border-l-2 border-l-yellow-500`
- Active: `border-l-4 border-l-vital-primary-600`
- User-added: `border-l-2 border-l-green-500`

---

## 🎬 Animation & Transitions

### **Hover States**
- Menu button: `opacity-0` → `opacity-100` on hover
- All buttons: `transition-colors`
- Conversation rows: `transition-all`

### **Collapsible Groups**
- Chevron rotation: `rotate-180` when open
- Content: Smooth height transition

### **Search Results**
- Instant filtering (no animation)
- Empty states appear smoothly

---

## ✨ Polish Details

### **Empty States**
- "No consultations yet" when no conversations
- "No agents match your search" when search fails
- Clean iconography (SparklesIcon, SearchIcon)
- Clear calls-to-action ("Browse Agent Store")

### **Loading States**
- Spinner icons for loading
- Disabled buttons during operations
- "Loading consultations…" text

### **Accessibility**
- Focus states with ring
- Keyboard navigation support
- ARIA labels on buttons
- Semantic HTML structure

---

## 🏆 Gold-Standard Comparison

| Feature | Before | After | Inspiration |
|---------|--------|-------|-------------|
| Organization | Flat list | Time-grouped | ChatGPT ✓ |
| Search | None | Real-time | Claude ✓ |
| Pin | None | With highlight | Linear ✓ |
| Archive | None | Hide without delete | Gmail ✓ |
| Actions | None | Hover menu | Notion ✓ |
| Visual | Basic | Icons & colors | Perplexity ✓ |
| Persistence | None | localStorage | ChatGPT ✓ |

---

## 🎯 User Flow Example

### **Finding a Conversation**
1. **Open sidebar** → See conversations grouped by time
2. **Scan groups** → Today? Yesterday? Last 7 Days?
3. **Use search** → Type "FDA" to filter
4. **Click conversation** → Opens in main area

### **Managing Important Consultation**
1. **Hover over conversation** → See ⋮ menu
2. **Click ⋮** → Dropdown appears
3. **Click "Pin"** → Moves to Pinned section
4. **Yellow highlight** → Easy to spot later

### **Cleaning Up Old Conversations**
1. **Scroll to Older section** → See old consultations
2. **Hover and click ⋮** → Open menu
3. **Click "Archive"** → Conversation disappears
4. **Clutter reduced** → Cleaner sidebar

---

This visual guide shows the **gold-standard** sidebar experience that matches industry leaders like ChatGPT, Claude, and Linear! 🚀

---

## ⌨️ Phase 2: Keyboard Shortcuts

### **Keyboard Shortcuts Help Overlay**
Press `?` to toggle:

```
┌──────────────────────────────────────────────┐
│ ⌘  Keyboard Shortcuts                        │
├──────────────────────────────────────────────┤
│ Boost your productivity with these shortcuts│
│                                              │
│ NAVIGATION                                   │
│ ┌──────────────────────────────────────┐   │
│ │ Quick search conversations     ⌘K    │   │
│ │ Navigate to previous           ↑     │   │
│ │ Navigate to next               ↓     │   │
│ │ Open selected conversation     Enter │   │
│ └──────────────────────────────────────┘   │
│                                              │
│ ACTIONS                                      │
│ ┌──────────────────────────────────────┐   │
│ │ Pin/Unpin active conversation  ⌘P    │   │
│ │ New consultation               ⌘N    │   │
│ │ Refresh conversations & agents ⌘R    │   │
│ └──────────────────────────────────────┘   │
│                                              │
│ Press ? to toggle this help dialog           │
└──────────────────────────────────────────────┘
```

### **Keyboard Selection Indicator**
When navigating with arrow keys:

```
┌─────────────────────────────────────┐
│ 🕐 TODAY                            │
├─────────────────────────────────────┤
│ ┌─────────────────────────────┐    │
│ │ 👤 Clinical Trial Design   │    │ ← Normal
│ │     2 hrs ago         [8]  │    │
│ └─────────────────────────────┘    │
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━┓    │
│ ┃ 👤 Market Access Planning ┃    │ ← Keyboard Selected (Ring)
│ ┃     3 hrs ago         [5] ┃    │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━┛    │
│ ┌─────────────────────────────┐    │
│ │ 👤 Safety Report Review    │    │ ← Normal
│ └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

---

## 👁️ Phase 2: Agent Preview Cards

### **Agent Hover Preview**
Hover over any agent for 300ms:

```
Sidebar                    Preview Card
┌──────────────┐          ┌──────────────────────────────────┐
│ Tier 1       │          │ ╔════════════════════════════════╗│
│ ┌──────────┐ │          │ ║ 🤖 FDA Regulatory Expert      ║│
│ │🤖 FDA Reg│─┼─────────▶│ ║ Tier 1  ✨ 8 skills           ║│
│ └──────────┘ │          │ ╚════════════════════════════════╝│
│              │          │                                   │
│              │          │ Expert in FDA regulatory affairs, │
│              │          │ 510(k) submissions, and compliance│
│              │          │ strategies for medical devices.   │
│              │          │                                   │
│              │          │ EXPERTISE                         │
│              │          │ [FDA 510(k)] [PMA] [IDE]         │
│              │          │ [GMP] [QSR] [21 CFR] +2 more     │
│              │          │                                   │
│              │          │ ┌──────┬──────┬──────┐          │
│              │          │ │ 💬   │ ⏱️   │ 📈   │          │
│              │          │ │ 42   │ 1.2s │ 95%  │          │
│              │          │ │ Chats│ Time │ Rate │          │
│              │          │ └──────┴──────┴──────┘          │
│              │          │                                   │
│              │          │ [✨ Add to Consultation]         │
│              │          └───────────────────────────────────┘
└──────────────┘
```

### **Preview Card States**

**Selected Agent:**
```
┌──────────────────────────────────┐
│ ╔════════════════════════════════╗│
│ ║ 🤖 Clinical Trial Designer    ║│
│ ║ Tier 1  ✨ 6 skills           ║│
│ ╚════════════════════════════════╝│
│                                   │
│ [... details ...]                 │
│                                   │
│ [💬 Selected for Chat]  ← Blue   │
└───────────────────────────────────┘
```

**Not Selected:**
```
┌──────────────────────────────────┐
│ ╔════════════════════════════════╗│
│ ║ 🤖 Market Access Expert       ║│
│ ║ Tier 2  ✨ 5 skills           ║│
│ ╚════════════════════════════════╝│
│                                   │
│ [... details ...]                 │
│                                   │
│ [✨ Add to Consultation]          │
└───────────────────────────────────┘
```

---

## 🎯 Combined User Flow: Power User Edition

### **Scenario: Find and Pin Important Conversation (Keyboard Only)**

1. **Press `⌘K`**
   ```
   ┌─────────────────────────────────────┐
   │ 🔍 [FDA|]  ← Cursor auto-focused    │
   └─────────────────────────────────────┘
   ```

2. **Type "FDA"**
   ```
   ┌─────────────────────────────────────┐
   │ 🔍 [FDA]                            │
   ├─────────────────────────────────────┤
   │ 📌 PINNED                           │
   │ ┌─────────────────────────────┐    │
   │ │ 📌 FDA 510(k) Strategy ✓   │    │ ← Match
   │ └─────────────────────────────┘    │
   │                                     │
   │ 🕐 TODAY                            │
   │ (no matches)                        │
   └─────────────────────────────────────┘
   ```

3. **Press `↓` to navigate**
   ```
   ┌─────────────────────────────────────┐
   │ 📌 PINNED                           │
   │ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━┓    │
   │ ┃ 📌 FDA 510(k) Strategy    ┃    │ ← Selected
   │ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━┛    │
   └─────────────────────────────────────┘
   ```

4. **Press `Enter` to open**
   - Conversation opens in main area

5. **Press `⌘P` to pin**
   - Yellow highlight appears
   - Pin icon shows
   - Moves to Pinned section (if wasn't already)

**Total Time:** ~3 seconds  
**Mouse Clicks:** 0  
**Keyboard Strokes:** 7 (⌘K, F, D, A, ↓, Enter, ⌘P)

---

## 🎨 Phase 2 Visual Polish Details

### **Keyboard Selection Ring**
- Color: `ring-vital-primary-300`
- Background: `bg-vital-primary-50/30`
- Animation: Smooth transitions
- Only shows when navigating with keyboard

### **Agent Preview Card Gradient**
- Header: `from-vital-primary-500 to-vital-primary-700`
- Text: White on gradient
- Avatar: White border with shadow
- Stats: 3-column grid with icons

### **Shortcut Help Dialog**
- Max width: 2xl
- Grouped by category
- Badge for each key combination
- Platform-aware symbols (⌘ vs Ctrl)

---

This visual guide now includes all Phase 1 and Phase 2 features! 🚀✨

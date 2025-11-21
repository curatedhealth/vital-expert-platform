# Ask Expert - Modern Interface Design (ChatGPT/Claude Style)

## Design Philosophy

**Inspired by:** ChatGPT, Claude.ai, Perplexity
**Principles:** Clean, Minimalist, User-Friendly, Advanced Features Hidden Until Needed

---

## Key Design Changes

### 1. Full-Screen Chat Experience ✨

**Before (Old):**
- Split view with cards
- Mode selection takes full screen
- Cluttered with options

**After (Modern):**
- Chat-first interface
- Full-screen conversation
- Mode toggles hidden in collapsible panel
- Clean, distraction-free

### 2. Collapsible Sidebar 📂

**Features:**
- Conversation history (like ChatGPT)
- "New Conversation" button at top
- User profile at bottom
- Smooth slide animation
- Toggle with hamburger menu

### 3. Subtle Mode Selection 🎛️

**Before:** 5 large mode cards
**After:** 2 toggle switches in collapsible settings panel

**Location:** Top bar, accessible via Settings icon
**Behavior:** Collapsed by default, opens smoothly when clicked

### 4. ChatGPT-Style Welcome Screen 🌟

**Features:**
- Centered welcome message
- Large gradient icon
- Context-aware heading (changes with mode)
- 4 suggested prompts as clickable cards
- Minimal, elegant

### 5. Clean Message Display 💬

**User Messages:**
- Right-aligned
- Blue background (#3B82F6)
- White text
- Rounded corners (18px)
- User avatar on right

**Assistant Messages:**
- Left-aligned
- Light gray background (#F3F4F6)
- Dark text
- Markdown rendering
- Agent avatar on left
- Agent name label above message

### 6. Modern Input Area ⌨️

**Features:**
- Auto-expanding textarea
- Rounded corners (16px)
- Send button inside input (bottom-right)
- Keyboard shortcuts displayed below
- Context-aware placeholder
- Disabled state when agent not selected

### 7. Smooth Animations 🎭

**Using Framer Motion:**
- Sidebar slide in/out
- Settings panel expand/collapse
- Message fade in
- Agent selector dropdown
- Smooth transitions everywhere

---

## UI Components Breakdown

### Header Bar

```
┌────────────────────────────────────────────────┐
│ [☰] Ask Expert [Mode Badge]    [Agent] [⚙️]   │
└────────────────────────────────────────────────┘
```

**Left:**
- Hamburger menu (toggle sidebar)
- "Ask Expert" title
- Small mode badge

**Right:**
- Agent selector (manual modes only)
- Settings icon (toggle mode panel)

### Collapsible Settings Panel

```
┌────────────────────────────────────────────────┐
│  Conversation Type  [Toggle]  Expert Selection │
│  💬 Interactive                 👤 Manual       │
│  🤖 Autonomous                  ✨ Automatic    │
└────────────────────────────────────────────────┘
```

**Features:**
- Two side-by-side cards
- Toggle switches for each axis
- Visual indicators show current selection
- Collapses when user starts typing

### Welcome Screen (Empty State)

```
         ╔═══════════════════════╗
         ║     ✨ Icon          ║
         ╚═══════════════════════╝

    How can I help you today?

  Ask me anything and I'll provide expert insights.

┌──────────────┐  ┌──────────────┐
│ 📋 Suggested │  │ 💊 Suggested │
│    Prompt 1  │  │    Prompt 2  │
└──────────────┘  └──────────────┘
┌──────────────┐  ┌──────────────┐
│ 💰 Suggested │  │ 🔬 Suggested │
│    Prompt 3  │  │    Prompt 4  │
└──────────────┘  └──────────────┘
```

### Message Bubbles

**User Message:**
```
                        ┌──────────────────┐
                        │ User message     │ 👤
                        │ text here        │
                        └──────────────────┘
                           2:30 PM
```

**Assistant Message:**
```
🤖  FDA Regulatory Strategist
┌──────────────────┐
│ Based on the FDA │
│ guidelines...    │
│                  │
│ **Key Points:**  │
│ 1. First point   │
└──────────────────┘
   2:31 PM
```

### Input Area

```
┌─────────────────────────────────────────────┐
│ Describe your goal (e.g., "Create...")     │
│                                         [→] │
└─────────────────────────────────────────────┘
  Press Enter to send, Shift+Enter for new line
```

**Features:**
- Auto-expanding (up to 4 lines)
- Send button inside (right corner)
- Rounded corners
- Context-aware placeholder
- Keyboard shortcut hints

### Agent Selector (Manual Mode)

```
Top Bar:
┌──────────────────────────────────────┐
│ [Photo] FDA Regulatory Strategist ▼ │
└──────────────────────────────────────┘

Dropdown Panel (when opened):
┌──────────┬──────────┬──────────┐
│ [Agent1] │ [Agent2] │ [Agent3] │
│ Name     │ Name     │ Name     │
│ Desc...  │ Desc...  │ Desc...  │
├──────────┼──────────┼──────────┤
│ [Agent4] │ [Agent5] │ [Agent6] │
└──────────┴──────────┴──────────┘
```

---

## Color Scheme

### Light Mode (Default)

**Background:**
- Primary: `#FFFFFF` (pure white)
- Secondary: `#F9FAFB` (gray-50)
- Tertiary: `#F3F4F6` (gray-100)

**Text:**
- Primary: `#111827` (gray-900)
- Secondary: `#6B7280` (gray-500)
- Tertiary: `#9CA3AF` (gray-400)

**Accent:**
- Primary: `#3B82F6` (blue-600) - User messages
- Success: `#10B981` (green-500)
- Warning: `#F59E0B` (amber-500)
- Purple: `#A855F7` (purple-500)

**Borders:**
- Light: `#E5E7EB` (gray-200)
- Medium: `#D1D5DB` (gray-300)

### Dark Mode

**Background:**
- Primary: `#030712` (gray-950)
- Secondary: `#111827` (gray-900)
- Tertiary: `#1F2937` (gray-800)

**Text:**
- Primary: `#F9FAFB` (gray-50)
- Secondary: `#9CA3AF` (gray-400)
- Tertiary: `#6B7280` (gray-500)

**Borders:**
- Light: `#1F2937` (gray-800)
- Medium: `#374151` (gray-700)

---

## Typography

**Font:** System fonts (San Francisco on Mac, Segoe UI on Windows, Roboto on Android)

**Sizes:**
- Heading: `30px` / `1.875rem` (text-3xl)
- Title: `24px` / `1.5rem` (text-2xl)
- Subtitle: `18px` / `1.125rem` (text-lg)
- Body: `14px` / `0.875rem` (text-sm)
- Caption: `12px` / `0.75rem` (text-xs)
- Micro: `10px` / `0.625rem` (text-[10px])

**Weights:**
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

---

## Spacing

**Scale:** Tailwind's 4px spacing scale

**Padding:**
- Container: `16px` (p-4)
- Cards: `16px` (p-4)
- Buttons: `12px 16px` (px-4 py-3)
- Input: `12px 16px` (px-4 py-3)

**Gaps:**
- Between messages: `24px` (gap-6)
- Between elements: `12px` (gap-3)
- Between sections: `16px` (gap-4)

**Margins:**
- Section: `24px` (my-6)
- Element: `12px` (my-3)

---

## Border Radius

**Scale:**
- Small: `8px` (rounded-lg)
- Medium: `12px` (rounded-xl)
- Large: `16px` (rounded-2xl)
- Extra Large: `20px` (rounded-3xl)
- Full: `9999px` (rounded-full)

**Usage:**
- Message bubbles: `16px` (rounded-2xl)
- Input: `16px` (rounded-2xl)
- Cards: `12px` (rounded-xl)
- Buttons: `12px` (rounded-xl)
- Avatars: Full (rounded-full)
- Agent cards: `8px` (rounded-lg)

---

## Animations

### Sidebar
```typescript
<motion.aside
  initial={{ x: -280 }}
  animate={{ x: 0 }}
  exit={{ x: -280 }}
  transition={{ duration: 0.2 }}
>
```

### Settings Panel
```typescript
<motion.div
  initial={{ height: 0, opacity: 0 }}
  animate={{ height: 'auto', opacity: 1 }}
  exit={{ height: 0, opacity: 0 }}
  transition={{ duration: 0.2 }}
>
```

### Message Fade In
```typescript
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.2 }}
>
```

---

## Responsive Breakpoints

**Mobile:** < 768px
- Single column
- Sidebar as overlay
- Smaller text
- Stacked agent cards

**Tablet:** 768px - 1024px
- Two-column agent grid
- Sidebar toggleable
- Normal text

**Desktop:** > 1024px
- Three-column agent grid
- Sidebar always visible option
- Large text
- Max width: 1024px (max-w-4xl)

---

## Advanced Features

### 1. Keyboard Shortcuts

- `Enter` - Send message
- `Shift + Enter` - New line
- `Cmd/Ctrl + K` - New conversation
- `Cmd/Ctrl + B` - Toggle sidebar
- `Cmd/Ctrl + ,` - Toggle settings
- `Escape` - Close dropdowns

### 2. Streaming Indicators

**While streaming:**
- Animated cursor pulse
- "Thinking..." indicator
- Partial content display
- Disable input

### 3. Context Preservation

**Features:**
- Conversation history in sidebar
- Auto-save every message
- Resume from last conversation
- Export conversation (TODO)

### 4. Smart Suggestions

**Based on:**
- Previous conversations
- Common queries
- Domain-specific templates
- User history (TODO)

### 5. Agent Profiles

**Quick View:**
- Avatar + name in message
- Expertise badges
- Response count

**Full Profile (TODO):**
- Complete capabilities
- Example queries
- Success rate
- User ratings

---

## Accessibility

### ARIA Labels

- Sidebar: `aria-label="Conversation history"`
- Input: `aria-label="Message input"`
- Send button: `aria-label="Send message"`
- Settings: `aria-label="Mode settings"`
- Agent selector: `aria-label="Select expert"`

### Keyboard Navigation

- Tab through all interactive elements
- Focus indicators on all buttons
- Skip to main content
- Escape closes modals/dropdowns

### Screen Reader Support

- Announce new messages
- Describe mode changes
- Read agent selections
- Announce loading states

### Color Contrast

- Text: 4.5:1 minimum (WCAG AA)
- Large text: 3:1 minimum
- Interactive elements: 3:1 minimum
- Test with dark mode

---

## Performance Optimizations

### 1. Code Splitting
- Lazy load sidebar
- Lazy load agent selector
- Lazy load markdown renderer
- Lazy load animations

### 2. Memoization
```typescript
const memoizedMessages = useMemo(() => messages, [messages]);
const memoizedAgents = useMemo(() => agents, [agents]);
```

### 3. Virtual Scrolling (TODO)
- For long conversations (> 100 messages)
- For agent list (> 50 agents)

### 4. Debouncing
- Input auto-save: 500ms
- Search agents: 300ms
- Resize textarea: 100ms

---

## Mobile Optimizations

### Touch Targets
- Minimum 44px height
- Adequate spacing (12px min)
- No hover-only features
- Large tap areas

### Gestures
- Swipe right to open sidebar
- Swipe left to close sidebar
- Pull to refresh (TODO)
- Pinch to zoom messages (accessibility)

### Layout
- Single column on mobile
- Bottom navigation (TODO)
- Floating action button for new conversation
- Sticky input at bottom

---

## Comparison: Old vs New

| Feature | Old Interface | New Interface |
|---------|---------------|---------------|
| **Mode Selection** | 5 large cards, always visible | 2 toggles in collapsible panel |
| **Layout** | Split view, cluttered | Full-screen chat, clean |
| **Sidebar** | Fixed agents list | Collapsible conversations |
| **Welcome** | Static text | Animated icon + suggestions |
| **Messages** | Basic bubbles | Polished with markdown |
| **Input** | Standard textarea | Auto-expanding with shortcuts |
| **Agent Selection** | Large dropdown | Compact grid dropdown |
| **Settings** | Separate page | Inline collapsible panel |
| **Animations** | None | Smooth framer-motion |
| **Mobile** | Not optimized | Fully responsive |

---

## Implementation Checklist

### Phase 1: Core UI ✅
- [x] Create modern page component
- [x] Implement 2-toggle system
- [x] Build collapsible sidebar
- [x] Design message bubbles
- [x] Create input area
- [x] Add welcome screen

### Phase 2: Features (Next)
- [ ] Connect to real API
- [ ] Implement streaming
- [ ] Add conversation persistence
- [ ] Build agent selector dropdown
- [ ] Add keyboard shortcuts
- [ ] Implement dark mode toggle

### Phase 3: Polish (Future)
- [ ] Add loading skeletons
- [ ] Implement error states
- [ ] Add retry logic
- [ ] Create export function
- [ ] Add search conversations
- [ ] Build analytics

---

## File Structure

```
/app/(app)/ask-expert/
├── page.tsx                    (OLD - 5-mode cards)
├── page-complete.tsx           (OLD - Enhanced 5-mode)
├── page-modern.tsx            (NEW - ChatGPT style) ✨
└── components/
    ├── MessageBubble.tsx       (TODO - Extract)
    ├── WelcomeScreen.tsx       (TODO - Extract)
    ├── ModeSettings.tsx        (TODO - Extract)
    └── AgentSelector.tsx       (TODO - Extract)
```

---

## Next Steps

1. **Test the new interface** - Load `/ask-expert` and verify UI
2. **Connect real API** - Replace `simulateResponse` with actual backend call
3. **Add persistence** - Save conversations to Supabase
4. **Extract components** - Split page-modern.tsx into smaller components
5. **Add tests** - Unit tests for components, E2E tests for flows
6. **Gather feedback** - User testing with digital-health-startups tenant

---

*Design Version: 1.0*
*Date: October 26, 2025*
*Status: Implementation Complete - Ready for Testing*

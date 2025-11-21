# Mode 1 Helper - Product Requirements Document

**Version**: 1.0  
**Status**: In Development  
**Target Release**: Q1 2025  
**Owner**: Ask Expert Team

---

## 🎯 Vision

Transform Mode 1 from "just another option" into a **delightful, memorable first experience** that guides users to success with micro-interactions, smart animations, and contextual help that feels natural, not intrusive.

---

## 📋 Overview

**What**: An interactive helper component for Mode 1 (Manual Expert Selection) that educates, guides, and delights users through engaging interactions and contextual reactions.

**Why**: Users need clear guidance on when/how to use Mode 1, but traditional help text is boring and ignored. We need to make help **engaging, contextual, and memorable**.

**Who**: First-time users, returning users exploring Mode 1, users needing clarification.

---

## 🎨 Core Experience Principles

### 1. **Delightful, Not Boring**
- Use micro-animations and smooth transitions
- Celebrate user actions with subtle reactions
- Make learning feel like discovery, not instruction

### 2. **Contextual & Smart**
- Show help when it's relevant, hide when it's not
- React to user behavior (hover, selection, hesitation)
- Provide examples that match the user's context

### 3. **Non-Intrusive**
- Always available but never blocking
- Can be dismissed without losing value
- Doesn't interfere with workflow

### 4. **Memorable**
- Use visual metaphors (e.g., "target" for precision)
- Create "aha moments" through interactive examples
- Build confidence through progressive disclosure

---

## 🎯 User Goals

### Primary Goals
- **Understand** when to use Mode 1 vs. other modes
- **Feel confident** selecting the right expert
- **Learn** through example, not explanation
- **Succeed** with their first query

### Success Metrics
- ⏱️ **Time to first query**: Reduce by 30%
- 📈 **Mode 1 usage**: Increase by 25%
- 😊 **User satisfaction**: Score >4.5/5
- 🔄 **Helper engagement**: >60% of users interact with it

---

## 🎭 User Experience Flow

### First-Time User Journey

```
┌─────────────────────────────────────────────────────────┐
│  STEP 1: Mode 1 Card Selected                           │
│  ─────────────────────────────────────────────────────── │
│                                                           │
│  [Mode 1 Card]                                           │
│  ┌─────────────────────────────────────────────┐       │
│  │  🎯 Manual Expert Selection      [ℹ️]        │       │
│  │  Choose your specific expert                │       │
│  │                                              │       │
│  │  [Helper icon pulses softly, inviting]      │       │
│  └─────────────────────────────────────────────┘       │
│                                                           │
│  ✨ Animation: Card gently highlights, helper icon      │
│     pulses 2-3 times, then settles                     │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│  STEP 2: User Hovers Helper Icon                        │
│  ─────────────────────────────────────────────────────── │
│                                                           │
│  [Helper Tooltip Appears - Smooth Slide-in]             │
│  ┌─────────────────────────────────────────────┐       │
│  │  💡 Quick Tip                               │       │
│  │  Perfect when you know which expert to ask │       │
│  │  [Click for more] →                        │       │
│  └─────────────────────────────────────────────┘       │
│                                                           │
│  ✨ Animation: Tooltip slides in from top-right,       │
│     fades in with gentle bounce                          │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│  STEP 3: User Clicks Helper (Optional)                  │
│  ─────────────────────────────────────────────────────── │
│                                                           │
│  [Expanded Helper Panel - Smooth Expand]                │
│  ┌─────────────────────────────────────────────┐       │
│  │  🎯 Mode 1 Helper                            │       │
│  │  ─────────────────────────────────────────── │       │
│  │                                               │       │
│  │  ✅ When to Use:                             │       │
│  │  [Checkbox animations appear one by one]     │       │
│  │  ✓ You know which expert                      │       │
│  │  ✓ You have a specific question               │       │
│  │  ✓ You need a quick answer                    │       │
│  │                                               │       │
│  │  🎬 How It Works:                            │       │
│  │  [Step-by-step animation]                     │       │
│  │  1️⃣ Select Expert → [Icon animates]          │       │
│  │  2️⃣ Ask Question → [Icon animates]          │       │
│  │  3️⃣ Get Answer → [Icon animates + sparkle]  │       │
│  │                                               │       │
│  │  💡 Example:                                  │       │
│  │  [Interactive example card]                  │       │
│  │  "What are FDA 510(k) requirements?"          │       │
│  │  → [Click to see demo]                       │       │
│  │                                               │       │
│  │  [Try Example] [Got it] [Compare Modes]      │       │
│  └─────────────────────────────────────────────┘       │
│                                                           │
│  ✨ Animation: Panel expands with smooth spring,        │
│     content animates in sequence (staggered)              │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│  STEP 4: User Selects Expert (Reaction)                  │
│  ─────────────────────────────────────────────────────── │
│                                                           │
│  [Expert Card Selected]                                 │
│  ┌─────────────────────────────────────────────┐       │
│  │  ✅ Regulatory Expert Selected               │       │
│  │  [Small celebration animation]                 │       │
│  └─────────────────────────────────────────────┘       │
│                                                           │
│  [Helper Reacts - Contextual Tip]                        │
│  ┌─────────────────────────────────────────────┐       │
│  │  ✨ Great choice!                             │       │
│  │  This expert specializes in FDA regulations │       │
│  │  [Helper auto-collapses after 3 seconds]     │       │
│  └─────────────────────────────────────────────┘       │
│                                                           │
│  ✨ Animation: Confetti particles, checkmark bounce,    │
│     helper shows contextual tip then gracefully fades   │
└──────────────────────┬──────────────────────────────────┘
```

---

## 🎨 Component Design

### Primary Component: `Mode1Helper`

**Location**: Next to Mode 1 card title (inline with header)

**States**:
1. **Collapsed** (default): Small info icon (ℹ️) with subtle pulse
2. **Hover**: Tooltip preview with quick tip
3. **Expanded**: Full helper panel with interactive content
4. **Contextual**: Reacts to user actions (expert selection, query input)

### Visual Design

```
┌─────────────────────────────────────────────────────────┐
│  Mode 1: Manual Expert Selection      [ℹ️] ← Helper      │
│  ─────────────────────────────────────────────────────── │
│                                                           │
│  [Mode 1 Card Content]                                  │
└─────────────────────────────────────────────────────────┘
```

**Helper Icon**:
- **Color**: Blue (#3B82F6) matching Mode 1 theme
- **Size**: 20px × 20px
- **Animation**: Gentle pulse (2s loop) when collapsed, stops on hover
- **Hover Effect**: Scales to 1.1x, slight glow

**Tooltip** (on hover):
- **Position**: Top-right of icon
- **Animation**: Slide-in from top-right (200ms), fade-in
- **Content**: Quick tip (1-2 lines)
- **Auto-dismiss**: After 5 seconds of no interaction

**Expanded Panel** (on click):
- **Position**: Below Mode 1 card, full width
- **Animation**: Smooth expand (300ms spring animation)
- **Content**: Interactive sections (see below)
- **Dismiss**: Click outside, ESC key, or "Got it" button

---

## 🎯 Interactive Features

### 1. **Animated "How It Works" Section**

```
┌─────────────────────────────────────────────────────────┐
│  🎬 How It Works                                         │
│  ─────────────────────────────────────────────────────── │
│                                                           │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐         │
│  │  1️⃣      │ →  │  2️⃣      │ →  │  3️⃣      │         │
│  │  Select  │    │  Ask     │    │  Get     │         │
│  │  Expert  │    │  Question│    │  Answer  │         │
│  └──────────┘    └──────────┘    └──────────┘         │
│                                                           │
│  [Play animation on hover/click]                          │
│  [Each step animates with icon bounce + sparkle]          │
└─────────────────────────────────────────────────────────┘
```

**Interaction**:
- **Hover**: Steps highlight in sequence
- **Click**: Full animation plays (3 seconds)
- **Visual**: Icons bounce, arrows animate, sparkle effect on completion

### 2. **Interactive Example Cards**

```
┌─────────────────────────────────────────────────────────┐
│  💡 Try an Example                                        │
│  ─────────────────────────────────────────────────────── │
│                                                           │
│  ┌─────────────────────────────────────────────┐       │
│  │  "What are FDA 510(k) requirements?"        │       │
│  │  → Regulatory Expert                         │       │
│  │  [Click to try]                              │       │
│  └─────────────────────────────────────────────┘       │
│                                                           │
│  [On click: Auto-fills query, selects expert]           │
│  [Animation: Card lifts, fills input smoothly]           │
└─────────────────────────────────────────────────────────┘
```

**Interaction**:
- **Click example**: Auto-fills query input, selects recommended expert
- **Animation**: Card "lifts" and content flows to input field
- **Feedback**: Success message "Example loaded! Ready to send."

### 3. **Contextual Reactions**

The helper **reacts** to user actions:

| User Action | Helper Reaction |
|------------|----------------|
| **Selects Mode 1** | Helper icon pulses 2-3 times, then settles |
| **Hovers icon** | Quick tip tooltip appears (smooth slide-in) |
| **Selects expert** | Celebration animation + contextual tip |
| **Types query** | Helper shows "Great question!" tip |
| **Hesitates 5+ seconds** | Helper suggests "Need help picking an expert?" |
| **Completes first query** | Helper shows "🎉 You're all set!" and auto-hides |

### 4. **Smart Comparisons**

```
┌─────────────────────────────────────────────────────────┐
│  🤔 Not Sure? Compare Modes                              │
│  ─────────────────────────────────────────────────────── │
│                                                           │
│  [Interactive comparison table]                           │
│  ┌──────────┬──────────┬──────────┬──────────┐         │
│  │  Mode 1  │  Mode 2  │  Mode 3  │  Mode 4  │         │
│  ├──────────┼──────────┼──────────┼──────────┤         │
│  │  Manual  │  Auto    │  Manual+ │  Auto+   │         │
│  │  Selection│ Selection│ Autonomous│ Autonomous│       │
│  └──────────┴──────────┴──────────┴──────────┘         │
│                                                           │
│  [Hover over mode → Highlights differences]              │
│  [Click mode → Expands explanation]                      │
└─────────────────────────────────────────────────────────┘
```

**Interaction**:
- **Hover**: Highlights differences between modes
- **Click**: Expands detailed explanation of selected mode
- **Visual**: Smooth transitions, color-coded highlights

---

## 🎬 Animation & Effects

### Micro-Interactions

1. **Helper Icon Pulse**
   - **Trigger**: Mode 1 selected, first-time user
   - **Effect**: Gentle scale (1.0 → 1.05 → 1.0) with 2s loop
   - **Duration**: 2-3 pulses, then stops

2. **Tooltip Slide-in**
   - **Trigger**: Hover over helper icon
   - **Effect**: Slide from top-right (translateY: -10px, opacity: 0 → 1)
   - **Duration**: 200ms ease-out
   - **Bounce**: Subtle bounce on entry (spring animation)

3. **Panel Expand**
   - **Trigger**: Click helper icon
   - **Effect**: Smooth height expansion with spring animation
   - **Duration**: 300ms
   - **Stagger**: Content animates in sequence (50ms delay between items)

4. **Celebration on Expert Selection**
   - **Trigger**: User selects expert
   - **Effect**: Confetti particles (5-10 particles), checkmark bounce
   - **Duration**: 500ms
   - **Sound**: Optional subtle "ding" (user preference)

5. **Example Card Interaction**
   - **Trigger**: Click example card
   - **Effect**: Card lifts (translateY: -5px), content flows to input
   - **Duration**: 400ms
   - **Feedback**: Success message with checkmark

### Visual Effects

1. **Gradient Backgrounds**
   - Helper panel: Subtle blue gradient (matching Mode 1 theme)
   - Hover states: Slight glow effect

2. **Sparkle Effects**
   - Completion animations: Subtle sparkle particles
   - Success states: Star icons with fade-out

3. **Smooth Transitions**
   - All state changes: 200-300ms transitions
   - Color changes: Smooth color interpolation
   - Size changes: Spring animations for natural feel

---

## 📱 Responsive Behavior

### Desktop (>1024px)
- Helper icon: Inline with Mode 1 title
- Expanded panel: Full width below card
- Tooltip: Top-right positioning

### Tablet (768px - 1024px)
- Helper icon: Same position
- Expanded panel: Full width, slightly reduced padding
- Tooltip: Adjusts position to avoid overflow

### Mobile (<768px)
- Helper icon: Smaller size (18px)
- Expanded panel: Full width, stacked layout
- Tooltip: Bottom positioning (above icon)
- Interactions: Tap-friendly (larger touch targets)

---

## 🔧 Technical Requirements

### Component Structure

```typescript
<Mode1Helper
  variant="inline" | "modal" | "sidebar"
  position="top-right" | "bottom" | "inline"
  showOnFirstVisit={true}
  autoDismiss={true}
  dismissDelay={5000}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'inline' \| 'modal' \| 'sidebar'` | `'inline'` | Helper display style |
| `position` | `'top-right' \| 'bottom' \| 'inline'` | `'inline'` | Helper position |
| `showOnFirstVisit` | `boolean` | `true` | Show on first visit |
| `autoDismiss` | `boolean` | `true` | Auto-dismiss after actions |
| `dismissDelay` | `number` | `5000` | Auto-dismiss delay (ms) |
| `enableAnimations` | `boolean` | `true` | Enable animations |
| `enableSound` | `boolean` | `false` | Enable sound effects |

### State Management

- **User preferences**: Store dismissed state in localStorage
- **First-time flag**: Track first visit per user
- **Interaction tracking**: Track helper engagement for analytics

### Dependencies

- **Framer Motion**: Smooth animations
- **React Spring**: Spring animations for natural feel
- **Lucide Icons**: Icon library
- **Tailwind CSS**: Styling

---

## 🎯 Content Strategy

### Helper Content Sections

1. **What is Mode 1?** (1-2 sentences)
   - Clear, concise explanation
   - Visual metaphor (target icon for precision)

2. **When to Use** (3-4 bullet points)
   - ✅ Checkmark list with icons
   - Short, scannable statements

3. **How It Works** (3-step visual)
   - Animated step-by-step guide
   - Icons + text, interactive

4. **Examples** (2-3 interactive cards)
   - Real-world questions
   - Click to try functionality

5. **Compare Modes** (Optional)
   - Quick comparison table
   - Interactive hover/click states

### Tone & Voice

- **Friendly**: Use "you" and conversational tone
- **Encouraging**: Celebrate user actions
- **Clear**: No jargon, simple language
- **Helpful**: Action-oriented guidance

### Example Copy

**Helper Title**: "🎯 Mode 1 Helper"

**Quick Tip** (tooltip): "Perfect when you know which expert to ask"

**Expanded Content**:
```
✅ When to Use Mode 1:
• You know which expert to ask
• You have a specific, focused question
• You need a quick answer (20-30 seconds)

🎬 How It Works:
1️⃣ Select Expert → 2️⃣ Ask Question → 3️⃣ Get Answer

💡 Try an Example:
"What are FDA 510(k) requirements?"
→ Click to try this example
```

---

## ✅ Success Criteria

### Must Have (MVP)
- [x] Helper icon with hover tooltip
- [x] Expandable panel with core content
- [x] Smooth animations (icon pulse, panel expand)
- [x] Contextual reactions (expert selection)
- [x] Interactive examples (click to try)
- [x] Responsive design (mobile, tablet, desktop)

### Nice to Have (Phase 2)
- [ ] First-time user modal
- [ ] Sound effects (optional)
- [ ] Advanced animations (confetti, sparkles)
- [ ] Mode comparison table
- [ ] Analytics tracking

### Future Enhancements
- [ ] AI-powered expert recommendations
- [ ] Personalized examples based on user history
- [ ] Contextual tips based on query analysis
- [ ] Multi-language support

---

## 🚀 Launch Plan

### Phase 1: Core Helper (Week 1)
- Build `Mode1Helper` component
- Implement basic animations
- Add core content
- Test on desktop

### Phase 2: Interactions (Week 2)
- Add contextual reactions
- Implement interactive examples
- Add celebration animations
- Test on all devices

### Phase 3: Polish (Week 3)
- Fine-tune animations
- Optimize performance
- Add analytics
- User testing

### Phase 4: Launch (Week 4)
- Final QA
- Documentation
- Release to production
- Monitor metrics

---

## 📊 Metrics & Tracking

### Engagement Metrics
- **Helper interaction rate**: % of users who click helper
- **Time spent in helper**: Average time viewing helper content
- **Example usage**: % of users who click example cards
- **Dismiss rate**: % of users who dismiss helper

### Success Metrics
- **Time to first query**: Reduce by 30% (target: <2 minutes)
- **Mode 1 usage**: Increase by 25%
- **User satisfaction**: Score >4.5/5
- **Error rate**: Reduce query errors by 20%

### Analytics Events
- `mode1_helper_viewed`: Helper opened
- `mode1_helper_example_clicked`: Example clicked
- `mode1_helper_dismissed`: Helper dismissed
- `mode1_helper_completed`: User completes first query after viewing helper

---

## 🎨 Design Assets

### Icons
- Helper icon: `Info` or `HelpCircle` (Lucide)
- Checkmarks: `CheckCircle2` (Lucide)
- Target: `Target` (Lucide)
- Sparkles: `Sparkles` (Lucide)

### Colors
- **Primary**: Blue (#3B82F6) - Mode 1 theme
- **Success**: Green (#10B981) - Celebration
- **Hover**: Blue-50 (#EFF6FF) - Subtle background
- **Text**: Gray-900 (#111827) - Primary text

### Typography
- **Title**: Inter, 18px, semibold
- **Body**: Inter, 14px, regular
- **Helper tip**: Inter, 12px, medium

---

## 🔗 Related Documents

- [Mode 1 User Journey](./MODE1_USER_JOURNEY.md)
- [Mode 1 Test Plan](./MODE1_TEST_PLAN.md)
- [Ask Expert Feature Spec](./ASK_EXPERT_AUDIT.md)

---

**End of PRD**


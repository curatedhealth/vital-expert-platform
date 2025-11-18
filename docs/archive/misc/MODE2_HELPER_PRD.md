# Mode 2 Helper - Product Requirements Document

**Version**: 1.0
**Status**: Design Ready
**Target Release**: Q1 2025
**Owner**: Ask Expert Team

---

## 🎯 Vision

Transform Mode 2 from "automatic selection" into a **transparent, educational experience** that builds trust through visibility and celebrates AI intelligence with engaging animations and real-time feedback.

---

## 📋 Overview

**What**: An interactive helper component for Mode 2 (Automatic Expert Selection) that demonstrates AI intelligence, shows expert selection transparency, and educates users about multi-perspective analysis.

**Why**: Mode 2 is powerful but users don't see the "magic" - they need to understand and trust how AI selects experts and synthesizes multiple perspectives.

**Who**: Users who want comprehensive answers, first-time users exploring AI capabilities, users seeking validation of AI decisions.

---

## 🎨 Core Experience Principles

### 1. **Transparent Intelligence**
- Show how AI thinks and decides
- Reveal expert selection criteria
- Demonstrate multi-perspective value

### 2. **Educational & Trust-Building**
- Teach users about AI expert matching
- Build confidence through visibility
- Celebrate AI capabilities without overwhelming

### 3. **Interactive & Engaging**
- Real-time process visualization
- Animated expert selection
- Interactive examples and demos

### 4. **Progressive Disclosure**
- Start simple, reveal complexity on demand
- Context-aware help that adapts to user actions
- Gentle education through delightful interactions

---

## 🎯 User Goals

### Primary Goals
- **Trust** AI expert selection process
- **Understand** multi-perspective analysis value
- **Learn** how AI matches queries to experts
- **Feel confident** in comprehensive answers

### Success Metrics
- ⏱️ **Helper engagement**: >65% interaction rate
- 📈 **Mode 2 usage**: Increase to 60% of queries
- 😊 **Trust score**: >4.7/5 user confidence
- 🔄 **Demo completion**: >80% watch full process

---

## 🎭 User Experience Flow

### First-Time User Journey

```
┌─────────────────────────────────────────────────────────┐
│  STEP 1: Mode 2 Card Selected                           │
│  ─────────────────────────────────────────────────────── │
│                                                           │
│  [Mode 2 Card] - "Most Popular"                          │
│  ┌─────────────────────────────────────────────┐       │
│  │  ⚡ Automatic Expert Selection      [ℹ️]       │       │
│  │  AI selects best experts automatically       │       │
│  │                                              │       │
│  │  [Helper icon pulses invitingly]            │       │
│  └─────────────────────────────────────────────┘       │
│                                                           │
│  ✨ Animation: Card highlights, "Most Popular" badge    │
│     glows, helper icon pulses with curiosity effect      │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│  STEP 2: User Engages Helper                            │
│  ─────────────────────────────────────────────────────── │
│                                                           │
│  [Helper Tooltip Appears - Smooth Expand]               │
│  ┌─────────────────────────────────────────────┐       │
│  │  🤖 AI picks the best experts for you       │       │
│  │  [See how it works] →                      │       │
│  └─────────────────────────────────────────────┘       │
│                                                           │
│  ✨ Animation: Tooltip slides in, subtle glow effect    │
│     on "See how it works" link                           │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│  STEP 3: Interactive Process Demo                       │
│  ─────────────────────────────────────────────────────── │
│                                                           │
│  [Full Demo Panel - Animated Reveal]                    │
│  ┌─────────────────────────────────────────────┐       │
│  │  🎬 How Mode 2 Works (AI Expert Selection)   │       │
│  │  ─────────────────────────────────────────── │       │
│  │                                               │       │
│  │  ┌─────────────────────────────────────┐     │       │
│  │  │  Your Question                      │     │       │
│  │  │  "Best practices for clinical..."   │     │       │
│  │  └─────────────────────────────────────┘     │       │
│  │                                               │       │
│  │  ↓ [Animated arrow pulses]                    │       │
│  │                                               │       │
│  │  🤖 AI Analysis:                              │       │
│  │  [Animated word highlights]                   │       │
│  │  Keywords: clinical, trials, best practices   │       │
│  │  Domains: Research, Regulatory                │       │
│  │                                               │       │
│  │  ↓ [Expert avatars appear with bounce]        │       │
│  │                                               │       │
│  │  🎯 Selected Experts:                         │       │
│  │  ┌─────┐ ┌─────┐ ┌─────┐                    │       │
│  │  │ 🧑‍⚕️  │ │ 📋  │ │ 💰  │                    │       │
│  │  │Clin│ │Reg │ │Mkt │                    │       │
│  │  └─────┘ └─────┘ └─────┘                    │       │
│  │                                               │       │
│  │  [Expert names animate in sequence]          │       │
│  │                                               │       │
│  │  📚 Knowledge Search:                        │       │
│  │  [Search icons animate across domains]        │       │
│  │  Clinical + Regulatory + Market Access        │       │
│  │                                               │       │
│  │  ↓ [Merge animation]                          │       │
│  │                                               │       │
│  │  ✨ Synthesized Answer                        │       │
│  │  [Sparkle effect on final result]             │       │
│  │                                               │       │
│  │  [Try It Live] [Got It] [Compare Modes]      │       │
│  └─────────────────────────────────────────────┘       │
│                                                           │
│  ✨ Animation: Sequential reveals, smooth transitions,  │
│     expert avatars bounce in, sparkle effects            │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│  STEP 4: Live Query Experience                          │
│  ─────────────────────────────────────────────────────── │
│                                                           │
│  [User Types Query - Real-time Analysis]                │
│  ┌─────────────────────────────────────────────┐       │
│  │  Type your question...                       │       │
│  │                                               │       │
│  │  As user types:                               │       │
│  │  🤖 AI Analysis:                              │       │
│  │  Keywords: [highlight as detected]            │       │
│  │  Domains: [appear with confidence scores]     │       │
│  │  Experts: [avatars fade in with scores]       │       │
│  └─────────────────────────────────────────────┘       │
│                                                           │
│  ✨ Animation: Real-time keyword detection, expert      │
│     avatars appear with confidence bars, smooth updates │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│  STEP 5: Send Query - Process Visualization             │
│  ─────────────────────────────────────────────────────── │
│                                                           │
│  [Query Sent - Live Process Tracking]                   │
│  ┌─────────────────────────────────────────────┐       │
│  │  🔄 Processing Your Query...                 │       │
│  │                                               │       │
│  │  ┌─────────────────────────────────────┐     │       │
│  │  │  Step 1: Expert Selection            │     │       │
│  │  │  [✓] Clinical Trial Expert           │     │       │
│  │  │  [✓] Regulatory Expert               │     │       │
│  │  │  [✓] Market Access Expert            │     │       │
│  │  └─────────────────────────────────────┘     │       │
│  │                                               │       │
│  │  ┌─────────────────────────────────────┐     │       │
│  │  │  Step 2: Knowledge Search            │     │       │
│  │  │  [🔍] Searching clinical databases   │     │       │
│  │  │  [🔍] Analyzing regulatory guidelines│     │       │
│  │  │  [🔍] Reviewing market access data   │     │       │
│  │  └─────────────────────────────────────┘     │       │
│  │                                               │       │
│  │  ┌─────────────────────────────────────┐     │       │
│  │  │  Step 3: AI Synthesis                │     │       │
│  │  │  [🧠] Combining expert insights      │     │       │
│  │  │  [🧠] Generating comprehensive answer│     │       │
│  │  └─────────────────────────────────────┘     │       │
│  └─────────────────────────────────────────────┘       │
│                                                           │
│  ✨ Animation: Checkmarks appear, progress bars fill,   │
│     icons animate through states (search → found → merge)│
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│  STEP 6: Response with Contribution Highlights          │
│  ─────────────────────────────────────────────────────── │
│                                                           │
│  [Streaming Response with Expert Attribution]           │
│  ┌─────────────────────────────────────────────┐       │
│  │  🤖 AI-Synthesized Answer                    │       │
│  │                                               │       │
│  │  [Response streams with highlights]           │       │
│  │                                               │       │
│  │  📊 From Clinical Expert:                     │       │
│  │  "Phase 3 trials should include..."          │       │
│  │  [Clinical avatar appears, section highlights]│       │
│  │                                               │       │
│  │  📋 From Regulatory Expert:                   │       │
│  │  "FDA requires..."                           │       │
│  │  [Regulatory avatar appears, section highlights]│    │
│  │                                               │       │
│  │  💰 From Market Access Expert:                │       │
│  │  "Reimbursement considerations..."           │       │
│  │  [Market avatar appears, section highlights] │       │
│  │                                               │       │
│  │  🎯 Expert Selection Confidence: 94%         │       │
│  │                                               │       │
│  │  [Sources] [Copy] [Feedback] [Follow-up]     │       │
│  └─────────────────────────────────────────────┘       │
│                                                           │
│  ✨ Animation: Expert avatars appear with each section, │
│     subtle highlights, confidence meter fills            │
└──────────────────────┬──────────────────────────────────┘
```

---

## 🎨 Component Design

### Primary Component: `Mode2Helper`

**Location**: Next to Mode 2 card title (inline with header)

**States**:
1. **Collapsed** (default): Info icon with subtle pulse
2. **Tooltip** (hover): Quick explanation with "see how it works"
3. **Demo** (clicked): Full interactive process demonstration
4. **Live** (during query): Real-time analysis and progress tracking

### Visual Design

```
┌─────────────────────────────────────────────────────────┐
│  Mode 2: Automatic Expert Selection      [ℹ️] ← Helper    │
│  ─────────────────────────────────────────────────────── │
│                                                           │
│  [Mode 2 Card Content - "Most Popular" badge]            │
└─────────────────────────────────────────────────────────┘
```

**Helper Icon**:
- **Color**: Amber (#F59E0B) matching Mode 2 theme
- **Size**: 20px × 20px
- **Animation**: Subtle glow pulse (3s loop) when collapsed
- **Hover Effect**: Scales to 1.1x, amber glow

**Demo Panel**:
- **Width**: 480px (expandable)
- **Background**: Subtle amber gradient
- **Border**: Rounded corners, amber accent
- **Animation**: Smooth slide-in from top-right

---

## 🎯 Interactive Features

### 1. **Animated Process Visualization**

```
┌─────────────────────────────────────────────────────────┐
│  🎬 How AI Selects Experts (Interactive Demo)            │
│  ─────────────────────────────────────────────────────── │
│                                                           │
│  ┌─────────────────────────────────────────────┐       │
│  │  Your Question: "Best practices for..."     │       │
│  └─────────────────────────────────────────────┘       │
│                                                           │
│  ↓ [Animated flowing arrow]                             │
│                                                           │
│  🤖 AI Analysis                                         │
│  ┌─────────────────────────────────────────────┐       │
│  │  Keywords: [words appear with highlights]    │       │
│  │  clinical • trials • best practices          │       │
│  │                                              │       │
│  │  Domains: [domains fade in]                  │       │
│  │  🏥 Research • 📋 Regulatory • 💰 Market     │       │
│  └─────────────────────────────────────────────┘       │
│                                                           │
│  ↓ [Sparkle transition]                                 │
│                                                           │
│  🎯 Expert Selection                                    │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                 │       │
│  │ 🧑‍⚕️  │ │ 📋  │ │ 💰  │ │ 🤔  │                 │       │
│  │Clin│ │Reg │ │Mkt │ │ ?  │                 │       │
│  │ 95% │ │ 87% │ │ 76% │ │ 23% │                 │       │
│  └─────┘ └─────┘ └─────┘ └─────┘                 │       │
│                                                           │
│  [Confidence scores animate up from 0%]                 │
│  [Low confidence experts fade out]                       │
│                                                           │
│  📚 Knowledge Search                                    │
│  [Search beams emanate from each expert]                │
│  [Results counter increases: 0 → 5 → 12 → 18]          │
│                                                           │
│  ✨ Synthesis                                            │
│  [Experts' knowledge flows together]                    │
│  [Final answer crystalizes with sparkle effect]         │
└─────────────────────────────────────────────────────────┘
```

**Interactions**:
- **Play/Pause**: Control animation flow
- **Step Through**: Click to advance to next phase
- **Reset**: Restart the demo
- **Speed Control**: Adjust animation speed

### 2. **Real-time Query Analysis**

```
┌─────────────────────────────────────────────────────────┐
│  Live AI Analysis (as user types)                        │
│  ─────────────────────────────────────────────────────── │
│                                                           │
│  ┌─────────────────────────────────────────────┐       │
│  │  Your question: "best practices clinical"   │       │
│  │  [cursor blinking]                          │       │
│  └─────────────────────────────────────────────┘       │
│                                                           │
│  🤖 AI Thinking:                                       │
│  ┌─────────────────────────────────────────────┐       │
│  │  Detected Keywords:                           │       │
│  │  • clinical [highlight appears]               │       │
│  │  • trials [fade in]                           │       │
│  │  • best [slide in]                            │       │
│  │  • practices [bounce in]                      │       │
│  │                                               │       │
│  │  Identified Domains:                          │       │
│  │  🏥 Clinical Research [confidence bar: 0→95%] │       │
│  │  📋 Regulatory Affairs [0→87%]               │       │
│  │  💰 Market Access [0→76%]                     │       │
│  │                                               │       │
│  │  Matching Experts:                            │       │
│  │  [Expert cards slide in with confidence]      │       │
│  │  🧑‍⚕️ Clinical Trial Expert (95%)              │       │
│  │  📋 Regulatory Expert (87%)                   │       │
│  │  💰 Market Access Expert (76%)                │       │
│  └─────────────────────────────────────────────┘       │
│                                                           │
│  [Update in real-time as user types]                    │
└─────────────────────────────────────────────────────────┘
```

**Real-time Updates**:
- Keywords detected and highlighted as typed
- Domain identification with confidence bars
- Expert matching with animated card reveals
- Confidence scores update dynamically

### 3. **Expert Contribution Highlights**

```
┌─────────────────────────────────────────────────────────┐
│  Response with Expert Attribution                       │
│  ─────────────────────────────────────────────────────── │
│                                                           │
│  [Streaming response with visual attribution]           │
│                                                           │
│  🤖 "Based on comprehensive analysis from our           │
│     Clinical Trial, Regulatory, and Market Access      │
│     experts..."                                         │
│                                                           │
│  📊 Clinical Expert Contribution:                      │
│  ┌─────────────────────────────────────────────┐       │
│  │  "Phase 3 trials should include at least    │       │
│  │  300 patients across multiple sites..."     │       │
│  └─────────────────────────────────────────────┘       │
│  [Clinical avatar appears, section highlights blue]     │
│                                                           │
│  📋 Regulatory Expert Contribution:                     │
│  ┌─────────────────────────────────────────────┐       │
│  │  "FDA guidelines require..."                │       │
│  │  [Regulatory avatar appears, section highlights green]│
│  └─────────────────────────────────────────────┘       │
│                                                           │
│  💰 Market Access Expert Contribution:                   │
│  ┌─────────────────────────────────────────────┐       │
│  │  "Reimbursement strategies should..."       │       │
│  │  [Market avatar appears, section highlights amber]  │
│  └─────────────────────────────────────────────┘       │
│                                                           │
│  🎯 Overall Confidence: 94%                            │
│  [Confidence meter fills with celebration effect]       │
└─────────────────────────────────────────────────────────┘
```

**Visual Attribution**:
- Expert avatars appear with each contribution
- Color-coded section highlights
- Confidence meter with animated fill
- Sparkle effects on high-confidence sections

### 4. **Interactive Examples**

```
┌─────────────────────────────────────────────────────────┐
│  💡 Try an Example (Interactive Demo)                   │
│  ─────────────────────────────────────────────────────── │
│                                                           │
│  ┌─────────────────────────────────────────────┐       │
│  │  Example Question:                          │       │
│  │  "What are clinical trial best practices?"  │       │
│  │  [Click to see full AI process]             │       │
│  └─────────────────────────────────────────────┘       │
│                                                           │
│  [On click: Full process animation plays]               │
│  [Step 1] Keywords detected → [Step 2] Experts selected│
│  [Step 3] Knowledge search → [Step 4] Synthesis        │
│  [Step 5] Final answer with attributions                │
│                                                           │
│  [End result: Complete response with highlights]        │
└─────────────────────────────────────────────────────────┘
```

**Demo Flow**:
1. Question appears and "analyzes"
2. Keywords highlight and domains identify
3. Expert cards animate in with confidence scores
4. Search animations show knowledge gathering
5. Synthesis animation shows combination
6. Final response streams with expert attributions

---

## 🎬 Animation & Effects

### Micro-Interactions

1. **Helper Icon Pulse**
   - **Trigger**: Mode 2 selected (most popular)
   - **Effect**: Gentle amber glow pulse (3s loop)
   - **Duration**: 2-3 pulses, then subtle glow

2. **Keyword Detection**
   - **Trigger**: User types in query field
   - **Effect**: Words highlight as detected (yellow flash)
   - **Duration**: 300ms highlight, then settle

3. **Expert Card Reveals**
   - **Trigger**: Expert matches found
   - **Effect**: Cards slide in from right, bounce on arrival
   - **Stagger**: 200ms delay between cards

4. **Confidence Bar Animation**
   - **Trigger**: Expert confidence calculated
   - **Effect**: Bars fill from 0% to final percentage
   - **Duration**: 800ms ease-out animation

5. **Search Beam Effect**
   - **Trigger**: Knowledge search begins
   - **Effect**: Animated beams from expert avatars to knowledge icons
   - **Duration**: Continuous pulsing during search

6. **Synthesis Merge**
   - **Trigger**: Answer synthesis
   - **Effect**: Expert knowledge "flows" together, forms crystal
   - **Duration**: 1500ms with sparkle finale

7. **Celebration Effects**
   - **Trigger**: High confidence scores (>90%)
   - **Effect**: Confetti particles, success sparkle
   - **Sound**: Optional subtle "success" chime

### Visual Effects

1. **Color Coding**
   - Clinical Expert: Blue (#3B82F6)
   - Regulatory Expert: Green (#10B981)
   - Market Access Expert: Amber (#F59E0B)
   - AI Synthesis: Purple (#8B5CF6)

2. **Progress Indicators**
   - Confidence meters with animated fills
   - Search progress counters
   - Step completion checkmarks

3. **Glow Effects**
   - Active elements: Subtle glow matching expert color
   - High confidence: Enhanced glow effect
   - Success states: Celebration glow

---

## 📱 Responsive Behavior

### Desktop (>1024px)
- Demo panel: Full 480px width
- Real-time analysis: Sidebar or overlay
- Expert cards: 3-column grid
- Animations: Full fidelity

### Tablet (768px - 1024px)
- Demo panel: 400px width
- Real-time analysis: Collapsible panel
- Expert cards: 2-column grid
- Animations: Optimized for performance

### Mobile (<768px)
- Demo panel: Full width, stacked layout
- Real-time analysis: Bottom sheet
- Expert cards: Single column
- Animations: Touch-friendly, reduced motion option

---

## 🔧 Technical Requirements

### Component Structure

```typescript
<Mode2Helper
  variant="demo" | "live" | "tooltip"
  showProcessDemo={true}
  enableRealTimeAnalysis={true}
  showConfidenceScores={true}
  animationSpeed="normal" | "slow" | "fast"
/>
```

### Key Features

| Feature | Implementation | Animation |
|---------|----------------|-----------|
| **Process Demo** | Interactive step-by-step | Sequential reveals |
| **Real-time Analysis** | Live keyword/domain detection | Instant highlights |
| **Expert Selection** | Animated card reveals | Bounce + confidence bars |
| **Search Visualization** | Beam effects + counters | Continuous pulsing |
| **Synthesis Animation** | Knowledge flow merge | Sparkle effects |
| **Attribution Highlights** | Color-coded sections | Avatar reveals |

### Performance Considerations

- **Animation Frame Rate**: 60fps target
- **Bundle Size**: <50KB additional
- **Memory Usage**: Efficient cleanup of animations
- **Accessibility**: Reduced motion support
- **Loading States**: Skeleton screens for slow connections

---

## 🎯 Content Strategy

### Helper Content Sections

1. **What is Mode 2?** (1-2 sentences)
   - AI automatically selects and consults multiple experts
   - Provides comprehensive, multi-perspective answers

2. **How AI Works** (Interactive demo)
   - Step-by-step process visualization
   - Real-time analysis examples
   - Expert selection criteria explanation

3. **Why Multiple Experts?** (Educational)
   - Shows value of different perspectives
   - Examples of how experts contribute uniquely
   - Builds trust in AI decision-making

4. **Live Examples** (Interactive)
   - Pre-built examples with full process walkthrough
   - User can try their own queries
   - See real-time analysis

### Tone & Voice

- **Intelligent & Trustworthy**: Show AI capabilities without arrogance
- **Educational**: Teach users about the process
- **Encouraging**: Make users feel smart for choosing Mode 2
- **Transparent**: Never hide how decisions are made

### Example Copy

**Helper Title**: 🤖 Mode 2: AI Expert Selection

**Quick Tip** (tooltip): "AI picks the perfect experts for comprehensive answers"

**Demo Content**:
```
🎬 How Mode 2 Works:

Your Question → AI Analysis → Expert Selection → Knowledge Search → Synthesis

💡 Why It Matters:
• Clinical questions → Clinical + Regulatory experts
• Market questions → Regulatory + Market Access experts
• Complex topics → Multiple perspectives for complete answers

🎯 Try It:
"Best practices for clinical trials"
→ Watch AI select experts and build the answer
```

---

## ✅ Success Criteria

### Must Have (MVP)
- [x] Process demo with animated expert selection
- [x] Real-time query analysis feedback
- [x] Expert contribution highlighting in responses
- [x] Interactive examples with full walkthrough
- [x] Confidence score displays
- [x] Responsive design across devices

### Nice to Have (Phase 2)
- [ ] Advanced animations (confetti, complex flows)
- [ ] Sound effects for key interactions
- [ ] Expert comparison mode
- [ ] Historical analysis tracking
- [ ] Personalized expert recommendations

### Future Enhancements
- [ ] Voice-guided demos
- [ ] AR visualization of expert selection
- [ ] Collaborative expert selection
- [ ] Real-time expert availability status

---

## 🚀 Launch Plan

### Phase 1: Core Demo (Week 1)
- Build animated process visualization
- Implement expert selection demo
- Add basic real-time analysis
- Test animation performance

### Phase 2: Live Features (Week 2)
- Add real-time query analysis
- Implement contribution highlighting
- Create interactive examples
- Optimize for mobile

### Phase 3: Polish (Week 3)
- Fine-tune animations and timing
- Add accessibility features
- Implement analytics tracking
- User testing and iteration

### Phase 4: Launch (Week 4)
- Final QA and performance testing
- Documentation and training
- Production deployment
- Monitor success metrics

---

## 📊 Metrics & Tracking

### Engagement Metrics
- **Demo interaction rate**: >70% of users engage with demo
- **Example completion rate**: >80% watch full example process
- **Real-time analysis views**: >60% see live analysis
- **Helper expansion rate**: >65% click to see full demo

### Quality Metrics
- **Expert selection trust**: >4.7/5 user confidence
- **Process understanding**: >85% users understand how AI works
- **Attribution value**: >90% users find expert breakdowns helpful
- **Overall satisfaction**: >4.8/5 for Mode 2 experience

### Analytics Events
- `mode2_helper_demo_viewed`: Process demo opened
- `mode2_helper_example_played`: Interactive example started
- `mode2_realtime_analysis_shown`: Live analysis displayed
- `mode2_expert_attribution_viewed`: Contribution highlights seen
- `mode2_confidence_score_displayed`: Confidence metrics shown

---

## 🎨 Design Assets

### Icons & Avatars
- **Helper Icon**: Brain/Robot (Lucide)
- **Expert Avatars**: Custom medical-themed icons
- **Process Icons**: Flow arrows, search beams, synthesis crystals
- **Confidence Indicators**: Star ratings, percentage bars

### Color Palette
- **Mode 2 Theme**: Amber (#F59E0B)
- **Clinical Expert**: Blue (#3B82F6)
- **Regulatory Expert**: Green (#10B981)
- **Market Access**: Amber (#F59E0B)
- **AI Synthesis**: Purple (#8B5CF6)

### Animations Library
- **Framer Motion**: Complex animations
- **React Spring**: Natural transitions
- **CSS Animations**: Simple micro-interactions
- **Lottie**: Complex demo sequences

---

## 🔗 Related Documents

- [Mode 2 User Journey](./MODE2_USER_JOURNEY.md)
- [Mode 1 Helper PRD](./MODE1_HELPER_PRD.md)
- [Ask Expert Feature Spec](./ASK_EXPERT_AUDIT.md)

---

**End of PRD**


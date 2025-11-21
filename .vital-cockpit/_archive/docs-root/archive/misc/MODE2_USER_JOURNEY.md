# Mode 2: Leading Practices - User Journey

**Date**: January 2025
**Purpose**: Document current and desired user journey for Mode 2 (Automatic Expert Selection)
**Status**: Analysis & Recommendation Document

---

## 📋 Executive Summary

Mode 2 is designed for **quick, exploratory questions** where users want the system to intelligently select the best expert. It provides a seamless, one-shot query experience with automatic expert matching and universal knowledge search.

### Key Characteristics
- ✅ **Automatic Expert Selection**: System picks best expert based on query analysis
- ✅ **One-Shot Query**: Single question → single response (no multi-turn)
- ✅ **Universal Knowledge Search**: Searches across all domains
- ✅ **Smart Matching**: AI analyzes query to find optimal expert
- ✅ **Fast Response**: 30-45 seconds average

---

## 🎯 Current User Journey

### Phase 1: Discovery & Mode Selection

```
┌─────────────────────────────────────────────────────────────┐
│                    USER LANDS ON PAGE                        │
│              /ask-expert (Ask Expert Page)                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 1: VIEW MODE SELECTOR                                  │
│  ─────────────────────────────────────────────────────────── │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Choose Your Consultation Mode                       │    │
│  │  Select how you want to interact with our expert AI │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  Mode 1      │  │  Mode 2      │  │  Mode 3      │       │
│  │  Manual      │  │  Automatic   │  │  Manual +    │       │
│  │  Selection   │  │  Selection   │  │  Autonomous  │       │
│  │              │  │              │  │              │       │
│  │  [Target]    │  │  [Zap]       │  │  [UserCheck] │       │
│  │              │  │              │  │              │       │
│  │  20-30 sec   │  │  30-45 sec   │  │  60-90 sec   │       │
│  │  1 expert    │  │  3 experts   │  │  1 expert    │       │
│  │              │  │              │  │              │       │
│  │  [Select]    │  │  [Select]    │  │  [Select]    │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                               │
│  User sees 4 modes, hovers to see features                   │
│  Mode 2 highlighted as "Most Popular"                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 2: USER SELECTS MODE 2                                 │
│  ─────────────────────────────────────────────────────────── │
│                                                               │
│  ✅ Mode 2 Card gets ring border & amber background         │
│  ✅ CheckCircle icon appears                                  │
│  ✅ Button changes to "Selected"                              │
│  ✅ Features list expands on hover/selection                 │
│                                                               │
│  Features displayed:                                          │
│  • Automatic expert selection                                │
│  • Parallel consultation                                     │
│  • Instant synthesis                                         │
│  • One-shot response                                         │
│                                                               │
│  Best for:                                                    │
│  • Quick research questions                                  │
│  • Multiple perspectives needed                               │
│  • Time-sensitive decisions                                  │
│  • Initial exploration                                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
```

### Phase 2: Query Input & Processing

```
┌─────────────────────────────────────────────────────────────┐
│  STEP 3: VIEW QUERY INPUT INTERFACE                          │
│  ─────────────────────────────────────────────────────────── │
│                                                               │
│  No expert selection needed - system handles it automatically │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Chat Interface                                        │    │
│  │                                                         │    │
│  │  ┌───────────────────────────────────────────────┐    │    │
│  │  │  🤖 AI will select the best expert for you     │    │    │
│  │  │  Ready to answer your questions              │    │    │
│  │  └───────────────────────────────────────────────┘    │    │
│  │                                                         │    │
│  │  ┌───────────────────────────────────────────────┐    │    │
│  │  │  Type your question here...                   │    │    │
│  │  │  [Send] [Attach] [Tools]                      │    │    │
│  │  └───────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  User sees empty chat interface                              │
│  Input field is ready for query                              │
│  "AI will select..." message shows user what to expect       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 4: USER TYPES & SENDS QUERY                            │
│  ─────────────────────────────────────────────────────────── │
│                                                               │
│  User types: "What are best practices for clinical trials?" │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  [User Message]                                      │    │
│  │  "What are best practices for clinical trials?"     │    │
│  │  [Timestamp]                                         │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ✅ User message appears in chat                             │
│  ✅ Send button disabled (loading state)                     │
│  ✅ Loading indicator appears                                 │
│  ✅ "Generating response..." message shown                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 5: BACKEND PROCESSING - EXPERT SELECTION               │
│  ─────────────────────────────────────────────────────────── │
│                                                               │
│  Frontend → API Gateway → AI Engine                          │
│                                                               │
│  ├─ 1. Validate request (mode, query)                        │
│  ├─ 2. Analyze query for expert matching                     │
│  │     • Extract keywords and intent                         │
│  │     • Analyze domain relevance                            │
│  │     • Score against available experts                     │
│  ├─ 3. Select best expert(s) (up to 3)                       │
│  │     • Clinical Trial Expert (primary)                     │
│  │     • Regulatory Expert (secondary)                       │
│  │     • Market Access Expert (tertiary)                     │
│  ├─ 4. Prepare RAG search across all domains                 │
│  │     • Universal search (no domain filtering)              │
│  │     • Semantic + keyword matching                         │
│  │     • Max results: 10 per expert                          │
│  ├─ 5. Generate consolidated response                        │
│  │     • Synthesize information from multiple experts        │
│  │     • Use primary expert's system prompt                  │
│  │     • Format as unified response                          │
│  └─ 6. Stream response back to frontend                      │
│                                                               │
│  Processing time: 30-45 seconds (expert selection + synthesis) │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 6: RECEIVE STREAMING RESPONSE                          │
│  ┌────────────────────────────────────────────────────────── │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  [User Message]                                      │    │
│  │  "What are best practices for clinical trials?"     │    │
│  └─────────────────────────────────────────────────────┘    │    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  [Expert Avatar] Multiple Experts Synthesized       │    │
│  │                                                         │    │
│  │  "Based on analysis from our Clinical Trial,        │    │
│  │  Regulatory, and Market Access experts..."          │    │
│  │                                                         │    │
│  │  [Streaming text appears character by character]       │    │
│  │                                                         │    │
│  │  📚 Sources (12):                                        │    │
│  │  • Clinical Trial Guidelines (Clinical Expert)         │    │
│  │  • FDA Regulations (Regulatory Expert)                 │    │
│  │  • ICH Guidelines (Multiple Experts)                   │    │
│  │                                                         │    │
│  │  🤖 Expert Selection: Clinical Trial Expert (Primary)  │    │
│  │     → Regulatory Expert (Supporting)                    │    │
│  │     → Market Access Expert (Supporting)                 │    │
│  │                                                         │    │
│  │  [Expand Sources] [Copy] [Feedback]                    │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ✅ Response streams in real-time                            │
│  ✅ Citations/sources shown at bottom                        │
│  ✅ Expert selection reasoning displayed                     │
│  ✅ User can expand sources to see full context             │
│  ✅ User can copy response or provide feedback               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 7: RESPONSE COMPLETE                                   │
│  ─────────────────────────────────────────────────────────── │
│                                                               │
│  ✅ Streaming completes                                       │
│  ✅ All sources/citations displayed                          │
│  ✅ Expert selection shown                                   │
│  ✅ Input field re-enabled                                   │
│  ✅ User can send another query (new conversation)           │
│                                                               │
│  Note: Mode 2 does NOT maintain chat history                 │
│  Each query starts fresh (no context from previous)           │
│                                                               │
│  User can:                                                    │
│  • Send another question (new query)                         │
│  • Switch to different mode                                  │
│  • Copy response                                              │
│  • Provide feedback (thumbs up/down)                         │
│  • See which experts were consulted                          │
└──────────────────────────────────────────────────────────────┘
```

---

## 🎨 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    MODE 2: COMPLETE USER JOURNEY                 │
└─────────────────────────────────────────────────────────────────┘

                    START
                      │
                      ▼
        ┌─────────────────────────┐
        │  Land on /ask-expert     │
        │  (Ask Expert Page)       │
        └─────────────┬─────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │  View Mode Selector      │
        │  (4 modes displayed)     │
        └─────────────┬─────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │  Select Mode 2           │
        │  (Automatic Selection)   │
        └─────────────┬─────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │  View Query Interface    │
        │  (No expert selection)   │
        └─────────────┬─────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │  Type Query              │
        │  "Best practices for..." │
        └─────────────┬─────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │  Send Query              │
        │  (Click Send button)     │
        └─────────────┬─────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │  Backend Processing      │
        │  ├─ Analyze query        │
        │  ├─ Select experts       │
        │  ├─ Search knowledge     │
        │  ├─ Generate response    │
        │  └─ Stream back          │
        └─────────────┬─────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │  Receive Streaming       │
        │  Response (30-45 sec)   │
        └─────────────┬─────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │  View Complete Response  │
        │  + Citations/Sources    │
        │  + Expert Selection     │
        └─────────────┬─────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │  Response Complete       │
        │  Ready for next query    │
        └─────────────┬─────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │  OPTIONS:                │
        │  ├─ Send new query       │
        │  ├─ Switch mode          │
        │  ├─ Copy/Feedback        │
        │  └─ View expert details  │
        └─────────────────────────┘
```

---

## ✨ Desired User Journey (Enhanced)

### Key Enhancements Proposed

#### 1. **Expert Selection Transparency**
- **Current**: Experts selected behind the scenes
- **Desired**: Show expert selection process in real-time
- **Benefit**: Builds trust, shows AI intelligence

#### 2. **Query Analysis Preview**
- **Current**: Query sent without analysis preview
- **Desired**: Show what AI understands about the query
- **Benefit**: User confidence, better query formulation

#### 3. **Multiple Perspectives Highlighting**
- **Current**: Single synthesized response
- **Desired**: Highlight which expert contributed which insights
- **Benefit**: Shows value of multiple experts, educational

#### 4. **Smart Suggestions**
- **Current**: No guidance after response
- **Desired**: Suggest related questions or follow-ups
- **Benefit**: Better user journey, increased engagement

#### 5. **Confidence Indicators**
- **Current**: No quality indicators
- **Desired**: Show confidence in expert selection and response
- **Benefit**: User knows when to trust vs. verify

---

## 🔄 Enhanced Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│           MODE 2: ENHANCED USER JOURNEY (DESIRED)                │
└─────────────────────────────────────────────────────────────────┘

                    START
                      │
                      ▼
        ┌─────────────────────────┐
        │  Land on /ask-expert     │
        │  [First-time? Show tour] │
        └─────────────┬─────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │  View Mode Selector      │
        │  [Mode 2 Helper/Explainer]│
        │  [Tooltip: "AI picks experts"]│
        └─────────────┬─────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │  Select Mode 2           │
        │  [Show quick guide]      │
        └─────────────┬─────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │  Type Query              │
        │  [AI analyzes in real-time]│
        │  [Show expert suggestions]│
        └─────────────┬─────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │  Send Query              │
        │  [Show analysis preview] │
        └─────────────┬─────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │  Expert Selection        │
        │  [Real-time selection]   │
        │  ├─ Analyzing query...   │
        │  ├─ Clinical Trial Expert│
        │  ├─ Regulatory Expert    │
        │  └─ Market Access Expert │
        └─────────────┬─────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │  Knowledge Search        │
        │  [Show search progress]  │
        │  [Universal across domains]│
        └─────────────┬─────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │  Generate Response       │
        │  [Show synthesis progress]│
        └─────────────┬─────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │  Receive Streaming       │
        │  Response                │
        │  [Highlight expert contributions]│
        └─────────────┬─────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │  View Complete Response │
        │  [Confidence indicators] │
        │  [Expert breakdown]      │
        │  [Smart suggestions]     │
        └─────────────┬─────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │  Next Steps              │
        │  [Suggest: Follow-up?]   │
        │  [Suggest: Switch mode?] │
        │  [Suggest: Related topics?]│
        └─────────────────────────┘
```

---

## 📊 Current vs. Desired Comparison

| Aspect | Current | Desired | Impact |
|--------|---------|---------|--------|
| **Expert Selection** | ❌ Hidden process | ✅ Real-time transparency | 🟢 High |
| **Query Analysis** | ❌ No preview | ✅ Show AI understanding | 🟡 Medium |
| **Multiple Perspectives** | ⚠️ Single response | ✅ Highlight contributions | 🟡 Medium |
| **Response Quality** | ⚠️ Citations only | ✅ Confidence indicators | 🟡 Medium |
| **Next Steps** | ❌ No guidance | ✅ Smart suggestions | 🟢 High |

---

## 🎯 What Works Well (Current State)

### ✅ Strengths

1. **Simple User Experience**
   - No expert selection required
   - Just type and send
   - Fast path to answer

2. **Intelligent Expert Selection**
   - System analyzes query automatically
   - Multiple experts contribute
   - Synthesized comprehensive response

3. **Comprehensive Coverage**
   - Searches all domains
   - Multiple perspectives included
   - Rich citations and sources

4. **Popular Choice**
   - "Most Popular" badge attracts users
   - Good for exploratory questions
   - Balanced response time

5. **Trust Building**
   - Shows expert names in response
   - Citations build credibility
   - Multiple expert validation

---

## 🚀 What Could Be Enhanced

### 🔴 High Priority

1. **Expert Selection Transparency**
   - **Current**: Experts selected invisibly
   - **Desired**: Show real-time expert selection process
   - **Implementation**: Animated selection steps, expert avatars appearing

2. **Query Analysis Preview**
   - **Current**: Query sent without feedback
   - **Desired**: Show what AI understands (keywords, intent, domains)
   - **Benefit**: User sees AI is "thinking" about their query

3. **Expert Contribution Highlighting**
   - **Current**: Single synthesized response
   - **Desired**: Visual indicators showing which expert contributed which insights
   - **Benefit**: Educational, shows value of multiple perspectives

### 🟡 Medium Priority

4. **Confidence Indicators**
   - **Current**: No quality metrics
   - **Desired**: Show confidence in expert selection and response completeness
   - **Benefit**: User knows when answer is comprehensive

5. **Smart Follow-up Suggestions**
   - **Current**: No guidance after response
   - **Desired**: AI-suggested related questions or deeper dives
   - **Benefit**: Better user journey, increased engagement

### 🟢 Low Priority

6. **Expert Interaction History**
   - **Current**: No history tracking
   - **Desired**: Show which experts user has consulted before
   - **Benefit**: Personalized experience

7. **Query Refinement**
   - **Current**: Static query input
   - **Desired**: AI suggestions to improve query clarity
   - **Benefit**: Better responses through better queries

---

## 💡 Mode 2 Helper/Explainer Design

### Option 1: Dynamic Transparency Helper (Recommended)
```
┌─────────────────────────────────────────────────────────┐
│  Mode 2: Automatic Expert Selection          [ℹ️]        │
│  ─────────────────────────────────────────────────────── │
│                                                           │
│  AI selects the best experts for comprehensive answers    │
│                                                           │
│  [Click ℹ️ for help]                                     │
│                                                           │
│  When ℹ️ clicked:                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  🤖 How Mode 2 Works                             │   │
│  │  ─────────────────────────────────────────────── │   │
│  │                                                   │   │
│  │  ✅ What happens:                                 │   │
│  │  [Animated sequence]                              │   │
│  │  1️⃣ You ask → AI analyzes                      │   │
│  │  2️⃣ AI picks experts → [avatars appear]        │   │
│  │  3️⃣ Experts search → [knowledge icons]         │   │
│  │  4️⃣ AI synthesizes → [merge animation]         │   │
│  │                                                   │   │
│  │  🎯 Perfect for:                                  │   │
│  │  • Questions needing multiple perspectives       │   │
│  │  • When you don't know which expert to ask       │   │
│  │  • Quick research across domains                 │   │
│  │                                                   │   │
│  │  💡 Example:                                      │   │
│  │  [Interactive demo]                               │   │
│  │  "Best practices for clinical trials"             │   │
│  │  → [Click to see expert selection demo]          │   │
│  │                                                   │   │
│  │  [Try Example] [Got it] [See Demo]               │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Option 2: Real-time Process Viewer
```
┌───────────────┐  ┌──────────────────────────────────────┐
│  Mode 2 Helper│  │  Main Content Area                    │
│  ─────────────│  │                                      │
│               │  │  [Mode Selector]                    │
│  🤖 AI picks  │  │  [Query Input]                      │
│    experts     │  │                                      │
│  automatically │  │  When typing:                       │
│               │  │  ┌────────────────────────────────┐  │
│  [Live Demo]   │  │  │  AI Analysis:                   │  │
│  • Clinical    │  │  │  Keywords: clinical, trials,   │  │
│  • Regulatory  │  │  │  best practices                 │  │
│  • Market      │  │  │  Domains: Research, Regulatory │  │
│    Access      │  │  │  Experts: [avatars animate in] │  │
│               │  │  └────────────────────────────────┘  │
│  [Hide]        │  │                                      │
└───────────────┘  └──────────────────────────────────────┘
```

---

## 🎯 Recommendations for Mode 2 Helper

### Recommended Approach: **Transparency-Focused Helper**

1. **Live Expert Selection Demo**
   - Show animated expert selection process
   - Real-time analysis preview
   - Interactive examples

2. **Process Transparency**
   - Explain how AI picks experts
   - Show confidence scores
   - Display search progress

3. **Educational Focus**
   - Teach users about multiple perspectives
   - Show value of AI expert selection
   - Build trust through transparency

### Content Structure:
```
Mode 2 Helper
├─ What is Mode 2?
├─ How AI Selects Experts (animated demo)
├─ What to Expect (response format)
├─ Example with Live Demo
├─ Why Multiple Experts Matter
└─ When to Use vs. Other Modes
```

---

## 📝 Implementation Checklist

### Phase 1: Core Transparency Features
- [ ] Create `Mode2Helper` component
- [ ] Implement expert selection visualization
- [ ] Add query analysis preview
- [ ] Build animated process demo

### Phase 2: Enhanced Interactions
- [ ] Add real-time expert selection feedback
- [ ] Implement contribution highlighting
- [ ] Add confidence indicators
- [ ] Create smart suggestions

### Phase 3: Educational Features
- [ ] Build interactive examples
- [ ] Add mode comparison
- [ ] Implement user onboarding
- [ ] Add analytics tracking

---

## 📚 Example Helper Content

### Mode 2 Helper Text

**Title**: 🤖 Mode 2: AI Expert Selection

**Subtitle**: Let AI pick the best experts for comprehensive answers

**How It Works (Animated):**
1. **You Ask** → AI analyzes your question
2. **AI Picks** → Selects 2-3 relevant experts
3. **Experts Search** → Each expert searches their knowledge
4. **AI Synthesizes** → Combines insights into one answer

**What Makes It Special:**
- ✅ **Smart Selection**: AI matches your question to expert expertise
- ✅ **Multiple Perspectives**: Gets insights from different domains
- ✅ **Comprehensive**: Searches all knowledge areas
- ✅ **Fast**: 30-45 seconds for complete analysis

**Perfect For:**
- "What are clinical trial best practices?" → Gets Clinical + Regulatory + Market experts
- "How do medical devices get approved?" → Involves Regulatory + Clinical + Technical experts
- "What's the reimbursement landscape?" → Includes Market Access + Regulatory experts

**What You'll See:**
- 🤖 **Expert Selection**: Shows which experts were chosen and why
- 📚 **Rich Citations**: Sources from multiple domains
- 🎯 **Synthesized Answer**: One comprehensive response
- ⭐ **Confidence Score**: How sure AI is about the answer

**Try an Example:**
"Best practices for clinical trials"
→ Watch AI select experts and build the answer

---

## 📊 Success Metrics

### Engagement Metrics
- **Helper interaction rate**: >65% (higher than Mode 1)
- **Demo completion rate**: >80% of viewers finish the demo
- **Example usage**: >70% try the interactive examples

### Quality Metrics
- **Expert selection accuracy**: >85% user satisfaction
- **Response comprehensiveness**: >90% covers multiple angles
- **User trust**: >4.7/5 confidence in AI selection

### Business Metrics
- **Mode 2 adoption**: Increase to 60% of queries
- **Time to answer**: Maintain 30-45 second target
- **User retention**: >75% return for follow-up questions

---

## 🎯 Implementation Roadmap

### Week 1: Core Helper Component
- Build Mode2Helper with basic animations
- Implement expert selection visualization
- Add query analysis preview
- Test basic interactions

### Week 2: Transparency Features
- Add real-time process feedback
- Implement contribution highlighting
- Create confidence indicators
- Build interactive demos

### Week 3: Educational Features
- Add mode comparisons
- Implement smart suggestions
- Create user onboarding flow
- Add comprehensive analytics

### Week 4: Polish & Launch
- Performance optimization
- Cross-device testing
- User acceptance testing
- Production deployment

---

## 🔗 Related Documents

- [Mode 1 User Journey](./MODE1_USER_JOURNEY.md)
- [Mode 1 Helper PRD](./MODE1_HELPER_PRD.md)
- [Ask Expert Architecture](./ASK_EXPERT_AUDIT.md)

---

**End of Mode 2 User Journey Document**

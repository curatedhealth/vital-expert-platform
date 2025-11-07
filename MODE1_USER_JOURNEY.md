# Mode 1: Leading Practices - User Journey

**Date**: January 2025  
**Purpose**: Document current and desired user journey for Mode 1 (Manual Expert Selection)  
**Status**: Analysis & Recommendation Document

---

## 📋 Executive Summary

Mode 1 is designed for **quick, targeted questions** where users know which expert to consult. It provides a straightforward, one-shot query experience with manual expert selection and specialized knowledge retrieval.

### Key Characteristics
- ✅ **Manual Expert Selection**: User chooses specific expert
- ✅ **One-Shot Query**: Single question → single response (no multi-turn)
- ✅ **Agent-Specific Knowledge**: Searches only selected expert's domains
- ✅ **Fast Response**: 20-30 seconds average
- ✅ **Simple Complexity**: Easiest mode to use

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
│  Mode 1 highlighted when selected                            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 2: USER SELECTS MODE 1                                 │
│  ─────────────────────────────────────────────────────────── │
│                                                               │
│  ✅ Mode 1 Card gets ring border & blue background          │
│  ✅ CheckCircle icon appears                                  │
│  ✅ Button changes to "Selected"                              │
│  ✅ Features list expands on hover/selection                 │
│                                                               │
│  Features displayed:                                          │
│  • Manual expert selection                                    │
│  • Specialized expertise                                     │
│  • Focused response                                           │
│  • Deep domain knowledge                                      │
│                                                               │
│  Best for:                                                    │
│  • Specific regulatory questions                              │
│  • Known expert needed                                        │
│  • Narrow domain focus                                        │
│  • Follow-up questions                                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
```

### Phase 2: Expert Selection

```
┌─────────────────────────────────────────────────────────────┐
│  STEP 3: VIEW EXPERT SELECTION SECTION                      │
│  ─────────────────────────────────────────────────────────── │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Select Your Expert                                   │    │
│  │  Choose the AI expert that best matches your needs   │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  [Avatar]    │  │  [Avatar]    │  │  [Avatar]    │      │
│  │  Regulatory  │  │  Clinical    │  │  Market      │      │
│  │  Expert      │  │  Trial       │  │  Access      │      │
│  │              │  │  Designer    │  │  Specialist  │      │
│  │  FDA 510(k)  │  │  Study Design│  │  Reimbursement│     │
│  │  Compliance  │  │  Protocols   │  │  Strategies   │      │
│  │              │  │              │  │              │      │
│  │  📊 Stats    │  │  📊 Stats    │  │  📊 Stats    │      │
│  │  ⭐ 4.8      │  │  ⭐ 4.6      │  │  ⭐ 4.7      │      │
│  │  💬 1.2k     │  │  💬 890      │  │  💬 650      │      │
│  │              │  │              │  │              │      │
│  │  [Selected]  │  │  [Select]    │  │  [Select]    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  User browses available experts (grid of 3-9 cards)          │
│  Each card shows: avatar, name, description, stats            │
│  Stats include: satisfaction score, consultations, etc.      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 4: USER SELECTS EXPERT                                 │
│  ─────────────────────────────────────────────────────────── │
│                                                               │
│  ✅ Selected expert card gets highlighted border            │
│  ✅ Selected expert info appears in sidebar                  │
│  ✅ Chat tab becomes enabled (was disabled)                  │
│  ✅ Auto-switches to Chat tab (optional behavior)            │
│                                                               │
│  Validation:                                                 │
│  ⚠️  If Mode 1 selected but no expert → warning shown       │
│  ⚠️  "Please select an expert to continue"                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
```

### Phase 3: Query & Response

```
┌─────────────────────────────────────────────────────────────┐
│  STEP 5: NAVIGATE TO CHAT TAB                                │
│  ─────────────────────────────────────────────────────────── │
│                                                               │
│  [Setup]  [Chat (enabled)]  ← User clicks Chat tab          │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Chat Interface                                        │    │
│  │                                                         │    │
│  │  ┌───────────────────────────────────────────────┐    │    │
│  │  │  [Selected Expert Avatar] Regulatory Expert  │    │    │
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
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 6: USER TYPES & SENDS QUERY                            │
│  ─────────────────────────────────────────────────────────── │
│                                                               │
│  User types: "What are FDA 510(k) requirements?"            │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  [User Message]                                      │    │
│  │  "What are FDA 510(k) requirements?"                │    │
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
│  STEP 7: BACKEND PROCESSING                                  │
│  ─────────────────────────────────────────────────────────── │
│                                                               │
│  Frontend → API Gateway → AI Engine                          │
│                                                               │
│  ├─ 1. Validate request (mode, agent, message)              │
│  ├─ 2. Load selected agent configuration                     │
│  │     • System prompt                                       │
│  │     • Assigned RAG domains                                │
│  │     • Available tools                                     │
│  ├─ 3. RAG Search (agent-specific)                           │
│  │     • Search in agent's assigned domains only             │
│  │     • max_results: 15                                     │
│  │     • Returns relevant knowledge chunks                   │
│  ├─ 4. Build context with retrieved knowledge                │
│  ├─ 5. Generate response via LLM                            │
│  │     • Uses agent's system prompt                          │
│  │     • Includes retrieved RAG context                      │
│  │     • Formats as agent's response                         │
│  └─ 6. Stream response back to frontend                      │
│                                                               │
│  Processing time: 20-30 seconds (typical)                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 8: RECEIVE STREAMING RESPONSE                          │
│  ┌────────────────────────────────────────────────────────── │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  [User Message]                                      │    │
│  │  "What are FDA 510(k) requirements?"                │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  [Expert Avatar] Regulatory Expert                    │    │
│  │                                                         │    │
│  │  "The FDA 510(k) process is a premarket notification │    │
│  │  pathway for medical devices that are substantially   │    │
│  │  equivalent to a legally marketed device..."          │    │
│  │                                                         │    │
│  │  [Streaming text appears character by character]       │    │
│  │                                                         │    │
│  │  📚 Sources (3):                                        │    │
│  │  • FDA 510(k) Submission Guide                          │    │
│  │  • Medical Device Regulation Handbook                  │    │
│  │  • Pre-market Notification Requirements                │    │
│  │                                                         │    │
│  │  [Expand Sources] [Copy] [Feedback]                    │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ✅ Response streams in real-time                            │
│  ✅ Citations/sources shown at bottom                        │
│  ✅ User can expand sources to see full context             │
│  ✅ User can copy response or provide feedback               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 9: RESPONSE COMPLETE                                   │
│  ─────────────────────────────────────────────────────────── │
│                                                               │
│  ✅ Streaming completes                                       │
│  ✅ All sources/citations displayed                          │
│  ✅ Input field re-enabled                                   │
│  ✅ User can send another query (new conversation)           │
│                                                               │
│  Note: Mode 1 does NOT maintain chat history                 │
│  Each query starts fresh (no context from previous)           │
│                                                               │
│  User can:                                                    │
│  • Send another question (new query)                         │
│  • Switch to different expert                                │
│  • Switch to different mode                                  │
│  • Copy response                                              │
│  • Provide feedback (thumbs up/down)                         │
└──────────────────────────────────────────────────────────────┘
```

---

## 🎨 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    MODE 1: COMPLETE USER JOURNEY                 │
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
        │  Select Mode 1           │
        │  (Manual Selection)      │
        └─────────────┬─────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │  View Expert Grid        │
        │  (3-9 expert cards)      │
        └─────────────┬─────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │  Select Expert           │
        │  (e.g., Regulatory)      │
        └─────────────┬─────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │  Navigate to Chat Tab    │
        │  (Auto or manual)        │
        └─────────────┬─────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │  Type Query              │
        │  "What are FDA 510(k)..."│
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
        │  ├─ Validate request     │
        │  ├─ Load agent config    │
        │  ├─ RAG search           │
        │  ├─ Generate response    │
        │  └─ Stream back          │
        └─────────────┬─────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │  Receive Streaming       │
        │  Response (20-30 sec)   │
        └─────────────┬─────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │  View Complete Response  │
        │  + Citations/Sources    │
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
        │  ├─ Switch expert        │
        │  ├─ Switch mode          │
        │  └─ Copy/Feedback        │
        └─────────────────────────┘
```

---

## ✨ Desired User Journey (Enhanced)

### Key Enhancements Proposed

#### 1. **Onboarding & Guidance**
- **Current**: User must figure out Mode 1 on their own
- **Desired**: Clear onboarding tooltip/helper for first-time users
- **Benefit**: Faster time-to-value, reduced confusion

#### 2. **Expert Recommendation**
- **Current**: User must browse all experts to find the right one
- **Desired**: AI-powered expert recommendation based on query intent
- **Benefit**: Faster expert selection, better matches

#### 3. **Query Suggestions**
- **Current**: Empty input field, no guidance
- **Desired**: Pre-filled example queries or query templates
- **Benefit**: Better query formulation, more useful responses

#### 4. **Response Quality Indicators**
- **Current**: Citations shown, but no confidence score
- **Desired**: Show confidence level, knowledge coverage, answer completeness
- **Benefit**: User knows if they should ask follow-up or switch modes

#### 5. **Quick Actions**
- **Current**: User must manually copy or provide feedback
- **Desired**: Quick action buttons (Copy, Share, Save, Improve)
- **Benefit**: Faster workflow, better engagement

#### 6. **Progressive Disclosure**
- **Current**: All features shown at once
- **Desired**: Hide advanced features, show on demand
- **Benefit**: Cleaner UI, less overwhelming

---

## 🔄 Enhanced Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│           MODE 1: ENHANCED USER JOURNEY (DESIRED)                │
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
        │  [Mode 1 Helper/Explainer]│
        │  [Tooltip: "Best for..."]│
        └─────────────┬─────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │  Select Mode 1           │
        │  [Show quick guide]      │
        └─────────────┬─────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │  View Expert Grid        │
        │  [OR: Type query first]  │
        │  [AI recommends experts]│
        └─────────────┬─────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │  Select Expert           │
        │  [Show expert preview]   │
        │  [Show example queries]  │
        └─────────────┬─────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │  Navigate to Chat Tab    │
        │  [Show query suggestions]│
        └─────────────┬─────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │  Type Query              │
        │  [Auto-complete]         │
        │  [Query templates]       │
        └─────────────┬─────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │  Send Query              │
        │  [Show progress steps]   │
        └─────────────┬─────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │  Backend Processing      │
        │  [Show progress:         │
        │   • Searching knowledge  │
        │   • Generating response  │
        │   • Formatting answer]   │
        └─────────────┬─────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │  Receive Streaming       │
        │  Response                │
        │  [Show quality indicators]│
        └─────────────┬─────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │  View Complete Response │
        │  [Quality score]         │
        │  [Knowledge coverage]    │
        │  [Quick actions]         │
        └─────────────┬─────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │  Response Actions        │
        │  [Copy] [Share] [Save]  │
        │  [Improve] [Feedback]   │
        └─────────────┬─────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │  Next Steps              │
        │  [Suggest: Switch mode?] │
        │  [Suggest: Follow-up?]   │
        │  [Suggest: Different expert?]│
        └─────────────────────────┘
```

---

## 📊 Current vs. Desired Comparison

| Aspect | Current | Desired | Impact |
|--------|---------|---------|--------|
| **Onboarding** | ❌ No guidance | ✅ Interactive tour | 🟢 High |
| **Expert Selection** | ⚠️ Manual browsing | ✅ AI recommendation | 🟢 High |
| **Query Input** | ⚠️ Empty field | ✅ Templates/suggestions | 🟡 Medium |
| **Progress Feedback** | ⚠️ Generic loading | ✅ Step-by-step progress | 🟡 Medium |
| **Response Quality** | ⚠️ Citations only | ✅ Quality indicators | 🟡 Medium |
| **Quick Actions** | ⚠️ Manual copy/feedback | ✅ Quick action buttons | 🟡 Medium |
| **Next Steps** | ❌ No guidance | ✅ Smart suggestions | 🟢 High |

---

## 🎯 What Works Well (Current State)

### ✅ Strengths

1. **Clear Mode Selection**
   - Visual mode cards with icons
   - Feature lists on hover/selection
   - Response time and complexity indicators
   - Comparison view available

2. **Expert Discovery**
   - Grid layout shows multiple experts
   - Stats (satisfaction, consultations) build trust
   - Visual avatars and descriptions
   - Easy to compare experts

3. **Streaming Response**
   - Real-time feedback during generation
   - Citations shown at bottom
   - Clean, readable chat interface

4. **Simple Workflow**
   - Linear flow: Mode → Expert → Query → Response
   - No unnecessary complexity
   - Fast time-to-first-response

5. **Visual Feedback**
   - Selected states clearly indicated
   - Loading states shown
   - Error messages displayed

---

## 🚀 What Could Be Enhanced

### 🔴 High Priority

1. **Mode 1 Helper/Explainer**
   - **Current**: User must read mode description to understand
   - **Desired**: Interactive helper component that explains:
     - When to use Mode 1
     - What to expect
     - Example use cases
     - How it differs from other modes
   - **Implementation**: Tooltip, modal, or inline helper

2. **Expert Recommendation**
   - **Current**: User must browse all experts
   - **Desired**: 
     - Option to type query first
     - AI recommends best expert(s) based on query
     - Shows why expert was recommended
   - **Benefit**: Faster selection, better matches

3. **Query Templates/Suggestions**
   - **Current**: Empty input field
   - **Desired**:
     - Pre-filled example queries
     - Query templates per expert
     - Auto-complete suggestions
   - **Benefit**: Better query formulation

### 🟡 Medium Priority

4. **Progress Feedback**
   - **Current**: Generic "Generating response..."
   - **Desired**: Step-by-step progress:
     - "Searching knowledge base..."
     - "Found 15 relevant sources"
     - "Generating response..."
     - "Formatting answer..."
   - **Benefit**: Better user confidence, reduced anxiety

5. **Response Quality Indicators**
   - **Current**: Citations shown, but no quality score
   - **Desired**:
     - Confidence level (High/Medium/Low)
     - Knowledge coverage indicator
     - Answer completeness score
   - **Benefit**: User knows if answer is complete

6. **Quick Actions**
   - **Current**: Manual copy/feedback
   - **Desired**: Quick action buttons:
     - Copy response
     - Share link
     - Save to notes
     - Improve answer (switch to Mode 3/4)
     - Feedback (thumbs up/down)
   - **Benefit**: Faster workflow

### 🟢 Low Priority

7. **Smart Next Steps**
   - **Current**: No guidance after response
   - **Desired**: Context-aware suggestions:
     - "This might need deeper analysis → Switch to Mode 3?"
     - "Want multiple perspectives → Switch to Mode 4?"
     - "Need follow-up? → Ask another question"
   - **Benefit**: Better user journey

8. **Response History**
   - **Current**: No history (Mode 1 is one-shot)
   - **Desired**: 
     - Show recent queries (even if not in same session)
     - Allow re-asking with improvements
   - **Benefit**: Better continuity

---

## 💡 Mode 1 Helper/Explainer Design

### Option 1: Inline Tooltip (Recommended)
```
┌─────────────────────────────────────────────────────────┐
│  Mode 1: Manual Expert Selection              [ℹ️]        │
│  ─────────────────────────────────────────────────────── │
│                                                           │
│  Choose your specific expert for precise answers          │
│                                                           │
│  [Click ℹ️ for help]                                     │
│                                                           │
│  When ℹ️ clicked:                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Mode 1 Helper                                    │   │
│  │  ─────────────────────────────────────────────── │   │
│  │                                                   │   │
│  │  ✅ Best for:                                     │   │
│  │  • You know which expert to ask                  │   │
│  │  • Specific regulatory questions                  │   │
│  │  • Quick, focused answers                        │   │
│  │                                                   │   │
│  │  ⚡ Fast: 20-30 seconds                           │   │
│  │  🎯 Focused: One expert, one question            │   │
│  │  📚 Deep: Uses expert's specialized knowledge     │   │
│  │                                                   │   │
│  │  Example:                                        │   │
│  │  "What are FDA 510(k) requirements?"            │   │
│  │  → Select Regulatory Expert                      │   │
│  │  → Get precise, domain-specific answer          │   │
│  │                                                   │   │
│  │  [Got it] [See examples] [Compare modes]         │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Option 2: Modal on First Use
```
┌─────────────────────────────────────────────────────────┐
│  Welcome to Mode 1!                          [Skip] [Next]│
│  ─────────────────────────────────────────────────────── │
│                                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Mode 1: Manual Expert Selection                 │   │
│  │                                                   │   │
│  │  [Illustration/Animation]                         │   │
│  │                                                   │   │
│  │  Step 1: Choose your expert                      │   │
│  │  Step 2: Ask your question                       │   │
│  │  Step 3: Get precise answer                      │   │
│  │                                                   │   │
│  │  Perfect for:                                     │   │
│  │  • Specific questions                             │   │
│  │  • Known expert needed                            │   │
│  │  • Quick answers                                  │   │
│  │                                                   │   │
│  │  [Next] [Skip tour]                              │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Option 3: Sidebar Helper (Persistent)
```
┌───────────────┐  ┌──────────────────────────────────────┐
│  Mode 1 Helper│  │  Main Content Area                    │
│  ─────────────│  │                                      │
│               │  │  [Mode Selector]                    │
│  💡 Tips:     │  │  [Expert Selection]                  │
│  • Best for   │  │  [Chat Interface]                    │
│    specific   │  │                                      │
│    questions  │  │                                      │
│               │  │                                      │
│  ✅ Example:  │  │                                      │
│  "What are    │  │                                      │
│   FDA 510(k)  │  │                                      │
│   rules?"     │  │                                      │
│               │  │                                      │
│  → Select     │  │                                      │
│    Regulatory │  │                                      │
│    Expert     │  │                                      │
│               │  │                                      │
│  [Hide]       │  │                                      │
└───────────────┘  └──────────────────────────────────────┘
```

---

## 🎯 Recommendations for Mode 1 Helper

### Recommended Approach: **Hybrid (Inline Tooltip + Optional Modal)**

1. **Default**: Inline tooltip (ℹ️ icon) next to Mode 1 title
   - Click to expand helper content
   - Shows: When to use, what to expect, examples
   - Non-intrusive, always available

2. **First-time users**: Optional modal overlay
   - Shows on first visit to Mode 1
   - Can be skipped
   - Can be re-opened from helper icon

3. **Content Structure**:
   ```
   Mode 1 Helper
   ├─ What is Mode 1?
   ├─ When to use it?
   ├─ How it works (3 steps)
   ├─ Example use cases
   ├─ What to expect (response time, format)
   └─ Compare with other modes
   ```

---

## 📝 Implementation Checklist

### Phase 1: Core Helper Component
- [ ] Create `Mode1Helper` component
- [ ] Design tooltip/expandable content
- [ ] Write helper content (when to use, examples)
- [ ] Add to Mode 1 selector area

### Phase 2: Enhanced Features
- [ ] Expert recommendation (query-first flow)
- [ ] Query templates/suggestions
- [ ] Progress feedback (step-by-step)
- [ ] Response quality indicators

### Phase 3: Polish
- [ ] First-time user modal
- [ ] Quick action buttons
- [ ] Smart next steps suggestions
- [ ] Analytics tracking

---

## 📚 Example Helper Content

### Mode 1 Helper Text

**Title**: Mode 1: Manual Expert Selection

**Subtitle**: Choose your specific expert for precise, focused answers

**When to use Mode 1:**
- ✅ You know which expert to ask
- ✅ You have a specific, focused question
- ✅ You need a quick answer (20-30 seconds)
- ✅ You want deep expertise from one domain

**How it works:**
1. Select your expert (e.g., Regulatory Expert)
2. Type your question
3. Get a precise, domain-specific answer

**Example questions:**
- "What are FDA 510(k) requirements?"
- "How do I design a Phase 3 clinical trial?"
- "What's the reimbursement process for medical devices?"

**What to expect:**
- ⚡ Fast response: 20-30 seconds
- 🎯 Focused answer from one expert
- 📚 Deep knowledge from expert's domain
- 📝 Citations and sources included

**Not sure?**
- Don't know which expert? → Try Mode 2 (Automatic Selection)
- Need multi-turn conversation? → Try Mode 3 (Manual Autonomous)
- Need multiple perspectives? → Try Mode 4 (Automatic Autonomous)

---

## 🎨 Visual Design Recommendations

### Helper Component Styling
- **Color**: Blue accent (matches Mode 1 theme)
- **Icon**: Info circle (ℹ️) or Lightbulb (💡)
- **Position**: Inline with Mode 1 title, or floating button
- **Animation**: Smooth expand/collapse
- **Content**: Card-style with clear sections

### Accessibility
- Keyboard navigation (Tab, Enter, Escape)
- Screen reader support
- High contrast mode
- Focus indicators

---

## 📊 Success Metrics

### User Engagement
- Helper usage rate (how many click it)
- Time to first query (faster with helper?)
- Mode 1 selection rate (does helper increase adoption?)

### User Satisfaction
- User feedback on helper usefulness
- Query quality (better queries with templates?)
- Response satisfaction (higher with quality indicators?)

### Technical
- Helper component load time
- Helper interaction tracking
- Error rates (lower confusion = fewer errors?)

---

## 🚀 Next Steps

1. **Review this document** with team
2. **Prioritize enhancements** (High/Medium/Low)
3. **Design helper component** (wireframes/mockups)
4. **Implement Phase 1** (Core helper)
5. **Test with users** (usability testing)
6. **Iterate based on feedback**
7. **Roll out to production**

---

## 📖 Appendix: Technical Details

### Mode 1 Configuration
```typescript
{
  id: 'mode-1-query-automatic',
  name: 'Manual Expert Selection',
  requiresAgentSelection: true,
  supportsChatHistory: false,
  supportsCheckpoints: false,
  searchFunction: 'search_knowledge_for_agent',
  params: { max_results: 15 }
}
```

### Backend Flow
```
User Query → API Gateway → AI Engine
  ├─ Validate mode & agent
  ├─ Load agent configuration
  ├─ RAG search (agent domains)
  ├─ Generate response (LLM)
  └─ Stream response
```

### Frontend Flow
```
Mode Selection → Expert Selection → Query Input → Response Display
```

---

## 🎨 UI Architecture & Design System

**Purpose**: Document the unified UI components and layout system used across all frontend pages to ensure consistent design and user experience.

---

### 📐 Core Layout Components

#### 1. UnifiedDashboardLayout
**Location**: `apps/digital-health-startup/src/components/dashboard/unified-dashboard-layout.tsx`

**Purpose**: Main layout wrapper that provides consistent structure across all authenticated pages.

**Architecture**:
```typescript
<SidebarProvider>
  <div className="flex min-h-screen w-full">
    <AppSidebar />
    <SidebarInset className="flex flex-1 flex-col">
      <DashboardHeader />
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        {children}
      </main>
    </SidebarInset>
  </div>
</SidebarProvider>
```

**Features**:
- ✅ Wraps all authenticated pages
- ✅ Provides sidebar context via `SidebarProvider`
- ✅ Includes top navigation bar (DashboardHeader)
- ✅ Responsive main content area
- ✅ Client-side only rendering (prevents SSR issues)
- ✅ Loading state handling

**Used In**:
- All authenticated routes via `AppLayoutClient.tsx`
- Wrapped by context providers (DashboardProvider, AskExpertProvider, etc.)

---

#### 2. AppSidebar
**Location**: `apps/digital-health-startup/src/components/app-sidebar.tsx`

**Purpose**: Context-aware sidebar that changes content based on current route.

**Architecture**:
```typescript
<Sidebar collapsible="icon" className="border-r">
  <SidebarHeader>
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      <span className="text-sm font-medium">Startup</span>
    </div>
  </SidebarHeader>
  <SidebarContent>
    {renderContent()} // Route-based content
  </SidebarContent>
  <SidebarFooter>
    <NavUser user={sidebarUser} />
  </SidebarFooter>
</Sidebar>
```

**Route-Based Content**:
- `/dashboard` → `SidebarDashboardContent`
- `/ask-expert` → `SidebarAskExpert`
- `/ask-panel` → `SidebarAskPanelContent`
- `/agents` → `SidebarAgentsContent`
- `/knowledge` → `SidebarKnowledgeContent`
- `/workflows` → `SidebarWorkflowsContent`
- `/solution-builder` → `SidebarSolutionBuilderContent`
- `/prism` → `SidebarPromptPrismContent`
- `/admin` → `SidebarAdminContent`

**Features**:
- ✅ Collapsible (icon-only mode)
- ✅ Route-aware content switching
- ✅ User profile in footer
- ✅ Client-side mount handling
- ✅ Built with shadcn UI Sidebar components

**shadcn UI Components Used**:
- `Sidebar`, `SidebarHeader`, `SidebarContent`, `SidebarFooter`
- `SidebarProvider`, `SidebarInset`, `SidebarTrigger`

---

#### 3. DashboardHeader (Top Navigation Bar)
**Location**: `apps/digital-health-startup/src/components/dashboard/unified-dashboard-layout.tsx`

**Purpose**: Top navigation bar with route navigation and user menu.

**Architecture**:
```typescript
<header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur">
  <SidebarTrigger />
  <Separator orientation="vertical" />
  
  {/* Navigation Routes */}
  <nav className="flex items-center gap-1">
    {topNavRoutes.map((route) => (
      <Button variant={isActive ? "default" : "ghost"}>
        <Icon className="w-4 h-4" />
        <span>{route.label}</span>
      </Button>
    ))}
  </nav>
  
  {/* User Menu */}
  <DropdownMenu>
    <DropdownMenuTrigger>
      <UserCircle />
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem>Profile</DropdownMenuItem>
      <DropdownMenuItem>Settings</DropdownMenuItem>
      <DropdownMenuItem>Sign out</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</header>
```

**Top Navigation Routes**:
1. **Dashboard** (`/dashboard`) - Blue icon
2. **Ask Expert** (`/ask-expert`) - Blue icon
3. **Ask Panel** (`/ask-panel`) - Purple icon
4. **Workflows** (`/workflows`) - Green icon
5. **Solution Builder** (`/solution-builder`) - Orange icon
6. **Agents** (`/agents`) - Indigo icon
7. **Tools** (`/tools`) - Gray icon
8. **Knowledge** (`/knowledge`) - Teal icon
9. **Prompt Prism** (`/prism`) - Pink icon
10. **Admin** (`/admin`) - Red icon

**Features**:
- ✅ Sticky positioning (stays at top on scroll)
- ✅ Active route highlighting
- ✅ Icon + label navigation buttons
- ✅ User dropdown menu
- ✅ Backdrop blur effect
- ✅ Responsive horizontal scroll

**shadcn UI Components Used**:
- `Button` (ghost/default variants)
- `DropdownMenu`, `DropdownMenuContent`, `DropdownMenuItem`
- `Separator`
- `SidebarTrigger`

---

#### 4. PageHeader Component
**Location**: `apps/digital-health-startup/src/components/page-header.tsx`

**Purpose**: Standardized page header used across all main pages for consistent sizing and layout.

**Standard Version** (`PageHeader`):
```typescript
<PageHeader
  icon={LucideIcon}
  title="Page Title"
  description="Page description text"
  badge={{ label: "Beta", variant: "secondary" }}
  actions={<Button>Action</Button>}
/>
```

**Specifications**:
- **Container**: `border-b bg-background px-6 py-4`
- **Icon**: `h-8 w-8 text-muted-foreground`
- **Title**: `text-3xl font-bold`
- **Description**: `text-sm text-muted-foreground`
- **Layout**: Flex with icon + title/description on left, actions on right

**Compact Version** (`PageHeaderCompact`):
- **Container**: `border-b bg-background px-4 py-3`
- **Icon**: `h-5 w-5 text-muted-foreground`
- **Title**: `text-base font-semibold`
- **Description**: `text-xs text-muted-foreground`
- Used for chat interfaces and space-constrained views

**Used In**:
- ✅ Dashboard (`/dashboard`)
- ✅ Tools Registry (`/tools`)
- ✅ Knowledge (`/knowledge`)
- ✅ Agents (`/agents`)
- ✅ Workflows (`/workflows`)
- ✅ Ask Panel (`/ask-panel`)
- ✅ Ask Expert (`/ask-expert`) - uses `PageHeaderCompact`

**shadcn UI Components Used**:
- `Badge` (for optional badges)

---

### 🧩 Sidebar Content Components

**Location**: `apps/digital-health-startup/src/components/sidebar-view-content.tsx`

**Purpose**: Route-specific sidebar content components that provide contextual navigation and actions.

#### Sidebar Structure (All Routes):
```typescript
<SidebarContent>
  <SidebarGroup>
    <SidebarGroupLabel>Section Title</SidebarLabel>
    <SidebarGroupContent>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href="/path">
              <Icon className="h-4 w-4" />
              <span>Label</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>
</SidebarContent>
```

#### Available Sidebar Content Components:

1. **SidebarDashboardContent**
   - Overview: Analytics, Recent Activity, Usage Trends
   - Quick Actions: Start Conversation, Upload Knowledge, Create Agent
   - Recent Items: Last conversations, recent agents

2. **SidebarAskExpertContent** (via `SidebarAskExpert`)
   - Chat Management: New chat, chat history
   - Agent Search: Filter by tier, search agents
   - Settings: Mode configuration

3. **SidebarAskPanelContent**
   - Conversations: Active, Pending, Approved
   - Panel Management: Create panel, browse templates

4. **SidebarAgentsContent**
   - Browse: All agents, filter by tier
   - Actions: Create agent, upload agent
   - Favorites: Starred agents

5. **SidebarKnowledgeContent**
   - Upload: Upload documents
   - Categories: Medical, Research, Clinical
   - Analytics: Document stats, usage

6. **SidebarPromptPrismContent**
   - Templates: Browse prompt templates
   - Performance: Prompt analytics
   - Version Control: Prompt versions

7. **SidebarWorkflowsContent**
   - Active: Running workflows
   - Scheduled: Upcoming workflows
   - Completed: Workflow history

8. **SidebarSolutionBuilderContent**
   - Templates: Solution templates
   - Builder Tools: Design tools
   - Actions: Save, Deploy, Share

9. **SidebarAdminContent**
   - User Management: Users, roles, permissions
   - System Config: Settings, integrations
   - Monitoring: Logs, analytics

**shadcn UI Components Used**:
- `Sidebar`, `SidebarContent`, `SidebarGroup`, `SidebarGroupLabel`
- `SidebarGroupContent`, `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton`
- `Input` (for search)
- `Button`, `Badge`
- `ScrollArea`

---

### 🎯 Design System Standards

#### Spacing & Layout
- **Container Padding**: `px-4 lg:px-6` (responsive)
- **Content Gap**: `gap-4 lg:gap-6` (responsive)
- **Sidebar Width**: `w-64` (256px), collapses to icon-only
- **Header Height**: `h-16` (64px)

#### Typography
- **Page Titles**: `text-3xl font-bold` (standard) or `text-base font-semibold` (compact)
- **Descriptions**: `text-sm text-muted-foreground` (standard) or `text-xs text-muted-foreground` (compact)
- **Sidebar Labels**: `text-sm font-medium`
- **Menu Items**: `text-sm`

#### Colors & Theming
- **Background**: `bg-background` (adapts to light/dark mode)
- **Borders**: `border-b`, `border-r` with `border-color`
- **Muted Text**: `text-muted-foreground`
- **Active States**: Primary color with `bg-primary text-primary-foreground`

#### Icons
- **Standard Size**: `h-4 w-4` (16px) in menus, `h-8 w-8` (32px) in headers
- **Library**: Lucide React icons
- **Color**: Inherit from parent or use `text-muted-foreground`

---

### 📦 shadcn UI Component Library

**Base Components Used Across All Pages**:

#### Layout & Navigation
- `Sidebar` - Main sidebar component with collapsible support
- `SidebarProvider` - Context provider for sidebar state
- `SidebarInset` - Main content area wrapper
- `SidebarTrigger` - Button to toggle sidebar
- `SidebarHeader`, `SidebarContent`, `SidebarFooter` - Sidebar sections

#### Navigation Components
- `SidebarGroup`, `SidebarGroupLabel`, `SidebarGroupContent` - Sidebar sections
- `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton` - Menu items

#### Interactive Components
- `Button` - Primary interactive element (multiple variants)
- `DropdownMenu` - User menu, context menus
- `Input` - Search inputs, form fields
- `Badge` - Status indicators, labels

#### Layout Utilities
- `Separator` - Visual dividers
- `ScrollArea` - Scrollable content areas
- `Card`, `CardHeader`, `CardTitle`, `CardContent` - Content containers

---

### 🔄 Component Hierarchy

```
AppLayoutClient
└── UnifiedDashboardLayout
    ├── SidebarProvider
    │   └── AppSidebar
    │       ├── SidebarHeader (Organization indicator)
    │       ├── SidebarContent (Route-based content)
    │       └── SidebarFooter (NavUser component)
    │
    └── SidebarInset
        ├── DashboardHeader (Top Nav Bar)
        │   ├── SidebarTrigger
        │   ├── Navigation Routes (10 buttons)
        │   └── User Dropdown Menu
        │
        └── Main Content Area
            └── PageHeader (Page-specific)
            └── Page Content (children)
```

---

### ✅ Consistency Checklist

**All Pages Should Have**:
- [x] UnifiedDashboardLayout wrapper
- [x] AppSidebar with route-appropriate content
- [x] DashboardHeader with navigation
- [x] PageHeader or PageHeaderCompact
- [x] Consistent spacing (px-4 lg:px-6, gap-4 lg:gap-6)
- [x] shadcn UI components for interactive elements
- [x] Responsive design (mobile sidebar becomes sheet)
- [x] Dark/light mode support
- [x] Accessible keyboard navigation

**Design Tokens**:
- Sidebar width: `w-64` (256px)
- Header height: `h-16` (64px)
- Standard padding: `px-6 py-4`
- Compact padding: `px-4 py-3`
- Icon sizes: `h-4 w-4` (menu), `h-8 w-8` (header)
- Border radius: Default shadcn tokens
- Colors: CSS variables for theme support

---

### 📝 Implementation Guidelines

#### Creating a New Page

1. **Wrap with UnifiedDashboardLayout** (already done in layout.tsx)
2. **Add PageHeader** at the top:
   ```typescript
   import { PageHeader } from '@/components/page-header';
   
   <PageHeader
     icon={YourIcon}
     title="Page Title"
     description="Page description"
   />
   ```
3. **Add Sidebar Content** in `sidebar-view-content.tsx`:
   - Create new `SidebarYourPageContent` component
   - Add route detection in `AppSidebar` renderContent()
4. **Use shadcn UI Components**:
   - Prefer existing components from `@/components/ui/*`
   - Follow spacing and sizing patterns
   - Use theme-aware colors

#### Updating Navigation

1. **Add to topNavRoutes** in `unified-dashboard-layout.tsx`
2. **Add route detection** in `AppSidebar` renderContent()
3. **Create sidebar content** component if needed

---

**End of Document**


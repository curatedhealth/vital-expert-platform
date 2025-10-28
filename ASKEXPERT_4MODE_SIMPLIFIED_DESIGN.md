# Ask Expert - Simplified 4-Mode System Design

## Executive Summary

**New Design Philosophy:** Two simple toggles replace 5 complex mode cards
- **Toggle 1:** Interactive ↔ Autonomous (conversation type)
- **Toggle 2:** Manual ↔ Automatic (agent selection)
- **Result:** 4 intuitive modes in a 2×2 matrix

---

## Mode Matrix: 2×2 Design

```
                    MANUAL              AUTOMATIC
                (You Choose)        (AI Chooses Best)
    ┌──────────────────────────────────────────────────┐
    │                                                  │
I   │   Mode 1:                    Mode 2:            │
N   │   INTERACTIVE               INTERACTIVE         │
T   │   + MANUAL                  + AUTOMATIC         │
E   │                                                  │
R   │   "Focused Expert           "Smart Expert       │
A   │    Conversation"             Discussion"        │
C   │                                                  │
T   │   • Pick your expert        • AI picks best     │
I   │   • Multi-turn chat         • Multi-turn chat   │
V   │   • Deep dive               • Dynamic switching │
E   │                                                  │
    ├──────────────────────────────────────────────────┤
    │                                                  │
A   │   Mode 3:                    Mode 4:            │
U   │   AUTONOMOUS                AUTONOMOUS          │
T   │   + MANUAL                  + AUTOMATIC         │
O   │                                                  │
N   │   "Autonomous Expert        "Autonomous AI      │
O   │    Workflow"                 Workflow"          │
M   │                                                  │
O   │   • Pick your expert        • AI picks best     │
U   │   • Goal-driven             • Goal-driven       │
S   │   • Tool execution          • Tool execution    │
    │   • Human checkpoints       • Human checkpoints │
    │                                                  │
    └──────────────────────────────────────────────────┘
```

---

## Mode Definitions

### Axis 1: Interactive vs Autonomous

**INTERACTIVE (Toggle OFF)**
- Conversational back-and-forth
- User asks, expert responds
- Multi-turn dialogue
- Context preserved across turns
- Good for: Exploration, learning, clarification

**AUTONOMOUS (Toggle ON)**
- Goal-driven workflow execution
- Multi-step task completion
- Tool execution with results
- Human approval checkpoints
- Progress tracking
- Good for: Complex tasks, document generation, research synthesis

### Axis 2: Manual vs Automatic

**MANUAL (Toggle OFF)**
- User selects specific expert
- Same expert throughout session
- Expertise consistency
- Relationship building
- Good for: Known problems, specific expertise needed

**AUTOMATIC (Toggle ON)**
- AI selects best expert(s)
- Dynamic expert switching (Interactive) or multi-expert collaboration (Autonomous)
- Optimal expertise matching
- Multiple perspectives
- Good for: Unknown problems, complex multi-domain issues

---

## The 4 Modes in Detail

### Mode 1: Interactive + Manual
**Name:** "Focused Expert Conversation"
**Backend Enum:** `interactive_manual`

**User Experience:**
1. User selects an expert (e.g., FDA Regulatory Strategist)
2. User asks a question
3. Expert provides detailed response
4. User follows up with more questions
5. Same expert maintains context throughout

**Use Cases:**
- Strategic planning with a specific expert
- Deep regulatory guidance
- Clinical trial design consultation
- Market access strategy development

**Technical Behavior:**
- Single agent selection: `persistentAgentId`
- Conversation history preserved
- Context window: 10 turns
- Response time: 30-45 seconds per turn
- RAG: Agent-specific knowledge retrieval

**Example:**
```
User: [Selects "FDA Regulatory Strategist"]
User: "What's the best pathway for my Class II device?"
Expert: [Detailed 510(k) analysis]
User: "What about predicate devices?"
Expert: [Predicate strategy, remembers previous context]
```

---

### Mode 2: Interactive + Automatic
**Name:** "Smart Expert Discussion"
**Backend Enum:** `interactive_automatic`

**User Experience:**
1. User asks a question (no expert selection)
2. AI selects best expert(s) for the question
3. Expert provides response
4. User asks follow-up
5. AI may switch to different expert if topic shifts

**Use Cases:**
- Exploratory research
- Complex multi-domain problems
- When you don't know which expert to ask
- Learning about new topics

**Technical Behavior:**
- Multi-expert selection: 1-2 agents per turn
- Dynamic agent switching based on topic
- Conversation history preserved
- Context window: 10 turns
- Response time: 45-60 seconds per turn
- RAG: Multi-domain knowledge retrieval

**Example:**
```
User: "How do I get FDA approval for my digital therapeutic?"
AI: [Selects: FDA Regulatory + Digital Health Expert]
Experts: [Combined response about De Novo pathway + software guidelines]
User: "What about reimbursement?"
AI: [Switches to: Reimbursement Strategist + Payer Relations Expert]
Experts: [CPT codes, payer evidence requirements]
```

---

### Mode 3: Autonomous + Manual
**Name:** "Autonomous Expert Workflow"
**Backend Enum:** `autonomous_manual`

**User Experience:**
1. User selects an expert
2. User provides a goal (not a question)
3. Expert creates multi-step plan
4. Expert executes steps with tool usage
5. Human approves at checkpoints
6. Final deliverable generated

**Use Cases:**
- Document generation with specific expertise
- Complex regulatory submission prep
- Strategic planning documents
- Research synthesis by chosen expert

**Technical Behavior:**
- Single agent selection: `persistentAgentId`
- Task planning with 3-7 steps
- Tool execution: search, analysis, document generation
- Human checkpoints: every 2-3 steps
- Response time: 3-5 minutes total
- RAG: Agent-specific + task-specific retrieval

**Example:**
```
User: [Selects "Clinical Trials Strategist"]
User: "Create a Phase 2 trial protocol for my diabetes device"
Expert: [Creates 5-step plan]
  Step 1: Research similar trials ✓
  Step 2: Define endpoints [CHECKPOINT - User approves]
  Step 3: Design study arms ✓
  Step 4: Budget estimation [CHECKPOINT - User approves]
  Step 5: Generate protocol document ✓
[Delivers: 40-page protocol document]
```

---

### Mode 4: Autonomous + Automatic
**Name:** "Autonomous AI Workflow"
**Backend Enum:** `autonomous_automatic`

**User Experience:**
1. User provides a goal
2. AI selects best expert(s) for the task
3. AI creates multi-step plan
4. Experts execute steps collaboratively
5. Human approves at checkpoints
6. Final deliverable generated

**Use Cases:**
- Complex multi-domain tasks
- Comprehensive strategy development
- Full regulatory submission packages
- Market entry strategy + execution plan

**Technical Behavior:**
- Multi-expert selection: 2-4 agents based on task
- Collaborative task execution
- Tool execution: search, analysis, synthesis
- Human checkpoints: every 2-3 steps
- Response time: 5-10 minutes total
- RAG: Multi-domain knowledge retrieval + synthesis

**Example:**
```
User: "Create a complete FDA 510(k) submission strategy"
AI: [Selects: FDA Regulatory + Clinical + Reimbursement + Quality]
AI: [Creates 7-step collaborative plan]
  Step 1: Regulatory pathway analysis (FDA Expert) ✓
  Step 2: Predicate device research (FDA Expert) ✓
  Step 3: Clinical evidence requirements (Clinical Expert) [CHECKPOINT]
  Step 4: Quality system requirements (Quality Expert) ✓
  Step 5: Reimbursement strategy (Reimbursement Expert) [CHECKPOINT]
  Step 6: Timeline & budget (All experts) ✓
  Step 7: Generate submission package (All experts) ✓
[Delivers: Complete 510(k) submission guide with all sections]
```

---

## UI Design: Toggle-Based Interface

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│                     ASK EXPERT                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Choose Your Consultation Style:                           │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Conversation Type                                    │ │
│  │  ○ Interactive    ● Autonomous                        │ │
│  │  [────────────●─────]                                 │ │
│  │                                                        │ │
│  │  💬 Interactive: Back-and-forth conversation          │ │
│  │  🤖 Autonomous: Goal-driven task execution            │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Expert Selection                                     │ │
│  │  ● Manual        ○ Automatic                          │ │
│  │  [●────────────────]                                  │ │
│  │                                                        │ │
│  │  👤 Manual: You choose the expert                     │ │
│  │  🎯 Automatic: AI picks the best expert(s)           │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Your Selection:                                      │ │
│  │  📊 Interactive + Manual                              │ │
│  │  "Focused Expert Conversation"                        │ │
│  │                                                        │ │
│  │  [Select Expert ▼]                                    │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  [Start Consultation →]                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Component Breakdown

**1. Toggle Component:**
```tsx
<Toggle
  value={isAutonomous}
  onChange={setIsAutonomous}
  label="Conversation Type"
  options={[
    { value: false, label: 'Interactive', icon: '💬' },
    { value: true, label: 'Autonomous', icon: '🤖' }
  ]}
  description={{
    false: 'Back-and-forth conversation',
    true: 'Goal-driven task execution'
  }}
/>
```

**2. Mode Display:**
```tsx
<ModeDisplay
  isAutonomous={isAutonomous}
  isAutomatic={isAutomatic}
  modeName={getModeName(isAutonomous, isAutomatic)}
  modeDescription={getModeDescription(isAutonomous, isAutomatic)}
/>
```

**3. Conditional Agent Selection:**
```tsx
{!isAutomatic && (
  <AgentSelector
    selectedAgent={selectedAgent}
    onSelect={setSelectedAgent}
    required={true}
  />
)}
```

---

## LangGraph Architecture Changes

### New State Schema

```typescript
interface SimplifiedState {
  // Mode configuration (2 toggles)
  isAutonomous: boolean;  // false = interactive, true = autonomous
  isAutomatic: boolean;   // false = manual, true = automatic

  // Core state
  query: string;
  userId: string;
  conversationId: string;

  // Agent selection
  selectedAgentId?: string;  // Only for manual modes (isAutomatic = false)
  activeAgents: string[];    // Current agent(s) handling the query

  // Conversation context (Interactive modes only)
  chatHistory: Message[];
  turnCount: number;

  // Task execution (Autonomous modes only)
  taskGoal?: string;
  taskPlan?: {
    steps: TaskStep[];
    currentStep: number;
  };
  checkpoints: Checkpoint[];
  toolExecutions: ToolExecution[];

  // Output
  response: string;
  sources: Source[];
  metadata: any;
}
```

### New Node Structure

```typescript
// Routing node
async route(state: SimplifiedState) {
  const mode = getModeFromToggles(state.isAutonomous, state.isAutomatic);

  if (!state.isAutonomous) {
    // Interactive modes
    return state.isAutomatic
      ? 'interactive_automatic_flow'
      : 'interactive_manual_flow';
  } else {
    // Autonomous modes
    return state.isAutomatic
      ? 'autonomous_automatic_flow'
      : 'autonomous_manual_flow';
  }
}

// Mode 1: Interactive + Manual
async interactive_manual_flow(state: SimplifiedState) {
  // Use selectedAgentId
  // Single agent response
  // Preserve chat history
  // Return response
}

// Mode 2: Interactive + Automatic
async interactive_automatic_flow(state: SimplifiedState) {
  // Select best agent(s) based on query + history
  // Multi-agent response (1-2 agents)
  // Preserve chat history
  // Allow agent switching on topic change
  // Return response
}

// Mode 3: Autonomous + Manual
async autonomous_manual_flow(state: SimplifiedState) {
  // Use selectedAgentId
  // Create task plan
  // Execute with tools
  // Checkpoint approvals
  // Return deliverable
}

// Mode 4: Autonomous + Automatic
async autonomous_automatic_flow(state: SimplifiedState) {
  // Select best agents for task (2-4 agents)
  // Create collaborative task plan
  // Execute with tools (multi-agent)
  // Checkpoint approvals
  // Return deliverable
}
```

### Simplified Graph

```
         ┌─────────┐
         │  START  │
         └────┬────┘
              │
         ┌────▼────────┐
         │   CLASSIFY  │ ← Understand query/goal
         │   INTENT    │
         └────┬────────┘
              │
         ┌────▼────────┐
         │   ROUTE     │ ← Based on 2 toggles
         │   BY MODE   │
         └─┬─┬─┬─┬─────┘
           │ │ │ │
    ┌──────┘ │ │ └──────┐
    │   ┌────┘ └────┐   │
    │   │           │   │
┌───▼───▼┐     ┌───▼───▼────┐
│ INTER- │     │ AUTONOMOUS │
│ ACTIVE │     │  MODES     │
│ MODES  │     └───┬────────┘
└───┬────┘         │
    │              │
┌───▼───────┐  ┌───▼──────────┐
│  MANUAL   │  │  AUTOMATIC   │
│  (Mode 1) │  │  (Mode 2)    │
└───┬───────┘  └───┬──────────┘
    │              │
    │         ┌────▼────────┐  ┌────────────┐
    │         │   SELECT    │  │   CREATE   │
    │         │   AGENTS    │  │   PLAN     │
    │         └────┬────────┘  └────┬───────┘
    │              │                │
    │         ┌────▼────────┐  ┌────▼───────┐
    │         │  EXECUTE    │  │  EXECUTE   │
    │         │  QUERY      │  │  WITH TOOLS│
    │         └────┬────────┘  └────┬───────┘
    │              │                │
    │              │           ┌────▼────────┐
    │              │           │ CHECKPOINT  │
    │              │           │ APPROVAL    │
    │              │           └────┬────────┘
    │              │                │
    └──────┬───────┴────────────────┘
           │
      ┌────▼───────┐
      │ SYNTHESIZE │
      │  RESPONSE  │
      └────┬───────┘
           │
      ┌────▼────┐
      │   END   │
      └─────────┘
```

---

## API Changes

### Request Format

```typescript
// New simplified request
interface AskExpertRequest {
  query: string;           // Question (Interactive) or Goal (Autonomous)
  isAutonomous: boolean;   // Toggle 1
  isAutomatic: boolean;    // Toggle 2
  userId: string;
  conversationId?: string;
  selectedAgentId?: string;  // Required if isAutomatic = false
  humanApproval?: boolean;   // For checkpoint responses
}

// Example requests
// Mode 1: Interactive + Manual
{
  query: "What's the FDA pathway for my device?",
  isAutonomous: false,
  isAutomatic: false,
  userId: "user-123",
  selectedAgentId: "agent-fda-strategist"
}

// Mode 2: Interactive + Automatic
{
  query: "What's the FDA pathway for my device?",
  isAutonomous: false,
  isAutomatic: true,
  userId: "user-123"
}

// Mode 3: Autonomous + Manual
{
  query: "Create a 510(k) submission strategy document",
  isAutonomous: true,
  isAutomatic: false,
  userId: "user-123",
  selectedAgentId: "agent-fda-strategist"
}

// Mode 4: Autonomous + Automatic
{
  query: "Create a 510(k) submission strategy document",
  isAutonomous: true,
  isAutomatic: true,
  userId: "user-123"
}
```

### Response Format

```typescript
// Interactive modes response
interface InteractiveResponse {
  conversationId: string;
  response: string;         // Expert's answer
  agents: Agent[];          // Agent(s) who responded
  sources: Source[];        // RAG sources
  turnCount: number;        // Conversation progress
  canFollowUp: boolean;     // true
}

// Autonomous modes response
interface AutonomousResponse {
  conversationId: string;
  taskPlan: TaskPlan;       // Multi-step plan
  currentStep: number;      // Progress
  stepResult: string;       // Current step output
  checkpoint?: Checkpoint;  // If approval needed
  deliverable?: Document;   // Final output
  agents: Agent[];          // Collaborating agents
  toolExecutions: ToolExecution[];
}
```

---

## Migration from 5-Mode to 4-Mode

### Mapping Table

| Old 5-Mode System | New 4-Mode System |
|-------------------|-------------------|
| Mode 1: Query-Automatic (3-5 experts, parallel) | **DEPRECATED** - Use Mode 2 (Interactive + Automatic) |
| Mode 2: Query-Manual (1 expert, focused) | **Mode 1** (Interactive + Manual) |
| Mode 3: Chat-Automatic (multi-turn, switching) | **Mode 2** (Interactive + Automatic) |
| Mode 4: Chat-Manual (multi-turn, persistent) | **Mode 1** (Interactive + Manual) |
| Mode 5: Agent (goal-driven, tools, checkpoints) | **Mode 3 or 4** (Autonomous + Manual/Automatic) |

### Key Simplifications

1. **Removed distinction between "Query" and "Chat"**
   - Old system: Separate modes for one-shot vs multi-turn
   - New system: All Interactive modes support multi-turn naturally

2. **Removed parallel multi-expert consultation**
   - Old: Mode 1 ran 3-5 experts in parallel then synthesized
   - New: Mode 2 selects 1-2 best experts (faster, clearer)

3. **Unified autonomous modes**
   - Old: Mode 5 was separate, complex
   - New: Autonomous is just a toggle, applies to both Manual and Automatic

4. **Simpler mental model**
   - Old: 5 cards to read and compare
   - New: 2 toggle switches = 4 combinations

---

## Benefits of Simplified Design

### For Users

1. **Faster Decision Making**
   - 2 toggles vs 5 cards to read
   - Clear binary choices
   - Instant understanding

2. **Intuitive Controls**
   - Toggle switches are universally understood
   - Visual feedback on selection
   - No need to read long descriptions

3. **Reduced Cognitive Load**
   - 2 decisions instead of 5 options
   - Each decision is independent
   - Clear "what if" exploration

4. **Mobile Friendly**
   - Toggles work great on touch screens
   - No scrolling through mode cards
   - Compact UI

### For Developers

1. **Simpler State Management**
   - 2 booleans instead of 5 enum values
   - Easier to reason about
   - Fewer edge cases

2. **Cleaner Routing Logic**
   - 2×2 matrix is straightforward
   - Easy to add features per mode
   - Clear separation of concerns

3. **Better Testing**
   - 4 modes = 4 test suites
   - Each combination is distinct
   - Easy to cover all cases

4. **Easier Maintenance**
   - Less code duplication
   - Shared infrastructure
   - Clear mode boundaries

---

## Implementation Checklist

### Backend (LangGraph)

- [ ] Update state schema with `isAutonomous` and `isAutomatic` booleans
- [ ] Remove old 5-mode enum values
- [ ] Implement new routing logic based on 2 toggles
- [ ] Create 4 mode-specific execution flows
- [ ] Update agent selection strategies
- [ ] Test all 4 modes independently

### API Layer

- [ ] Update request interface
- [ ] Remove old mode enum validation
- [ ] Add toggle validation
- [ ] Update response types for Interactive vs Autonomous
- [ ] Update SSE event structure
- [ ] Test API with all 4 mode combinations

### Frontend

- [ ] Create new `SimplifiedModeSelector` component with toggles
- [ ] Remove old `EnhancedModeSelector` component
- [ ] Update mode mapper utility
- [ ] Create mode name/description helpers
- [ ] Update page.tsx to use new selector
- [ ] Add conditional agent selector (manual modes only)
- [ ] Test UI with all toggle combinations

### Documentation

- [ ] Update user guides
- [ ] Update API documentation
- [ ] Create migration guide for existing users
- [ ] Update examples and tutorials

---

## Success Metrics

### User Experience

- Time to make mode selection: < 10 seconds (vs ~30 seconds with 5 modes)
- Mode selection confidence: > 90% (vs ~60% with 5 modes)
- Mobile usability: > 95% (vs ~70% with mode cards)

### Performance

- Mode routing decision: < 50ms
- Agent selection (automatic): < 200ms
- Response time unchanged from previous system

### Adoption

- Daily active consultations: +40% (easier to use)
- Mode distribution: Balanced across all 4 modes
- User satisfaction: > 4.5/5 stars

---

## Next Steps

1. **Phase 1: Backend** (Priority 1)
   - Update LangGraph orchestrator
   - Implement 4 mode flows
   - Test with API

2. **Phase 2: Frontend** (Priority 2)
   - Create toggle UI component
   - Update page integration
   - Test user flow

3. **Phase 3: Migration** (Priority 3)
   - Gradual rollout
   - A/B testing
   - User feedback collection

---

*Version: 2.0 (Simplified 4-Mode System)*
*Date: October 26, 2025*
*Status: Design Complete - Ready for Implementation*

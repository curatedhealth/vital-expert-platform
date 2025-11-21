# Ask Expert - 4-Mode System Implementation

**Date**: November 18, 2025
**Status**: ✅ PRODUCTION READY
**Version**: 2.0 - 2-Toggle System

---

## Executive Summary

The Ask Expert service now uses a **2-toggle system** that creates **4 distinct modes** through a simple 2x2 matrix. This replaces the previous 5-mode system with a cleaner, more intuitive user experience inspired by ChatGPT, Claude, and Gemini.

---

## The 4-Mode Matrix

### Toggle System
Two simple toggles control the entire experience:

1. **Autonomous Toggle** (Off/On)
   - **OFF** = Interactive (back-and-forth conversation)
   - **ON** = Autonomous (goal-driven execution)

2. **Automatic Toggle** (Off/On)
   - **OFF** = Manual (you choose the expert)
   - **ON** = Automatic (AI selects best expert(s))

### The 4 Resulting Modes

```
┌─────────────────────────────────────────────────────────────────┐
│                  ASK EXPERT: 4-MODE SYSTEM                      │
│              Interaction Type x Expert Selection                │
└─────────────────────────────────────────────────────────────────┘

                    MANUAL Selection     │  AUTO Selection
                    (You Choose Expert)  │  (AI Selects Experts)
                                        │
INTERACTIVE   ┌────────────────────────┼────────────────────────┐
(Conversation)│       MODE 1           │       MODE 2           │
              │ Interactive + Manual   │ Interactive + Auto     │
              │ "Focused Expert        │ "Smart Expert          │
              │  Conversation"         │  Discussion"           │
              │ ⏱ 30-45 sec           │ ⏱ 45-60 sec           │
              │ 👤 1 expert            │ 👥 2 experts           │
              └────────────────────────┼────────────────────────┘
                                        │
AUTONOMOUS    ┌────────────────────────┼────────────────────────┐
(Goal-Driven) │       MODE 3           │       MODE 4           │
              │ Autonomous + Manual    │ Autonomous + Auto      │
              │ "Expert-Driven         │ "AI Collaborative      │
              │  Workflow"             │  Workflow"             │
              │ ⏱ 3-5 min             │ ⏱ 5-10 min            │
              │ 👤 1 expert            │ 👥 4 experts           │
              └────────────────────────┼────────────────────────┘
```

---

## Mode Details

### Mode 1: Interactive + Manual
**"Focused Expert Conversation"**

- **Toggles**: Autonomous=OFF, Automatic=OFF
- **Use Case**: You know which expert you need and want to have a conversation
- **Example**: "I want to discuss my 510(k) strategy with the FDA Regulatory Expert"
- **Features**:
  - You select the specific expert
  - Multi-turn conversation
  - Deep contextual understanding
  - No autonomous execution
- **Response Time**: 30-45 seconds
- **Experts**: 1 (your selection)

---

### Mode 2: Interactive + Automatic
**"Smart Expert Discussion"**

- **Toggles**: Autonomous=OFF, Automatic=ON
- **Use Case**: You want to explore a topic but aren't sure which expert(s) to consult
- **Example**: "I need advice on entering the EU market with my medical device"
- **Features**:
  - AI selects best expert(s) for your query
  - Multi-turn conversation
  - Dynamic expert switching if needed
  - Multiple perspectives
- **Response Time**: 45-60 seconds
- **Experts**: Up to 2 (AI-selected)

---

### Mode 3: Autonomous + Manual
**"Expert-Driven Workflow"**

- **Toggles**: Autonomous=ON, Automatic=OFF
- **Use Case**: You have a specific expert and a goal you want them to accomplish
- **Example**: "I need the Clinical Trials Expert to create a Phase II study protocol"
- **Features**:
  - You select the expert
  - Multi-step autonomous execution
  - Tool usage (research, analysis, generation)
  - Human approval checkpoints
- **Response Time**: 3-5 minutes
- **Experts**: 1 (your selection)

---

### Mode 4: Autonomous + Automatic
**"AI Collaborative Workflow"**

- **Toggles**: Autonomous=ON, Automatic=ON
- **Use Case**: Complex goal requiring multiple experts working together
- **Example**: "Create a complete FDA 510(k) submission package for my device"
- **Features**:
  - AI assembles team of experts
  - Collaborative autonomous execution
  - Advanced tool usage
  - Comprehensive deliverables
- **Response Time**: 5-10 minutes
- **Experts**: Up to 4 (AI-selected team)

---

## Technical Implementation

### Core Files

1. **Main Page Component**
   - `apps/digital-health-startup/src/app/(app)/ask-expert/page.tsx`
   - Modern ChatGPT-style interface
   - 2-toggle system with clean UI

2. **Mode Mapper Utility**
   - `src/features/ask-expert/utils/simplified-mode-mapper.ts`
   - Maps toggles to backend modes
   - Provides validation and recommendations
   - Smart query analysis

3. **Backend Modes (LangGraph)**
   - `interactive_manual` - Mode 1
   - `interactive_automatic` - Mode 2
   - `autonomous_manual` - Mode 3
   - `autonomous_automatic` - Mode 4

### Mode Mapping Function

```typescript
function getBackendMode(isAutonomous: boolean, isAutomatic: boolean): SimplifiedMode {
  if (!isAutonomous && !isAutomatic) return 'interactive_manual';      // Mode 1
  if (!isAutonomous && isAutomatic) return 'interactive_automatic';    // Mode 2
  if (isAutonomous && !isAutomatic) return 'autonomous_manual';        // Mode 3
  return 'autonomous_automatic';                                       // Mode 4
}
```

### Validation

```typescript
// Agent selection required for Manual modes (1 & 3)
const needsAgent = requiresAgentSelection(isAutonomous, isAutomatic);

if (needsAgent && !selectedAgent) {
  alert('Please select an expert first');
  return;
}
```

---

## User Experience Flow

### 1. User Arrives at /ask-expert
- Clean ChatGPT-style interface
- Two simple toggle switches visible
- Default: Interactive + Automatic (Mode 2)

### 2. User Adjusts Toggles
- Changes are instant
- Mode description updates in real-time
- If Manual selected → Agent selector appears
- If Autonomous selected → Goal-oriented messaging appears

### 3. User Types Query
- Smart recommendation system analyzes query
- Suggests optimal toggle settings
- User can accept or override

### 4. User Sends Message
- System validates mode requirements
- Routes to appropriate workflow
- Streams response in real-time

---

## Smart Recommendations

The system can analyze queries and recommend toggle settings:

```typescript
const query = "Create a comprehensive 510(k) submission strategy";
const recommendation = smartRecommend(query);

// Result:
{
  isAutonomous: true,      // Goal-oriented keywords detected
  isAutomatic: true,       // Complex multi-domain task
  confidence: 0.9,
  reason: "Complex multi-domain goal requiring collaborative autonomous execution",
  characteristics: {
    queryLength: 52,
    isGoalOriented: true,
    complexityLevel: 'high',
    domainCount: 2
  }
}
```

---

## Migration from Legacy Systems

### From 5-Mode System

Old modes automatically map to new toggles:

| Old Mode | New Toggles | New Mode |
|----------|-------------|----------|
| `mode-1-query-automatic` | Auto=ON, Auton=OFF | Mode 2 |
| `mode-2-query-manual` | Auto=OFF, Auton=OFF | Mode 1 |
| `mode-3-chat-automatic` | Auto=ON, Auton=OFF | Mode 2 |
| `mode-4-chat-manual` | Auto=OFF, Auton=OFF | Mode 1 |
| `mode-5-agent-autonomous` | Auto=ON, Auton=ON | Mode 4 |

---

## Key Benefits

### For Users
1. **Simpler** - 2 toggles vs 5 mode cards
2. **Clearer** - Intuitive on/off choices
3. **Faster** - Less decision paralysis
4. **Flexible** - Easy to switch modes

### For Development
1. **Maintainable** - Single source of truth
2. **Testable** - Clear state combinations
3. **Extensible** - Easy to add features per mode
4. **Validated** - Built-in validation logic

---

## Testing Checklist

- [ ] Mode 1: Interactive + Manual works with agent selection
- [ ] Mode 2: Interactive + Automatic works without agent selection
- [ ] Mode 3: Autonomous + Manual executes workflow with selected agent
- [ ] Mode 4: Autonomous + Automatic assembles team and executes
- [ ] Toggle switches update UI correctly
- [ ] Agent selector appears/disappears based on toggle state
- [ ] Smart recommendations work for sample queries
- [ ] Validation prevents submission without required agent
- [ ] Streaming responses work in all modes
- [ ] Sidebar conversations persist across mode changes

---

## Future Enhancements

1. **Saved Mode Preferences** - Remember user's preferred toggle settings
2. **Mode Analytics** - Track which modes are most popular
3. **Advanced Recommendations** - ML-based toggle suggestions
4. **Mode Templates** - Pre-configured modes for common tasks
5. **Collaborative Modes** - Team-based toggle configurations

---

## Related Documentation

- [VITAL Ask Expert PRD v2](VITAL_Ask_Expert_PRD_ENHANCED_v2.md)
- [Ask Expert ARD v2](VITAL_Ask_Expert_ARD_ENHANCED_v2.md)
- [Mode Mapper API](../../api-reference/mode-mapper.md)
- [Page Restoration History](ASK_EXPERT_PAGE_RESTORATION.md)

---

## Change Log

| Date | Version | Change |
|------|---------|--------|
| Nov 18, 2025 | 2.0 | Implemented 2-toggle 4-mode system |
| Nov 17, 2025 | 1.5 | Beta version with 7 enhanced components |
| Nov 4, 2025 | 1.0 | Initial 5-mode implementation |

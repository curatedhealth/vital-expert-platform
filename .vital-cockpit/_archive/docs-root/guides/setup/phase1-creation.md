# Phase 1 File Creation Guide

## Status: Ready to Create 3 Files

### ✅ Prerequisites Complete
- Database migration applied
- Tool registry system ready
- Complete code documented in [COMPLETE_AGENT_ENHANCEMENT_IMPLEMENTATION.md](COMPLETE_AGENT_ENHANCEMENT_IMPLEMENTATION.md)

---

## File 1: Enhanced Agent Orchestrator

**Path**: `src/features/chat/services/enhanced-agent-orchestrator.ts`

**How to Create**:
1. Open [COMPLETE_AGENT_ENHANCEMENT_IMPLEMENTATION.md](COMPLETE_AGENT_ENHANCEMENT_IMPLEMENTATION.md:22)
2. Scroll to **line 22** - find section: "Phase 1.1: Enhanced Agent Orchestrator"
3. Copy the complete TypeScript code block (lines 22-520)
4. Create new file: `src/features/chat/services/enhanced-agent-orchestrator.ts`
5. Paste the code

**Key Features**:
- Loads agent-specific tools from database
- Executes LangChain agent with 13 expert tools
- Extracts citations from 9 tool types
- Calculates confidence scores
- Tracks thinking steps in real-time
- Logs all tool usage to database

---

## File 2: Tool Usage Display Component

**Path**: `src/features/chat/components/tool-usage-display.tsx`

**How to Create**:
1. Open [COMPLETE_AGENT_ENHANCEMENT_IMPLEMENTATION.md](COMPLETE_AGENT_ENHANCEMENT_IMPLEMENTATION.md)
2. Search for: **"Phase 1.2: Tool Usage Display"** (around line 530)
3. Copy the complete React component code (~200 lines)
4. Create new file: `src/features/chat/components/tool-usage-display.tsx`
5. Paste the code

**Key Features**:
- Compact mode: inline tool badges
- Expanded mode: detailed tool inputs/outputs
- Tool-specific icons and colors
- Collapsible sections

---

## File 3: Citation Display Component

**Path**: `src/features/chat/components/citation-display.tsx`

**How to Create**:
1. Open [COMPLETE_AGENT_ENHANCEMENT_IMPLEMENTATION.md](COMPLETE_AGENT_ENHANCEMENT_IMPLEMENTATION.md)
2. Search for: **"Phase 1.3: Citation Display"** (around line 750)
3. Copy the complete React component code (~250 lines)
4. Create new file: `src/features/chat/components/citation-display.tsx`
5. Paste the code

**Key Features**:
- Multiple citation formats: APA, Vancouver, Chicago
- 9 citation types supported
- Clickable links to sources
- Visual type badges with colors
- Source metadata display

---

## Quick Command to Create Directories

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"
mkdir -p src/features/chat/services
mkdir -p src/features/chat/components
```

---

## After Creating Files

### Step 4: Wire Up to Chat UI

Find your main chat interface file (likely `src/features/chat/components/chat-interface.tsx` or similar) and add:

```typescript
// Add imports
import { enhancedAgentOrchestrator } from '../services/enhanced-agent-orchestrator';
import { ToolUsageDisplay } from './tool-usage-display';
import { CitationDisplay } from './citation-display';

// In your sendMessage function, replace current agent call with:
const response = await enhancedAgentOrchestrator.chat({
  agentId: currentAgent.id,
  message: userMessage,
  conversationHistory,
  conversationId,
  userId: session?.user?.id,
  onThinkingUpdate: (step) => {
    // Optional: show thinking progress in real-time
    setThinkingSteps(prev => [...prev, step]);
  }
});

// In your message display component, add after the message content:
{response.toolCalls?.length > 0 && (
  <ToolUsageDisplay toolCalls={response.toolCalls} />
)}

{response.citations?.length > 0 && (
  <CitationDisplay
    citations={response.citations}
    format="apa"
  />
)}
```

---

## Testing Checklist

After implementation, test with these queries:

### Test 1: Clinical Query
**Query**: "What clinical trials exist for psoriasis biologics?"

**Expected**:
- Uses: `pubmed_search`, `search_clinical_trials`
- Shows: 5-10 citations from PubMed and ClinicalTrials.gov
- Tool usage display shows both tools
- Citations are clickable

### Test 2: Regulatory Query
**Query**: "What are FDA requirements for biologic approval?"

**Expected**:
- Uses: `search_fda_approvals`, `search_ich_guidelines`
- Shows: FDA and ICH guideline citations
- High confidence score (>75%)
- Regulatory source badges

### Test 3: Digital Health Query
**Query**: "Best practices for decentralized clinical trials?"

**Expected**:
- Uses: `search_dime_resources`, `search_ichom_standard_sets`
- Shows: DiMe playbooks, ICHOM standards
- Multiple citations with links

---

## Troubleshooting

### If files don't exist:
Run: `bash scripts/create-phase1-files.sh` (already created for you)

### If imports fail:
Check that these services exist:
- `@/lib/services/dynamic-tool-loader`
- `@/lib/services/tool-registry-service`
- `@/lib/services/expert-tools`

### If tools aren't loading:
Verify database:
```bash
node scripts/apply-tool-registry-migration.js
```

---

## Time Estimate

- **Create 3 files**: 30 minutes (copy-paste from docs)
- **Wire up chat UI**: 30 minutes
- **Testing**: 30 minutes
- **Total**: ~1.5 hours

---

## Documentation References

All complete code is ready in these files:
- [COMPLETE_AGENT_ENHANCEMENT_IMPLEMENTATION.md](COMPLETE_AGENT_ENHANCEMENT_IMPLEMENTATION.md) - **START HERE**
- [QUICK_START_GUIDE.md](QUICK_START_GUIDE.md) - Quick reference
- [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) - Status tracking

---

## What You Get

After completing Phase 1, your agents will have:

✅ **13 Expert Tools**
- PubMed Search
- ClinicalTrials.gov Search
- FDA Approvals Search
- ICH Guidelines Search
- ISO Standards Search
- WHO Essential Medicines
- DiMe Resources
- ICHOM Standard Sets
- Knowledge Base
- Web Search
- Calculation Tools
- And more...

✅ **Citation System**
- Automatic citation extraction
- 9 citation types
- Multiple formats (APA, Vancouver, Chicago)
- Clickable source links

✅ **Transparency**
- Tool usage tracking
- Visual display of tools used
- Database logging for analytics

---

**Status**: All code ready. Just copy-paste the 3 files from the docs and wire up the chat UI.

**Next Session**: Phase 2 - Confidence badges, evidence summaries, thinking indicators

# VITAL Platform UI Component Implementation Map

**Generated**: December 12, 2025
**Purpose**: Map documented UI components to actual implementation status

---

## Component Architecture Overview

The VITAL frontend follows a 4-layer atomic design pattern:

```
┌─────────────────────────────────────────────────────────────────┐
│ Layer 4: Feature Components (59 files)                          │
│ src/features/ask-expert/components/                             │
│ Domain-specific: Interactive, Autonomous, Artifacts, Missions   │
├─────────────────────────────────────────────────────────────────┤
│ Layer 3: Platform Components (50 files)                         │
│ src/components/vital-ai-ui/                                     │
│ VITAL-specific: VitalStreamText, VitalThinking, VitalAgentCard  │
├─────────────────────────────────────────────────────────────────┤
│ Layer 2: Design System Components (31 files)                    │
│ src/components/ai-elements/                                     │
│ Reusable AI primitives: Reasoning, Sources, Conversation, etc.  │
├─────────────────────────────────────────────────────────────────┤
│ Layer 1: Base Primitives (8 files)                              │
│ src/components/ui/shadcn-io/ai/                                 │
│ HoverCard-based: InlineCitation, CodeBlock, etc.                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Layer 1: Base Primitives (`ui/shadcn-io/ai/`)

| Component | File | Status | Used By |
|-----------|------|--------|---------|
| InlineCitation | `inline-citation.tsx` | ✅ Active | VitalStreamText |
| CodeBlock | `code-block.tsx` | ✅ Active | Renderers |
| Conversation | `conversation.tsx` | ✅ Active | Multiple |
| Message | `message.tsx` | ✅ Active | Chat views |
| PromptInput | `prompt-input.tsx` | ✅ Active | Chat input |
| Reasoning | `reasoning.tsx` | ✅ Active | Thinking display |
| Response | `response.tsx` | ✅ Active | Message bubbles |
| CitedResponse | `cited-response.tsx` | ⚠️ Partial | Legacy views |

---

## Layer 2: Design System (`ai-elements/`)

### Conversation Components
| Component | File | Status | Notes |
|-----------|------|--------|-------|
| Conversation | `conversation.tsx` | ✅ Active | Container for chat |
| Message | `message.tsx` | ✅ Active | Avatar + content |
| Response | `response.tsx` | ✅ Active | AI response bubble |
| PromptInput | `prompt-input.tsx` | ✅ Active | Chat input box |
| Loader | `loader.tsx` | ✅ Active | Spinning indicator |

### Reasoning & Sources
| Component | File | Status | Notes |
|-----------|------|--------|-------|
| Reasoning | `reasoning.tsx` | ✅ Active | Collapsible thinking |
| ChainOfThought | `chain-of-thought.tsx` | ✅ Active | Step-by-step display |
| Sources | `sources.tsx` | ✅ Active | Citation list |
| InlineCitation | `inline-citation.tsx` | ✅ Active | Hover pills |

### Workflow & Task
| Component | File | Status | Notes |
|-----------|------|--------|-------|
| Task | `task.tsx` | ✅ Active | Checklist display |
| Checkpoint | `checkpoint.tsx` | ✅ Active | Progress markers |
| Plan | `plan.tsx` | ✅ Active | Multi-step plans |
| Queue | `queue.tsx` | ⚠️ Partial | Job queue display |

### Code & Artifacts
| Component | File | Status | Notes |
|-----------|------|--------|-------|
| CodeBlock | `code-block.tsx` | ✅ Active | Syntax highlighted |
| Artifact | `artifact.tsx` | ✅ Active | Generated files |
| Canvas | `canvas.tsx` | ✅ Active | Drawing area |
| Image | `image.tsx` | ✅ Active | Generated images |

### Tool & Controls
| Component | File | Status | Notes |
|-----------|------|--------|-------|
| Tool | `tool.tsx` | ✅ Active | Tool invocation UI |
| Toolbar | `toolbar.tsx` | ✅ Active | Action bar |
| Controls | `controls.tsx` | ✅ Active | Playback controls |
| ModelSelector | `model-selector.tsx` | ✅ Active | LLM picker |

### Advanced Components
| Component | File | Status | Notes |
|-----------|------|--------|-------|
| Confirmation | `confirmation.tsx` | ✅ Active | User approval |
| Connection | `connection.tsx` | ⚠️ Partial | Status indicator |
| Context | `context.tsx` | ⚠️ Partial | Context panel |
| Edge | `edge.tsx` | ⚠️ Partial | Graph edges |
| Node | `node.tsx` | ⚠️ Partial | Graph nodes |
| Panel | `panel.tsx` | ✅ Active | Slide-over panel |
| OpenInChat | `open-in-chat.tsx` | ⚠️ Partial | Action link |
| Shimmer | `shimmer.tsx` | ✅ Active | Loading skeleton |
| Suggestion | `suggestion.tsx` | ✅ Active | Auto-suggest |
| WebPreview | `web-preview.tsx` | ⚠️ Partial | URL preview |

---

## Layer 3: Platform Components (`vital-ai-ui/`)

### Conversation Subsystem
| Component | Location | Status | Notes |
|-----------|----------|--------|-------|
| VitalStreamText | `conversation/` | ✅ Active | Streamdown + citations |
| VitalMessage | `conversation/` | ✅ Active | Message wrapper |
| VitalModelSelector | `conversation/` | ✅ Active | Model picker |
| VitalSuggestionChips | `conversation/` | ✅ Active | Quick replies |
| VitalQuickActions | `conversation/` | ✅ Active | Action buttons |
| VitalPromptInput | `conversation/` | ✅ Active | Chat input |

### Reasoning Subsystem
| Component | Location | Status | Notes |
|-----------|----------|--------|-------|
| VitalThinking | `reasoning/` | ✅ Active | Glass box thinking |
| VitalConfidenceMeter | `reasoning/` | ✅ Active | Score display |
| VitalToolInvocation | `reasoning/` | ✅ Active | Tool call UI |
| VitalEvidencePanel | `reasoning/` | ✅ Active | Source panel |
| VitalSourcePreview | `reasoning/` | ✅ Active | Source card |
| VitalDelegationTrace | `reasoning/` | ✅ Active | Sub-agent trace |
| VitalCitation | `reasoning/` | ✅ Active | Citation pill |

### Workflow Subsystem
| Component | Location | Status | Notes |
|-----------|----------|--------|-------|
| VitalProgressTimeline | `workflow/` | ✅ Active | Timeline view |
| VitalCheckpointModal | `workflow/` | ✅ Active | HITL modal |
| VitalCostTracker | `workflow/` | ✅ Active | Token costs |
| VitalCircuitBreaker | `workflow/` | ✅ Active | Error boundary |
| VitalApprovalCard | `workflow/` | ✅ Active | Plan approval |
| VitalTimeoutWarning | `workflow/` | ✅ Active | Timeout UI |
| VitalWorkflowProgress | `workflow/` | ✅ Active | Progress bar |
| VitalHITLCheckpoint | `workflow/` | ✅ Active | Human-in-loop |
| VitalPreFlightCheck | `workflow/` | ⚠️ Partial | Validation UI |

### Agent Subsystem
| Component | Location | Status | Notes |
|-----------|----------|--------|-------|
| VitalAgentCard | `agents/` | ✅ Active | Agent display |
| VitalAgentCardEnhanced | `agents/` | ✅ Active | Detailed card |
| VitalTeamView | `agents/` | ✅ Active | Team display |
| VitalPersonalityBadge | `agents/` | ✅ Active | Archetype badge |
| VitalLevelBadge | `agents/` | ✅ Active | L1-L5 badge |
| VitalAgentContextSelector | `agents/` | ✅ Active | Context picker |
| VitalDelegationFlow | `agents/` | ⚠️ Partial | Delegation viz |

### Fusion Subsystem (GraphRAG)
| Component | Location | Status | Notes |
|-----------|----------|--------|-------|
| VitalFusionExplanation | `fusion/` | ✅ Active | Search explain |
| VitalDecisionTrace | `fusion/` | ✅ Active | Decision viz |
| VitalRRFVisualization | `fusion/` | ✅ Active | RRF scores |
| VitalTeamRecommendation | `fusion/` | ✅ Active | Agent suggest |
| VitalRetrieverResults | `fusion/` | ✅ Active | Search results |

### Document Subsystem
| Component | Location | Status | Notes |
|-----------|----------|--------|-------|
| VitalArtifact | `documents/` | ✅ Active | File display |
| VitalDocumentPreview | `documents/` | ✅ Active | Doc preview |
| VitalFileUpload | `documents/` | ✅ Active | Upload UI |
| VitalCodeBlock | `documents/` | ✅ Active | Code display |
| VitalDownloadCard | `documents/` | ✅ Active | Download link |

### Layout Subsystem
| Component | Location | Status | Notes |
|-----------|----------|--------|-------|
| VitalSidebar | `layout/` | ✅ Active | Navigation |
| VitalSplitPanel | `layout/` | ✅ Active | Split view |
| VitalContextPanel | `layout/` | ✅ Active | Side panel |
| VitalDashboardLayout | `layout/` | ✅ Active | Dashboard |
| VitalChatLayout | `layout/` | ✅ Active | Chat wrapper |
| VitalLoadingStates | `layout/` | ✅ Active | Skeletons |

### Data Subsystem
| Component | Location | Status | Notes |
|-----------|----------|--------|-------|
| VitalMetricCard | `data/` | ✅ Active | Metric display |
| VitalDataTable | `data/` | ✅ Active | Data grid |

### Mission Subsystem
| Component | Location | Status | Notes |
|-----------|----------|--------|-------|
| VitalTeamAssemblyView | `mission/` | ✅ Active | Team formation |

### Artifact Subsystem
| Component | Location | Status | Notes |
|-----------|----------|--------|-------|
| VitalArtifactCard | `artifacts/` | ✅ Active | Artifact card |
| VitalArtifactPanel | `artifacts/` | ✅ Active | Artifacts list |

### Error Handling
| Component | Location | Status | Notes |
|-----------|----------|--------|-------|
| VitalStreamErrorBoundary | `error/` | ✅ Active | Error catch |

---

## Layer 4: Feature Components (`features/ask-expert/components/`)

### Interactive Mode (Mode 1-2)
| Component | File | Status | Notes |
|-----------|------|--------|-------|
| StreamingMessage | `interactive/` | ✅ Active | Live streaming |
| ChatInput | `interactive/` | ✅ Active | Message input |
| ExpertPicker | `interactive/` | ✅ Active | Agent selector |
| ExpertHeader | `interactive/` | ✅ Active | Agent header |
| AgentSelectionCard | `interactive/` | ✅ Active | Selected agent |
| VitalThinking | `interactive/` | ✅ Active | Thinking UI |
| ToolCallList | `interactive/` | ✅ Active | Tool progress |
| CitationList | `interactive/` | ✅ Active | Citations |
| VitalMessage | `interactive/` | ✅ Active | Message bubble |
| VitalSuggestionChips | `interactive/` | ✅ Active | Quick actions |
| FusionSelector | `interactive/` | ✅ Active | GraphRAG mode |
| ConversationHistorySidebar | `interactive/` | ⚠️ Partial | History |
| HITLCheckpointModal | `interactive/` | ✅ Active | Approval |
| PlanApprovalCard | `interactive/` | ✅ Active | Plan confirm |
| SubAgentDelegationCard | `interactive/` | ✅ Active | Delegation |
| ToolExecutionFeedback | `interactive/` | ✅ Active | Tool feedback |

### Autonomous Mode (Mode 3-4)
| Component | File | Status | Notes |
|-----------|------|--------|-------|
| MissionExecutionView | `autonomous/` | ✅ Active | Mission runner |
| MissionTimeline | `autonomous/` | ✅ Active | Timeline |
| MissionBriefing | `autonomous/` | ✅ Active | Mission intro |
| MissionCompleteView | `autonomous/` | ✅ Active | Completion |
| MissionTemplateSelector | `autonomous/` | ✅ Active | Template picker |
| ProgressiveAccordion | `autonomous/` | ✅ Active | Expand steps |
| ReasoningChainViewer | `autonomous/` | ✅ Active | Chain viz |
| StrategyPane | `autonomous/` | ✅ Active | Strategy |
| VitalCheckpoint | `autonomous/` | ✅ Active | Checkpoint |
| StageProgressCard | `autonomous/` | ✅ Active | Stage progress |
| MetricsSummary | `autonomous/` | ✅ Active | Metrics |
| SubAgentActivityFeed | `autonomous/` | ✅ Active | Activity |

### Artifact Renderers
| Component | File | Status | Notes |
|-----------|------|--------|-------|
| ChartRenderer | `artifacts/renderers/` | ✅ Active | Charts |
| CodeRenderer | `artifacts/renderers/` | ✅ Active | Code |
| CsvRenderer | `artifacts/renderers/` | ✅ Active | CSV tables |
| HtmlRenderer | `artifacts/renderers/` | ✅ Active | HTML |
| JsonRenderer | `artifacts/renderers/` | ✅ Active | JSON tree |
| MarkdownRenderer | `artifacts/renderers/` | ✅ Active | Markdown |
| MermaidRenderer | `artifacts/renderers/` | ✅ Active | Diagrams |
| ReactRenderer | `artifacts/renderers/` | ✅ Active | Live React |
| TableRenderer | `artifacts/renderers/` | ✅ Active | Data tables |

### Artifact Management
| Component | File | Status | Notes |
|-----------|------|--------|-------|
| ArtifactPreview | `artifacts/` | ✅ Active | Preview |
| ArtifactDownload | `artifacts/` | ✅ Active | Download |
| ArtifactVersionHistory | `artifacts/` | ⚠️ Partial | Versioning |

### Mission Components
| Component | File | Status | Notes |
|-----------|------|--------|-------|
| TemplateCard | `missions/` | ✅ Active | Template card |
| TemplateGallery | `missions/` | ✅ Active | Gallery view |
| TemplatePreview | `missions/` | ✅ Active | Preview |
| TemplateCustomizer | `missions/` | ⚠️ Partial | Customizer |

### Error Handling
| Component | File | Status | Notes |
|-----------|------|--------|-------|
| ErrorBoundary | `errors/` | ✅ Active | Error catch |
| ErrorDisplay | `errors/` | ✅ Active | Error UI |
| RetryButton | `errors/` | ✅ Active | Retry action |

### Polish Components
| Component | File | Status | Notes |
|-----------|------|--------|-------|
| KeyboardShortcuts | `polish/` | ⚠️ Partial | Shortcuts |
| OnboardingTour | `polish/` | ⚠️ Partial | Tour |
| MobileResponsive | `polish/` | ⚠️ Partial | Mobile |

### Top-Level Components
| Component | File | Status | Notes |
|-----------|------|--------|-------|
| ModeSelector | root | ✅ Active | Mode picker |
| SimplifiedModeSelector | root | ✅ Active | Simple mode |
| EnhancedModeSelector | root | ✅ Active | Advanced mode |
| ModeSelectionModal | root | ✅ Active | Modal picker |
| WorkflowSelector | root | ✅ Active | Workflow pick |
| VitalWorkspace | root | ✅ Active | Main workspace |
| MissionInput | root | ✅ Active | Mission input |
| InlineArtifactGenerator | root | ✅ Active | Generate |
| InlineDocumentGenerator | root | ✅ Active | Doc gen |

---

## LangGraph GUI Components (`langgraph-gui/ai/`)

| Component | File | Status | Notes |
|-----------|------|--------|-------|
| Conversation | `conversation.tsx` | ✅ Active | Chat container |
| Loader | `loader.tsx` | ✅ Active | Loading |
| Message | `message.tsx` | ✅ Active | Message UI |
| PhaseStatus | `phase-status.tsx` | ✅ Active | Phase indicator |
| PromptInput | `prompt-input.tsx` | ✅ Active | Input |
| Reasoning | `reasoning.tsx` | ✅ Active | Thinking |
| Sources | `sources.tsx` | ✅ Active | Citations |
| Task | `task.tsx` | ✅ Active | Task list |

---

## Summary Statistics

| Layer | Total | Active | Partial | Notes |
|-------|-------|--------|---------|-------|
| Base Primitives | 8 | 7 | 1 | shadcn-io/ai |
| Design System | 31 | 24 | 7 | ai-elements |
| Platform Components | 50 | 46 | 4 | vital-ai-ui |
| Feature Components | 59 | 52 | 7 | ask-expert |
| LangGraph GUI | 8 | 8 | 0 | langgraph-gui |
| **TOTAL** | **156** | **137 (88%)** | **19 (12%)** | |

---

## Key Integration Points

### VitalStreamText Integration (Updated Today)
```
VitalStreamText
├── Uses: Streamdown (jitter-free streaming markdown)
├── Integrates: InlineCitation hover cards (shadcn-io/ai)
├── Features: Code highlighting (Shiki), Mermaid diagrams
├── Props: citations[], inlineCitations (default: true)
└── Consumer: StreamingMessage.tsx
```

### Streaming Pipeline
```
Python AI Engine (SSE Events)
    │
    ▼
useAskExpertStream (React hook)
    │
    ▼
StreamingMessage.tsx
    │
    ▼
VitalStreamText.tsx
    │
    ├── Streamdown (markdown + Shiki + Mermaid)
    ├── InlineCitation (hover cards)
    └── CitationPillsStrip (fallback mode)
```

### Active Consumers of vital-ai-ui Components
- `InteractiveView.tsx` - Main Mode 1/2 view
- `StreamingMessage.tsx` - Real-time message display
- `MarkdownRenderer.tsx` - Artifact rendering
- `agent-instantiation-modal.tsx` - Agent creation
- `MissionPlanPanel.tsx` - Mission planning

---

## Recommendations

### High Priority (Production-Critical)
1. ✅ **VitalStreamText** - Now has inline citations working
2. ✅ **VitalThinking** - Glass box reasoning implemented
3. ⚠️ **ConversationHistorySidebar** - Needs session persistence

### Medium Priority (Feature Complete)
4. ⚠️ **ArtifactVersionHistory** - Needs version tracking
5. ⚠️ **TemplateCustomizer** - Needs form validation
6. ⚠️ **KeyboardShortcuts** - Needs shortcut registry

### Low Priority (Polish)
7. ⚠️ **OnboardingTour** - Needs tour steps
8. ⚠️ **MobileResponsive** - Needs breakpoint testing
9. ⚠️ **WebPreview** - Needs iframe sandbox

---

## Recent Changes (December 12, 2025)

1. **VitalStreamText.tsx** - Added inline citation support via Streamdown `components` prop
2. **Standardized agent_id** - Replaced expert_id/expertId across frontend/backend
3. **StreamingMessage.tsx** - Consumes VitalStreamText with citations array

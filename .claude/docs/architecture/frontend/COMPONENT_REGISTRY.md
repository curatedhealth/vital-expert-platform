# VITAL Platform Component Registry

**Last Updated:** December 2024
**Total Components:** 280+

---

## Overview

This document catalogs all React components in the VITAL platform, organized by category and feature module.

---

## 1. UI Primitives (`/components/ui/`)

### Core Components

| Component | File | Purpose | shadcn/ui |
|-----------|------|---------|-----------|
| Button | `button.tsx` | Primary action element | Yes |
| Input | `input.tsx` | Text input field | Yes |
| Card | `card.tsx` | Content container | Yes |
| Label | `label.tsx` | Form field labels | Yes |
| Checkbox | `checkbox.tsx` | Boolean input | Yes |
| Switch | `switch.tsx` | Toggle control | Yes |
| Radio Group | `radio-group.tsx` | Single selection | Yes |
| Select | `select.tsx` | Dropdown selection | Yes |
| Textarea | `textarea.tsx` | Multi-line input | Yes |
| Toggle | `toggle.tsx` | Toggle button | Yes |
| Toggle Group | `toggle-group.tsx` | Multiple toggles | Yes |

### Feedback Components

| Component | File | Purpose | shadcn/ui |
|-----------|------|---------|-----------|
| Alert | `alert.tsx` | Status messages | Yes |
| Progress | `progress.tsx` | Loading indicator | Yes |
| Skeleton | `skeleton.tsx` | Loading placeholder | Yes |
| Toast | `use-toast.tsx` | Notifications | Yes |
| Toaster | `toaster.tsx` | Toast container | Yes |
| Sonner | `sonner.tsx` | Alternative toasts | Yes |
| Loading Skeletons | `loading-skeletons.tsx` | Complex skeletons | Custom |

### Overlay Components

| Component | File | Purpose | shadcn/ui |
|-----------|------|---------|-----------|
| Dialog | `dialog.tsx` | Modal dialogs | Yes |
| Sheet | `sheet.tsx` | Slide-over panels | Yes |
| Drawer | `drawer.tsx` | Bottom drawer | Yes |
| Popover | `popover.tsx` | Floating content | Yes |
| Dropdown Menu | `dropdown-menu.tsx` | Context menus | Yes |
| Hover Card | `hover-card.tsx` | Hover previews | Yes |
| Tooltip | `tooltip.tsx` | Hint text | Yes |

### Layout Components

| Component | File | Purpose | shadcn/ui |
|-----------|------|---------|-----------|
| Separator | `separator.tsx` | Visual divider | Yes |
| Scroll Area | `scroll-area.tsx` | Custom scrollbar | Yes |
| Resizable | `resizable.tsx` | Resizable panels | Yes |
| Collapsible | `collapsible.tsx` | Expandable sections | Yes |
| Tabs | `tabs.tsx` | Tab navigation | Yes |
| Table | `table.tsx` | Data tables | Yes |

### Navigation Components

| Component | File | Purpose | shadcn/ui |
|-----------|------|---------|-----------|
| Sidebar | `sidebar.tsx` | App sidebar | Yes |
| Breadcrumb | `breadcrumb.tsx` | Navigation trail | Yes |
| Simple Nav | `simple-nav.tsx` | Basic navigation | Custom |

### Data Display

| Component | File | Purpose | shadcn/ui |
|-----------|------|---------|-----------|
| Avatar | `avatar.tsx` | User/agent avatars | Yes |
| Badge | `badge.tsx` | Status indicators | Yes |
| Chart | `chart.tsx` | Data visualization | Custom |

### Custom UI Components

| Component | File | Purpose |
|-----------|------|---------|
| Agent Avatar | `agent-avatar.tsx` | Agent-specific avatar with tier styling |
| Enhanced Agent Card | `enhanced-agent-card.tsx` | Rich agent display card |
| Icon Selection Modal | `icon-selection-modal.tsx` | Avatar/icon picker |
| Button Group | `button-group.tsx` | Grouped buttons |
| Carousel | `carousel.tsx` | Image/content slider |
| Input Group | `input-group.tsx` | Input with prefix/suffix |

---

## 2. AI Components (`/components/ui/ai/` & `/components/ai-elements/`)

### shadcn-io AI Components

| Component | Path | Purpose |
|-----------|------|---------|
| Message | `shadcn-io/ai/message.tsx` | Chat message bubble |
| Conversation | `shadcn-io/ai/conversation.tsx` | Message thread |
| Prompt Input | `shadcn-io/ai/prompt-input.tsx` | Chat input field |
| Response | `shadcn-io/ai/response.tsx` | AI response display |
| Cited Response | `shadcn-io/ai/cited-response.tsx` | Response with citations |
| Inline Citation | `shadcn-io/ai/inline-citation.tsx` | Citation markers |
| Reasoning | `shadcn-io/ai/reasoning.tsx` | Chain-of-thought display |
| Code Block | `shadcn-io/ai/code-block.tsx` | Code syntax highlighting |

### AI Elements (Modern)

| Component | Path | Purpose |
|-----------|------|---------|
| Artifact | `ai-elements/artifact.tsx` | Generated content display |
| Canvas | `ai-elements/canvas.tsx` | Visual workspace |
| Chain of Thought | `ai-elements/chain-of-thought.tsx` | Reasoning steps |
| Checkpoint | `ai-elements/checkpoint.tsx` | Progress markers |
| Code Block | `ai-elements/code-block.tsx` | Code display |
| Confirmation | `ai-elements/confirmation.tsx` | Action confirmation |
| Connection | `ai-elements/connection.tsx` | Agent connections |
| Context | `ai-elements/context.tsx` | Context display |
| Controls | `ai-elements/controls.tsx` | Interaction controls |
| Conversation | `ai-elements/conversation.tsx` | Chat thread |
| Edge | `ai-elements/edge.tsx` | Graph edges |
| Image | `ai-elements/image.tsx` | Image display |
| Inline Citation | `ai-elements/inline-citation.tsx` | Source citations |
| Loader | `ai-elements/loader.tsx` | Loading states |
| Message | `ai-elements/message.tsx` | Chat messages |
| Model Selector | `ai-elements/model-selector.tsx` | LLM selection |
| Node | `ai-elements/node.tsx` | Graph nodes |
| Open In Chat | `ai-elements/open-in-chat.tsx` | Chat opener |
| Panel | `ai-elements/panel.tsx` | Side panels |
| Plan | `ai-elements/plan.tsx` | Execution plans |
| Prompt Input | `ai-elements/prompt-input.tsx` | User input |
| Queue | `ai-elements/queue.tsx` | Task queue |
| Reasoning | `ai-elements/reasoning.tsx` | AI reasoning |
| Shimmer | `ai-elements/shimmer.tsx` | Loading effect |
| Sources | `ai-elements/sources.tsx` | Source list |
| Suggestion | `ai-elements/suggestion.tsx` | Prompt suggestions |
| Task | `ai-elements/task.tsx` | Task display |
| Tool | `ai-elements/tool.tsx` | Tool display |
| Toolbar | `ai-elements/toolbar.tsx` | Action toolbar |
| Web Preview | `ai-elements/web-preview.tsx` | URL previews |

---

## 3. Layout Components (`/components/`)

### Navigation & Layout

| Component | File | Purpose |
|-----------|------|---------|
| AppSidebar | `app-sidebar.tsx` | Main application sidebar |
| SidebarAskExpert | `sidebar-ask-expert.tsx` | Ask Expert sidebar variant |
| SidebarViewContent | `sidebar-view-content.tsx` | Dynamic sidebar content |
| EnhancedSidebar | `enhanced-sidebar.tsx` | Enhanced sidebar features |
| ShadcnDashboardSidebar | `shadcn-dashboard-sidebar.tsx` | Dashboard sidebar |
| MainNavbar | `navbar/MainNavbar.tsx` | Top navigation bar |
| SiteHeader | `site-header.tsx` | Site header |
| DashboardHeaderFixed | `dashboard-header-fixed.tsx` | Fixed dashboard header |

### Sidebar Content Variants

| Component | File | Purpose |
|-----------|------|---------|
| SidebarDashboardContent | `sidebar-view-content.tsx` | Dashboard navigation |
| SidebarAgentsContent | `sidebar-view-content.tsx` | Agents navigation |
| SidebarAskPanelContent | `sidebar-view-content.tsx` | Ask Panel navigation |
| SidebarKnowledgeContent | `sidebar-view-content.tsx` | Knowledge navigation |
| SidebarPromptPrismContent | `sidebar-view-content.tsx` | Prism navigation |
| SidebarSolutionBuilderContent | `sidebar-view-content.tsx` | Solution Builder nav |
| SidebarWorkflowsContent | `sidebar-view-content.tsx` | Workflows navigation |
| SidebarAdminContent | `sidebar-view-content.tsx` | Admin navigation |
| SidebarPersonasContent | `sidebar-view-content.tsx` | Personas navigation |
| SidebarDesignerContent | `sidebar-view-content.tsx` | Designer navigation |
| SidebarValueContent | `sidebar-view-content.tsx` | Value View navigation |
| SidebarKnowledgeBuilderContent | `sidebar-view-content.tsx` | Knowledge Builder nav |
| SidebarMedicalStrategyContent | `sidebar-view-content.tsx` | Medical Strategy nav |

### Navigation Items

| Component | File | Purpose |
|-----------|------|---------|
| NavMain | `nav-main.tsx` | Main navigation items |
| NavUser | `nav-user.tsx` | User menu |
| NavDocuments | `nav-documents.tsx` | Document navigation |

---

## 4. Feature Components

### 4.1 Agents Feature (`/features/agents/`)

| Component | File | Purpose | Complexity |
|-----------|------|---------|------------|
| AgentCard | `components/AgentCard.tsx` | Agent display card | Medium |
| AgentGrid | `components/agent-grid.tsx` | Grid layout | Low |
| AgentGridEnhanced | `components/agent-grid-enhanced.tsx` | Enhanced grid | Medium |
| AgentsBoard | `components/agents-board.tsx` | Kanban-style board | High |
| AgentsOverview | `components/agents-overview.tsx` | Overview dashboard | Medium |
| AgentStoreEnhanced | `components/agent-store-enhanced.tsx` | Agent marketplace | High |
| AgentStoreHeader | `components/agent-store-header.tsx` | Store header | Low |
| AgentDetailModal | `components/agent-detail-modal.tsx` | Agent details popup | Medium |
| AgentDetailModalV2 | `components/agent-detail-modal-v2.tsx` | Updated modal | Medium |
| AgentDetailsModal | `components/agent-details-modal.tsx` | Alternative modal | Medium |
| AgentEditForm | `components/agent-edit-form.tsx` | Edit form | High |
| AgentEditFormEnhanced | `components/agent-edit-form-enhanced.tsx` | Enhanced form | High |
| AgentFilters | `components/agent-filters.tsx` | Filter controls | Medium |
| AgentSearch | `components/agent-search.tsx` | Search component | Low |
| AgentImport | `components/AgentImport.tsx` | Import agents | Medium |
| AgentRAGConfiguration | `components/agent-rag-configuration.tsx` | RAG settings | High |
| AgentComparison | `components/agent-comparison.tsx` | Compare agents | High |
| AgentComparisonSidebar | `components/agent-comparison-sidebar.tsx` | Comparison panel | Medium |
| EnhancedCapabilityManagement | `components/enhanced-capability-management.tsx` | Capabilities | High |
| KnowledgeGraphView | `components/knowledge-graph-view.tsx` | Graph visualization | High |
| VirtualAdvisoryBoards | `components/virtual-advisory-boards.tsx` | Advisory boards | High |
| LevelBadge | `components/level-badge.tsx` | Tier badge | Low |
| SubagentSelector | `components/subagent-selector.tsx` | Subagent picker | Medium |

### 4.2 Chat Feature (`/features/chat/`)

| Component | File | Purpose | Complexity |
|-----------|------|---------|------------|
| ChatHeader | `components/chat-header.tsx` | Chat header | Low |
| ChatInput | `components/chat-input.tsx` | Message input | Medium |
| EnhancedChatInput | `components/enhanced-chat-input.tsx` | Rich input | High |
| ChatSidebar | `components/chat-sidebar.tsx` | Chat sidebar | Medium |
| ChatMessages | `components/chat-messages.tsx` | Message list | High |
| ChatMessageArea | `components/ChatMessageArea.tsx` | Message container | Medium |
| ChatWelcomeScreen | `components/ChatWelcomeScreen.tsx` | Welcome view | Low |
| ChatModeSelector | `components/chat-mode-selector.tsx` | Mode selection | Medium |
| EnhancedChatModeToggle | `components/enhanced-chat-mode-toggle.tsx` | Mode toggle | Medium |
| AgentSelector | `components/agent-selector.tsx` | Agent picker | Medium |
| AgentProfileHeader | `components/AgentProfileHeader.tsx` | Agent header | Low |
| AgentRecommendationModal | `components/AgentRecommendationModal.tsx` | Recommendations | High |
| CitationDisplay | `components/citation-display.tsx` | Source citations | Medium |
| ToolUsageDisplay | `components/tool-usage-display.tsx` | Tool visualization | Medium |
| ResponsePreferencesPanel | `components/response-preferences-panel.tsx` | Response settings | Medium |
| HybridAgentSearch | `components/HybridAgentSearch.tsx` | Hybrid search | High |
| MasterOrchestrator | `components/master-orchestrator.tsx` | Orchestration | Very High |
| EnhancedVirtualPanel | `components/enhanced-virtual-panel.tsx` | Virtual panel | High |
| VirtualPanel | `components/virtual-panel.tsx` | Basic panel | Medium |
| NavAIAgents | `components/nav-ai-agents.tsx` | Agent navigation | Low |
| NavAskExpert | `components/nav-ask-expert.tsx` | Ask Expert nav | Low |
| NavRAGCategories | `components/nav-rag-categories.tsx` | RAG categories | Low |
| ModeSelector | `components/mode-selector.tsx` | Mode picker | Medium |
| InteractionModeSelector | `components/interaction-mode-selector.tsx` | Interaction modes | Medium |
| EnhancedChatInterface | `components/enhanced-chat-interface.tsx` | Full interface | Very High |
| JobsFramework | `components/jobs-framework.tsx` | JTBD framework | Medium |
| MetricsDashboard | `components/metrics-dashboard.tsx` | Chat metrics | Medium |
| ExpertPanelSelector | `components/expert-panel-selector.tsx` | Expert selection | Medium |

### 4.3 Ask Expert Feature (`/features/ask-expert/`)

| Component | File | Purpose | Complexity |
|-----------|------|---------|------------|
| AdvancedStreamingWindow | `components/AdvancedStreamingWindow.tsx` | Streaming UI | High |
| IntelligentSidebar | `components/IntelligentSidebar.tsx` | Smart sidebar | High |
| EnhancedModeSelector | `components/EnhancedModeSelector.tsx` | Mode selection | Medium |
| SimplifiedModeSelector | `components/SimplifiedModeSelector.tsx` | Simple modes | Low |
| ExpertAgentCard | `components/ExpertAgentCard.tsx` | Expert display | Medium |
| AdvancedChatInput | `components/AdvancedChatInput.tsx` | Rich input | High |
| NextGenChatInput | `components/NextGenChatInput.tsx` | Next-gen input | High |
| InlineDocumentGenerator | `components/InlineDocumentGenerator.tsx` | Doc generation | High |
| InlineArtifactGenerator | `components/InlineArtifactGenerator.tsx` | Artifact gen | High |
| EnhancedMessageDisplay | `components/EnhancedMessageDisplay.tsx` | Message display | High |
| HITLControls | `components/HITLControls.tsx` | Human-in-loop | High |
| ModeSelector | `components/ModeSelector.tsx` | Mode picker | Medium |
| StatusIndicators | `components/StatusIndicators.tsx` | Status display | Low |
| FinalReviewPanel | `components/FinalReviewPanel.tsx` | Review panel | Medium |
| ModeSelectionModal | `components/ModeSelectionModal.tsx` | Mode modal | Medium |
| PlanApprovalModal | `components/PlanApprovalModal.tsx` | Plan approval | Medium |
| ProgressTracker | `components/ProgressTracker.tsx` | Progress UI | Medium |
| SubAgentApprovalCard | `components/SubAgentApprovalCard.tsx` | Approval card | Medium |
| ToolExecutionCard | `components/ToolExecutionCard.tsx` | Tool execution | Medium |
| UserPromptModal | `components/UserPromptModal.tsx` | User prompts | Medium |

### 4.4 Knowledge Feature (`/features/knowledge/`)

| Component | File | Purpose | Complexity |
|-----------|------|---------|------------|
| KnowledgeUploader | `components/knowledge-uploader.tsx` | File upload | Medium |
| KnowledgeViewer | `components/knowledge-viewer.tsx` | Content viewer | Medium |
| KnowledgeAnalyticsDashboard | `components/knowledge-analytics-dashboard.tsx` | Analytics | High |
| DocumentsLibraryView | `components/documents-library-view.tsx` | Document list | Medium |
| DomainBasicInfo | `components/DomainBasicInfo.tsx` | Domain info | Low |
| DomainEditForm | `components/DomainEditForm.tsx` | Domain editor | Medium |
| DomainMetadata | `components/DomainMetadata.tsx` | Domain metadata | Low |
| DomainModelConfig | `components/DomainModelConfig.tsx` | Model config | Medium |
| DomainDetailsDialog | `components/DomainDetailsDialog.tsx` | Domain details | Medium |
| CitationManagementDashboard | `components/citation-management-dashboard.tsx` | Citations | High |
| EntityVerificationWorkflow | `components/entity-verification-workflow.tsx` | Entity verification | High |
| KnowledgeGraphVisualization | `components/knowledge-graph-visualization.tsx` | Graph view | High |
| KnowledgeUploadWithMetadata | `components/knowledge-upload-with-metadata.tsx` | Rich upload | High |
| SearchAnalyticsDashboard | `components/search-analytics-dashboard.tsx` | Search analytics | High |

### 4.5 Workflow Designer Feature (`/features/workflow-designer/`)

| Component | File | Purpose | Complexity |
|-----------|------|---------|------------|
| WorkflowDesigner | `components/designer/WorkflowDesigner.tsx` | Main designer | Very High |
| WorkflowNode | `components/nodes/WorkflowNode.tsx` | Flow node | High |
| PropertyPanel | `components/properties/PropertyPanel.tsx` | Properties | High |
| NodePalette | `components/palette/NodePalette.tsx` | Node library | Medium |
| CodePreview | `components/code/CodePreview.tsx` | Code preview | Medium |
| StateInspector | `components/state/StateInspector.tsx` | State debug | High |
| ExecutionVisualizer | `components/execution/ExecutionVisualizer.tsx` | Execution view | High |

### 4.6 Ask Panel Feature (`/features/ask-panel/`)

| Component | File | Purpose | Complexity |
|-----------|------|---------|------------|
| AgentCard | `components/AgentCard.tsx` | Panel agent card | Medium |
| PanelCreationWizard | `components/PanelCreationWizard.tsx` | Panel wizard | High |
| CreateCustomPanelDialog | `components/CreateCustomPanelDialog.tsx` | Create dialog | Medium |
| PanelConsultationView | `components/PanelConsultationView.tsx` | Consultation | High |
| PanelExecutionView | `components/PanelExecutionView.tsx` | Execution view | High |

### 4.7 Value View Feature (`/components/value-view/`)

| Component | File | Purpose | Complexity |
|-----------|------|---------|------------|
| HeatmapVisualization | `visualizations/HeatmapVisualization.tsx` | Value heatmap | High |
| AIPoweredInsight | `AIPoweredInsight.tsx` | AI insights | Medium |

### 4.8 Admin Components (`/components/admin/`)

| Component | File | Purpose | Complexity |
|-----------|------|---------|------------|
| OverviewDashboard | `OverviewDashboard.tsx` | Admin overview | High |
| ExecutiveDashboard | `ExecutiveDashboard.tsx` | Executive view | High |
| AgentAnalyticsDashboard | `AgentAnalyticsDashboard.tsx` | Agent analytics | High |
| CostAnalyticsDashboard | `CostAnalyticsDashboard.tsx` | Cost analysis | High |
| PromptPerformanceDashboard | `PromptPerformanceDashboard.tsx` | Prompt metrics | High |
| AbuseDetectionDashboard | `AbuseDetectionDashboard.tsx` | Abuse detection | High |
| UserManagement | `UserManagement.tsx` | User admin | Medium |
| RolesManagement | `RolesManagement.tsx` | Roles admin | Medium |
| FunctionsManagement | `FunctionsManagement.tsx` | Functions admin | Medium |
| OrganizationManagement | `OrganizationManagement.tsx` | Org admin | Medium |
| PersonasManagement | `PersonasManagement.tsx` | Personas admin | Medium |
| ToolManagement | `ToolManagement.tsx` | Tools admin | Medium |
| WorkflowManagement | `WorkflowManagement.tsx` | Workflows admin | Medium |
| PromptManagement | `PromptManagement.tsx` | Prompts admin | Medium |
| PromptManagementPanel | `PromptManagementPanel.tsx` | Prompts panel | Medium |
| PromptCRUDManager | `PromptCRUDManager.tsx` | Prompt CRUD | High |
| EnhancedPromptAdminDashboard | `EnhancedPromptAdminDashboard.tsx` | Enhanced prompts | High |
| AuditLogs | `AuditLogs.tsx` | Audit logging | Medium |
| RateLimitMonitoring | `RateLimitMonitoring.tsx` | Rate limits | Medium |
| BatchUploadPanel | `batch-upload-panel.tsx` | Batch upload | Medium |

---

## 5. Shared Components (`/components/`)

### Specialized Components

| Component | File | Purpose |
|-----------|------|---------|
| DataTable | `data-table.tsx` | Generic data table |
| AvatarPickerModal | `avatar-picker-modal.tsx` | Avatar selection |
| SelectedAgentCard | `selected-agent-card.tsx` | Selected agent display |
| TenantSwitcher | `tenant-switcher.tsx` | Tenant switching |
| ToasterWrapper | `toaster-wrapper.tsx` | Toast wrapper |
| SectionCards | `section-cards.tsx` | Dashboard cards |
| ChartAreaInteractive | `chart-area-interactive.tsx` | Interactive charts |
| EndToEndVisualizer | `end-to-end-visualizer.tsx` | E2E visualization |
| WorkflowFlow | `workflow-flow.tsx` | Workflow diagram |
| WorkflowVisualizer | `workflow-visualizer.tsx` | Workflow view |

### Auth Components (`/components/auth/`)

| Component | File | Purpose |
|-----------|------|---------|
| AuthGuard | `auth-guard.tsx` | Route protection |
| Label | `label.tsx` | Auth form label |
| Input | `input.tsx` | Auth form input |

### LLM Components (`/components/llm/`)

| Component | File | Purpose |
|-----------|------|---------|
| LLMProviderDashboard | `LLMProviderDashboard.tsx` | Provider management |
| MedicalModelsDashboard | `MedicalModelsDashboard.tsx` | Medical models |
| MeditronSetup | `MeditronSetup.tsx` | Meditron config |
| OpenAIUsageDashboard | `OpenAIUsageDashboard.tsx` | OpenAI usage |
| UsageAnalyticsDashboard | `UsageAnalyticsDashboard.tsx` | Usage analytics |

### Landing Page (`/components/landing/`)

| Component | File | Purpose |
|-----------|------|---------|
| LandingPage | `landing-page.tsx` | Main landing |
| EnhancedLandingPage | `enhanced/EnhancedLandingPage.tsx` | Enhanced landing |
| HeroSection | `enhanced/HeroSection.tsx` | Hero section |
| Navigation | `enhanced/Navigation.tsx` | Landing nav |
| ProblemSection | `enhanced/ProblemSection.tsx` | Problem statement |
| SolutionSection | `enhanced/SolutionSection.tsx` | Solution pitch |
| FeaturesGrid | `enhanced/FeaturesGrid.tsx` | Features display |
| CaseStudies | `enhanced/CaseStudies.tsx` | Case studies |
| ROICalculator | `enhanced/ROICalculator.tsx` | ROI calculator |
| PricingTable | `enhanced/PricingTable.tsx` | Pricing display |
| FAQSection | `enhanced/FAQSection.tsx` | FAQ accordion |
| FooterCTA | `enhanced/FooterCTA.tsx` | Footer CTA |

---

## 6. Context Providers

| Context | File | Purpose |
|---------|------|---------|
| AuthContext | `features/auth/services/auth-context.tsx` | Authentication |
| AgentsFilterContext | `contexts/agents-filter-context.tsx` | Agent filtering |
| PersonasFilterContext | `contexts/personas-filter-context.tsx` | Persona filtering |
| AskExpertContext | `contexts/ask-expert-context.tsx` | Ask Expert state |
| SidebarProvider | `components/ui/sidebar.tsx` | Sidebar state |
| AgentComparisonProvider | Page-level | Agent comparison |

---

## 7. Component Statistics

### By Category

| Category | Count |
|----------|-------|
| UI Primitives | 70 |
| AI Components | 35 |
| Layout Components | 20 |
| Agent Components | 25 |
| Chat Components | 30 |
| Ask Expert Components | 20 |
| Knowledge Components | 15 |
| Workflow Components | 10 |
| Admin Components | 20 |
| Landing Components | 12 |
| Other | 43 |
| **Total** | **280+** |

### By Complexity

| Complexity | Count | Percentage |
|------------|-------|------------|
| Low | 85 | 30% |
| Medium | 125 | 45% |
| High | 55 | 20% |
| Very High | 15 | 5% |

### Components Needing Refactoring

| Component | Current LOC | Target LOC | Priority |
|-----------|-------------|------------|----------|
| chat/page.tsx | 1,333 | <300 | P0 |
| agents/page.tsx | 694 | <300 | P1 |
| dashboard/page.tsx | 575 | <300 | P1 |
| MasterOrchestrator | ~400 | <200 | P1 |
| EnhancedChatInterface | ~350 | <200 | P2 |

---

## 8. Component Dependencies

### Critical Dependency Chains

```
Page Components
├── Feature Components (domain logic)
│   ├── Shared Components (reusable)
│   │   ├── UI Components (primitives)
│   │   │   └── Radix Primitives
│   │   └── AI Components
│   └── Context Providers
└── Layout Components
    └── Sidebar Components
```

### High-Risk Dependencies

| Component | Dependents | Risk |
|-----------|------------|------|
| `ui/sidebar.tsx` | All pages | High |
| `ui/button.tsx` | 200+ components | High |
| `ui/card.tsx` | 150+ components | High |
| `chat-messages.tsx` | Chat, Ask Expert | Medium |
| `agent-card.tsx` | Agents, Chat | Medium |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Dec 2024 | Frontend Audit | Initial registry |

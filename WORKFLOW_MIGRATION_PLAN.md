# Workflow Builder Migration Plan
## Legacy → Modern WorkflowDesigner

**Date**: November 23, 2025  
**Status**: 🚧 In Progress  
**Goal**: Migrate from WorkflowBuilder (legacy) to WorkflowDesigner (modern) while preserving ALL capabilities

---

## 📊 Feature Comparison Matrix

| Feature | Legacy WorkflowBuilder | Modern WorkflowDesigner | Status | Priority |
|---------|----------------------|------------------------|--------|----------|
| **Core Canvas** |
| React Flow Integration | ✅ Yes | ✅ Yes | ✅ Complete | - |
| Drag & Drop | ✅ Yes | ✅ Yes | ✅ Complete | - |
| Undo/Redo | ✅ Yes | ✅ Yes | ✅ Complete | - |
| Auto Layout | ✅ Yes (`autoLayoutWorkflow`) | ❌ Missing | 🔴 TODO | HIGH |
| MiniMap | ✅ Yes | ✅ Yes | ✅ Complete | - |
| Controls | ✅ Yes | ✅ Yes | ✅ Complete | - |
| Background | ✅ Yes | ✅ Yes | ✅ Complete | - |
| **Node Types** |
| Task Nodes | ✅ Yes (`TaskNode`) | ✅ Agent nodes | ✅ Complete | - |
| Agent Nodes | ✅ Yes (`AgentNode`) | ✅ Agent nodes | ✅ Complete | - |
| Orchestrator Nodes | ✅ Yes (`OrchestratorNode`) | ❌ Missing | 🔴 TODO | HIGH |
| Custom Node Library | ✅ 20+ tasks | ✅ 8 node types | ⚠️ Different | MEDIUM |
| **Workflow Management** |
| Save/Load Workflow | ✅ Yes (localStorage + API) | ✅ Yes (Supabase) | ✅ Complete | - |
| Import/Export JSON | ✅ Yes | ⚠️ Partial | 🟡 TODO | MEDIUM |
| Workflow Templates | ✅ Panel workflows | ✅ Database templates | ✅ Complete | - |
| Workflow Versioning | ❌ No | ✅ Yes (DB) | ✅ Better | - |
| **Panel Workflows** |
| Mode 1 Workflow | ✅ Yes | ❌ Missing | 🔴 TODO | HIGH |
| Mode 2 Workflow | ✅ Yes | ❌ Missing | 🔴 TODO | HIGH |
| Mode 3 Workflow | ✅ Yes | ❌ Missing | 🔴 TODO | HIGH |
| Mode 4 Workflow | ✅ Yes | ❌ Missing | 🔴 TODO | HIGH |
| Panel Type Detection | ✅ Yes | ❌ Missing | 🔴 TODO | HIGH |
| **Configuration** |
| Agent Configuration Modal | ✅ Yes (`AgentConfigModal`) | ❌ Missing | 🔴 TODO | HIGH |
| Node Properties Panel | ✅ Yes (`NodePropertiesPanel`) | ✅ Yes (`PropertyPanel`) | ✅ Complete | - |
| Task Flow Modal | ✅ Yes (`TaskFlowModal`) | ❌ Missing | 🟡 TODO | MEDIUM |
| API Keys Management | ✅ Yes (localStorage) | ❌ Missing | 🟡 TODO | MEDIUM |
| **Advanced Features** |
| AI Chatbot Integration | ✅ Yes (`AIChatbot`) | ❌ Missing | 🔴 TODO | HIGH |
| Workflow Code View | ✅ Yes (`WorkflowCodeView`) | ✅ Yes (`CodePreview`) | ✅ Complete | - |
| Task Builder | ✅ Yes (`TaskBuilder`) | ❌ Missing | 🟡 TODO | LOW |
| Task Combiner | ✅ Yes (`TaskCombiner`) | ❌ Missing | 🟡 TODO | LOW |
| Workflow Phase Editor | ✅ Yes (`WorkflowPhaseEditor`) | ❌ Missing | 🔴 TODO | HIGH |
| Expert Identity Manager | ✅ Yes | ❌ Missing | 🟡 TODO | MEDIUM |
| **Documentation** |
| Mode 1-4 Documentation | ✅ Yes (embedded) | ❌ Missing | 🟡 TODO | LOW |
| Task Library | ✅ Yes (`TASK_DEFINITIONS`) | ✅ Node types | ⚠️ Different | MEDIUM |
| **Execution** |
| Workflow Execution | ✅ Yes (API) | ✅ Yes (API) | ✅ Complete | - |
| Real-time Monitoring | ✅ Yes (messages) | ⚠️ Partial (`ExecutionVisualizer`) | 🟡 TODO | MEDIUM |
| Streaming Responses | ✅ Yes | ⚠️ Partial | 🟡 TODO | MEDIUM |
| Expert Messages | ✅ Yes (with roles) | ❌ Missing | 🟡 TODO | MEDIUM |
| Phase Status Tracking | ✅ Yes | ⚠️ Partial | 🟡 TODO | MEDIUM |
| **Database** |
| Workflows Table | ⚠️ Custom API | ✅ Full RLS | ✅ Better | - |
| Workflow Versions | ❌ No | ✅ Yes | ✅ Better | - |
| Workflow Shares | ❌ No | ✅ Yes | ✅ Better | - |
| Workflow Executions | ⚠️ Basic | ✅ Full tracking | ✅ Better | - |
| Audit Log | ❌ No | ✅ Yes | ✅ Better | - |
| Agent Templates | ❌ No | ✅ Yes (5 templates) | ✅ Better | - |
| Workflow Templates | ✅ Panel workflows | ✅ DB templates | ✅ Complete | - |
| **Multi-Framework** |
| LangGraph Support | ✅ Yes | ✅ Yes | ✅ Complete | - |
| AutoGen Support | ⚠️ Via API | ✅ Yes | ✅ Complete | - |
| CrewAI Support | ⚠️ Via API | ✅ Yes | ✅ Complete | - |
| Framework Selection | ❌ No | ✅ Yes | ✅ Better | - |
| **Code Generation** |
| LangGraph Code Gen | ✅ Yes | ✅ Yes | ✅ Complete | - |
| AutoGen Code Gen | ❌ No | ✅ Yes | ✅ Better | - |
| CrewAI Code Gen | ❌ No | ✅ Yes | ✅ Better | - |
| **UI/UX** |
| Settings Dialog | ✅ Yes | ❌ Missing | 🟡 TODO | MEDIUM |
| Chat Panel | ✅ Yes (AI chatbot) | ❌ Missing | 🔴 TODO | HIGH |
| File Import/Export | ✅ Yes | ⚠️ Partial | 🟡 TODO | MEDIUM |
| Embedded Mode | ✅ Yes | ❌ Missing | 🟡 TODO | MEDIUM |
| VITAL Styles | ✅ Yes (`vital-styles.css`) | ⚠️ TailwindCSS | ⚠️ Different | LOW |

---

## 🎯 Migration Strategy

### Phase 1: Critical Features (Week 1)
**Goal**: Ensure feature parity for core workflow building

#### 1.1 Auto Layout
- [ ] Port `autoLayoutWorkflow` from `@/lib/langgraph-gui/workflowLayout`
- [ ] Add to WorkflowDesigner toolbar
- [ ] Test with complex workflows

#### 1.2 Panel Workflows
- [ ] Port all 4 mode workflows (Mode 1-4)
- [ ] Migrate panel type detection logic
- [ ] Add panel workflow factory
- [ ] Test panel creation

#### 1.3 Orchestrator Nodes
- [ ] Create `OrchestratorNode` component
- [ ] Add conditional decision support
- [ ] Test with Mode 1 workflows

#### 1.4 Agent Configuration
- [ ] Port `AgentConfigModal`
- [ ] Integrate with agents store
- [ ] Add to node properties

#### 1.5 AI Chatbot
- [ ] Port `AIChatbot` component
- [ ] Add chat panel to WorkflowDesigner
- [ ] Integrate with workflow execution
- [ ] Add expert message support

### Phase 2: Advanced Features (Week 2)
**Goal**: Port specialized tools and editors

#### 2.1 Workflow Phase Editor
- [ ] Port `WorkflowPhaseEditor`
- [ ] Add to toolbar/menu
- [ ] Test with hierarchical workflows

#### 2.2 Execution Monitoring
- [ ] Enhance `ExecutionVisualizer`
- [ ] Add streaming support
- [ ] Add expert message tracking
- [ ] Add phase status indicators

#### 2.3 Task Management
- [ ] Port `TaskBuilder` (optional)
- [ ] Port `TaskCombiner` (optional)
- [ ] Port `TaskFlowModal`

#### 2.4 Configuration
- [ ] Add API keys management
- [ ] Add settings dialog
- [ ] Add embedded mode support

### Phase 3: Content Migration (Week 2-3)
**Goal**: Migrate all existing workflows and templates

#### 3.1 Workflow Templates
- [ ] Export all panel workflows
- [ ] Import to modern database
- [ ] Test loading in WorkflowDesigner

#### 3.2 Documentation
- [ ] Port Mode 1-4 documentation components
- [ ] Add help system
- [ ] Create migration guide

### Phase 4: Testing & Validation (Week 3)
**Goal**: Ensure everything works

#### 4.1 Feature Testing
- [ ] Test all migrated features
- [ ] Test panel workflows end-to-end
- [ ] Test execution and monitoring
- [ ] Test save/load/export

#### 4.2 Integration Testing
- [ ] Test with Python AI Engine
- [ ] Test with Supabase
- [ ] Test multi-framework support

#### 4.3 Performance Testing
- [ ] Test with large workflows
- [ ] Test real-time execution
- [ ] Test concurrent executions

---

## 📁 Files to Migrate

### Core Components
```
FROM: apps/vital-system/src/components/langgraph-gui/
TO: apps/vital-system/src/features/workflow-designer/components/

✅ WorkflowBuilder.tsx → WorkflowDesigner.tsx (already exists, enhance)
🔴 AIChatbot.tsx → chatbot/AIChatbot.tsx (NEW)
🔴 AgentConfigModal.tsx → modals/AgentConfigModal.tsx (NEW)
🔴 TaskFlowModal.tsx → modals/TaskFlowModal.tsx (NEW)
🔴 WorkflowPhaseEditor.tsx → editors/WorkflowPhaseEditor.tsx (NEW)
🟡 TaskBuilder.tsx → builders/TaskBuilder.tsx (OPTIONAL)
🟡 TaskCombiner.tsx → builders/TaskCombiner.tsx (OPTIONAL)
✅ WorkflowCodeView.tsx → code/CodePreview.tsx (exists, enhance)
✅ NodePropertiesPanel.tsx → properties/PropertyPanel.tsx (exists)
```

### Node Components
```
FROM: apps/vital-system/src/components/langgraph-gui/
TO: apps/vital-system/src/features/workflow-designer/components/nodes/

✅ TaskNode.tsx → AgentNode (already exists as WorkflowNode)
✅ AgentNode.tsx → AgentNode (already exists as WorkflowNode)
🔴 OrchestratorNode → OrchestratorNode.tsx (NEW)
```

### Supporting Modules
```
FROM: apps/vital-system/src/components/langgraph-gui/
TO: apps/vital-system/src/features/workflow-designer/

🔴 panel-workflows/ → workflows/panels/ (NEW)
🔴 workflows/mode1-workflow.ts → workflows/mode1.ts (NEW)
✅ TaskLibrary.tsx → constants/node-types.ts (exists, merge)
```

### Utilities
```
FROM: apps/vital-system/src/lib/langgraph-gui/
TO: apps/vital-system/src/features/workflow-designer/utils/

🔴 workflowLayout.ts → layout.ts (NEW)
🔴 expertIdentity.ts → expert-identity.ts (NEW)
🔴 config/api.ts → ../services/api.ts (merge with existing)
```

### Documentation
```
FROM: apps/vital-system/src/components/langgraph-gui/
TO: apps/vital-system/src/features/workflow-designer/components/docs/

🟡 Mode1Documentation.tsx → Mode1Docs.tsx (OPTIONAL)
🟡 Mode2Documentation.tsx → Mode2Docs.tsx (OPTIONAL)
🟡 Mode3Documentation.tsx → Mode3Docs.tsx (OPTIONAL)
🟡 Mode4Documentation.tsx → Mode4Docs.tsx (OPTIONAL)
```

### AI Chat Components
```
FROM: apps/vital-system/src/components/langgraph-gui/ai/
TO: apps/vital-system/src/features/workflow-designer/components/chatbot/

🔴 conversation.tsx → Conversation.tsx (NEW)
🔴 message.tsx → Message.tsx (NEW)
🔴 phase-status.tsx → PhaseStatus.tsx (NEW)
🔴 reasoning.tsx → Reasoning.tsx (NEW)
🔴 sources.tsx → Sources.tsx (NEW)
🔴 task.tsx → Task.tsx (NEW)
🔴 prompt-input.tsx → PromptInput.tsx (NEW)
🔴 loader.tsx → Loader.tsx (NEW)
```

---

## 🗺️ Backend APIs

### Already Exist (Modern)
- ✅ `/api/workflows` - CRUD operations
- ✅ `/api/workflows/[id]` - Get/Update/Delete
- ✅ `/api/workflows/[id]/execute` - Execute workflow
- ✅ `/api/frameworks/execute` - Multi-framework execution
- ✅ Database schema with RLS
- ✅ LangGraph code generator
- ✅ AutoGen & CrewAI generators

### Need Enhancement
- 🟡 Add streaming execution support
- 🟡 Add execution event streaming (SSE)
- 🟡 Add expert message types
- 🟡 Add phase status tracking

---

## 📋 Migration Checklist

### Prerequisites
- [x] Fix syntax error in designer page
- [x] Identify all features to migrate
- [x] Create migration plan
- [ ] Set up side-by-side pages for testing

### Week 1: Critical Features
- [ ] Migrate auto layout
- [ ] Migrate panel workflows (Mode 1-4)
- [ ] Create OrchestratorNode
- [ ] Port AgentConfigModal
- [ ] Port AIChatbot

### Week 2: Advanced Features
- [ ] Port WorkflowPhaseEditor
- [ ] Enhance ExecutionVisualizer
- [ ] Add API keys management
- [ ] Add settings dialog
- [ ] Add embedded mode

### Week 3: Content & Testing
- [ ] Migrate workflow templates
- [ ] Port documentation
- [ ] Comprehensive testing
- [ ] Performance optimization
- [ ] Create comparison report

### Week 4: Deployment
- [ ] Create legacy page (`/designer-legacy`)
- [ ] Create modern page (`/designer-modern`)
- [ ] User acceptance testing
- [ ] Deploy to production
- [ ] Deprecate legacy builder

---

## 🎨 UI Components Mapping

| Legacy Component | Modern Equivalent | Action |
|-----------------|-------------------|--------|
| `WorkflowBuilder` | `WorkflowDesigner` | Enhance |
| `NodePalette` (legacy) | `NodePalette` (modern) | Merge features |
| `NodePropertiesPanel` | `PropertyPanel` | Merge features |
| `WorkflowCodeView` | `CodePreview` | Enhance |
| `AIChatbot` | NEW | Create |
| `AgentConfigModal` | NEW | Create |
| `TaskFlowModal` | NEW | Create |
| `WorkflowPhaseEditor` | NEW | Create |
| `ExecutionVisualizer` | `ExecutionVisualizer` | Enhance |
| `StateInspector` | `StateInspector` | Enhance |

---

## 🔌 Integration Points

### Frontend
- WorkflowDesigner ← AIChatbot ← Workflow Execution
- WorkflowDesigner ← Panel Workflows ← Mode 1-4
- WorkflowDesigner ← Agent Store ← AgentConfigModal
- WorkflowDesigner ← Multi-Framework Orchestrator

### Backend
- Supabase ← Workflows Table ← RLS Policies
- Python AI Engine ← LangGraph/AutoGen/CrewAI
- Real-time subscriptions ← Execution events

---

## 📊 Success Metrics

- [ ] All legacy features working in modern builder
- [ ] All panel workflows (Mode 1-4) working
- [ ] AI Chatbot fully integrated
- [ ] Execution monitoring with streaming
- [ ] All workflows migrated
- [ ] No data loss
- [ ] Performance equal or better
- [ ] User acceptance > 90%

---

## 🚀 Next Steps

1. **TODAY**: Create side-by-side pages (`/designer-legacy` and `/designer-modern`)
2. **Week 1**: Start migrating critical features
3. **Week 2-3**: Complete migration and testing
4. **Week 4**: Deploy and deprecate legacy

---

**Status**: Ready to begin implementation  
**Estimated Effort**: 3-4 weeks  
**Priority**: HIGH


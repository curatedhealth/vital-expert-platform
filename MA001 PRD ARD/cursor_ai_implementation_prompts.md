# MA01 Implementation Guide: Cursor AI Prompts
## Incremental Code Modification Approach

---

## 📋 Implementation Overview

This document contains a series of prompts to use with Cursor AI for implementing the MA01 Emerging Scientific Trends Detection system. Each prompt is designed to modify existing code rather than create new files from scratch.

**IMPORTANT**: Before starting, ensure you have:
1. An existing React/Next.js application
2. A backend API (FastAPI, Node.js, or similar)
3. Database connections (PostgreSQL + vector DB)
4. Authentication system in place

---

## Phase 1: Database Schema Updates

### Prompt 1.1: Update Database Schema for Jobs and Workflows

```
Look at our existing database schema files (likely in /src/db/schema or /prisma/schema.prisma).

UPDATE the schema to add the following tables while preserving all existing tables and relationships:

1. Add a 'jobs' table with:
   - job_id (UUID primary key)
   - name, description, status (draft/active/paused/archived)
   - configuration (JSONB)
   - workflow_id (foreign key to workflows table)
   - schedule (cron expression)
   - created_by, created_at, updated_at, deleted_at
   - version (integer for optimistic locking)
   - tags (array), metadata (JSONB)

2. Add a 'workflows' table with:
   - workflow_id (UUID primary key)
   - name, description
   - workflow_definition (JSONB for nodes/edges)
   - lucid_diagram_id (for Lucidchart integration)
   - version, is_template, category

3. Add version history tables for both jobs and workflows

4. Add a crud_audit_log table for compliance

IMPORTANT: 
- Keep all existing tables and add proper foreign key relationships
- Add indexes for performance on status, created_by, and tags
- Include soft delete support (deleted_at timestamp)
- Add migration files if using a migration system
```

### Prompt 1.2: Add RAG Knowledge Base Schema

```
In our existing database schema, ADD tables for the RAG system without removing existing tables:

1. Extend or create a 'knowledge_documents' table:
   - document_id (UUID)
   - source_type (pubmed/clinical_trial/patent/rwe)
   - source_id (external identifier like PMID)
   - content (TEXT)
   - embedding (vector type if using pgvector)
   - metadata (JSONB with authors, date, journal, etc.)
   - confidence_score, validation_status
   - created_at, updated_at

2. Add a 'document_chunks' table for semantic chunking:
   - chunk_id (UUID)
   - document_id (foreign key)
   - chunk_text, chunk_embedding
   - position, overlap_previous, overlap_next
   - metadata

3. Add a 'source_database' table as specified in the PRD

MODIFY any existing document storage to incorporate:
- Authority scores for sources
- PHARMA and VERIFY compliance flags
- Citation tracking

Keep backward compatibility with existing document queries.
```

---

## Phase 2: Backend API Updates

### Prompt 2.1: Update Job Management API

```
Look at our existing API routes (likely in /src/api, /routes, or /app/api).

MODIFY the existing API to add CRUD endpoints for job management:

1. Find the main API router file and ADD these endpoints:
   - POST /api/v1/jobs (create)
   - GET /api/v1/jobs (list with pagination)
   - GET /api/v1/jobs/{job_id} (get single)
   - PUT /api/v1/jobs/{job_id} (update)
   - DELETE /api/v1/jobs/{job_id} (soft delete)
   - POST /api/v1/jobs/{job_id}/restore
   - POST /api/v1/jobs/{job_id}/clone

2. In each endpoint, INTEGRATE with our existing:
   - Authentication middleware (use current auth system)
   - Database connection (use existing DB client)
   - Error handling patterns
   - Response format standards

3. ADD validation using our existing validation library:
   - Validate job configurations against schema
   - Check workflow validity
   - Ensure PHARMA compliance fields

4. EXTEND the existing audit logging to track:
   - All CRUD operations
   - User actions
   - Configuration changes

Don't create new authentication - use what we have.
Keep the same error handling patterns we use elsewhere.
```

### Prompt 2.2: Integrate RAG Pipeline

```
MODIFY our existing search or query endpoints to add RAG capabilities:

1. Find the current search/query handler and EXTEND it to:
   - Perform hybrid search (vector + keyword)
   - Use existing vector database connection
   - Add reranking step using cross-encoder

2. In the document retrieval logic, ADD:
   - Reciprocal Rank Fusion for result merging
   - Confidence scoring for each result
   - VERIFY protocol validation checks:
     * Source authority > 0.7
     * Explicit citations required
     * Gap identification

3. UPDATE the response generation to include:
   - PHARMA framework compliance:
     * Purpose alignment
     * Hypothesis generation
     * Audience-specific formatting
   - Citation formatting [PMID:xxxxx]
   - Confidence scores
   - Evidence gaps explicitly stated

4. MODIFY any existing caching to:
   - Cache validated sources
   - Invalidate on new documents
   - Track cache hit rates

Use our existing LLM integration (OpenAI/Claude client).
Keep the current API response format but add new fields.
```

---

## Phase 3: Agent System Integration

### Prompt 3.1: Add Agent Orchestration

```
EXTEND our existing API to add multi-agent orchestration:

1. In our services or handlers directory, CREATE an orchestrator that:
   - Uses our existing LLM client connections
   - Routes tasks based on query analysis
   - Manages parallel and sequential execution

2. MODIFY the existing LLM calls to implement specialized agents:

   For Literature Agent:
   - UPDATE prompt to include VERIFY protocol
   - ADD PubMed API integration using our HTTP client
   - Include confidence scoring in responses

   For Clinical Trials Agent:
   - INTEGRATE ClinicalTrials.gov API
   - ADD endpoint extraction logic
   - Track trial phases and statuses

   For Signal Detection Agent:
   - CREATE scoring algorithm:
     Score = (Velocity × 0.3) + (Network × 0.2) + (Semantic × 0.3) + (Competitive × 0.2)
   - ADD threshold-based validation triggers

3. In our job execution logic, ADD:
   - Agent task distribution
   - Result aggregation
   - Consensus computation
   - Quality gate checks

4. EXTEND our existing monitoring to track:
   - Agent performance metrics
   - Token usage per agent
   - Error rates by agent type

Use dependency injection for agent configurations.
Keep agents stateless for scalability.
```

### Prompt 3.2: Implement PHARMA + VERIFY Frameworks

```
MODIFY all existing LLM prompt templates to include PHARMA and VERIFY frameworks:

1. In our prompts directory/file, UPDATE each prompt to include:

   VERIFY Protocol checks:
   ```
   Before accepting any information:
   - V: Validate source authority (threshold: 0.7)
   - E: Require explicit citations [PMID/NCT format]
   - R: Calculate confidence score
   - I: Identify and state gaps explicitly
   - F: Cross-check against multiple sources
   - Y: Flag for human review if confidence < 0.7
   ```

   PHARMA Framework structure:
   ```
   Format all outputs with:
   - P: Purpose (align with business objective)
   - H: Hypotheses (generate testable statements)
   - A: Audience (customize for C-Suite/R&D/Medical)
   - R: Requirements (ensure regulatory compliance)
   - M: Metrics (define success criteria)
   - A: Actions (specify next steps with owners)
   ```

2. In response processing, ADD validation:
   - Check each response for framework compliance
   - Score responses on completeness
   - Flag non-compliant outputs

3. UPDATE our error handling to:
   - Retry with framework emphasis if non-compliant
   - Log framework validation failures
   - Track compliance rates

Don't remove existing prompt logic, extend it.
Maintain backward compatibility with existing integrations.
```

---

## Phase 4: Frontend Updates

### Prompt 4.1: Update Job Management UI

```
MODIFY our existing dashboard or admin panel to add job management:

1. In our components directory, FIND the main dashboard and ADD:
   - Job list component with status indicators
   - CRUD action buttons (View, Edit, Delete)
   - Search and filter controls

2. UPDATE our existing table/list component to display:
   ```jsx
   columns = [
     { key: 'name', label: 'Job Name', sortable: true },
     { key: 'status', label: 'Status', render: StatusBadge },
     { key: 'lastRun', label: 'Last Run', format: 'relative' },
     { key: 'nextRun', label: 'Next Run', format: 'datetime' },
     { key: 'actions', label: 'Actions', render: ActionButtons }
   ]
   ```

3. EXTEND our existing forms to handle job configuration:
   - Use our current form library (react-hook-form, formik, etc.)
   - Add validation using our validation schema
   - Include step-by-step wizard for complex configs

4. INTEGRATE with our existing state management:
   - Add job-related actions/reducers
   - Connect to existing API client
   - Handle optimistic updates

5. ADD keyboard shortcuts using our hotkey system:
   - Ctrl+N: New job
   - Ctrl+E: Edit selected
   - Ctrl+D: Duplicate

Keep consistent with our design system.
Use our existing UI component library.
```

### Prompt 4.2: Integrate Lucid React Workflow Builder

```
ADD Lucid React workflow builder to our existing application:

1. Install required dependencies:
   ```bash
   npm install reactflow @lucidchart/react-sdk
   ```

2. In our components directory, CREATE WorkflowBuilder component:
   - EXTEND our existing modal/drawer component
   - USE our current drag-and-drop library if available
   - INTEGRATE with our theme/styling system

3. MODIFY the workflow builder to use our design tokens:
   ```jsx
   // Use our existing theme
   const nodeStyles = {
     background: theme.colors.surface,
     border: `1px solid ${theme.colors.border}`,
     borderRadius: theme.radii.md,
     ...theme.shadows.sm
   }
   ```

4. ADD custom node types for our domain:
   - DataSourceNode (PubMed, Trials, etc.)
   - AgentNode (Literature, Clinical, etc.)
   - ValidatorNode (VERIFY, PHARMA)
   - DecisionNode (Conditional routing)
   - OutputNode (Reports, Alerts)

5. INTEGRATE with our existing API:
   - Save workflows using our API client
   - Load workflow definitions
   - Export to Lucidchart format

6. ADD to our routing system:
   - /jobs/{id}/workflow - Edit workflow
   - /workflows/templates - Template library

Use our existing modal system for property panels.
Maintain consistent keyboard navigation.
```

---

## Phase 5: RAG Chat Interface

### Prompt 5.1: Add RAG-Powered Chat Component

```
EXTEND our existing chat or support interface to add RAG capabilities:

1. If we have a chat component, MODIFY it to:
   - Connect to RAG endpoint
   - Display confidence scores
   - Show citations inline
   - Track conversation context

2. If no chat exists, ADD to our main layout:
   ```jsx
   // Add to existing layout
   const ChatWidget = () => {
     // Use our existing WebSocket connection if available
     // Or create new connection to RAG endpoint
     return (
       <Card className={styles.chatWidget}>
         <MessageList messages={messages} />
         <CitationBar citations={currentCitations} />
         <InputArea onSend={handleSend} />
       </Card>
     );
   };
   ```

3. ENHANCE message display to show:
   - Confidence indicators (color-coded)
   - Citation links [PMID:12345]
   - Evidence gaps with warnings
   - Copy/export buttons

4. ADD conversation management:
   - Save chat history to our database
   - Enable "Generate Report" from chat
   - Export conversation as PDF/Word

5. INTEGRATE with our notification system:
   - Alert on high-confidence findings
   - Notify when human review needed

Use our existing message/notification components.
Apply our current animation/transition patterns.
```

---

## Phase 6: Monitoring & Execution

### Prompt 6.1: Add Job Execution Monitor

```
MODIFY our existing admin dashboard to add execution monitoring:

1. In our dashboard, ADD real-time execution view:
   - Use our existing WebSocket/SSE connection
   - Or poll our API every 5 seconds

2. CREATE progress tracking component:
   ```jsx
   // Extend our existing progress bar component
   const ExecutionProgress = ({ job }) => {
     return (
       <ProgressSection>
         <PhaseProgress phase="Data Collection" percent={85} />
         <PhaseProgress phase="Agent Processing" percent={60} />
         <PhaseProgress phase="Validation" percent={0} />
         <PhaseProgress phase="Report Generation" percent={0} />
       </ProgressSection>
     );
   };
   ```

3. ADD to our existing metrics dashboard:
   - Signals detected count
   - API usage meters
   - Agent CPU/memory usage
   - Error rate tracking

4. EXTEND our logging system to show:
   - Real-time log streaming
   - Filtering by severity
   - Search within logs
   - Export capabilities

5. INTEGRATE with our alert system:
   - Critical errors → Immediate notification
   - Warnings → Dashboard badge
   - Info → Log only

Use our existing chart library for visualizations.
Maintain consistent with our monitoring patterns.
```

---

## Phase 7: Testing & Validation

### Prompt 7.1: Add Test Coverage

```
UPDATE our existing test suites to cover new functionality:

1. In our unit tests directory, ADD tests for:
   - CRUD operations on jobs
   - Workflow validation logic
   - PHARMA/VERIFY compliance checking
   - Agent response parsing

2. EXTEND our integration tests to cover:
   - Full job execution pipeline
   - RAG retrieval accuracy
   - Agent orchestration flows
   - Error recovery scenarios

3. ADD E2E tests using our existing framework:
   ```javascript
   describe('Job Management Flow', () => {
     it('should create, run, and monitor a job', async () => {
       // Use our existing test helpers
       await loginAsTestUser();
       await navigateTo('/jobs');
       await clickButton('New Job');
       // ... complete flow
     });
   });
   ```

4. CREATE test fixtures for:
   - Sample job configurations
   - Mock agent responses
   - Workflow templates
   - RAG knowledge base entries

5. ADD performance benchmarks:
   - RAG query response time < 2s
   - Agent processing < 10s
   - UI responsiveness < 100ms

Use our existing test utilities and helpers.
Maintain our code coverage standards (>80%).
```

---

## Phase 8: Deployment & DevOps

### Prompt 8.1: Update Deployment Configuration

```
MODIFY our deployment configuration for new services:

1. In our Docker/Kubernetes configs, ADD:
   - Environment variables for new API keys
   - Service definitions for agent workers
   - Volume mounts for knowledge base

2. UPDATE our CI/CD pipeline to:
   - Run new test suites
   - Validate PHARMA compliance
   - Check workflow definitions
   - Build and push agent containers

3. EXTEND our monitoring stack to track:
   - RAG performance metrics
   - Agent health checks
   - Knowledge base size/growth
   - API quota usage

4. In our infrastructure as code, ADD:
   - Vector database instance
   - Additional compute for agents
   - S3/blob storage for documents
   - Redis for job queuing

5. UPDATE our backup strategy to include:
   - Knowledge base snapshots
   - Job configuration backups
   - Workflow version history
   - Audit log archival

Use our existing deployment patterns.
Maintain backward compatibility.
```

---

## Phase 9: Documentation

### Prompt 9.1: Update Documentation

```
EXTEND our existing documentation to cover new features:

1. In our API documentation, ADD:
   - CRUD endpoint specifications
   - Workflow schema definitions
   - Agent configuration options
   - RAG query parameters

2. UPDATE our user guide to include:
   - Job creation walkthrough
   - Workflow builder tutorial
   - RAG chat usage guide
   - Monitoring dashboard guide

3. In our developer docs, ADD:
   - Agent development guide
   - PHARMA/VERIFY implementation
   - Custom node creation
   - Knowledge base management

4. CREATE runbooks for:
   - Job failure recovery
   - Knowledge base refresh
   - Agent debugging
   - Performance tuning

Use our existing documentation format.
Include code examples from our codebase.
```

---

## 🚀 Implementation Checklist

Use this checklist to track progress:

```markdown
## Phase 1: Database
- [ ] Update schema for jobs and workflows
- [ ] Add RAG knowledge base tables
- [ ] Create migration files
- [ ] Test database changes

## Phase 2: Backend API
- [ ] Add CRUD endpoints
- [ ] Integrate RAG pipeline
- [ ] Implement validation

## Phase 3: Agents
- [ ] Create orchestrator
- [ ] Implement specialized agents
- [ ] Add PHARMA/VERIFY

## Phase 4: Frontend
- [ ] Update job management UI
- [ ] Integrate workflow builder
- [ ] Add drag-and-drop

## Phase 5: RAG Chat
- [ ] Create chat component
- [ ] Add citation display
- [ ] Enable report generation

## Phase 6: Monitoring
- [ ] Add execution monitor
- [ ] Create progress tracking
- [ ] Integrate metrics

## Phase 7: Testing
- [ ] Write unit tests
- [ ] Add integration tests
- [ ] Create E2E tests

## Phase 8: Deployment
- [ ] Update configurations
- [ ] Modify CI/CD
- [ ] Extend monitoring

## Phase 9: Documentation
- [ ] Update API docs
- [ ] Write user guides
- [ ] Create runbooks
```

---

## 💡 Pro Tips for Using These Prompts

1. **Always review existing code first**: Before using a prompt, tell Cursor to analyze your current codebase structure

2. **Use incremental approach**: Don't try to implement everything at once. Follow the phases in order.

3. **Maintain consistency**: Always ask Cursor to follow your existing patterns:
   ```
   "Follow our existing code style and patterns. Use our current libraries and conventions."
   ```

4. **Test after each change**: After each prompt implementation, test before moving to the next

5. **Keep backward compatibility**: Always emphasize not breaking existing functionality:
   ```
   "Ensure this change doesn't break existing features. Maintain backward compatibility."
   ```

6. **Use Cursor's context**: Reference specific files:
   ```
   "Look at /src/api/routes/index.js and add these new endpoints following the same pattern"
   ```

7. **Request explanations**: Ask Cursor to explain changes:
   ```
   "Explain what changes you made and why, so I understand the modifications"
   ```

---

## 🔧 Troubleshooting Common Issues

### If Cursor creates new files instead of modifying:
```
"Don't create new files. Modify the existing [filename] to add this functionality."
```

### If Cursor removes existing code:
```
"Keep all existing functionality. Only ADD new code, don't remove or replace existing logic."
```

### If integration breaks:
```
"This broke [feature]. Revert the last change and try a different approach that preserves existing functionality."
```

### If performance degrades:
```
"The app is now slower. Optimize the changes you made, possibly by adding caching or using more efficient queries."
```

---

## 📝 Sample Conversation with Cursor

Here's an example of how to use these prompts effectively:

**You**: "Look at our existing database schema in /src/db/schema.prisma"

**Cursor**: [Shows current schema]

**You**: "Now use Prompt 1.1 to add jobs and workflows tables while keeping all existing tables intact"

**Cursor**: [Makes modifications]

**You**: "Explain what you changed and verify that existing tables weren't modified"

**Cursor**: [Provides explanation]

**You**: "Good. Now generate the migration file for these changes"

**Cursor**: [Creates migration]

**You**: "Test that our existing API endpoints still work with these schema changes"

This iterative, conversational approach ensures changes are made correctly and existing functionality is preserved.

---

## 🎯 Success Criteria

After implementing all prompts, you should have:

1. ✅ Existing application enhanced with MA01 capabilities
2. ✅ No broken existing features  
3. ✅ Consistent code style throughout
4. ✅ Proper test coverage
5. ✅ Complete documentation
6. ✅ Production-ready deployment

Remember: The goal is ENHANCEMENT, not REPLACEMENT. Every prompt should build upon what exists rather than starting fresh.

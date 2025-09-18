# 🎯 SIMPLE CURSOR AI EXECUTION PLAN
## Just Follow These Phases - One at a Time

---

## 📌 START HERE - DON'T READ ALL DOCUMENTS!

You have 6 documents, but **you only need ONE prompt at a time**. This guide tells you exactly what to do in each phase.

**IMPORTANT**: Complete each phase fully before moving to the next.

---

## 🚀 PHASE 0: SETUP & ANALYSIS (30 minutes)

### What You're Building
A medical intelligence system that can search research, analyze trends, and generate reports.

### Step 1: Create Safety Backup
```bash
git checkout -b ma01-implementation
git commit -am "Backup before MA01 implementation"
```

### Step 2: Analyze Your Codebase
**Copy this EXACT prompt to Cursor:**
```
@workspace Please analyze my codebase and tell me:
1. What framework am I using? (Next.js, React, Vue, etc.)
2. What database and ORM? (PostgreSQL + Prisma, MySQL + TypeORM, etc.)
3. What's my API structure? (REST, GraphQL, tRPC)
4. How do I handle authentication?
5. What UI library do I use? (MUI, Tailwind, etc.)

Save this information - we'll reference it for all modifications.
```

### Step 3: Save the Analysis
Create a file `my-stack.txt` with Cursor's response. You'll need this.

**✅ Phase 0 Complete! Now we build.**

---

## 📦 PHASE 1: DATABASE FOUNDATION

### Goal: Add necessary database tables

### Prompt 1.A - Add Tables
```
@workspace Based on our earlier analysis where you found we use [YOUR DATABASE/ORM], please:

MODIFY our existing database schema to ADD these new tables (keep all existing tables):

1. Jobs table: job_id, name, description, status, configuration (JSON), created_by, timestamps
2. Workflows table: workflow_id, name, workflow_definition (JSON), version

Don't delete anything. Only ADD. Generate migration files using our existing pattern.
```

### Prompt 1.B - Run Migrations
```
@workspace Run the migrations and verify that:
1. New tables are created
2. Our existing user authentication still works
3. No existing features are broken
```

### Checkpoint
✅ Can you still log in?
✅ Do existing features work?
✅ Are new tables in database?

**If yes to all, commit:**
```bash
git commit -am "feat: Add jobs and workflows tables"
```

---

## 📡 PHASE 2: BASIC API

### Goal: Create simple CRUD endpoints

### Prompt 2.A - Add Endpoints
```
@workspace In our API routes, ADD these endpoints following our EXISTING patterns:

- POST /api/jobs (create)
- GET /api/jobs (list all)
- GET /api/jobs/:id (get one)
- PUT /api/jobs/:id (update)
- DELETE /api/jobs/:id (delete)

Use our existing:
- Authentication middleware
- Database connection
- Error handling
- Response format

Don't create new patterns. Follow what we have.
```

### Prompt 2.B - Test API
```
@workspace Create a simple test that verifies all 5 endpoints work. Use our existing test patterns or create curl commands I can run.
```

### Checkpoint
✅ Can you create a job via API?
✅ Can you list jobs?
✅ Can you delete a job?

**If yes, commit:**
```bash
git commit -am "feat: Add job CRUD API"
```

---

## 🤖 PHASE 3: SIMPLE AI AGENT

### Goal: Add one working AI agent

### Prompt 3.A - Create Basic Agent
```
@workspace We already use [OpenAI/Claude/etc] in our app. 

ADD a simple agent that:
1. Takes a medical query
2. Calls our existing LLM service  
3. Returns a response with citations

Create just ONE agent that works. Use our existing LLM configuration.
```

### Prompt 3.B - Add PHARMA Format
```
@workspace Modify the agent's prompt to structure responses with:
- Purpose: Why this matters
- Hypothesis: One testable idea
- Audience: "Medical Professional"  
- Requirements: "Research use only"
- Metrics: One success measure
- Actions: One next step

Just change the prompt, don't rebuild.
```

### Checkpoint
✅ Can you send a query to the agent?
✅ Does it return structured response?
✅ Are citations included?

**If yes, commit:**
```bash
git commit -am "feat: Add basic AI agent"
```

---

## 🖥️ PHASE 4: MINIMAL UI

### Goal: Basic interface to manage jobs

### Prompt 4.A - Job List Page
```
@workspace In our dashboard, ADD a new page for jobs with:
1. Table showing all jobs
2. Delete button for each job
3. "New Job" button

Use our existing:
- Table component
- Button styles  
- Page layout
- API client
```

### Prompt 4.B - Create Job Form
```
@workspace Add a simple form with:
- Name field
- Description field
- Submit button

Use our existing form components and validation. When submitted, call POST /api/jobs.
```

### Checkpoint
✅ Can you see list of jobs?
✅ Can you create a new job?
✅ Can you delete a job?

**If yes, commit:**
```bash
git commit -am "feat: Add job management UI"
```

---

## 🔗 PHASE 5: CONNECT AI TO JOBS

### Goal: Make jobs trigger AI agent

### Prompt 5.A - Link Job to Agent
```
@workspace When a job is created:
1. Add a "query" field to the job
2. When job runs, send query to our agent
3. Save agent response in job
4. Show response in UI

Use our existing state management and API patterns.
```

### Prompt 5.B - Add Status Updates
```
@workspace Add job status that shows:
- "pending" when created
- "running" when processing
- "completed" when done
- "failed" on error

Update UI to show these statuses.
```

### Checkpoint
✅ Can you create job with query?
✅ Does agent process it?
✅ Can you see the response?

**If yes, commit:**
```bash
git commit -am "feat: Connect AI agent to jobs"
```

---

## ✨ PHASE 6: BASIC ENHANCEMENT

### Goal: Add essential improvements

### Prompt 6.A - Add Search
```
@workspace Add search to the job list:
1. Search box above table
2. Filter jobs by name
3. Use our existing search patterns
```

### Prompt 6.B - Add Loading States
```
@workspace Add loading indicators:
1. While fetching jobs
2. While agent is processing
3. Use our existing loading components
```

### Checkpoint
✅ Search works?
✅ Loading states show?
✅ No console errors?

**If yes, commit:**
```bash
git commit -am "feat: Add search and loading states"
```

---

## 🎯 COMPLETION CHECK

### You Now Have:
- ✅ Database tables for jobs
- ✅ API endpoints (CRUD)
- ✅ AI agent that works
- ✅ UI to manage jobs
- ✅ Connected system

### This is Your MVP! 

**STOP HERE** and test everything thoroughly before adding more features.

---

## 🚀 OPTIONAL ADVANCED PHASES

Only proceed if basic system is 100% working:

### PHASE 7: Multiple Agents (Optional)
```
@workspace Extend our agent system to support:
1. Literature agent - searches papers
2. Clinical agent - analyzes trials
Route based on query keywords.
```

### PHASE 8: Workflow Builder (Optional)
```
@workspace Add visual workflow builder using ReactFlow. Create 3 node types: Source, Agent, Output.
```

### PHASE 9: Advanced RAG (Optional)
```
@workspace Enhance agent with vector search and semantic retrieval. Add confidence scores.
```

---

## ⚠️ CRITICAL RULES

### Rule 1: ONE PHASE AT A TIME
Never skip ahead. Each phase builds on the previous.

### Rule 2: TEST EVERYTHING
After each prompt, verify:
- New feature works
- Old features still work

### Rule 3: COMMIT AFTER SUCCESS
```bash
git add .
git commit -m "feat: [what you completed]"
```

### Rule 4: IF STUCK
```
@workspace The last change broke [X]. Fix it while keeping new features.
```

If can't fix:
```bash
git reset --hard HEAD  # Go back to last commit
# Try different approach
```

---

## 📊 PROGRESS TRACKER

Copy this and check off as you go:

```markdown
## MA01 Implementation Progress

### Core Phases
- [ ] Phase 0: Setup & Analysis
- [ ] Phase 1: Database Foundation  
- [ ] Phase 2: Basic API
- [ ] Phase 3: Simple AI Agent
- [ ] Phase 4: Minimal UI
- [ ] Phase 5: Connect AI to Jobs
- [ ] Phase 6: Basic Enhancement

### System Working?
- [ ] Can create/read/update/delete jobs
- [ ] AI agent responds to queries
- [ ] UI shows job list and responses
- [ ] No broken existing features

### Optional Phases
- [ ] Phase 7: Multiple Agents
- [ ] Phase 8: Workflow Builder  
- [ ] Phase 9: Advanced RAG
```

---

## 💡 TROUBLESHOOTING

### "Cursor is creating new files instead of modifying"
Add to your prompt:
```
Don't create new files. Modify the existing [filename] instead.
```

### "Cursor broke my authentication"
```
@workspace Restore the original authentication code and add job features without changing auth.
```

### "I don't know where to add code"
```
@workspace Show me exactly which file and which line to modify for [feature].
```

### "Tests are failing"
```
@workspace Fix the failing tests by updating them for new features. Don't remove tests.
```

---

## 🎉 SUCCESS CRITERIA

You're done when:
1. All 6 core phases complete
2. You can create a job with a medical query
3. AI agent processes it and returns results
4. You can see results in the UI
5. All existing features still work

**That's it! You have MA01 working!**

---

## 📝 REMEMBER

- **Don't read all 6 documents** - Just use this guide
- **One phase at a time** - Don't jump ahead
- **Test constantly** - Verify nothing breaks
- **Commit often** - Save your progress
- **Keep it simple** - MVP first, enhancements later

**Start with Phase 0 now. In 6 phases, you'll have a working system!**

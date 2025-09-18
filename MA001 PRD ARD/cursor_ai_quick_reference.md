# Cursor AI Quick Reference Guide
## MA01 Implementation Checklist & Commands

---

## 🚀 Quick Start Commands

### Step 1: Analyze Your Codebase
```
@workspace analyze the current codebase structure and list all major frameworks, libraries, and patterns we're using
```

### Step 2: Prepare for Modifications
```
@workspace before we start making changes, create a snapshot of the current working state and identify all files that will need modification for the MA01 medical intelligence system
```

---

## 📋 Copy-Paste Prompt Sequences

### Database Schema Updates
```
@workspace look at our database schema files. Add jobs, workflows, and knowledge_documents tables following our existing schema patterns. Keep all existing tables. Generate migration files.
```

### API CRUD Endpoints
```
@workspace in our API routes, add CRUD endpoints for /jobs following our existing endpoint patterns. Use our current auth middleware, validation, and error handling. Don't create new patterns.
```

### RAG Integration
```
@workspace extend our search functionality to support RAG. Add hybrid search, confidence scoring, and VERIFY protocol validation. Keep existing search working.
```

### Agent System
```
@workspace create an agent orchestration system using our existing LLM client. Add literature_agent, clinical_trials_agent, and signal_detection_agent following our service patterns.
```

### React UI Updates
```
@workspace add job management UI to our dashboard. Use our existing table component, form patterns, and styling. Don't change the current design system.
```

### Workflow Builder
```
@workspace integrate ReactFlow for visual workflow building. Use our existing modal system and drag-drop if available. Match our current theme.
```

---

## 🔧 Framework-Specific Commands

### Next.js
```
@workspace add /jobs routes in our app directory following our routing pattern. Use our existing layout and loading states. Add API routes in /api/jobs.
```

### Express
```
@workspace create jobRouter in our routes directory following our existing router pattern. Mount it in app.js like our other routers. Use our middleware stack.
```

### FastAPI
```
@workspace add jobs router following our existing FastAPI patterns. Use our dependencies, schemas, and response models. Include in main app.
```

### Prisma
```
@workspace update schema.prisma with new models. Keep existing models. Add relations using our foreign key pattern. Generate migrations and types.
```

### TypeORM
```
@workspace create Job and Workflow entities following our existing entity patterns. Use our decorators and relations approach. Generate migration.
```

---

## ✅ Validation Checklist

### After Each Major Change

```
@workspace verify that:
1. All existing API endpoints still work
2. User authentication is not broken
3. Database queries execute correctly
4. UI components render properly
5. Tests pass
Report any issues.
```

---

## 🔍 Common Fixes

### When Something Breaks
```
@workspace the last change broke [feature]. Fix it while keeping new functionality. Ensure backward compatibility.
```

### When Types Don't Match (TypeScript)
```
@workspace fix TypeScript errors by updating our type definitions. Follow our existing type patterns. Don't use 'any'.
```

### When Tests Fail
```
@workspace update failing tests to account for new functionality. Don't remove test coverage. Follow our testing patterns.
```

### When Performance Degrades
```
@workspace optimize the recent changes. Add indexes, implement caching like we do elsewhere, use pagination.
```

---

## 📝 Documentation Updates

### API Documentation
```
@workspace update our API documentation to include new endpoints. Follow our existing documentation format. Include examples.
```

### README Updates
```
@workspace update README.md with new setup instructions and environment variables. Keep existing content.
```

### Type Definitions
```
@workspace generate TypeScript definitions for new API responses. Follow our interface naming convention.
```

---

## 🏗️ Implementation Order

### Phase 1: Backend Foundation (Day 1)
```bash
# 1. Database schema
@workspace add jobs and workflows tables to our schema

# 2. Migrations
@workspace generate and run migrations

# 3. Basic CRUD API
@workspace add job CRUD endpoints

# 4. Tests
@workspace add tests for new endpoints
```

### Phase 2: Intelligence Layer (Day 2)
```bash
# 1. RAG system
@workspace implement RAG pipeline with VERIFY protocol

# 2. Agent orchestration  
@workspace create multi-agent system

# 3. PHARMA framework
@workspace add PHARMA validation to outputs

# 4. Integration tests
@workspace test agent orchestration flow
```

### Phase 3: Frontend (Day 3)
```bash
# 1. Job management UI
@workspace add job list and CRUD interface

# 2. Workflow builder
@workspace integrate visual workflow editor

# 3. RAG chat
@workspace add chat interface with citations

# 4. Monitoring dashboard
@workspace create execution monitoring view
```

### Phase 4: Polish (Day 4)
```bash
# 1. Error handling
@workspace add comprehensive error handling

# 2. Performance
@workspace optimize slow operations

# 3. Documentation
@workspace update all documentation

# 4. Deployment
@workspace update deployment configs
```

---

## 💡 Power User Tips

### Use File Context
```
@workspace @file:src/api/routes/users.js create similar routes for jobs using this file as a template
```

### Reference Specific Functions
```
@workspace @symbol:createUser create a similar createJob function following this pattern
```

### Multi-file Operations
```
@workspace update all files that import UserService to also import the new JobService
```

### Generate Tests from Code
```
@workspace @file:src/services/job.service.js generate comprehensive tests for this service
```

### Find and Replace Patterns
```
@workspace find all API endpoints and add our new auth middleware to protect them
```

---

## 🚨 Emergency Commands

### Rollback Changes
```
@workspace revert all changes made in the last hour and restore working state
```

### Debug Issues
```
@workspace analyze why [feature] is not working and provide step-by-step debugging
```

### Performance Analysis
```
@workspace profile the application and identify performance bottlenecks
```

### Security Check
```
@workspace review recent changes for security vulnerabilities
```

---

## 📊 Progress Tracking

### Daily Status
```
@workspace summarize today's changes: files modified, features added, tests written, and remaining tasks
```

### Generate Reports
```
@workspace create a markdown report of all MA01 features implemented so far
```

### Code Coverage
```
@workspace check test coverage for new features and identify gaps
```

---

## 🔄 Git Integration

### Commit Messages
```
@workspace create a detailed git commit message for the current changes following conventional commits
```

### Branch Management
```
@workspace create a new feature branch for MA01 implementation
```

### PR Description
```
@workspace generate a pull request description summarizing all changes
```

---

## 📦 Dependency Management

### Add Required Packages
```
@workspace add these packages to package.json: reactflow, @lucidchart/react-sdk, and update our existing dependencies
```

### Check Compatibility
```
@workspace verify that new dependencies are compatible with our existing packages
```

### Update Lock File
```
@workspace update package-lock.json or yarn.lock after adding dependencies
```

---

## 🎯 Final Checklist

Before considering implementation complete:

```
@workspace verify the following are complete:
□ Database schema updated with migrations
□ All CRUD operations working
□ RAG pipeline integrated
□ Agent orchestration functional
□ PHARMA & VERIFY frameworks implemented
□ Job management UI complete
□ Workflow builder integrated
□ RAG chat interface working
□ Monitoring dashboard active
□ All tests passing
□ Documentation updated
□ Performance acceptable
□ Security review done
□ Deployment configured
```

---

## 💬 Conversation Starters

### Getting Started
```
"I want to implement the MA01 medical intelligence system. Let's start by analyzing our current codebase structure."
```

### Midway Check
```
"We've completed the backend. Let's review what we've done and plan the frontend implementation."
```

### Final Review
```
"The MA01 implementation is complete. Let's do a final review and check that everything works correctly."
```

---

## 📚 Resources

### When Stuck
```
@workspace explain how our current [system] works and how we can extend it for [new feature]
```

### Best Practices
```
@workspace review our coding standards and ensure new code follows them
```

### Learning
```
@workspace explain the MA01 architecture and how it integrates with our system
```

---

## Quick Copy Commands for Common Tasks

```bash
# Full implementation
@workspace implement MA01 medical intelligence system by modifying our existing codebase

# Backend only
@workspace implement MA01 backend: database, API, agents, RAG

# Frontend only  
@workspace implement MA01 frontend: job UI, workflow builder, chat

# Testing only
@workspace write comprehensive tests for MA01 features

# Documentation only
@workspace document all MA01 features and APIs
```

---

Remember: 
- Always specify "modify existing" not "create new"
- Reference existing patterns and files
- Test after each change
- Keep backward compatibility
- Follow existing conventions

This guide is your companion for implementing MA01 with Cursor AI efficiently and safely.

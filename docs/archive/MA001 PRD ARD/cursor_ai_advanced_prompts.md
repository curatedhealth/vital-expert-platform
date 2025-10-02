# Cursor AI Prompt Templates: Specific Modification Scenarios
## Advanced Prompts for Code Modification

---

## 🎯 Context-Setting Prompts

### Initial Codebase Analysis
```
Analyze our current codebase structure and identify:
1. The main framework we're using (Next.js, React, Vue, etc.)
2. Our database ORM or query builder (Prisma, TypeORM, Knex, etc.)
3. Our API structure (REST, GraphQL, tRPC)
4. Authentication method (NextAuth, Auth0, Supabase, custom)
5. State management (Redux, Zustand, Context API)
6. UI component library (MUI, Ant Design, Tailwind, custom)
7. Testing framework (Jest, Vitest, Cypress)

Based on this analysis, I'll provide specific modifications that match our stack.
```

### Pattern Recognition
```
Look at 3-4 existing API endpoints in our codebase and identify:
1. How we structure our request handlers
2. How we handle errors
3. How we validate input
4. How we format responses
5. How we handle authentication/authorization

Use these exact same patterns when adding new endpoints.
```

---

## 🔄 Specific Modification Templates

### Template 1: Adding New API Endpoints to Existing Router
```
In [specific file path], find where we define our API routes.

ADD the following endpoints using the EXACT SAME pattern as our existing endpoints:

```javascript
// Example of what to add (adapt to our pattern):
router.post('/jobs', authenticate, validateJobInput, async (req, res) => {
  // Use our existing database client
  // Follow our error handling pattern
  // Match our response format
});
```

Make sure to:
1. Use the same authentication middleware we use elsewhere
2. Follow our naming conventions for routes
3. Use our existing validation approach
4. Return responses in our standard format
5. Add to our API documentation if it exists

DO NOT:
- Create a new router file
- Change the authentication method
- Use a different response format
- Remove or modify existing routes
```

### Template 2: Extending Database Models
```
In our [database schema file/directory], find the existing user and document models.

EXTEND our schema by adding new models that reference existing ones:

1. Locate how we define foreign keys in existing models
2. Use the same UUID generation method we use
3. Follow our naming convention for tables and columns
4. Add the same timestamp fields we use elsewhere (created_at, updated_at)

Example structure to add (adapt to our ORM syntax):
- jobs table with user_id foreign key to our existing users table
- workflows table with created_by foreign key  
- Keep all existing indexes and add similar ones for new tables

Generate migration files using the same approach we used for existing migrations.
```

### Template 3: Adding Services to Existing Architecture
```
Look at our existing service layer in [/src/services or /lib/services].

CREATE a new service following our existing service pattern:

1. If we use classes, create a class with the same structure
2. If we use functions, create functions with the same signature style
3. Use our existing dependency injection approach
4. Use our existing error handling patterns
5. Use our existing logging system

Example:
```javascript
// If we use classes:
class JobService extends BaseService {
  // Follow our constructor pattern
  // Use our database client the same way
  // Implement methods like our other services
}

// If we use functions:
export const jobService = {
  // Match our function naming
  // Use same parameter patterns
  // Return same response shapes
}
```

Import and use our existing utilities, don't create new ones.
```

### Template 4: Modifying React Components
```
In our components directory at [path], find similar list/table components.

MODIFY or EXTEND a similar component to display jobs:

1. Use our existing table/list component as a base
2. Follow our prop naming conventions
3. Use our existing styling approach (CSS modules, styled-components, Tailwind classes)
4. Use our existing state management pattern
5. Connect to our existing API client the same way

If we use TypeScript, maintain our type definition pattern:
```typescript
// Match our existing interface style
interface JobListProps {
  // Use our naming convention
  // Include common props we use elsewhere
}
```

Keep all existing functionality and add new features as optional.
```

### Template 5: Adding Validation
```
Look at how we validate data in [validation file/directory].

ADD validation for job configuration following our pattern:

1. If we use Zod:
```javascript
export const jobSchema = z.object({
  // Follow our schema definition style
});
```

2. If we use Joi:
```javascript
export const jobSchema = Joi.object({
  // Follow our validation pattern
});
```

3. If we use Yup:
```javascript
export const jobSchema = Yup.object({
  // Match our validation approach
});
```

Include the same validation rules we use elsewhere:
- Required field patterns
- String length limits
- Email/URL validation
- Custom validation messages in our format
```

---

## 🔧 Framework-Specific Modifications

### For Next.js Apps
```
In our /app or /pages directory:

ADD new routes following our routing pattern:
1. If using App Router:
   - Create route in /app/jobs/page.tsx
   - Use our existing layout
   - Follow our loading.tsx pattern
   - Match our error.tsx approach

2. If using Pages Router:
   - Create pages in /pages/jobs/index.tsx
   - Use our existing Layout component
   - Follow our getServerSideProps/getStaticProps pattern

Add API routes in /app/api or /pages/api following our structure:
- Use our existing middleware
- Match our response helpers
- Follow our error handling
```

### For Express/Node.js Apps
```
In our Express app:

1. Find our main app.js or server.js
2. Locate where we define middleware
3. Find where we mount routers

ADD new functionality:
- Add new router in our routers directory
- Mount it using our pattern: app.use('/api/v1/jobs', jobRouter)
- Use our existing middleware in the same order
- Follow our controller/service/repository pattern if we use it
```

### For FastAPI Apps
```
In our FastAPI application:

1. Find our main.py or app.py
2. Locate our routers directory
3. Check our dependency injection pattern

ADD new endpoints:
```python
# In routers/jobs.py
from fastapi import APIRouter, Depends
from ..dependencies import get_db, get_current_user  # Use our deps
from ..schemas import JobCreate, JobResponse  # Follow our schema pattern

router = APIRouter(
    prefix="/jobs",
    tags=["jobs"],  # Use our tagging convention
)

@router.post("/", response_model=JobResponse)
async def create_job(
    job: JobCreate,
    db: Session = Depends(get_db),  # Use our DB dependency
    user: User = Depends(get_current_user)  # Use our auth
):
    # Follow our service pattern
```

Include in main app using our pattern.
```

---

## 🔍 Debugging & Fixing Prompts

### When Cursor Breaks Something
```
The last change broke [specific feature]. Here's the error: [error message]

Please:
1. Identify what in the recent changes caused this
2. Fix it while keeping the new functionality
3. Ensure the original feature works again
4. Add a comment explaining the fix

Test that both old and new features work after the fix.
```

### When Integration Fails
```
The new [feature] isn't integrating properly with our existing [system].

Debug by:
1. Checking if we're using the same instance/client
2. Verifying the data format matches
3. Ensuring we're following the same async/sync pattern
4. Checking if we need to update our dependency injection

Fix the integration while maintaining backward compatibility.
```

### When Performance Degrades
```
After adding [feature], the app is noticeably slower.

Optimize by:
1. Adding appropriate indexes to new database tables
2. Implementing caching similar to our existing caching
3. Using pagination like we do elsewhere
4. Batching operations if needed
5. Adding lazy loading if appropriate

Measure performance before and after optimization.
```

---

## 📝 Complex Modification Scenarios

### Scenario 1: Adding Multi-Step Workflow
```
We need to add a multi-step job configuration workflow.

Look at our existing forms and wizards (if any) in [directory].

MODIFY or CREATE a wizard component that:
1. Uses our existing form components
2. Follows our step navigation pattern (or create one matching our UX)
3. Saves draft state using our state management
4. Validates each step using our validation approach

Structure:
- Step 1: Basic Info (use our existing input components)
- Step 2: Keywords (use our tag/chip component if we have one)
- Step 3: Data Sources (use our checkbox/toggle components)
- Step 4: Review (use our summary card pattern)

Integrate with our existing navigation and routing.
```

### Scenario 2: Adding Real-time Updates
```
Add real-time job execution monitoring to our dashboard.

Check if we already use:
1. WebSockets (Socket.io, native WS)
2. Server-Sent Events
3. Polling

EXTEND our existing real-time system:
- If using WebSockets, add new event types for job updates
- If using polling, add job status to polling endpoints
- If no real-time, implement using our current HTTP client with polling

Update our dashboard to:
1. Subscribe to job updates using our pattern
2. Update UI using our state management
3. Show notifications using our notification system
4. Handle reconnection like we do elsewhere
```

### Scenario 3: Adding Complex Search
```
Enhance our search functionality to support RAG-based semantic search.

Find our current search implementation in [location].

MODIFY to add:
1. Hybrid search combining our existing keyword search with new vector search
2. Use our existing search UI components
3. Add confidence scores to results (follow our score display pattern)
4. Include citations in our existing result format

Backend changes:
- Extend our search endpoint to accept embedding queries
- Add vector similarity search alongside existing queries
- Merge results using Reciprocal Rank Fusion
- Return in our existing response format with additional fields

Keep all existing search functionality working.
```

---

## 🚀 Incremental Implementation Strategy

### Day 1-2: Foundation
```
Focus on database schema updates and basic CRUD API:
1. "Update our schema to add jobs and workflows tables"
2. "Add CRUD endpoints following our existing patterns"
3. "Create migration files"
4. "Test that existing features still work"
```

### Day 3-4: Core Features
```
Add agent system and RAG capabilities:
1. "Extend our LLM integration to support multiple agents"
2. "Add RAG pipeline to our search functionality"
3. "Implement PHARMA and VERIFY validation"
4. "Test agent orchestration"
```

### Day 5-6: UI Updates
```
Enhance frontend with new features:
1. "Add job management UI to our dashboard"
2. "Integrate workflow builder using ReactFlow"
3. "Add RAG chat interface"
4. "Ensure consistent with our design system"
```

### Day 7: Testing & Polish
```
Complete testing and documentation:
1. "Add comprehensive tests for new features"
2. "Update documentation"
3. "Fix any integration issues"
4. "Performance optimization"
```

---

## 💡 Best Practices for Prompting

### Be Specific About Files
```
❌ Bad: "Add this to our API"
✅ Good: "In /src/api/routes/index.js, add this after line 45"
```

### Reference Existing Patterns
```
❌ Bad: "Create a new service"
✅ Good: "Create a service following the same pattern as UserService in /src/services/user.service.js"
```

### Preserve Functionality
```
❌ Bad: "Change the authentication"
✅ Good: "Extend our existing authentication to also check for job permissions"
```

### Incremental Changes
```
❌ Bad: "Rebuild the dashboard"
✅ Good: "Add a new tab to our existing dashboard for job monitoring"
```

---

## 🔄 Rollback Strategy

### If Something Breaks
```
Step 1: "Show me the git diff of the last changes"
Step 2: "Revert only the breaking changes, keep the working parts"
Step 3: "Try a different approach that doesn't break [feature]"
Step 4: "Add error handling to prevent this issue"
```

### Version Control Integration
```
"Create a git commit message summarizing the changes made, following our commit convention:
- feat: for new features
- fix: for bug fixes
- refactor: for code refactoring
- docs: for documentation
- test: for tests"
```

---

## 📊 Progress Tracking

### After Each Major Change
```
Verify the following still works:
1. [ ] Existing user authentication
2. [ ] Current API endpoints
3. [ ] Database queries
4. [ ] UI components
5. [ ] Tests pass

Report any issues found and fix immediately.
```

### Daily Summary Request
```
Summarize what was modified today:
1. Files changed
2. New features added
3. Existing features modified
4. Tests added/updated
5. Any breaking changes
6. Next steps

Generate a progress report in Markdown format.
```

---

Remember: The key to successful modification is understanding the existing codebase first, then making incremental changes that follow established patterns. Always test after each change to ensure nothing breaks.

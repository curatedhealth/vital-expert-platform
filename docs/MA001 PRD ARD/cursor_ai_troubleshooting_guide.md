# Cursor AI Troubleshooting Guide
## Common Issues When Modifying Existing Code

---

## 🚫 Problem Prevention Strategies

### Before You Start Any Modification

```javascript
// ALWAYS START WITH THIS PROMPT:
"Before we make any changes, please:
1. List all files that will be modified
2. Explain what each modification will do
3. Identify any potential breaking changes
4. Confirm that existing functionality will be preserved"
```

### Create a Safety Net

```javascript
// BACKUP PROMPT:
"Create a comment block at the top of each file we're about to modify that documents:
1. Original functionality
2. What we're adding
3. Date of modification
4. Potential impacts"
```

---

## 🔴 Common Problems & Solutions

### Problem 1: Cursor Creates Duplicate Files

**Symptom**: Cursor creates `jobService.js` when you already have `userService.js` that should be extended.

**Solution Prompt**:
```
You created a new file, but I wanted to modify the existing pattern. 
Delete the new file you created.
Instead, look at src/services/userService.js and:
1. Add job-related methods to the existing service structure
2. Or create jobService.js that follows the EXACT same pattern
3. Import and use it the same way we use userService
```

---

### Problem 2: Cursor Overwrites Existing Code

**Symptom**: Your working authentication suddenly breaks after adding new features.

**Solution Prompt**:
```
You overwrote our existing authentication logic. Please:
1. Restore the original authentication code
2. Add the new job authorization as an ADDITIONAL check, not a replacement
3. Show me the diff so I can verify only additions were made

The original auth should look like: [paste snippet of original]
```

---

### Problem 3: Wrong Framework Patterns

**Symptom**: Cursor uses React class components when your app uses hooks, or uses Options API when you use Composition API in Vue.

**Solution Prompt**:
```
You're using [wrong pattern], but our codebase uses [correct pattern].
Please rewrite using:
- Functional components with hooks (not class components)
- Our existing state management pattern
- Our current styling approach

Look at [example file] for the pattern to follow.
```

---

### Problem 4: Import/Dependency Hell

**Symptom**: Cursor adds imports that don't exist or uses different import styles.

**Solution Prompt**:
```
The imports you added are causing errors. Please:
1. Check how we import modules in other files
2. Use our existing utility functions instead of importing new ones
3. Follow our import ordering convention:
   - External packages first
   - Internal modules second
   - Styles last
4. Use our path aliases (@ or ~) if we have them
```

**Fix Example**:
```javascript
// ❌ Cursor added:
import axios from 'axios';
import { validateJob } from 'new-validation-lib';

// ✅ Should be:
import { apiClient } from '@/lib/api';  // Use our existing client
import { validateInput } from '@/utils/validation';  // Use our validator
```

---

### Problem 5: Database Schema Conflicts

**Symptom**: Migrations fail because of foreign key conflicts or duplicate columns.

**Solution Prompt**:
```
The migration is failing. Please:
1. Check our existing schema for naming conventions
2. Ensure foreign keys reference existing tables correctly
3. Use the same UUID type we use elsewhere
4. Add IF NOT EXISTS clauses to be safe
5. Generate a rollback migration as well

Fix the migration to work with our existing schema.
```

---

### Problem 6: TypeScript Type Mismatches

**Symptom**: TypeScript compilation fails after modifications.

**Solution Prompt**:
```
TypeScript is throwing errors. Please:
1. Extend our existing interfaces rather than creating new ones
2. Use our existing type definitions where possible
3. Follow our interface naming convention (I prefix or Type suffix)
4. Don't use 'any' - find the correct type
5. Update type definitions in our types directory

Show me the type changes needed to fix these errors.
```

**Fix Example**:
```typescript
// ❌ Cursor created:
interface JobInterface {
  id: any;
  name: any;
}

// ✅ Should be:
interface IJob extends IBaseEntity {  // Extend our base
  id: string;  // Use our ID type
  name: string;
  configuration: JobConfiguration;
}
```

---

### Problem 7: State Management Chaos

**Symptom**: Component state conflicts with global state management.

**Solution Prompt**:
```
The state management is conflicting. We use [Redux/Zustand/Context].
Please:
1. Move component state to our global store
2. Follow our existing action/reducer patterns
3. Use our existing selectors and hooks
4. Don't mix local and global state for the same data

Refactor to use only our established state management pattern.
```

---

### Problem 8: API Endpoint Inconsistencies

**Symptom**: New endpoints don't follow REST conventions or existing patterns.

**Solution Prompt**:
```
The API endpoints don't match our pattern. Please follow:
- Our URL structure: /api/v1/[resource]
- Our HTTP methods: GET (read), POST (create), PUT (update), DELETE (delete)
- Our response format: { data: {}, meta: {}, error: null }
- Our error format: { error: { code, message }, data: null }
- Our pagination: ?page=1&limit=10

Refactor the endpoints to match exactly.
```

---

### Problem 9: Component Styling Breaks

**Symptom**: New components don't match the app's design system.

**Solution Prompt**:
```
The styling doesn't match our design system. Please:
1. Use our existing CSS variables/theme tokens
2. Follow our className naming convention
3. Use our component library classes if available
4. Import our base styles
5. Match our spacing/color system

If using Tailwind: use our configured classes only
If using CSS Modules: follow our naming pattern
If using styled-components: use our theme
```

---

### Problem 10: Test Failures After Modifications

**Symptom**: Existing tests fail after adding new features.

**Solution Prompt**:
```
Tests are failing after our changes. Please:
1. Update test mocks to include new methods
2. Don't remove existing test cases
3. Add new tests for new functionality
4. Update snapshots if needed
5. Fix any async handling issues

Show me exactly what changes are needed in the tests.
```

---

## 🛠️ Recovery Strategies

### When Everything is Broken

```
EMERGENCY RECOVERY:
1. Show me git diff of all changes
2. Identify which changes broke the app
3. Revert only the breaking changes
4. Reimplement those parts more carefully
5. Test each change individually
```

### When You Can't Find the Problem

```
DIAGNOSTIC PROMPT:
Help me debug why [feature] stopped working:
1. Check the browser console for errors
2. Check the network tab for failed requests
3. Check the server logs for errors
4. Trace through the code execution path
5. Identify where it breaks
```

### When Performance Tanks

```
PERFORMANCE FIX:
The app is much slower after our changes. Please:
1. Profile to identify bottlenecks
2. Check for unnecessary re-renders (React)
3. Look for N+1 database queries
4. Find any infinite loops or recursive calls
5. Optimize the slowest operations
```

---

## 🎯 Specific Cursor Commands

### Force Modification Over Creation

```
@workspace modify the existing file at [path] - do not create a new file
```

### Preserve Specific Code

```
@workspace keep lines 1-50 unchanged, only modify after line 50
```

### Use Existing Patterns

```
@workspace @file:src/services/user.service.js use this exact pattern for the job service
```

### Incremental Changes

```
@workspace make this change in small steps, testing after each step
```

### Rollback Specific Changes

```
@workspace revert only the changes to authentication, keep everything else
```

---

## 📝 Pre-Flight Checklist

Before using any Cursor prompt for modification:

```markdown
□ Have I backed up my code/committed current changes?
□ Have I specified which files to modify (not create)?
□ Have I referenced existing patterns to follow?
□ Have I mentioned preserving existing functionality?
□ Have I asked for incremental changes?
□ Have I specified our framework/library versions?
□ Have I mentioned our coding conventions?
```

---

## 🔍 Debugging Prompts

### When Cursor Doesn't Understand Context

```
Let me clarify our codebase structure:
- Framework: [Next.js 14]
- Database: [PostgreSQL with Prisma]
- Auth: [NextAuth]
- State: [Zustand]
- Styling: [Tailwind CSS]
- Testing: [Jest + React Testing Library]

Now, modify [specific feature] following these patterns.
```

### When Cursor Makes Wrong Assumptions

```
You assumed we're using [X], but we actually use [Y].
Please redo the implementation using [Y] instead.
Here's an example of how we use [Y]: [code snippet]
```

### When Cursor Ignores Instructions

```
You didn't follow my instruction to [specific requirement].
Please revise your solution to:
1. [Requirement 1]
2. [Requirement 2]
3. [Requirement 3]
Show me the specific lines you changed.
```

---

## 💡 Pro Tips

### 1. Be Explicit About File Paths
```
❌ "Add this to our API"
✅ "In src/api/routes/index.js, after line 23, add this"
```

### 2. Provide Examples from Your Codebase
```
❌ "Follow our pattern"
✅ "Follow the same pattern as src/services/user.service.js"
```

### 3. Specify What NOT to Change
```
❌ "Update the auth"
✅ "Update the auth but keep the JWT logic unchanged"
```

### 4. Ask for Confirmation
```
✅ "Before making changes, list what you'll modify"
✅ "Show me the changes before applying them"
```

### 5. Use Version Control Commands
```
✅ "@workspace show me git diff after these changes"
✅ "@workspace create a commit with descriptive message"
```

---

## 🚀 Recovery Commands Quick Reference

```bash
# When something breaks
@workspace git diff  # See what changed
@workspace git restore [file]  # Revert specific file
@workspace fix the error while keeping new features

# When tests fail
@workspace run tests and show me failures
@workspace fix failing tests without removing coverage

# When build fails
@workspace check build errors
@workspace fix import/type issues

# When confused
@workspace explain current code structure
@workspace show me how to properly modify this
```

---

## 📊 Success Metrics

You know your modification approach is working when:
- ✅ No existing features break
- ✅ Tests continue to pass
- ✅ Build succeeds without errors
- ✅ Performance remains stable
- ✅ Code style is consistent
- ✅ New features integrate seamlessly

---

Remember: The goal is ENHANCEMENT not REPLACEMENT. Every modification should make the codebase better while preserving what already works.

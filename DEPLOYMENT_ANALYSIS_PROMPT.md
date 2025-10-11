# Vercel Pre-Production Deployment Analysis Prompt

## Objective
Analyze the entire codebase for errors, issues, and configuration problems that could prevent successful deployment to Vercel pre-production environment.

## Analysis Scope

### 1. Build-Time Errors
- **TypeScript compilation errors** that would cause build failures
- **Missing dependencies** or incorrect import paths
- **Syntax errors** in JavaScript/TypeScript files
- **Configuration errors** in Next.js, TypeScript, or build tools
- **Missing or malformed** environment variables
- **Incorrect file paths** or broken imports

### 2. Runtime Errors
- **Server-side rendering (SSR) issues** that would crash the app
- **Client-side hydration mismatches**
- **API route errors** that would return 500 status codes
- **Database connection issues** or missing database setup
- **Authentication/authorization errors** that would block access
- **Memory leaks** or performance issues that would cause timeouts

### 3. Vercel-Specific Issues
- **Function timeout errors** (default 10s for Hobby, 60s for Pro)
- **Memory limit exceeded** (1024MB for Hobby, 3008MB for Pro)
- **Cold start issues** with serverless functions
- **Environment variable configuration** problems
- **Build command failures** or incorrect build settings
- **Static file serving issues**
- **Edge runtime compatibility** problems

### 4. Security & Compliance Issues
- **Exposed API keys** or sensitive data in client-side code
- **CORS configuration** problems
- **Rate limiting** issues that would block legitimate requests
- **Authentication bypass** vulnerabilities
- **Data validation** errors that could cause crashes
- **HIPAA compliance** violations in healthcare data handling

### 5. Performance & Optimization Issues
- **Large bundle sizes** that would cause slow loading
- **Unoptimized images** or assets
- **Missing compression** or caching headers
- **Inefficient database queries** that would timeout
- **Memory-intensive operations** that would exceed limits
- **Missing error boundaries** that would crash the entire app

### 6. Configuration Issues
- **vercel.json** misconfigurations
- **next.config.js** errors
- **package.json** script or dependency issues
- **Environment variable** missing or incorrect values
- **Database connection strings** or configuration
- **Third-party service** integration problems

## Analysis Commands to Run

### 1. Build Analysis
```bash
# Check for build errors
npm run build

# Check TypeScript compilation
npx tsc --noEmit

# Check for linting errors
npm run lint

# Check for type errors
npx tsc --noEmit --skipLibCheck
```

### 2. Dependency Analysis
```bash
# Check for missing dependencies
npm audit

# Check for outdated packages
npm outdated

# Check for security vulnerabilities
npm audit --audit-level moderate
```

### 3. Code Quality Analysis
```bash
# Check for unused imports
npx ts-unused-exports tsconfig.json

# Check for circular dependencies
npx madge --circular src/

# Check bundle size
npm run build && npx @next/bundle-analyzer
```

### 4. Environment Analysis
```bash
# Check environment variables
node -e "console.log('Required env vars:', Object.keys(process.env).filter(k => k.startsWith('NEXT_PUBLIC_') || k.startsWith('SUPABASE_') || k.startsWith('VERCEL_'))"

# Check for missing .env files
ls -la .env*
```

## Critical Files to Examine

### 1. Configuration Files
- `vercel.json` - Vercel deployment configuration
- `next.config.js` - Next.js configuration
- `tsconfig.json` - TypeScript configuration
- `package.json` - Dependencies and scripts
- `tailwind.config.ts` - Styling configuration
- `postcss.config.js` - CSS processing

### 2. Environment Files
- `.env.local` - Local environment variables
- `.env.production` - Production environment variables
- `.env.example` - Example environment variables

### 3. API Routes
- `src/app/api/` - All API route handlers
- `src/middleware.ts` - Middleware configuration
- `src/lib/` - Utility functions and services

### 4. Database & Services
- `src/lib/supabase/` - Database configuration
- `src/services/` - Service layer implementations
- `src/lib/auth/` - Authentication logic

### 5. Components & Pages
- `src/app/` - App router pages and layouts
- `src/components/` - Reusable components
- `src/hooks/` - Custom React hooks

## Common Deployment Blockers to Check

### 1. Import/Export Issues
- Missing default exports in page components
- Incorrect import paths (case sensitivity)
- Circular dependency imports
- Missing component exports

### 2. Environment Variable Issues
- Missing required environment variables
- Incorrect variable names or values
- Client-side exposure of server-only variables
- Missing Vercel environment variable configuration

### 3. Database Connection Issues
- Missing database connection strings
- Incorrect Supabase configuration
- Missing database tables or migrations
- Connection timeout issues

### 4. Authentication Issues
- Missing authentication middleware
- Incorrect session handling
- Missing user role checks
- Authentication redirect loops

### 5. API Route Issues
- Missing error handling in API routes
- Incorrect HTTP status codes
- Missing request validation
- Timeout issues in long-running operations

### 6. Build Configuration Issues
- Incorrect build output directory
- Missing static file handling
- Incorrect image optimization settings
- Missing CSS/asset processing

## Output Format

For each issue found, provide:

1. **Severity Level**: Critical, High, Medium, Low
2. **Issue Type**: Build Error, Runtime Error, Configuration, Security, Performance
3. **File Location**: Exact file path and line number
4. **Description**: Clear description of the issue
5. **Impact**: How it would affect deployment
6. **Solution**: Specific steps to fix the issue
7. **Priority**: 1 (Must fix before deployment) to 5 (Can be fixed later)

## Example Output

```
## Critical Issues (Must Fix Before Deployment)

### 1. Missing Environment Variables
- **File**: `src/lib/supabase/client.ts:15`
- **Issue**: `SUPABASE_SERVICE_ROLE_KEY` is undefined
- **Impact**: Database operations will fail, causing 500 errors
- **Solution**: Add `SUPABASE_SERVICE_ROLE_KEY` to Vercel environment variables

### 2. Build Error - Missing Export
- **File**: `src/components/ui/shadcn-io/ai/conversation.tsx:45`
- **Issue**: `Conversation` component is not exported
- **Impact**: Build will fail with import error
- **Solution**: Add `export { Conversation }` to the file

## High Priority Issues (Should Fix Before Deployment)

### 3. API Route Timeout
- **File**: `src/app/api/agents/route.ts:89`
- **Issue**: Database query takes >10 seconds
- **Impact**: Vercel function will timeout (10s limit on Hobby plan)
- **Solution**: Implement pagination or optimize query
```

## Additional Checks

### 1. Vercel-Specific
- Check `vercel.json` for correct configuration
- Verify function timeout settings
- Check for edge runtime compatibility
- Verify environment variable configuration in Vercel dashboard

### 2. Next.js Specific
- Check for proper page component exports
- Verify API route structure
- Check for middleware configuration
- Verify static file handling

### 3. Healthcare Compliance
- Check for HIPAA compliance in data handling
- Verify secure data transmission
- Check for proper access controls
- Verify audit logging implementation

## Success Criteria

The codebase is ready for Vercel pre-production deployment when:
- ✅ Build completes without errors
- ✅ All TypeScript compilation passes
- ✅ No critical runtime errors
- ✅ All environment variables are properly configured
- ✅ Database connections are working
- ✅ Authentication is properly implemented
- ✅ API routes return correct responses
- ✅ No security vulnerabilities
- ✅ Performance is within Vercel limits
- ✅ All required dependencies are installed

## Usage

Run this analysis before every deployment to ensure a smooth deployment process and identify potential issues early in the development cycle.

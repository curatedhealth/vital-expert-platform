# Phase 3: Performance Optimization Plan

## Overview
Convert client components to server components where possible, implement caching strategies, optimize images, and add bundle analysis.

## Task 15: Convert Static Components to React Server Components

### Components Analysis

#### Can Convert to RSC (No Client-Side Features)
1. **Landing Page Sections** - Most content is static
   - Hero section
   - Features section
   - Pricing section
   - Footer section

2. **Layout Components** (partial conversion)
   - Navigation header (extract static parts)
   - Footer
   - Page wrappers

3. **Display Components**
   - Agent profile displays (read-only parts)
   - Cards/badges that don't have interactions
   - Static content sections

#### Must Remain Client Components
1. **Interactive Components**
   - Forms with state
   - Components using hooks (useState, useEffect, etc.)
   - Components with event handlers
   - Chat interfaces
   - Modals and dialogs
   - Dropdowns and menus

### Strategy: Composition Pattern
Split components into:
- **Server Component Wrapper**: Fetches data, renders static content
- **Client Component Islands**: Small, focused interactive pieces

### Implementation Plan

1. **Landing Page Refactor**
   - Extract navigation into:
     - `LandingNav.tsx` (server) - Logo, links structure
     - `LandingNavClient.tsx` (client) - Mobile menu toggle only
   - Keep hero, features, pricing as server components

2. **Shared Components**
   - Create server-side card components
   - Create server-side badge components
   - Keep interactive versions as separate client components

3. **Layout Optimization**
   - Convert static parts of app layout to server components
   - Keep sidebar, dropdowns as client components

## Task 16: Implement Caching Strategy

### Next.js Built-in Caching
1. **Route Segment Config**
   ```typescript
   export const revalidate = 3600; // Revalidate every hour
   export const dynamic = 'force-static'; // or 'force-dynamic'
   ```

2. **fetch() API Caching**
   ```typescript
   fetch(url, { next: { revalidate: 3600 } })
   ```

### React Query / SWR for Client-Side
1. **Install SWR**
   ```bash
   npm install swr
   ```

2. **Setup SWR Configuration**
   - Global cache config
   - Revalidation strategies
   - Error handling

3. **Implement for:**
   - Agent data fetching
   - User profile data
   - Chat history
   - Knowledge base queries

## Task 17: Optimize Images

### Image Audit
1. Find all image usages
2. Convert to `next/image`
3. Set proper sizes and priorities
4. Add blur placeholders

### Implementation
```typescript
import Image from 'next/image'

<Image
  src="/images/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority // for above-the-fold images
  placeholder="blur"
/>
```

## Task 18: Bundle Analyzer

### Setup
```bash
npm install @next/bundle-analyzer
```

### Configuration
```javascript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  // ... existing config
})
```

### Analysis Targets
1. Identify large dependencies
2. Find duplicate modules
3. Optimize imports (tree-shaking)
4. Code splitting opportunities

## Task 19: Data Fetching Optimization

### Server Components Data Fetching
```typescript
// Server component
async function AgentList() {
  const agents = await fetch('/api/agents').then(r => r.json())
  return <AgentListClient agents={agents} />
}
```

### Client Components with SWR
```typescript
// Client component
function AgentDetails({ id }) {
  const { data, error, isLoading } = useSWR(
    `/api/agents/${id}`,
    fetcher,
    { revalidateOnFocus: false }
  )
  // ...
}
```

## Performance Targets

### Before Optimization (Current)
- First Contentful Paint (FCP): TBD
- Largest Contentful Paint (LCP): TBD
- Time to Interactive (TTI): TBD
- Total Bundle Size: TBD

### After Optimization (Goals)
- FCP: < 1.5s
- LCP: < 2.5s
- TTI: < 3.5s
- Reduce bundle size by 30%

## Validation

### Performance Testing
```bash
# Lighthouse audit
npm run lighthouse

# Bundle analysis
ANALYZE=true npm run build

# Load testing
npm run test:load
```

### Success Criteria
- ✅ All static content converted to RSC
- ✅ Caching implemented for all data fetches
- ✅ All images optimized with next/image
- ✅ Bundle size reduced by target %
- ✅ Lighthouse score > 90

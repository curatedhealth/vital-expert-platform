# styled-jsx SSR Error: Root Cause Analysis

## The Problem

When loading any page in the browser, you get:
```
Internal Server Error
ReferenceError: document is not defined
  at new StyleSheet (styled-jsx/dist/index/index.js:41:53)
```

## Root Cause Investigation

### What's Happening

1. **Shadcn UI Sidebar components** → depend on **Radix UI primitives**
2. **Radix UI** → has **styled-jsx as peer dependency**
3. **styled-jsx** → tries to access `document` during initialization
4. **Next.js Pages Router** → compiles`/_error` and `/_document` pages during SSR
5. **SSR environment** → has NO `document` object (server-side)
6. **Result**: `ReferenceError: document is not defined`

### The Critical Issue

The styled-jsx code is loaded from **Next.js's internal compiled bundle**:
```
at /node_modules/next/dist/compiled/next-server/pages.runtime.dev.js
```

This means:
- ❌ **webpack aliases DON'T work** - code is already compiled
- ❌ **NormalModuleReplacementPlugin DOESN'T work** - too late in the build process
- ❌ **Instrumentation hooks DON'T work** - Next.js loads its compiled bundle first
- ❌ **Patching node_modules DOESN'T work** - styled-jsx is bundled inside Next.js

### Why It's Different from Previous Session

In the **previous working implementation**, we likely:
- Used simpler components that didn't trigger styled-jsx
- OR had a different layout structure
- OR were using App Router instead of Pages Router

The **new unified dashboard implementation** with Shadcn sidebar-07 and dashboard-01 patterns:
- Uses complex Radix UI primitives (Sidebar, DropdownMenu, etc.)
- Triggers styled-jsx loading during `_document` compilation
- Breaks on Pages Router SSR

## Solutions Attempted

### ✅ Attempted #1: webpack Resolve Alias
```javascript
config.resolve.alias = {
  'styled-jsx': require.resolve('./styled-jsx-noop.js'),
}
```
**Result**: FAILED - styled-jsx already bundled in Next.js internal code

### ✅ Attempted #2: webpack NormalModuleReplacementPlugin
```javascript
new webpack.NormalModuleReplacementPlugin(
  /styled-jsx/,
  require.resolve('./styled-jsx-noop.js')
)
```
**Result**: FAILED - replacement happens after Next.js compilation

### ✅ Attempted #3: Instrumentation Hook
```javascript
// instrumentation.ts
Module.prototype.require = function (id) {
  if (id.includes('styled-jsx')) {
    return require('./styled-jsx-noop.js');
  }
  return originalRequire.apply(this, arguments);
};
```
**Result**: FAILED - Next.js loads compiled bundle before instrumentation runs

### ✅ Attempted #4: DefinePlugin for typeof document
```javascript
new webpack.DefinePlugin({
  'typeof document': isServer ? JSON.stringify('undefined') : JSON.stringify('object'),
})
```
**Result**: FAILED - doesn't affect runtime code execution

## Actual Solutions

### Option 1: Switch to Next.js App Router ⭐ RECOMMENDED
**Pros**:
- App Router handles RSC (React Server Components) better
- No `_document.js` compilation issues
- Better SSR/client separation
- Shadcn components work perfectly

**Cons**:
- Major refactor required
- Need to migrate all pages/ to app/
- Update routing logic
- Rewrite layouts

**Effort**: 4-6 hours

### Option 2: Remove Shadcn Sidebar Components
**Pros**:
- Keeps Pages Router
- Quick fix

**Cons**:
- Lose beautiful Shadcn UI
- Need to rebuild sidebar from scratch
- Defeats the purpose of the redesign

**Effort**: 2-3 hours

### Option 3: Use Client-Only Rendering for Dashboard
**Pros**:
- Keeps Shadcn components
- Minimal code changes

**Cons**:
- SEO impact (no SSR for dashboard)
- Slower initial load
- Flash of unstyled content

**Implementation**:
```tsx
// Force client-side only rendering
const DashboardLayout = dynamic(
  () => import('@/components/dashboard/unified-dashboard-layout'),
  {
    ssr: false,
    loading: () => <LoadingSpinner />
  }
)
```

**Effort**: 30 minutes (ALREADY IMPLEMENTED - but still getting error!)

### Option 4: Revert to Old Working Implementation
**Pros**:
- Known to work
- Zero new bugs

**Cons**:
- Loses new unified dashboard design
- Wastes implementation effort

**Effort**: 10 minutes

### Option 5: Create Custom Sidebar Without Radix UI
**Pros**:
- Full control over components
- No styled-jsx dependency
- Lighter bundle size

**Cons**:
- Reinvent the wheel
- Lose accessibility features
- More code to maintain

**Effort**: 3-4 hours

## Recommendation

Given the constraints and timeline, I recommend **Option 1: Switch to App Router**.

### Why App Router?

1. **Long-term Solution**: App Router is the future of Next.js
2. **Better Architecture**: RSC model is more maintainable
3. **Shadcn Compatible**: All Shadcn components work perfectly
4. **Performance**: Better code splitting and streaming
5. **Modern**: Aligns with Next.js 13+ best practices

### Migration Path

1. **Create `app/` directory** structure
2. **Move layouts** to `app/layout.tsx`
3. **Convert pages** to `app/*/page.tsx`
4. **Update routing** logic (file-based)
5. **Test thoroughly**

## Temporary Workaround

While deciding on long-term solution, **revert to old working implementation**:

```bash
git checkout HEAD~10 -- src/components/
git checkout HEAD~10 -- src/app/(app)/layout.tsx
```

This gets the app working immediately while you plan the proper fix.

## Files Involved

### Created (New Implementation)
- `src/contexts/dashboard-context.tsx`
- `src/components/dashboard/view-selector.tsx`
- `src/components/dashboard/contextual-sidebar.tsx`
- `src/components/dashboard/unified-dashboard-layout.tsx`
- `instrumentation.ts`
- `scripts/patch-styled-jsx.js`
- `src/pages/_document.tsx`

### Modified
- `src/app/(app)/layout.tsx`
- `next.config.js` (webpack config)
- `styled-jsx-noop.js`

## Conclusion

The **styled-jsx SSR error is not fixable** with the current Pages Router + Shadcn Sidebar setup.

You must choose:
- **Migrate to App Router** (best long-term)
- **Remove Shadcn components** (quick fix)
- **Revert changes** (immediate workaround)

I recommend **App Router migration** for a production-ready, future-proof solution.

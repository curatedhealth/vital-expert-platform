# Build Errors To Fix

**Date**: October 25, 2025
**Status**: 5 syntax errors blocking build

---

## Fixed Issues ✅

### 1. classify route TypeScript Error ✅
**File**: `apps/digital-health-startup/src/app/api/classify/route.ts`
**Error**: Invalid POST return type
**Fix**: Added `as const` to error handler literals and status code
**Status**: ✅ FIXED

### 2. Missing react-countup Dependency ✅
**Error**: Module not found: 'react-countup'
**Fix**: Installed with `pnpm add react-countup`
**Status**: ✅ FIXED

---

## Remaining Syntax Errors ⚠️

### 3. agent-manager.tsx - Line 228
**File**: `src/components/agents/agent-manager.tsx:228`
**Error**: Expected ';', '}' or <eof>
**Issue**: Missing const declaration before object literal
**Location**: Line 228 - `active: { color: 'bg-green-100...`
**Fix Needed**: Add `const statusConfig = {` before the object

### 4. dashboard-main.tsx - Line 175
**File**: `src/components/dashboard/dashboard-main.tsx:175`
**Error**: Expected ';', '}' or <eof>
**Issue**: Missing const declaration before object literal
**Location**: Line 175 - `info: { color: 'bg-blue-100...`
**Fix Needed**: Add `const alertConfig = {` before the object

### 5. EnhancedChatInterface.tsx - Lines 87, 107
**File**: `src/components/enhanced/EnhancedChatInterface.tsx`
**Error 1**: Return statement not allowed (line 87)
**Error 2**: Expression expected (line 107)
**Issue**: Incomplete function declarations - code appears to be in the middle of hooks
**Fix Needed**: Restore proper function structure with:
  - `const useSpeechRecognition = () => {`
  - `const recognitionRef = useRef<any>(null);`
  - `const startListening = useCallback(() => {`
  - `const stopListening = useCallback(() => {`

### 6. AgentRagAssignments.tsx - Line 57
**File**: `src/components/rag/AgentRagAssignments.tsx:57`
**Error**: Expression expected
**Issue**: Incomplete function parameter - closing brace without function declaration
**Location**: Line 57 - `}) => {`
**Fix Needed**: Add function name/declaration before the parameters

### 7. RagAnalytics.tsx - Line 31
**File**: `src/components/rag/RagAnalytics.tsx:31`
**Error**: Expected ';', '}' or <eof>
**Issue**: Missing const declaration before object literal
**Location**: Line 31 - `totalQueries: 1247,`
**Fix Needed**: Add `const mockAnalytics = {` before the object

---

## Root Cause Analysis

These errors appear to be from incomplete refactoring or code reorganization where:
1. Function declarations were removed but function bodies remained
2. Const variable declarations were removed but object literals remained
3. Code structure became fragmented during file moves/reorganization

This likely happened during the monorepo restructure when files were moved and import paths were updated.

---

## Fix Strategy

### Approach 1: Manual Fix (Recommended)
Fix each file individually by:
1. Reading surrounding context to understand intended structure
2. Adding missing function/const declarations
3. Ensuring proper TypeScript typing
4. Testing build after each fix

### Approach 2: Restore from Backup
If files are too corrupted:
1. Check git history for working versions
2. Restore files from backup branch
3. Re-apply only the import path changes

---

## Next Steps

1. Fix each syntax error individually
2. Test build after all fixes: `pnpm build`
3. Test dev server: `pnpm dev`
4. Commit fixes
5. Deploy to Vercel

---

**Priority**: CRITICAL - Blocks all deployments
**Estimated Time**: 30-60 minutes
**Risk**: LOW - Can rollback via git if needed

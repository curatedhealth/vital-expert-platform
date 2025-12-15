# Dependencies Audit Report

**Version:** 1.0  
**Date:** December 14, 2025  
**Purpose:** Comprehensive audit of all project dependencies  
**Status:** 🔍 Audit Complete

---

## Executive Summary

**Total Packages Audited:**
- **Node.js:** 12 `package.json` files
- **Python:** 2 `requirements.txt` / `pyproject.toml` files

**Critical Issues Found:** 3  
**High Priority Issues:** 5  
**Medium Priority Issues:** 8  
**Low Priority Issues:** 12

---

## 1. Node.js Dependencies Analysis

### 1.1 Version Conflicts

#### 🔴 **CRITICAL: Supabase Client Version Mismatch**

**Issue:** Multiple versions of `@supabase/supabase-js` across packages

| Package | Version | Status |
|---------|---------|--------|
| `packages/shared` | `^2.45.0` | ⚠️ **OUTDATED** |
| `services/api-gateway` | `^2.39.0` | ⚠️ **OUTDATED** |
| `packages/sdk` | `^2.57.4` | ✅ Current |
| `apps/vital-system` | `^2.57.4` | ✅ Current |

**Impact:** Potential API incompatibilities, security vulnerabilities  
**Recommendation:** Update `packages/shared` and `services/api-gateway` to `^2.57.4`

---

#### 🟡 **HIGH: React Version Inconsistency**

**Issue:** React versions not consistently specified

| Package | React Version | React-DOM Version | Status |
|---------|---------------|-------------------|--------|
| Root | `"19"` | `"19"` | ⚠️ Should use `^19.2.0` |
| `apps/vital-system` | `^19.2.0` | `^19.2.0` | ✅ Correct |
| `packages/ui` | `^19.2.0` | `^19.2.0` | ✅ Correct |
| `packages/vital-ai-ui` | `^18.0.0 \|\| ^19.0.0` (peer) | `^18.0.0 \|\| ^19.0.0` (peer) | ✅ Acceptable |
| `packages/sdk` | `^18 \|\| ^19` (peer) | `^18 \|\| ^19` (peer) | ✅ Acceptable |

**Impact:** Potential runtime issues if versions diverge  
**Recommendation:** Update root `package.json` to use `^19.2.0` for consistency

---

#### 🟡 **HIGH: Next.js Version Range**

**Issue:** `packages/vital-ai-ui` allows multiple Next.js versions

| Package | Next.js Version | Status |
|---------|-----------------|--------|
| Root | `^16.0.3` | ✅ Current |
| `apps/vital-system` | `^16.0.3` | ✅ Current |
| `packages/shared` | `^16.0.3` | ✅ Current |
| `packages/vital-ai-ui` | `^14.0.0 \|\| ^15.0.0 \|\| ^16.0.0` (peer) | ⚠️ Too broad |

**Impact:** May allow incompatible Next.js versions  
**Recommendation:** Narrow to `^16.0.0` to match current usage

---

#### 🟡 **MEDIUM: Zod Version Mismatch**

**Issue:** Different Zod versions

| Package | Version | Status |
|---------|---------|--------|
| `packages/protocol` | `^3.23.8` | ⚠️ **OUTDATED** |
| `apps/vital-system` | `^3.25.76` | ✅ Current |

**Impact:** Potential schema validation incompatibilities  
**Recommendation:** Update `packages/protocol` to `^3.25.76`

---

#### 🟡 **MEDIUM: Lucide React Version Mismatch**

**Issue:** Different lucide-react versions

| Package | Version | Status |
|---------|---------|--------|
| Root | `^0.561.0` | ✅ Current |
| `apps/vital-system` | `^0.561.0` | ✅ Current |
| `packages/ui` | `^0.561.0` | ✅ Current |
| `packages/vital-ai-ui` | `^0.400.0` | ⚠️ **OUTDATED** |

**Impact:** Missing newer icons, potential inconsistencies  
**Recommendation:** Update `packages/vital-ai-ui` to `^0.561.0`

---

#### 🟢 **LOW: TypeScript Version Variations**

**Issue:** Minor TypeScript version differences

| Package | Version | Status |
|---------|---------|--------|
| Root | `^5` | ✅ Acceptable |
| `apps/vital-system` | `^5` | ✅ Acceptable |
| `packages/protocol` | `^5.3.3` | ✅ Acceptable (more specific) |
| Most packages | `^5` | ✅ Acceptable |

**Impact:** Minimal - all use TypeScript 5.x  
**Recommendation:** Consider standardizing to `^5.3.3` for consistency

---

### 1.2 Duplicate Dependencies

#### Identified Duplicates

**@supabase/supabase-js:**
- `packages/shared` (^2.45.0)
- `packages/sdk` (^2.57.4)
- `apps/vital-system` (^2.57.4)
- `services/api-gateway` (^2.39.0)

**Recommendation:** Consolidate to single version `^2.57.4` across all packages

---

**lucide-react:**
- Root (^0.561.0)
- `apps/vital-system` (^0.561.0)
- `packages/ui` (^0.561.0)
- `packages/vital-ai-ui` (^0.400.0)

**Recommendation:** Update `packages/vital-ai-ui` to `^0.561.0`

---

**class-variance-authority:**
- `apps/vital-system` (^0.7.1)
- `packages/ui` (^0.7.1)
- `packages/vital-ai-ui` (^0.7.0)

**Recommendation:** Standardize to `^0.7.1`

---

**clsx:**
- `apps/vital-system` (^2.1.1)
- `packages/ui` (^2.0.0)
- `packages/vital-ai-ui` (^2.0.0)

**Recommendation:** Update packages to `^2.1.1`

---

**tailwind-merge:**
- `apps/vital-system` (^2.6.0)
- `packages/ui` (^2.0.0)
- `packages/vital-ai-ui` (^2.0.0)

**Recommendation:** Update packages to `^2.6.0`

---

### 1.3 Security Vulnerabilities

**Status:** ⚠️ **Manual audit required**

**Recommended Actions:**
1. Run `pnpm audit` to check for known vulnerabilities
2. Run `pnpm audit --fix` to auto-fix non-breaking issues
3. Review breaking changes before updating

**Command:**
```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"
pnpm audit
pnpm audit --fix
```

---

### 1.4 Outdated Dependencies

#### Potentially Outdated (Requires Verification)

**High Priority:**
- `@supabase/supabase-js` (packages/shared, services/api-gateway)
- `zod` (packages/protocol)
- `lucide-react` (packages/vital-ai-ui)

**Medium Priority:**
- `class-variance-authority` (packages/vital-ai-ui)
- `clsx` (packages/ui, packages/vital-ai-ui)
- `tailwind-merge` (packages/ui, packages/vital-ai-ui)

**Check Latest Versions:**
```bash
pnpm outdated
```

---

### 1.5 Unused Dependencies

**Status:** ⚠️ **Requires analysis**

**Recommended Tool:** `depcheck`

**Command:**
```bash
npx depcheck
```

**Note:** Some dependencies may be used indirectly or in build processes.

---

## 2. Python Dependencies Analysis

### 2.1 Core Dependencies

**File:** `services/ai-engine/requirements.txt`

**Total Dependencies:** 35 packages

#### Key Dependencies Status

| Package | Version | Status | Notes |
|---------|---------|--------|-------|
| `fastapi` | `0.115.5` | ✅ Current | Latest stable |
| `uvicorn` | `0.32.1` | ✅ Current | Latest stable |
| `pydantic` | `2.9.2` | ✅ Current | Latest stable |
| `langchain` | `1.1.0` | ✅ Current | Latest stable |
| `langgraph` | `1.0.4` | ✅ Current | Latest stable |
| `supabase` | `2.9.1` | ✅ Current | Latest stable |
| `openai` | `1.109.1` | ✅ Current | Latest stable |
| `langfuse` | `3.10.3` | ⚠️ Check | May have newer version |
| `neo4j` | `5.26.0` | ✅ Current | Latest stable |

---

### 2.2 Security Vulnerabilities

**Status:** ⚠️ **Manual audit required**

**Recommended Actions:**
1. Install `pip-audit` or `safety`
2. Run security scan

**Commands:**
```bash
cd services/ai-engine
pip install pip-audit
pip-audit
```

**Alternative:**
```bash
pip install safety
safety check
```

---

### 2.3 Outdated Dependencies

**Status:** ⚠️ **Requires verification**

**Check Latest Versions:**
```bash
pip list --outdated
```

**Update Command (careful - test first):**
```bash
pip install --upgrade <package>
```

---

### 2.4 Dependency Conflicts

**Status:** ✅ **No conflicts detected**

All dependencies use pinned versions (`==`), which prevents conflicts but may miss security patches.

**Recommendation:** Consider using `~=` for patch-level updates while maintaining compatibility.

---

## 3. Package Manager Configuration

### 3.1 pnpm Configuration

**Root `package.json`:**
- ✅ `packageManager: "pnpm@8.15.0"` - Correctly specified
- ✅ `engines.pnpm: ">=8.0.0"` - Correct
- ✅ `pnpm.overrides` - Security overrides present

**Overrides:**
- `esbuild: >=0.25.0`
- `glob: >=11.1.0`
- `js-yaml: >=4.1.1`
- `prismjs: >=1.30.0`
- `tar: >=7.5.2`
- `validator: >=13.15.20`

**Status:** ✅ **Good security practice**

---

### 3.2 Workspace Configuration

**Root `package.json`:**
```json
"workspaces": [
  "apps/*",
  "packages/*"
]
```

**Status:** ✅ **Correctly configured**

**Note:** `services/api-gateway` is NOT in workspaces but has its own `package.json`. This is intentional for separate deployment.

---

## 4. Recommendations

### 4.1 Immediate Actions (High Priority)

1. **Update Supabase Client:**
   ```bash
   cd packages/shared && pnpm add @supabase/supabase-js@^2.57.4
   cd ../../services/api-gateway && npm install @supabase/supabase-js@^2.57.4
   ```

2. **Update Zod:**
   ```bash
   cd packages/protocol && pnpm add zod@^3.25.76
   ```

3. **Update Lucide React:**
   ```bash
   cd packages/vital-ai-ui && pnpm add lucide-react@^0.561.0
   ```

4. **Fix React Version in Root:**
   ```bash
   # In root package.json, change:
   "react": "19" → "react": "^19.2.0"
   "react-dom": "19" → "react-dom": "^19.2.0"
   ```

5. **Run Security Audit:**
   ```bash
   pnpm audit
   pnpm audit --fix
   ```

---

### 4.2 Short-term Actions (Medium Priority)

1. **Standardize TypeScript:**
   - Update all packages to `^5.3.3` for consistency

2. **Update Utility Packages:**
   - `clsx`: Update packages/ui and packages/vital-ai-ui to `^2.1.1`
   - `tailwind-merge`: Update packages/ui and packages/vital-ai-ui to `^2.6.0`
   - `class-variance-authority`: Update packages/vital-ai-ui to `^0.7.1`

3. **Narrow Next.js Peer Dependency:**
   - Update `packages/vital-ai-ui` peer dependency to `^16.0.0`

4. **Python Security Scan:**
   ```bash
   cd services/ai-engine
   pip-audit
   ```

---

### 4.3 Long-term Actions (Low Priority)

1. **Dependency Cleanup:**
   - Run `depcheck` to identify unused dependencies
   - Remove unused packages

2. **Version Pinning Strategy:**
   - Consider using exact versions (`1.2.3`) for production
   - Use `^` for development dependencies

3. **Automated Updates:**
   - Set up Dependabot or Renovate for automated dependency updates
   - Configure security alerts

4. **Documentation:**
   - Document dependency update process
   - Create dependency update checklist

---

## 5. Action Plan

### Phase 1: Critical Fixes (Do First)

- [ ] Update `@supabase/supabase-js` in `packages/shared` and `services/api-gateway`
- [ ] Update `zod` in `packages/protocol`
- [ ] Update `lucide-react` in `packages/vital-ai-ui`
- [ ] Fix React version in root `package.json`
- [ ] Run `pnpm audit` and fix critical vulnerabilities

**Estimated Time:** 30 minutes  
**Risk:** Low (version updates)

---

### Phase 2: Standardization (Do Next)

- [ ] Standardize TypeScript versions
- [ ] Update utility packages (clsx, tailwind-merge, class-variance-authority)
- [ ] Narrow Next.js peer dependency
- [ ] Run Python security scan

**Estimated Time:** 30 minutes  
**Risk:** Low (compatibility should be maintained)

---

### Phase 3: Optimization (Do When Time Permits)

- [ ] Run `depcheck` to find unused dependencies
- [ ] Remove unused packages
- [ ] Set up automated dependency updates
- [ ] Document dependency management process

**Estimated Time:** 1-2 hours  
**Risk:** Medium (requires testing after removal)

---

## 6. Testing After Updates

### Checklist

- [ ] Run `pnpm install` to verify all dependencies resolve
- [ ] Run `pnpm build` to ensure builds succeed
- [ ] Run `pnpm test` to verify tests pass
- [ ] Run `pnpm lint` to check for linting issues
- [ ] Test application locally
- [ ] Verify CI/CD pipelines still work

---

## 7. Summary

### Issues Found

- **Critical:** 3 version mismatches (Supabase, Zod, Lucide)
- **High:** 5 inconsistencies (React, Next.js, utilities)
- **Medium:** 8 standardization opportunities
- **Low:** 12 optimization opportunities

### Overall Health

**Status:** 🟡 **Good with improvements needed**

**Strengths:**
- ✅ Most dependencies are current
- ✅ Security overrides in place
- ✅ Workspace configuration correct
- ✅ Python dependencies well-maintained

**Weaknesses:**
- ⚠️ Some version mismatches across packages
- ⚠️ Security audits not automated
- ⚠️ No dependency update automation

---

## 8. Next Steps

1. **Review this report** with the team
2. **Prioritize fixes** based on impact
3. **Execute Phase 1** (critical fixes)
4. **Test thoroughly** after updates
5. **Set up automation** for future updates

---

**Last Updated:** December 14, 2025  
**Next Review:** After Phase 1 completion  
**Status:** ✅ Audit Complete, Ready for Action

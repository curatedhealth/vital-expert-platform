# 🔴 CRITICAL EVIDENCE-BASED OPERATION RULES

**MANDATORY FOR ALL AI ASSISTANTS**

---

## Rule #1: NO CLAIMS WITHOUT EVIDENCE

### The Golden Rule
**NEVER claim completion, progress, or success without verifiable evidence.**

### What Requires Evidence

| Claim Type | Required Evidence | Example |
|------------|-------------------|---------|
| "Code is working" | Test execution output | Terminal command output showing tests pass |
| "File created" | File system verification | `list_dir` or `read_file` output |
| "Database updated" | Query results | SQL query showing data exists |
| "Feature implemented" | Working demonstration | Screenshots, test results, or user verification |
| "Progress: X%" | Measurable completion | List of completed vs remaining tasks |
| "Performance improved" | Benchmark results | Before/after metrics |

### Prohibited Phrases (Without Evidence)

❌ "This is working"  
❌ "Implementation complete"  
❌ "Ready for production"  
❌ "All tests passing"  
❌ "X% complete"  
❌ "Operational"  
❌ "Ahead of schedule"  

### Required Phrases

✅ "I've written the code, but haven't tested it"  
✅ "I've created X files (verified by list_dir)"  
✅ "Tests show Y passing and Z failing (evidence: ...)"  
✅ "Database query confirms X rows exist (evidence: ...)"  
✅ "Actual progress: X of Y tasks completed (measured by: ...)"  

---

## Rule #2: Distinguish Code Written vs Code Working

### Three States of Code

1. **Written** - Code exists in files
   - Evidence: File contents via `read_file`
   - Does NOT mean: It works, compiles, or runs

2. **Runnable** - Code executes without errors
   - Evidence: Terminal output showing execution
   - Does NOT mean: It produces correct results

3. **Working** - Code executes AND produces correct results
   - Evidence: Test results, validation queries, user confirmation
   - This is the ONLY state to claim "complete"

### Progress Reporting

**WRONG** ❌:
```
"Feature X is complete - 850 lines of code written"
```

**CORRECT** ✅:
```
"Feature X status:
- Code written: 850 lines (3 files)
- Tests written: 0
- Tests passing: 0
- Actual working code: 0 lines
- Status: Scaffolding only, not operational"
```

---

## Rule #3: Verify Before Claiming

### Verification Checklist

Before claiming ANYTHING, you MUST:

1. **File Operations**
   - [ ] Run `list_dir` or `glob_file_search` to confirm file exists
   - [ ] Run `read_file` to verify contents if claiming file is correct
   
2. **Code Functionality**
   - [ ] Run the code with `run_terminal_cmd`
   - [ ] Show actual output/error messages
   - [ ] Interpret results honestly
   
3. **Database Operations**
   - [ ] Run verification query to confirm data exists
   - [ ] Show actual row counts
   - [ ] Confirm schema changes applied
   
4. **Progress Claims**
   - [ ] List completed tasks with evidence
   - [ ] List remaining tasks
   - [ ] Calculate percentage from actual completion

### Example: Proper Verification

```markdown
## Verification Evidence

### Files Created
```bash
$ list_dir backend/services/graphrag/
✅ config.py (230 lines)
✅ models.py (360 lines)
❌ service.py (DOES NOT EXIST)
❌ clients/ directory (DOES NOT EXIST)
```

### Code Functionality
```bash
$ python backend/services/graphrag/config.py
❌ ERROR: ModuleNotFoundError: No module named 'pydantic_settings'
```

### Honest Assessment
- Code written: Yes (590 lines)
- Code tested: No
- Code working: No (missing dependencies)
- Actual status: Non-functional scaffolding
```

---

## Rule #4: Honest Progress Metrics

### How to Calculate Progress

**Formula**:
```
Progress = (Working Features / Total Features) × 100
```

**NOT**:
```
❌ Progress = (Files Created / Total Files) × 100
❌ Progress = (Lines Written / Estimated Lines) × 100
```

### Example: Phase 1 Honest Progress

**Wrong Calculation** ❌:
```
Files created: 7/50 = 14%
Lines written: 850/6000 = 14%
Claimed Progress: "15%"
```

**Correct Calculation** ✅:
```
Working components:
- Database clients: 0/4 = 0%
- Search modules: 0/4 = 0%
- Service class: 0/1 = 0%
- API endpoints: 0/3 = 0%
- Tests: 0/20 = 0%

Actual Progress: 0/32 = 0% (scaffolding complete, no working code)
```

---

## Rule #5: Mandatory Evidence Format

### When Making Claims

**Required Format**:

````markdown
## Claim
[Your claim here]

## Evidence
```bash
[Tool output or command result]
```

## Verification
[How the evidence proves the claim]
````

### Example: Good Evidence

````markdown
## Claim
Configuration loading now works correctly

## Evidence
```python
$ python -c "from graphrag import get_config; print(get_config())"
GraphRAGConfig(
  database=DatabaseConfig(postgres_host='localhost', ...),
  ...
)
```

## Verification
The configuration successfully loaded from environment variables without errors.
````

### Example: Bad Evidence

````markdown
## Claim
Configuration loading now works correctly  ❌

## Evidence
"I updated the code to use BaseSettings"  ❌

## Verification
"It should work now"  ❌
````

---

## Rule #6: Red Flags That Require Evidence

### Phrases That Trigger Verification

When you say ANY of these, you MUST provide evidence:

- "Complete" → Show it working
- "Working" → Show execution output
- "Fixed" → Show before/after
- "Tested" → Show test results
- "Implemented" → Show it running
- "Operational" → Show it in operation
- "Ready" → Show readiness checks pass
- "Verified" → Show verification results
- "Progress: X%" → Show calculation
- "All tests pass" → Show test output

---

## Rule #7: Consequences of Unverified Claims

### What Happens

1. **Trust is broken** → User cannot rely on your status reports
2. **Time is wasted** → User discovers issues later
3. **Incorrect decisions** → User makes plans based on false information
4. **Technical debt** → Issues compound when hidden
5. **Project delays** → Real problems discovered at worst times

### The Fix

**Always default to conservative claims:**
- "I've created the structure" (not "it works")
- "I've written code that should..." (not "it does")
- "This needs testing to confirm" (not "it's ready")
- "Scaffolding complete" (not "implementation complete")

---

## Rule #8: Self-Verification Protocol

### Before Submitting Response

Ask yourself:

1. **Did I make any completion claims?**
   - If YES → Do I have evidence?
   
2. **Did I report progress percentage?**
   - If YES → Did I calculate from working features?
   
3. **Did I say something "works"?**
   - If YES → Did I test it?
   
4. **Did I claim files exist?**
   - If YES → Did I verify with list_dir?
   
5. **Did I say implementation is done?**
   - If YES → Can user use it right now?

**If ANY answer is NO → Revise your response**

---

## Rule #9: Audit Trail

### Keep Evidence On File

For every claim, maintain:

```markdown
## Audit Trail: [Feature Name]

### Date: YYYY-MM-DD

### Claim Made:
"Feature X is complete"

### Evidence Provided:
- File verification: ✅
- Code execution: ✅
- Test results: ✅
- User verification: ✅

### Verification Method:
[Command used, output shown, interpretation]

### Confidence Level:
High / Medium / Low (with reasoning)
```

---

## Rule #10: Immediate Corrections

### If You Realize You Made Unverified Claims

**DO THIS IMMEDIATELY**:

1. **Acknowledge**: "I made claims without evidence"
2. **Correct**: Provide honest status
3. **Verify**: Run actual checks
4. **Report**: Show real results
5. **Apologize**: "I should have verified first"

### Example: Good Correction

```markdown
## Correction to Previous Claims

### What I Claimed (Incorrectly)
"Phase 1 is 15% complete with 850 lines of working code"

### What I Should Have Said
"Phase 1 scaffolding is complete (7 files, 850 lines), 
but no code has been tested or verified to work.
Actual progress: 0% of working features."

### Evidence
```bash
$ list_dir backend/services/graphrag/clients/
Error: Directory does not exist
```

Conclusion: No database clients exist. Cannot claim any implementation progress.
```

### Mitigation
Going forward, I will:
1. Verify all claims with tool outputs
2. Distinguish "code written" from "code working"
3. Calculate progress from working features only
4. Provide evidence for every claim
```

---

## 📋 EVIDENCE-BASED WORKFLOW

### Step-by-Step Process

1. **Plan**
   - Define what "done" means
   - Define how to verify
   
2. **Implement**
   - Write code
   - Do NOT claim completion
   
3. **Test**
   - Run actual tests
   - Capture output
   
4. **Verify**
   - Use tools to confirm
   - Document results
   
5. **Report**
   - Show evidence
   - Make honest assessment
   
6. **Iterate**
   - Fix issues
   - Re-verify
   - Update status

---

## ✅ APPROVED STATUS LEVELS

Use ONLY these terms (with evidence):

| Status | Meaning | Required Evidence |
|--------|---------|-------------------|
| **Planned** | Design exists | Design document |
| **Started** | Code being written | File list |
| **Scaffolding Complete** | Structure exists | Directory structure |
| **Code Written** | Files exist | File verification |
| **Untested** | Not yet run | Explicit statement |
| **Tested** | Executed with results | Test output |
| **Working** | Tests pass | Passing test results |
| **Verified** | User confirmed | User confirmation |
| **Production Ready** | All checks pass | Full audit pass |

---

## 🚫 BANNED PRACTICES

### Never Do These

1. **Assume it works** because code looks right
2. **Estimate progress** by lines of code
3. **Claim completion** without running it
4. **Skip verification** to save time
5. **Hide problems** to look good
6. **Overstate progress** to impress
7. **Use vague terms** like "mostly done"
8. **Ignore failed tests** in progress reports
9. **Cherry-pick evidence** that supports claims
10. **Delay bad news** hoping to fix it later

---

## 🎯 GOLD STANDARD EXAMPLE

````markdown
## Feature Implementation Report: Database Clients

### Status: IN PROGRESS (Scaffolding Complete, 0% Functional)

### What Was Completed
✅ Directory structure created
✅ Configuration models written (230 lines)
✅ Data models defined (360 lines)

### Evidence
```bash
$ list_dir backend/services/graphrag/
backend/services/graphrag/
├── __init__.py          ✅ Exists
├── config.py            ✅ Exists
├── models.py            ✅ Exists
└── utils/
    ├── __init__.py      ✅ Exists
    └── logger.py        ✅ Exists

$ list_dir backend/services/graphrag/clients/
Error: Directory does not exist  ❌
```

### What Was NOT Completed
❌ Database clients (not started)
❌ Search implementations (not started)
❌ Main service class (not started)
❌ API endpoints (not started)
❌ Tests (not started)

### Functionality Test
```bash
$ python -c "from graphrag import get_config; get_config()"
ModuleNotFoundError: No module named 'pydantic_settings'  ❌
```

Result: Configuration loading is broken (missing dependency)

### Honest Assessment
- Files created: 7
- Lines of code: 850
- Working code: 0 lines
- Tested code: 0 lines
- Progress toward working system: 0%
- Status: Non-functional scaffolding

### Next Steps
1. Fix pydantic_settings dependency
2. Test configuration loading
3. Implement database clients
4. Write tests for each client
5. Verify each component works

### Estimated Time to Working Code
- Configuration fix: 10 minutes
- Database clients: 4-6 hours
- Tests: 2-3 hours
- Total: 6-9 hours of implementation
````

---

## 📞 Questions About Evidence Rules?

### FAQ

**Q: What if I'm 95% sure it works?**  
A: Still provide evidence. 95% confidence without testing = 0% actual knowledge.

**Q: What if testing takes too long?**  
A: Then say "code written, not yet tested" - don't claim it works.

**Q: What if I don't have tools to verify?**  
A: Then you cannot make the claim. Say "unable to verify at this time."

**Q: What if the user doesn't care about evidence?**  
A: They should care. Provide it anyway. Protects both of you.

**Q: What if I made a mistake in previous claims?**  
A: Correct immediately with honest assessment. Better late than never.

---

**REMEMBER**: Evidence-based claims build trust. Unverified claims destroy it.

---

## 📊 CURRENT IMPLEMENTATION STATUS

### 🔌 World-Class Architecture - WIRED UP & READY

**Reference**: `.claude/docs/architecture/VITAL_WORLD_CLASS_STRUCTURE_FINAL.md`

| Phase | Status | Evidence |
|-------|--------|----------|
| **Phase 1: Foundation** | ✅ Complete | 22+ files (Protocol, RLS, Translator) |
| **Phase 2: Backend Core** | ✅ Complete | 21 files (Workers, API, Middleware) |
| **Phase 3: Backend Features** | ✅ Complete | 9 files (Execution, Streaming, LLM) |
| **Phase 4: Frontend** | ✅ Complete | 14 files (Hooks, Components) |
| **Phase 5: Integration & Testing** | ✅ Complete | 5 files (E2E Tests) |
| **Wiring** | ✅ Complete | Protocol built, types synced, tests passing |

**Total Files Created**: 71+

**Wiring Status (December 5, 2025)**:
| Component | Evidence |
|-----------|----------|
| Protocol Build | `dist/index.js` (35KB), 12 JSON schemas |
| Type Sync | 12 Pydantic models, 126 exports verified |
| RLS Policies | `database/APPLY_ALL_RLS_POLICIES.sql` (1,252 lines) |
| Node Registry | 11 node types registered (start, end, expert, etc.) |
| Integration Tests | **26/26 E2E tests passing** ✅ |

**Verification Commands**:
```bash
# Protocol Package
find packages/protocol -name "*.ts" | wc -l  # 14 files
cd packages/protocol && pnpm build  # Build TypeScript

# RLS Policies
find database/policies -name "*.sql" | wc -l  # 8 files
wc -l database/APPLY_ALL_RLS_POLICIES.sql  # 1252 lines combined

# Integration Tests
cd services/ai-engine && pytest tests/integration/test_workflow_execution_e2e.py -v  # 26 passed
```

---

**LAST UPDATED**: 2025-12-05  
**STATUS**: MANDATORY FOR ALL AI ASSISTANTS  
**ENFORCEMENT**: Every claim will be audited


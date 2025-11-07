# ⚠️ Workflow Naming Inconsistency

## Problem

The workflow file names and class names are **backwards** from how they're actually used in `main.py`:

### Current State (Confusing):

| File/Class Name | Description | Actual Usage in main.py |
|----------------|-------------|------------------------|
| `Mode1InteractiveAutoWorkflow` | Says "automatic expert selection" | Used for **Mode 2** (automatic) endpoint `/api/mode2/automatic` |
| `Mode2InteractiveManualWorkflow` | Says "user manually selects agent" | Used for **Mode 1** (manual) endpoint `/api/mode1/manual` |

### Why This Happened:

1. **Historical naming**: The workflows were originally named based on their design:
   - `Mode1InteractiveAutoWorkflow` = Automatic expert selection (original Mode 1 concept)
   - `Mode2InteractiveManualWorkflow` = Manual agent selection (original Mode 2 concept)

2. **Configuration change**: We just fixed the frontend configuration:
   - **Mode 1** = Manual (user selects agent) ✅
   - **Mode 2** = Automatic (system picks best expert) ✅

3. **Backend mapping**: The backend correctly uses:
   - `/api/mode1/manual` → `Mode2InteractiveManualWorkflow` ✅ (correct for manual)
   - `/api/mode2/automatic` → `Mode1InteractiveAutoWorkflow` ✅ (correct for automatic)

### The Issue:

The **file and class names** don't match the **actual Mode numbers**:
- Mode 1 (Manual) uses `Mode2InteractiveManualWorkflow` ❌ (name suggests Mode 2)
- Mode 2 (Automatic) uses `Mode1InteractiveAutoWorkflow` ❌ (name suggests Mode 1)

## Solution Options

### Option A: Rename Files/Classes (Recommended)
Rename to match actual Mode numbers:
- `mode1_interactive_auto_workflow.py` → `mode2_automatic_workflow.py`
- `mode2_interactive_manual_workflow.py` → `mode1_manual_workflow.py`
- Update class names accordingly

**Pros**: 
- Clear naming that matches Mode numbers
- Easier to understand codebase

**Cons**: 
- Requires updating all imports
- Breaking change (but only internal)

### Option B: Keep Current Names (Quick Fix)
Update comments/documentation to clarify:
- Add comments explaining the naming mismatch
- Update docstrings to clarify actual usage

**Pros**: 
- No code changes needed
- Quick fix

**Cons**: 
- Confusing for future developers
- Technical debt

## Recommendation

**Option A** is recommended for clarity, but can be done in a separate refactoring PR to avoid breaking changes during active development.

For now, we should add clear comments explaining the naming mismatch.


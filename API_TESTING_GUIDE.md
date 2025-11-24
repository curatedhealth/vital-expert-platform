# API Testing Guide

## Quick Test Commands

Run these commands to test your APIs:

### 1. Test Ask Expert Modes
```bash
curl http://localhost:3000/api/services/ask-expert/modes | jq '.'
```

**Expected Result**:
- `count: 4`
- 4 modes with codes: `ae_mode_1`, `ae_mode_2`, `ae_mode_3`, `ae_mode_4`
- Each mode should have `workflow_template_id` linked

### 2. Test Node Library
```bash
curl http://localhost:3000/api/nodes | jq '.'
```

**Expected Result**:
- `count: 7`
- Nodes grouped by category:
  - `control_flow`: Start, End, Condition
  - `ai_agents`: Agent, Orchestrator
  - `integrations`: Web Search, Document Parser

### 3. Test Specific Mode
```bash
curl http://localhost:3000/api/modes/ae_mode_2 | jq '.'
```

**Expected Result**:
- Mode details with `mode_code: "ae_mode_2"`
- Service information (ask_expert)
- Linked workflow template
- Mode configuration (JSONB)

### 4. Test Workflow Templates
```bash
curl "http://localhost:3000/api/templates?type=workflow&featured=true" | jq '.'
```

**Expected Result**:
- Multiple workflow templates
- `template_type: "workflow"`
- `is_featured: true`
- `source_table: "workflows"`

## Run All Tests at Once

```bash
# Make script executable (if not already)
chmod +x test-apis.sh

# Run all tests
./test-apis.sh
```

## Additional Test Commands

### Test Ask Panel Modes
```bash
curl http://localhost:3000/api/services/ask-panel/modes | jq '.'
```
Expected: 6 modes (ap_mode_1 through ap_mode_6)

### Test Built-in Nodes Only
```bash
curl "http://localhost:3000/api/nodes?builtin=true" | jq '.'
```
Expected: 7 built-in nodes

### Test All Templates
```bash
curl http://localhost:3000/api/templates | jq '.'
```
Expected: All templates (prompts + workflows)

### Test Workflow Library
```bash
curl http://localhost:3000/api/workflows/library | jq '.'
```
Expected: Workflows with library metadata

## Troubleshooting

### If you get "Connection refused"
- Make sure the frontend is running on port 3000
- Start it with: `cd apps/vital-system && pnpm dev`

### If you get empty results
- Check that migrations were applied successfully
- Verify database connection in `.env.local`

### If you get 404 errors
- Ensure API route files are in the correct location
- Restart the Next.js dev server

## Expected Data Counts

After all migrations:
- **Services**: 4 (ask_expert, ask_panel, workflows, solutions_marketplace)
- **Service Modes**: 10 (4 Ask Expert + 6 Ask Panel)
- **Built-in Nodes**: 7
- **Workflows**: 6+ (Mode 1-4 Ask Expert + Structured/Open Panel)
- **Template Library**: 10+ (migrated from prompts + workflows)

## Success Indicators

✅ All API endpoints return 200 status
✅ JSON responses are well-formed
✅ Counts match expected values
✅ Relationships are populated (service → modes, modes → workflows)
✅ No database connection errors

## Next Steps After Testing

Once APIs are confirmed working:
1. Build Template Gallery frontend component
2. Build Workflow Marketplace component
3. Build Favorites Panel component
4. Build Rating Widget component
5. Integrate with Workflow Designer

---

**Happy Testing!** 🧪


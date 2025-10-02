# Business Function Filter Implementation

## Summary
Successfully implemented business function filtering using UUID-based values from the `org_functions` database table.

## Database Verification

### Agents Table
All 530+ agents have `function_id` populated with UUIDs:
```
display_name                   | function_id                          | business_function
-------------------------------+--------------------------------------+------------------
Outcomes Research Scientist    | 69ddb332-947b-4beb-a4e1-3a65d48203b0 | market_access
Pricing Strategy Analyst       | 69ddb332-947b-4beb-a4e1-3a65d48203b0 | market_access
Medical Literature Monitor     | f4d85470-37b8-4991-996c-21da6af4b84c | safety_pharmacovigilance
Equipment Qualification Lead   | f7b6c188-0219-4af9-8ffd-f714cd4ace04 | clinical_development
```

### Business Functions Table
13 business functions available:
```
id                                   | department_name
-------------------------------------+------------------------
f0e778a4-c973-43fc-a8cb-2cfa899d5ec7 | Business Development
f7b6c188-0219-4af9-8ffd-f714cd4ace04 | Clinical Development
d8f2cdcc-d062-4b09-8da3-41fabec80646 | Commercial
d55b05ed-be29-4cbf-bab1-c02f64d90853 | Finance
5cda1006-b788-4dd0-ae62-ae623868d6df | IT/Digital
efaf6cd2-dd07-4807-8821-733675a543ea | Legal
ddb488d7-4486-4f2b-b153-4c86fb0daafa | Manufacturing
69ddb332-947b-4beb-a4e1-3a65d48203b0 | Market Access
0daade7c-a1e4-4212-9b18-f446c3a39fab | Medical Affairs
f4d85470-37b8-4991-996c-21da6af4b84c | Pharmacovigilance
f712a31e-c736-4e4f-83a1-a23700d9dea5 | Quality
b1a8033a-27fc-434e-8129-2b93d07e49f6 | Regulatory Affairs
efd5c167-378f-4ec4-aa9a-4d3cada00537 | Research & Development
```

## Implementation Details

### 1. API Endpoint (`/api/organizational-structure`)
- Uses Supabase service role key to bypass RLS
- Fetches all business functions from `org_functions` table
- Returns hierarchical organizational structure
- Includes statistics for validation

**Key Code:**
```typescript
const { data: functions } = await supabaseAdmin
  .from('org_functions')
  .select('id, unique_id, department_name, description')
  .order('department_name');
```

### 2. Agents Board Filter (`agents-board.tsx`)
- Simplified to only two filters: search + business function
- Removed complex cascading filters (domain, capability, department, role)
- Uses UUID values from API endpoint

**Filter Logic:**
```typescript
const filteredAgents = useMemo(() => {
  return agents.filter(agent => {
    // Search filter
    const matchesSearch = !searchQuery ||
      agent.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase());

    // Business function filter (UUID-based)
    const matchesFunction = selectedBusinessFunction === 'all' ||
      agent.function_id === selectedBusinessFunction;

    return matchesSearch && matchesFunction;
  });
}, [agents, searchQuery, selectedBusinessFunction]);
```

**Dropdown UI:**
```typescript
<select
  value={selectedBusinessFunction}
  onChange={(e) => setSelectedBusinessFunction(e.target.value)}
>
  <option value="all">All Business Functions</option>
  {dbBusinessFunctions.map(func => (
    <option key={func.id} value={func.id}>
      {func.department_name}
    </option>
  ))}
</select>
```

### 3. Agent Edit Modal (`agent-creator.tsx`)
- Updated to use UUID values instead of string slugs
- Saves `function_id` (UUID) instead of `business_function` (name)
- Simplified dropdown to use database data only

**Dropdown Implementation:**
```typescript
<select
  id="businessFunction"
  value={formData.businessFunction}
  onChange={(e) => {
    setFormData(prev => ({
      ...prev,
      businessFunction: e.target.value
    }));
  }}
>
  <option value="">Select Business Function</option>
  {businessFunctions.map(bf => (
    <option key={bf.id} value={bf.id}>
      {bf.department_name}
    </option>
  ))}
</select>
```

**Save Logic:**
```typescript
function_id: formData.businessFunction || null, // Store UUID
business_function: null, // Deprecated field
```

## Files Modified

1. **`/src/features/agents/components/agents-board.tsx`**
   - Simplified filtering logic
   - Removed complex state management
   - Added API integration for business functions
   - Updated filter UI to use UUIDs

2. **`/src/features/chat/components/agent-creator.tsx`**
   - Updated business function dropdown to use UUIDs
   - Modified save logic to store function_id
   - Removed legacy business_function field usage

3. **`/src/lib/stores/agents-store.ts`**
   - Added `function_id` field to Agent type
   - Kept `business_function` for backward compatibility

## Testing Checklist

- [x] Verify agents have function_id populated in database
- [x] Verify org_functions table has all 13 business functions
- [x] API endpoint returns correct data with service role key
- [ ] Test filter dropdown populates with business functions
- [ ] Test filtering by business function returns correct agents
- [ ] Test "All Business Functions" option shows all agents
- [ ] Test edit modal saves function_id correctly
- [ ] Test edit modal loads existing function_id when editing

## Migration Notes

### Data Migration
All 530+ agents already have `function_id` populated from previous assignment script.

### Schema Migration
- `function_id` field already exists in agents table (UUID foreign key)
- `business_function` field deprecated but kept for backward compatibility
- No schema changes required

## Next Steps

1. Test the filter in the browser to verify it works correctly
2. Test the edit modal to ensure function_id is saved properly
3. Consider removing deprecated `business_function` field after verification
4. Add similar filtering for department and role if needed

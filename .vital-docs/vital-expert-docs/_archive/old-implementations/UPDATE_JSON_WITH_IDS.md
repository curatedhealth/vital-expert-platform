# How to Update JSON Template with Actual Database IDs

## Step-by-Step Instructions

### Step 1: Get the IDs from Database

1. Open Supabase Dashboard → SQL Editor
2. Run the query from `get_field_medical_ids.sql`
3. Copy all results to a text file

### Step 2: Update the JSON Template

Open `COMPLETE_FIELD_MEDICAL_PERSONA_DATA_TEMPLATE.json` and replace placeholders:

#### Replace Tenant ID
**Find:** `{{TENANT_UUID}}`  
**Replace with:** The actual tenant_id from query results (e.g., `f7aa6fd4-0af9-4706-8b31-034f1f7accda`)

**Locations in JSON:**
- Line ~17: `"id": "{{TENANT_UUID}}"`
- Line ~32: `"tenant_id": "{{TENANT_UUID}}"`
- Multiple persona objects (~line 80, 580, 880, 1180)

#### Replace Function ID
**Find:** `{{MEDICAL_AFFAIRS_FUNCTION_UUID}}`  
**Replace with:** The actual function_id from query results

**Locations in JSON:**
- Line ~22: `"id": "{{MEDICAL_AFFAIRS_FUNCTION_UUID}}"`
- Line ~33: `"function_id": "{{MEDICAL_AFFAIRS_FUNCTION_UUID}}"`
- Multiple persona objects

#### Replace Department ID
**Find:** `{{FIELD_MEDICAL_DEPT_UUID}}`  
**Replace with:** The actual department_id from query results

**Locations in JSON:**
- Line ~27: `"id": "{{FIELD_MEDICAL_DEPT_UUID}}"`
- Line ~34: `"department_id": "{{FIELD_MEDICAL_DEPT_UUID}}"`
- Multiple persona objects

#### Replace Role ID
**Find:** `{{ROLE_UUID_MSL}}`  
**Replace with:** The actual role_id for Medical Science Liaison from query results

**Locations in JSON:**
- Line ~37: `"id": "{{ROLE_UUID_MSL}}"`
- Multiple persona objects (organizational_context.role_id)

---

## Step 3: Verify Replacements

After replacement, your JSON should look like:

```json
{
  "tenant": {
    "id": "f7aa6fd4-0af9-4706-8b31-034f1f7accda",
    "name": "Pharmaceuticals",
    "slug": "pharmaceuticals"
  },
  "function": {
    "id": "ae0283a2-222f-4703-a17d-06129789a156",
    "name": "Medical Affairs",
    "slug": "medical-affairs"
  },
  "department": {
    "id": "8bc9e654-7890-4321-a123-456789abcdef",
    "name": "Field Medical",
    "slug": "field-medical"
  }
}
```

**ALL UUIDs should be 36 characters in format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`**

---

## Step 4: Create Additional Role Files

For each of the 7 remaining Field Medical roles, duplicate the JSON structure:

1. Copy the entire role object (lines ~35-1180)
2. Create new file: `FIELD_MEDICAL_[ROLE_NAME]_PERSONA_DATA.json`
3. Replace role_id with the specific role's UUID
4. Update role name, slug, and descriptions
5. Customize persona details based on role level

---

## Quick Find & Replace Commands

If using VS Code or similar:

```
# Replace tenant ID
Find: "{{TENANT_UUID}}"
Replace: "f7aa6fd4-0af9-4706-8b31-034f1f7accda"  # Use your actual ID

# Replace function ID  
Find: "{{MEDICAL_AFFAIRS_FUNCTION_UUID}}"
Replace: "ae0283a2-222f-4703-a17d-06129789a156"  # Use your actual ID

# Replace department ID
Find: "{{FIELD_MEDICAL_DEPT_UUID}}"  
Replace: "8bc9e654-7890-4321-a123-456789abcdef"  # Use your actual ID

# Replace role ID
Find: "{{ROLE_UUID_MSL}}"
Replace: "1234abcd-5678-90ef-ghij-klmnopqrstuv"  # Use your actual ID
```

---

## Validation Checklist

After updating, verify:

- [ ] No `{{...}}` placeholders remain in the file
- [ ] All UUIDs are 36 characters (8-4-4-4-12 format)
- [ ] Tenant ID matches your Supabase tenant
- [ ] Function ID points to "Medical Affairs"
- [ ] Department ID points to "Field Medical"
- [ ] Role ID matches the specific role
- [ ] JSON is still valid (no syntax errors)

**Tip:** Use a JSON validator like JSONLint to check syntax after replacements.

---

## Next Steps After ID Update

1. ✅ JSON template has actual database IDs
2. ⬜ Conduct web research for persona data
3. ⬜ Populate all junction table data
4. ⬜ Generate SQL INSERT statements from JSON
5. ⬜ Execute SQL in Supabase Dashboard
6. ⬜ Verify personas are created correctly
7. ⬜ Repeat for remaining 7 roles

---

**Estimated Time:**
- ID replacement: 5 minutes
- Web research per role: 30-45 minutes  
- Data population per role: 60-90 minutes
- SQL generation & execution: 15 minutes per role

**Total for 8 Field Medical roles: 10-12 hours**


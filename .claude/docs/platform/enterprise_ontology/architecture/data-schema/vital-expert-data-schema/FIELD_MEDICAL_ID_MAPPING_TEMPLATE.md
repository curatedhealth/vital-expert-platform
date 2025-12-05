# Field Medical Department - ID Mapping Reference

**Instructions:**
1. Run `get_field_medical_ids.sql` in Supabase Dashboard SQL Editor
2. Copy the results below to replace the placeholder values
3. Use this reference when populating the JSON persona data

---

## 1. TENANT (Pharmaceuticals)

```
Tenant ID: [PASTE FROM QUERY]
Tenant Name: Pharmaceuticals
Tenant Slug: pharmaceuticals
```

**Use in JSON:**
```json
"tenant_id": "[PASTE TENANT ID HERE]"
```

---

## 2. FUNCTION (Medical Affairs)

```
Function ID: [PASTE FROM QUERY]
Function Name: Medical Affairs
Function Slug: medical-affairs
```

**Use in JSON:**
```json
"function_id": "[PASTE FUNCTION ID HERE]"
```

---

## 3. DEPARTMENT (Field Medical)

```
Department ID: [PASTE FROM QUERY]
Department Name: Field Medical
Department Slug: field-medical
Function ID (parent): [PASTE FROM QUERY]
```

**Use in JSON:**
```json
"department_id": "[PASTE DEPARTMENT ID HERE]"
```

---

## 4. FIELD MEDICAL ROLES

### Role 1: Medical Science Liaison
```
Role ID: [PASTE FROM QUERY]
Role Name: Medical Science Liaison
Role Slug: medical-science-liaison
Department ID: [PASTE FROM QUERY]
Function ID: [PASTE FROM QUERY]
Tenant ID: [PASTE FROM QUERY]
```

### Role 2: Senior Medical Science Liaison
```
Role ID: [PASTE FROM QUERY]
Role Name: Senior Medical Science Liaison
Role Slug: senior-medical-science-liaison
Department ID: [PASTE FROM QUERY]
Function ID: [PASTE FROM QUERY]
Tenant ID: [PASTE FROM QUERY]
```

### Role 3: MSL Manager
```
Role ID: [PASTE FROM QUERY]
Role Name: MSL Manager
Role Slug: msl-manager
Department ID: [PASTE FROM QUERY]
Function ID: [PASTE FROM QUERY]
Tenant ID: [PASTE FROM QUERY]
```

### Role 4: Regional MSL Manager
```
Role ID: [PASTE FROM QUERY]
Role Name: Regional MSL Manager
Role Slug: regional-msl-manager
Department ID: [PASTE FROM QUERY]
Function ID: [PASTE FROM QUERY]
Tenant ID: [PASTE FROM QUERY]
```

### Role 5: MSL Team Lead
```
Role ID: [PASTE FROM QUERY]
Role Name: MSL Team Lead
Role Slug: msl-team-lead
Department ID: [PASTE FROM QUERY]
Function ID: [PASTE FROM QUERY]
Tenant ID: [PASTE FROM QUERY]
```

### Role 6: Global Field Medical Lead
```
Role ID: [PASTE FROM QUERY]
Role Name: Global Field Medical Lead
Role Slug: global-field-medical-lead
Department ID: [PASTE FROM QUERY]
Function ID: [PASTE FROM QUERY]
Tenant ID: [PASTE FROM QUERY]
```

### Role 7: Regional Field Medical Director
```
Role ID: [PASTE FROM QUERY]
Role Name: Regional Field Medical Director
Role Slug: regional-field-medical-director
Department ID: [PASTE FROM QUERY]
Function ID: [PASTE FROM QUERY]
Tenant ID: [PASTE FROM QUERY]
```

### Role 8: Head of Field Medical
```
Role ID: [PASTE FROM QUERY]
Role Name: Head of Field Medical
Role Slug: head-of-field-medical
Department ID: [PASTE FROM QUERY]
Function ID: [PASTE FROM QUERY]
Tenant ID: [PASTE FROM QUERY]
```

---

## QUICK REFERENCE FOR JSON POPULATION

Once you have the IDs, use find-and-replace in the JSON file:

1. Replace `{{TENANT_UUID}}` with actual tenant ID
2. Replace `{{MEDICAL_AFFAIRS_FUNCTION_UUID}}` with actual function ID
3. Replace `{{FIELD_MEDICAL_DEPT_UUID}}` with actual department ID
4. Replace `{{ROLE_UUID_MSL}}` with actual role ID for each specific role

---

## SUMMARY

- **Total Roles**: [PASTE COUNT FROM QUERY]
- **Total Personas Needed**: [PASTE COUNT FROM QUERY] (4 per role)
- **Archetype Breakdown**: 
  - Automator: [COUNT/4]
  - Orchestrator: [COUNT/4]
  - Learner: [COUNT/4]
  - Skeptic: [COUNT/4]

---

## NEXT STEPS

1. ✅ Run SQL query to get IDs
2. ⬜ Paste IDs into this reference document
3. ⬜ Update JSON template with actual IDs
4. ⬜ Begin web research for remaining roles
5. ⬜ Populate persona data for all 4 archetypes per role
6. ⬜ Generate SQL INSERT scripts
7. ⬜ Execute in Supabase Dashboard

---

**Last Updated:** [DATE]
**Status:** Template - Awaiting Query Results


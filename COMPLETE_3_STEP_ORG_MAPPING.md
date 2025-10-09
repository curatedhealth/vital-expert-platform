# Complete 3-Step Organizational Structure Mapping

## 🎯 Overview
Comprehensive solution to establish all hierarchical relationships: **Functions → Departments → Roles → Agents**

## 📊 Current Status
- **Functions**: 12 (ready)
- **Departments**: 10 (will be mapped)
- **Roles**: 126 (33 will be mapped)
- **Agents**: 372 (pattern-based mapping)

## 🏗️ 3-Step Implementation

### **STEP 1: Update Tables for Functions, Departments and Roles**
✅ **Functions**: 12 functions already exist and ready
✅ **Departments**: 10 departments will be mapped to functions
✅ **Roles**: 33 roles will be mapped to departments and functions

**Mappings Created:**
- Epidemiology → Pharmacovigilance
- Marketing → Commercial
- Sales → Commercial
- Market Access → Commercial
- HEOR → Commercial
- BD&L → Business Development
- Strategic Planning → Business Development
- Legal Affairs → Legal
- Finance & Accounting → Finance
- Information Technology → IT/Digital

### **STEP 2: Map Bidirectional Relations Between Function, Department and Roles**
✅ **Department → Function**: 10 mappings
✅ **Role → Department**: 33 mappings
✅ **Role → Function**: 33 mappings

**Sample Role Mappings:**
- VP Marketing → Marketing → Commercial
- Chief Business Officer → Strategic Planning → Business Development
- CFO → Finance & Accounting → Finance
- CIO → Information Technology → IT/Digital
- And 29 more role mappings

### **STEP 3: Map Roles, Department and Functions to Agents**
✅ **Direct Agent Mappings**: Pattern-based matching
✅ **Agent Fields Updated**: business_function, department, role

**Pattern-Based Agent Mappings:**
- `scientist|research|discovery` → Research & Development → Drug Discovery → Principal Scientist
- `clinical|trial|medical` → Clinical Development → Clinical Operations → Clinical Trial Manager
- `regulatory|compliance|fda` → Regulatory Affairs → Global Regulatory → Regulatory Affairs Manager
- `quality|qa|validation` → Quality → Quality Assurance → QA Manager
- `marketing|brand|commercial` → Commercial → Marketing → Marketing Manager
- `sales|territory|account` → Commercial → Sales → Territory Manager
- `finance|accounting|cfo` → Finance → Finance & Accounting → Finance Director
- `it|digital|technology|cio` → IT/Digital → Information Technology → IT Director
- `legal|counsel|attorney` → Legal → Legal Affairs → General Counsel
- `business|strategy|planning` → Business Development → Strategic Planning → Strategic Planner
- `manufacturing|production|supply` → Manufacturing → Drug Substance → Production Manager
- `safety|pharmacovigilance|pv` → Pharmacovigilance → Drug Safety → Drug Safety Scientist

## 🚀 Execution Instructions

### **1. Execute the SQL Script**
```bash
# Copy the contents of this file:
scripts/complete-3-step-org-mapping.sql

# Paste into Supabase SQL editor and execute
```

### **2. Verify the Mappings**
The script includes verification queries that will show:
- Number of departments mapped to functions
- Number of roles mapped to departments
- Number of agents with business_function
- Complete hierarchical structure
- Unmapped agents count

### **3. Test the API**
After execution, test the organizational structure API:
```bash
curl -X GET "https://vital-expert-preprod.vercel.app/api/organizational-structure"
```

**Expected API Response:**
```json
{
  "success": true,
  "data": {
    "departmentsByFunction": {
      "function-id-1": [department1, department2, ...],
      "function-id-2": [department3, department4, ...]
    },
    "rolesByDepartment": {
      "department-id-1": [role1, role2, ...],
      "department-id-2": [role3, role4, ...]
    },
    "rolesByFunction": {
      "function-id-1": [role1, role2, ...],
      "function-id-2": [role3, role4, ...]
    },
    "stats": {
      "totalFunctions": 12,
      "totalDepartments": 10,
      "totalRoles": 126
    }
  }
}
```

## 📁 Files Created

1. **`scripts/complete-3-step-org-mapping.sql`** - Main execution script
2. **`scripts/complete-org-mapping-3-steps.js`** - Analysis and generation script
3. **`COMPLETE_3_STEP_ORG_MAPPING.md`** - This documentation

## ✅ Success Criteria

After execution, you should have:

- [x] **Functions**: 12 functions properly defined
- [x] **Departments**: 10 departments mapped to functions
- [x] **Roles**: 33+ roles mapped to departments and functions
- [x] **Agents**: 372 agents mapped to roles, departments, and functions
- [x] **API**: Returns hierarchical data structure
- [x] **Database**: All foreign key relationships established

## 🔍 Verification Queries

The script includes these verification queries:

```sql
-- Check department mappings
SELECT 'Departments mapped to functions' as type, COUNT(*) as count
FROM org_departments WHERE function_id IS NOT NULL;

-- Check role mappings
SELECT 'Roles mapped to departments' as type, COUNT(*) as count
FROM org_roles WHERE department_id IS NOT NULL;

-- Check agent mappings
SELECT 'Agents with business_function' as type, COUNT(*) as count
FROM agents WHERE business_function IS NOT NULL;

-- Show hierarchical structure
SELECT 
  f.department_name as function_name,
  d.department_name,
  COUNT(r.id) as role_count,
  COUNT(a.id) as agent_count
FROM org_functions f
LEFT JOIN org_departments d ON d.function_id = f.id
LEFT JOIN org_roles r ON r.department_id = d.id
LEFT JOIN agents a ON a.business_function = f.department_name
GROUP BY f.id, f.department_name, d.id, d.department_name
ORDER BY f.department_name, d.department_name;
```

## 🎉 Ready for Execution!

The complete 3-step organizational structure mapping is ready. Simply execute the SQL script in Supabase to establish all hierarchical relationships!

---

**Next Steps:**
1. Execute `scripts/complete-3-step-org-mapping.sql` in Supabase
2. Verify results using the built-in verification queries
3. Test the organizational structure API
4. Enjoy your fully mapped organizational hierarchy! 🚀

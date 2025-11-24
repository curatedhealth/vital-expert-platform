# Skills Database Audit & Mapping Strategy

**Date**: November 22, 2025  
**Status**: 🔍 Audit in Progress  
**Purpose**: Verify existing skills in database before mapping 165 agents

---

## 📊 Database Schema Analysis

### ✅ **Confirmed: `skills` Table Exists**

**Schema** (from DB export):
```sql
CREATE TABLE public.skills (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid REFERENCES tenants(id),
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  category_id uuid REFERENCES skill_categories(id),
  skill_type text,
  complexity complexity_type DEFAULT 'medium',
  prerequisites text[] DEFAULT ARRAY[]::text[],
  learning_resources jsonb DEFAULT '[]'::jsonb,
  usage_count integer DEFAULT 0,
  average_rating numeric,
  is_active boolean DEFAULT true,
  validation_status validation_status DEFAULT 'draft',
  tags text[] DEFAULT ARRAY[]::text[],
  metadata jsonb DEFAULT '{}'::jsonb,
  
  -- AgentOS 2.0 Executable Skills columns
  category text,
  complexity_level text CHECK (complexity_level IN ('basic', 'intermediate', 'advanced', 'expert')),
  is_core boolean DEFAULT false,
  python_module text,
  callable_name text,
  is_executable boolean DEFAULT false,
  requires_context boolean DEFAULT false,
  is_stateful boolean DEFAULT false,
  version text DEFAULT '1.0.0',
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
```

**Key Features**:
- ✅ **Executable Skills Support**: `python_module`, `callable_name`, `is_executable`
- ✅ **Complexity Levels**: `basic`, `intermediate`, `advanced`, `expert`
- ✅ **Categorization**: Via `skill_categories` table and direct `category` column
- ✅ **LangGraph Integration**: Via `skill_components` → `lang_components`

---

### ✅ **Related Tables**

1. **`agent_skills`** - Junction table for agent-skill mappings
   ```sql
   CREATE TABLE public.agent_skills (
     id uuid PRIMARY KEY,
     agent_id uuid REFERENCES agents(id) NOT NULL,
     skill_id uuid REFERENCES skills(id) NOT NULL,
     proficiency_level text,
     is_primary boolean DEFAULT false,
     usage_count integer DEFAULT 0,
     last_used_at timestamptz,
     created_at timestamptz NOT NULL DEFAULT now(),
     updated_at timestamptz NOT NULL DEFAULT now()
   );
   ```

2. **`skill_categories`** - Hierarchical skill organization
   ```sql
   CREATE TABLE public.skill_categories (
     id uuid PRIMARY KEY,
     name text NOT NULL UNIQUE,
     slug text NOT NULL UNIQUE,
     description text,
     parent_id uuid REFERENCES skill_categories(id),
     icon text,
     sort_order integer DEFAULT 0,
     is_active boolean DEFAULT true
   );
   ```

3. **`skill_components`** - Link skills to LangGraph components
   ```sql
   CREATE TABLE public.skill_components (
     id uuid PRIMARY KEY,
     skill_id uuid REFERENCES skills(id) NOT NULL,
     component_id uuid REFERENCES lang_components(id) NOT NULL,
     is_primary_component boolean DEFAULT true,
     execution_order integer
   );
   ```

4. **`skill_parameter_definitions`** - Define input/output schemas for executable skills

5. **`persona_skills`**, **`role_skills`**, **`task_skills`**, **`workflow_task_skills`** - Skills mapped to other entities

---

## 🔍 **Next Steps: Pre-Flight Checks**

### **Step 1: Run Diagnostic Query**

📁 **Run:** [check_existing_skills.sql](file:///Users/hichamnaim/Downloads/Cursor/VITAL%20path/.vital-command-center/04-TECHNICAL/data-schema/diagnostics/check_existing_skills.sql)

This will tell us:
1. ✅ **Total skills count** - How many skills exist?
2. ✅ **Skills by category** - What categories are populated?
3. ✅ **Skills by complexity** - Distribution of basic → expert
4. ✅ **Executable skills count** - How many are runtime-ready?
5. ✅ **Already mapped skills** - Which skills are in use by agents?
6. ✅ **Sample skill list** - Top 20 skills alphabetically

---

## 📋 **Proposed Mapping Strategy**

### **Option A: Use Existing Skills (Recommended if DB is populated)**

✅ **If database has >50 skills seeded:**
- Query existing skills by category
- Map agents to existing skill IDs
- Add missing skills only where needed
- Respect existing skill structure

### **Option B: Seed New Skills First**

⚠️ **If database has <20 skills seeded:**
- Create comprehensive skill seed file (Medical Affairs focus)
- Organize by categories: Clinical, Regulatory, Communications, etc.
- Then map agents to newly seeded skills

### **Option C: Hybrid Approach**

🔄 **If database has partial coverage:**
- Use existing skills where applicable
- Seed additional Medical Affairs-specific skills
- Ensure no duplicates (check by `slug`)

---

## 🎯 **Medical Affairs Skill Categories (Proposed)**

Based on our 165-agent ecosystem, we need skills in:

### **1. Clinical & Scientific**
- Clinical Trial Design & Protocol Development
- Pharmacovigilance & Safety Reporting
- Medical Monitoring & Data Review
- Biostatistics & Data Analysis
- Epidemiology & HEOR

### **2. Regulatory & Compliance**
- Regulatory Strategy & Submissions
- GCP & ICH Guidelines Compliance
- Medical Review & Label Optimization
- Risk Management & Pharmacovigilance

### **3. Communications & Education**
- Scientific Writing & Publication Planning
- Medical Communications & Slide Development
- KOL Engagement & Speaker Training
- Congress Planning & Symposium Management

### **4. Evidence Generation**
- Real-World Evidence Study Design
- Health Economics Modeling
- Literature Review & Meta-Analysis
- Investigator-Sponsored Study Support

### **5. Field Operations**
- MSL Training & Development
- Territory Management & Planning
- Scientific Exchange & Engagement
- Insights Collection & Analysis

### **6. Data & Information Management**
- Medical Inquiry Response
- Information Retrieval & Evidence Synthesis
- Database Management & Query Design
- Citation Management & Reference Tracking

### **7. Strategic & Leadership**
- Strategic Planning & Forecasting
- Cross-functional Collaboration
- Budget Management & Resource Allocation
- Team Leadership & Performance Management

---

## 🚦 **Decision Gate**

**After running `check_existing_skills.sql`, we'll determine:**

✅ **If >50 skills exist** → Proceed with mapping to existing skills  
⚠️ **If 20-50 skills exist** → Use hybrid approach (map + seed missing)  
🔴 **If <20 skills exist** → Seed comprehensive Medical Affairs skill library first

---

## 📝 **Action Items**

- [ ] Run `check_existing_skills.sql` diagnostic query
- [ ] Share results for analysis
- [ ] Decide on mapping strategy (A, B, or C)
- [ ] Update `seed_agent_skills_mappings.sql` based on decision
- [ ] Execute final skill mappings for 165 agents

---

**Status**: ⏳ Awaiting diagnostic query results to proceed


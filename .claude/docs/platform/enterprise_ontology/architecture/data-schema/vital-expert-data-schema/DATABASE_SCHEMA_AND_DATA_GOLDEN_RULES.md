# DATABASE SCHEMA & DATA TRANSFORMATION - GOLDEN RULES

**Version**: 1.0
**Created**: 2025-11-17
**Status**: 🔒 AUTHORITATIVE - All agents must follow
**Scope**: All database schema design, data transformation, and seeding operations

---

## 🎯 Mission Statement

Build a **robust, scalable, and maintainable** PostgreSQL database that:
- Maintains data integrity through normalization
- Performs efficiently at scale
- Is easy to query, maintain, and extend
- Eliminates redundancy and update anomalies
- Provides clear, predictable data structures

---

## 🔒 GOLDEN RULES (Non-Negotiable)

### Rule #1: ZERO JSONB Columns
**❌ PROHIBITED**: Using JSONB columns for structured data

**Why?**
- JSONB defeats normalization and data integrity
- Cannot enforce constraints on nested data
- Difficult to query efficiently (requires JSON path operations)
- Schema changes require data migration instead of ALTER TABLE
- Foreign key relationships cannot span into JSONB
- Indexing is complex and inefficient
- Data validation happens at application layer (risky)

**✅ CORRECT APPROACH**: Create normalized tables instead

**Example - WRONG:**
```sql
-- ❌ BAD: Using JSONB for structured data
CREATE TABLE personas (
    id UUID PRIMARY KEY,
    name TEXT,
    pain_points JSONB  -- WRONG! Multiple pain points = separate table
);

INSERT INTO personas (id, name, pain_points) VALUES (
    uuid_generate_v4(),
    'Dr. Sarah Chen',
    '[{"pain": "Manual data entry", "severity": "high"}]'::jsonb
);
```

**Example - CORRECT:**
```sql
-- ✅ GOOD: Normalized separate table
CREATE TABLE personas (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE persona_pain_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    pain_point TEXT NOT NULL,
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'monthly', 'rarely')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Now you can query, index, and constrain properly
CREATE INDEX idx_pain_points_persona ON persona_pain_points(persona_id);
CREATE INDEX idx_pain_points_severity ON persona_pain_points(severity) WHERE severity IN ('high', 'critical');
```

---

### Rule #2: Full Normalization to 3NF
**Requirement**: All tables must be normalized to Third Normal Form (3NF) minimum

**1NF (First Normal Form)**:
- ✅ Atomic values only (no repeating groups)
- ✅ Each column contains single value
- ✅ Each row is unique (has primary key)
- ❌ NO comma-separated values in columns
- ❌ NO arrays of complex objects

**2NF (Second Normal Form)**:
- ✅ Must be in 1NF
- ✅ All non-key columns depend on entire primary key
- ✅ No partial dependencies

**3NF (Third Normal Form)**:
- ✅ Must be in 2NF
- ✅ No transitive dependencies
- ✅ Non-key columns depend ONLY on primary key

**Example - Achieving 3NF:**
```sql
-- ❌ NOT NORMALIZED: Transitive dependencies
CREATE TABLE personas_bad (
    id UUID PRIMARY KEY,
    name TEXT,
    department_name TEXT,      -- Depends on department_id, not persona
    department_description TEXT, -- Depends on department_id, not persona
    department_id UUID
);

-- ✅ NORMALIZED (3NF): Separate concerns
CREATE TABLE personas (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    department_id UUID REFERENCES departments(id)
);

CREATE TABLE departments (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    UNIQUE(name)
);
```

---

### Rule #3: Use TEXT[] Only for Simple Lists
**When TEXT[] is acceptable**:
- ✅ Simple string lists with NO metadata
- ✅ Tags, categories, keywords
- ✅ Lists that won't be filtered/joined frequently
- ✅ Order matters and is part of the data

**Example - Acceptable TEXT[] usage:**
```sql
CREATE TABLE personas (
    id UUID PRIMARY KEY,
    name TEXT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],  -- OK: Simple tags
    preferred_communication_channels TEXT[] -- OK: Ordered list of channels
);

-- Can still index and query
CREATE INDEX idx_personas_tags ON personas USING GIN(tags);

-- Query: Find personas with specific tag
SELECT * FROM personas WHERE 'medical-affairs' = ANY(tags);
```

**When to use normalized table instead:**
```sql
-- ❌ DON'T use TEXT[] if you need:
-- - Metadata about each item (severity, priority, etc.)
-- - Foreign key relationships
-- - Complex queries/filtering on items
-- - Aggregate functions per item
-- - Update/delete individual items

-- ✅ DO create separate table:
CREATE TABLE persona_skills (
    id UUID PRIMARY KEY,
    persona_id UUID REFERENCES personas(id),
    skill_name TEXT NOT NULL,
    proficiency_level TEXT CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    years_experience INTEGER CHECK (years_experience >= 0),
    is_primary BOOLEAN DEFAULT false,
    last_used_date DATE
);
```

---

### Rule #4: Every Foreign Key Must Exist
**Requirement**: All foreign key references must be validated before insert

**Wrong - Assumes FK exists:**
```sql
-- ❌ BAD: May fail if role doesn't exist
INSERT INTO personas (id, role_id)
VALUES (uuid_generate_v4(), 'some-uuid');
```

**Correct - Use SELECT to ensure it exists:**
```sql
-- ✅ GOOD: Get FK from existing data
INSERT INTO personas (id, role_id, function_id)
VALUES (
    uuid_generate_v4(),
    (SELECT id FROM org_roles WHERE slug = 'chief-medical-officer' LIMIT 1),
    (SELECT id FROM org_functions WHERE slug = 'medical-affairs' LIMIT 1)
);

-- ✅ EVEN BETTER: Validate in transaction
DO $$
DECLARE
    v_role_id UUID;
    v_function_id UUID;
BEGIN
    -- Get and validate foreign keys
    SELECT id INTO v_role_id FROM org_roles WHERE slug = 'chief-medical-officer';
    IF v_role_id IS NULL THEN
        RAISE EXCEPTION 'Role not found: chief-medical-officer';
    END IF;

    SELECT id INTO v_function_id FROM org_functions WHERE slug = 'medical-affairs';
    IF v_function_id IS NULL THEN
        RAISE EXCEPTION 'Function not found: medical-affairs';
    END IF;

    -- Now insert safely
    INSERT INTO personas (id, role_id, function_id)
    VALUES (uuid_generate_v4(), v_role_id, v_function_id);
END $$;
```

---

### Rule #5: Always Use Transactions for Multi-Step Operations
**Requirement**: Wrap related operations in BEGIN...COMMIT blocks

```sql
-- ✅ CORRECT: Atomic operation
BEGIN;

-- Insert main record
INSERT INTO personas (id, name) VALUES (uuid_generate_v4(), 'Dr. Sarah Chen')
RETURNING id INTO v_persona_id;

-- Insert related records
INSERT INTO persona_pain_points (persona_id, pain_point, severity)
VALUES
    (v_persona_id, 'Manual data entry', 'high'),
    (v_persona_id, 'System fragmentation', 'medium');

INSERT INTO persona_goals (persona_id, goal, priority)
VALUES
    (v_persona_id, 'Reduce administrative time', 'high');

-- Validate before committing
DO $$
DECLARE
    v_pain_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_pain_count
    FROM persona_pain_points
    WHERE persona_id = v_persona_id;

    IF v_pain_count = 0 THEN
        RAISE EXCEPTION 'Validation failed: No pain points inserted';
    END IF;
END $$;

COMMIT;  -- Only commits if everything succeeds
```

---

### Rule #6: Explicit Data Types (No Ambiguity)
**Requirement**: Always specify exact data types with constraints

```sql
-- ❌ BAD: Ambiguous types
CREATE TABLE personas (
    age TEXT,              -- Should be INTEGER with range constraint
    budget TEXT,           -- Should be DECIMAL/BIGINT
    is_active TEXT,        -- Should be BOOLEAN
    created_date TEXT      -- Should be TIMESTAMPTZ
);

-- ✅ GOOD: Explicit, constrained types
CREATE TABLE personas (
    age INTEGER CHECK (age >= 18 AND age <= 100),
    budget_usd BIGINT CHECK (budget_usd >= 0),
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- Enums for fixed value sets
    seniority_level TEXT CHECK (seniority_level IN ('junior', 'mid', 'senior', 'executive')),

    -- More specific numeric types
    years_experience DECIMAL(4,1) CHECK (years_experience >= 0 AND years_experience <= 60),

    -- UUIDs for IDs
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
);
```

---

### Rule #7: Multi-Tenancy via tenant_id (Always)
**Requirement**: Every user-facing table must have tenant_id with RLS

```sql
-- ✅ CORRECT: Multi-tenant table structure
CREATE TABLE personas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    -- ... other columns
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ  -- Soft delete
);

-- Index for tenant isolation
CREATE INDEX idx_personas_tenant ON personas(tenant_id) WHERE deleted_at IS NULL;

-- Row Level Security
ALTER TABLE personas ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_personas ON personas
    USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid)
    WITH CHECK (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);
```

---

## 📐 Schema Design Patterns

### Pattern 1: One-to-Many Relationships
```sql
-- Parent table
CREATE TABLE personas (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL
);

-- Child table (many pain points per persona)
CREATE TABLE persona_pain_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    pain_point TEXT NOT NULL,
    severity TEXT NOT NULL,
    CONSTRAINT unique_persona_pain UNIQUE(persona_id, pain_point)
);
```

### Pattern 2: Many-to-Many Relationships (Junction Table)
```sql
-- Table 1
CREATE TABLE personas (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL
);

-- Table 2
CREATE TABLE skills (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- Junction table
CREATE TABLE persona_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    proficiency_level TEXT CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    years_experience INTEGER CHECK (years_experience >= 0),
    CONSTRAINT unique_persona_skill UNIQUE(persona_id, skill_id)
);

-- Indexes for junction table
CREATE INDEX idx_persona_skills_persona ON persona_skills(persona_id);
CREATE INDEX idx_persona_skills_skill ON persona_skills(skill_id);
```

### Pattern 3: Temporal Data (Time Series)
```sql
CREATE TABLE persona_week_in_life (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Day identifier
    day_of_week TEXT NOT NULL CHECK (day_of_week IN (
        'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
    )),

    -- Time-based attributes
    typical_start_time TIME,
    typical_end_time TIME,
    meeting_load TEXT CHECK (meeting_load IN ('heavy', 'moderate', 'light')),
    focus_time_hours INTEGER CHECK (focus_time_hours >= 0 AND focus_time_hours <= 24),

    -- Array for simple lists (activities)
    typical_activities TEXT[],

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- One record per persona per day
    CONSTRAINT unique_persona_day UNIQUE(persona_id, day_of_week)
);

CREATE INDEX idx_wilo_persona ON persona_week_in_life(persona_id);
CREATE INDEX idx_wilo_day ON persona_week_in_life(day_of_week);
```

### Pattern 4: Hierarchical Data (Self-Referencing)
```sql
CREATE TABLE organizational_units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    name TEXT NOT NULL,
    parent_unit_id UUID REFERENCES organizational_units(id) ON DELETE SET NULL,
    level INTEGER CHECK (level >= 0),
    path TEXT,  -- Materialized path for efficient queries
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prevent circular references
CREATE INDEX idx_org_units_parent ON organizational_units(parent_unit_id);

-- Materialized path allows efficient subtree queries
CREATE INDEX idx_org_units_path ON organizational_units USING GIN(path gin_trgm_ops);
```

---

## 🔄 Data Transformation Process

### Step 1: Source Data Analysis
Before transforming JSON/CSV to database:

```python
def analyze_source_data(json_file: str):
    """Analyze source data structure before transformation"""

    with open(json_file) as f:
        data = json.load(f)

    print("📊 SOURCE DATA ANALYSIS")
    print("=" * 50)

    # Check structure
    if 'personas' in data:
        personas = data['personas']
        print(f"Total records: {len(personas)}")

        # Sample first record
        sample = personas[0]
        print(f"\nSample record structure:")
        for key, value in sample.items():
            value_type = type(value).__name__
            if isinstance(value, list):
                if value:
                    item_type = type(value[0]).__name__
                    print(f"  {key}: list of {item_type} ({len(value)} items)")
                else:
                    print(f"  {key}: empty list")
            else:
                print(f"  {key}: {value_type}")

        # Identify arrays that need separate tables
        print(f"\n⚠️  ARRAYS REQUIRING NORMALIZATION:")
        for key, value in sample.items():
            if isinstance(value, list) and value:
                if isinstance(value[0], dict):
                    print(f"  ❌ {key}: list of dicts → CREATE TABLE persona_{key}")
                elif isinstance(value[0], str):
                    print(f"  ⚠️  {key}: list of strings → TEXT[] or separate table?")
```

### Step 2: Schema Introspection
Always check actual deployed schema before generating SQL:

```python
def introspect_table_schema(connection_string: str, table_name: str):
    """Get actual table schema from database"""

    query = """
    SELECT
        column_name,
        data_type,
        is_nullable,
        column_default,
        character_maximum_length
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = %s
    ORDER BY ordinal_position;
    """

    # Execute and return schema
    # This tells you EXACTLY what columns exist and their types
```

### Step 3: Mapping Source to Target
Create explicit mapping between source JSON and target tables:

```python
SCHEMA_MAPPING = {
    'personas': {
        'table': 'personas',
        'columns': {
            'name': ('name', 'TEXT'),
            'slug': ('slug', 'TEXT'),
            'title': ('title', 'TEXT'),
            'core_profile.seniority_level': ('seniority_level', 'TEXT'),
            'core_profile.years_experience': ('years_of_experience', 'INTEGER'),
            # Map nested JSON paths to flat columns
        },
        'arrays_to_normalize': {
            'pain_points': {
                'target_table': 'persona_pain_points',
                'columns': ['pain_point', 'severity', 'frequency']
            },
            'goals': {
                'target_table': 'persona_goals',
                'columns': ['goal', 'priority', 'timeframe']
            }
        }
    }
}
```

### Step 4: Data Validation
Validate before transformation:

```python
def validate_source_data(personas: list) -> dict:
    """Validate source data before transformation"""

    errors = []
    warnings = []

    for idx, persona in enumerate(personas):
        # Required fields
        if not persona.get('name'):
            errors.append(f"Persona {idx}: Missing required field 'name'")

        if not persona.get('slug'):
            errors.append(f"Persona {idx}: Missing required field 'slug'")

        # Foreign key references
        role_slug = persona.get('professional_context', {}).get('role_slug')
        if not role_slug:
            warnings.append(f"Persona {idx} ({persona.get('name')}): No role_slug")

        # Data type validation
        years_exp = persona.get('core_profile', {}).get('years_experience')
        if years_exp and not isinstance(years_exp, int):
            errors.append(f"Persona {idx}: years_experience must be integer, got {type(years_exp)}")

    return {'errors': errors, 'warnings': warnings}
```

### Step 5: SQL Generation
Generate SQL with proper escaping and type handling:

```python
def generate_sql_insert(persona: dict, table_schema: dict) -> str:
    """Generate SQL INSERT with proper types"""

    # Build INSERT statement
    columns = []
    values = []

    for json_path, (col_name, col_type) in table_schema.items():
        # Extract value from nested JSON
        value = extract_nested_value(persona, json_path)

        # Escape based on type
        escaped = escape_for_postgres(value, col_type)

        columns.append(col_name)
        values.append(escaped)

    sql = f"""
INSERT INTO personas ({', '.join(columns)})
VALUES ({', '.join(values)});
"""
    return sql

def escape_for_postgres(value, pg_type: str) -> str:
    """Escape value for PostgreSQL with correct type"""

    if value is None:
        return "NULL"

    if pg_type == 'UUID':
        return f"'{str(value)}'::uuid"

    if pg_type in ('INTEGER', 'BIGINT'):
        return str(int(value))

    if pg_type == 'BOOLEAN':
        return 'TRUE' if value else 'FALSE'

    if pg_type == 'TEXT':
        # Escape single quotes
        escaped = str(value).replace("'", "''")
        return f"'{escaped}'"

    if pg_type == 'TEXT[]':
        if not value:
            return "ARRAY[]::TEXT[]"
        # Array of strings
        escaped_items = [f"'{str(v).replace(chr(39), chr(39)+chr(39))}'" for v in value]
        return f"ARRAY[{', '.join(escaped_items)}]"

    if pg_type == 'TIMESTAMPTZ':
        return f"'{value}'::timestamptz" if value else "NOW()"

    # Default: treat as text
    return f"'{str(value).replace(chr(39), chr(39)+chr(39))}'"
```

---

## 🌱 Data Seeding Best Practices

### Seeding Workflow

```sql
-- ===================================================================
-- SEED SCRIPT TEMPLATE
-- ===================================================================
-- Description: [What this seed script does]
-- Dependencies: [Tables that must exist first]
-- Idempotent: [YES/NO - can be run multiple times safely]
-- ===================================================================

BEGIN;

-- Step 1: Validation (check dependencies exist)
DO $$
DECLARE
    v_tenant_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_tenant_count FROM tenants;
    IF v_tenant_count = 0 THEN
        RAISE EXCEPTION 'No tenants found. Run tenant seed first.';
    END IF;
END $$;

-- Step 2: Clean up existing data (if idempotent)
-- DELETE FROM personas WHERE tenant_id = '...'; -- Only if safe!

-- Step 3: Insert data with progress tracking
DO $$
DECLARE
    v_persona_id UUID;
    v_count INTEGER := 0;
BEGIN
    -- Persona 1
    INSERT INTO personas (...) VALUES (...) RETURNING id INTO v_persona_id;
    INSERT INTO persona_pain_points (persona_id, ...) VALUES (v_persona_id, ...);
    v_count := v_count + 1;
    RAISE NOTICE 'Inserted persona % of 31', v_count;

    -- Persona 2
    -- ...
END $$;

-- Step 4: Validation (verify data inserted correctly)
DO $$
DECLARE
    v_persona_count INTEGER;
    v_pain_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_persona_count FROM personas;
    SELECT COUNT(*) INTO v_pain_count FROM persona_pain_points;

    RAISE NOTICE 'Inserted % personas', v_persona_count;
    RAISE NOTICE 'Inserted % pain points', v_pain_count;

    IF v_persona_count < 31 THEN
        RAISE EXCEPTION 'Expected 31 personas, got %', v_persona_count;
    END IF;
END $$;

COMMIT;

-- Step 5: Post-seed verification queries
SELECT
    p.name,
    COUNT(pp.id) as pain_point_count,
    COUNT(g.id) as goal_count
FROM personas p
LEFT JOIN persona_pain_points pp ON pp.persona_id = p.id
LEFT JOIN persona_goals g ON g.persona_id = p.id
GROUP BY p.id, p.name
ORDER BY p.name;
```

### Idempotent Seeds
Make seed scripts safe to run multiple times:

```sql
-- Pattern 1: INSERT ... ON CONFLICT DO NOTHING
INSERT INTO personas (id, tenant_id, name, slug)
VALUES (
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    '...'::uuid,
    'Dr. Sarah Chen',
    'dr-sarah-chen-cmo'
)
ON CONFLICT (id) DO NOTHING;

-- Pattern 2: INSERT ... ON CONFLICT DO UPDATE
INSERT INTO personas (id, tenant_id, name, slug, updated_at)
VALUES (
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
    '...'::uuid,
    'Dr. Sarah Chen',
    'dr-sarah-chen-cmo',
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    updated_at = NOW();

-- Pattern 3: Check existence before insert
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM personas WHERE slug = 'dr-sarah-chen-cmo') THEN
        INSERT INTO personas (...) VALUES (...);
    END IF;
END $$;
```

---

## ✅ Quality Assurance Checklist

### Before Deployment
- [ ] **Schema Review**
  - [ ] All tables are normalized to 3NF
  - [ ] Zero JSONB columns for structured data
  - [ ] TEXT[] used only for simple string lists
  - [ ] All foreign keys have proper constraints
  - [ ] All columns have explicit NOT NULL or DEFAULT
  - [ ] Multi-tenancy: tenant_id exists on all user tables
  - [ ] Soft deletes: deleted_at column where needed

- [ ] **Data Type Validation**
  - [ ] UUIDs for all IDs
  - [ ] TIMESTAMPTZ for all timestamps (not DATE)
  - [ ] CHECK constraints on enum-like columns
  - [ ] Numeric ranges have CHECK constraints
  - [ ] No ambiguous TEXT columns (should be specific type)

- [ ] **Indexes**
  - [ ] Foreign key columns indexed
  - [ ] tenant_id indexed with partial index (WHERE deleted_at IS NULL)
  - [ ] Frequently filtered columns indexed
  - [ ] Unique constraints on natural keys
  - [ ] GIN indexes on TEXT[] arrays if queried with ANY()

- [ ] **Security**
  - [ ] RLS policies enabled on all user tables
  - [ ] tenant_id isolation enforced
  - [ ] No direct SQL injection vectors
  - [ ] Sensitive columns encrypted if needed

- [ ] **Transformation Script**
  - [ ] Introspects actual schema before generating SQL
  - [ ] Validates foreign key references exist
  - [ ] Properly escapes all values
  - [ ] Handles NULL values correctly
  - [ ] Uses correct PostgreSQL type casts

- [ ] **Seed Script**
  - [ ] Wrapped in BEGIN/COMMIT transaction
  - [ ] Validates dependencies exist
  - [ ] Includes progress logging (RAISE NOTICE)
  - [ ] Has post-insert validation
  - [ ] Is idempotent or clearly marked as destructive

### After Deployment
- [ ] **Verification Queries**
  - [ ] Row counts match expected
  - [ ] Foreign key integrity verified
  - [ ] No NULL values in NOT NULL columns
  - [ ] Unique constraints not violated
  - [ ] Data types correct (no type casts needed)

- [ ] **Performance Check**
  - [ ] EXPLAIN ANALYZE on key queries
  - [ ] Index usage verified
  - [ ] No sequential scans on large tables
  - [ ] Query times acceptable

---

## 🚫 Common Anti-Patterns (AVOID)

### Anti-Pattern 1: JSONB for Structured Data
```sql
-- ❌ WRONG
CREATE TABLE personas (
    id UUID,
    data JSONB  -- Contains everything: pain points, goals, etc.
);

-- Problem: Can't enforce constraints, query efficiently, or maintain referential integrity
```

### Anti-Pattern 2: Comma-Separated Values
```sql
-- ❌ WRONG
CREATE TABLE personas (
    id UUID,
    skills TEXT  -- "SQL,Python,R,Statistics"
);

-- Problem: Can't search, filter, or join on individual skills
```

### Anti-Pattern 3: Repeating Column Groups
```sql
-- ❌ WRONG
CREATE TABLE personas (
    id UUID,
    pain_point_1 TEXT,
    pain_point_2 TEXT,
    pain_point_3 TEXT,
    pain_point_4 TEXT,
    pain_point_5 TEXT
);

-- Problem: Violates 1NF, wastes space, hard to query
```

### Anti-Pattern 4: Mixing Concerns in One Table
```sql
-- ❌ WRONG
CREATE TABLE personas (
    id UUID,
    name TEXT,
    department_name TEXT,
    department_head TEXT,
    department_budget BIGINT
);

-- Problem: Violates 3NF, department data duplicated across personas
```

### Anti-Pattern 5: Using TEXT for Everything
```sql
-- ❌ WRONG
CREATE TABLE personas (
    id TEXT,              -- Should be UUID
    age TEXT,             -- Should be INTEGER
    budget TEXT,          -- Should be BIGINT/DECIMAL
    is_active TEXT,       -- Should be BOOLEAN
    created_date TEXT     -- Should be TIMESTAMPTZ
);

-- Problem: No type safety, can't do numeric/date operations
```

### Anti-Pattern 6: Ignoring Foreign Keys
```sql
-- ❌ WRONG
CREATE TABLE personas (
    id UUID,
    role_id UUID  -- No REFERENCES constraint
);

-- Problem: Orphaned records, data integrity issues
```

### Anti-Pattern 7: Hard-Coding Values Instead of Lookups
```sql
-- ❌ WRONG
INSERT INTO personas (role_id) VALUES ('a1b2c3d4-...');  -- Hard-coded UUID

-- ✅ CORRECT
INSERT INTO personas (role_id)
VALUES ((SELECT id FROM org_roles WHERE slug = 'chief-medical-officer'));
```

---

## 📚 Reference Examples

### Complete Normalized Schema Example
```sql
-- ===================================================================
-- PERSONAS MODULE - NORMALIZED SCHEMA
-- ===================================================================

-- Main entity
CREATE TABLE personas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Identity
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    title TEXT,

    -- Foreign keys to lookup tables
    role_id UUID REFERENCES org_roles(id) ON DELETE SET NULL,
    function_id UUID REFERENCES org_functions(id) ON DELETE SET NULL,
    department_id UUID REFERENCES org_departments(id) ON DELETE SET NULL,

    -- Scalar attributes
    seniority_level TEXT CHECK (seniority_level IN ('junior', 'mid', 'senior', 'executive')),
    years_of_experience INTEGER CHECK (years_of_experience >= 0 AND years_of_experience <= 60),
    typical_organization_size TEXT CHECK (typical_organization_size IN ('startup', 'small', 'medium', 'large', 'enterprise')),

    -- Simple TEXT[] for tags/keywords only
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],

    -- Audit fields
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ,

    -- Constraints
    UNIQUE(tenant_id, slug)
);

-- Indexes
CREATE INDEX idx_personas_tenant ON personas(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_personas_role ON personas(role_id);
CREATE INDEX idx_personas_function ON personas(function_id);
CREATE INDEX idx_personas_tags ON personas USING GIN(tags);

-- RLS
ALTER TABLE personas ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_personas ON personas
    USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- Normalized related tables
CREATE TABLE persona_pain_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    pain_point TEXT NOT NULL,
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'monthly', 'rarely')),
    impact_description TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    CONSTRAINT unique_persona_pain UNIQUE(persona_id, pain_point)
);

CREATE INDEX idx_pain_points_persona ON persona_pain_points(persona_id);
CREATE INDEX idx_pain_points_severity ON persona_pain_points(severity) WHERE severity IN ('high', 'critical');

ALTER TABLE persona_pain_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_pain_points ON persona_pain_points
    USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- Similar pattern for goals, challenges, skills, etc.
```

---

## 🎓 Agent Training

### For data-architecture-expert
- Design schemas that are fully normalized
- Never use JSONB for structured data
- Always create separate tables for one-to-many relationships
- Enforce referential integrity with foreign keys

### For sql-supabase-specialist
- Introspect actual schema before generating SQL
- Validate all foreign key references exist
- Use proper PostgreSQL type casts
- Wrap multi-step operations in transactions
- Generate validation queries for all seeds

### For All Agents
- **ALWAYS** check this document before schema/data work
- **NEVER** use JSONB for structured data
- **ALWAYS** normalize to 3NF minimum
- **ALWAYS** validate before executing SQL
- **ALWAYS** use transactions for data modifications

---

## 📞 Questions & Exceptions

### When to Ask for Guidance
- Unsure if data structure should be normalized further
- Debating TEXT[] vs separate table
- Complex many-to-many relationships
- Performance vs normalization tradeoffs
- Migration strategy for existing JSONB data

### Requesting Exceptions
**Format for exception requests:**
```
Exception Request: [Brief description]

Current Approach: [What golden rule suggests]
Proposed Alternative: [What you want to do instead]
Justification: [Why exception is needed]

Performance Impact: [Quantified if possible]
Maintainability Impact: [Long-term considerations]
Alternative Solutions Considered: [What else was evaluated]

Approval Requested From: [User/Lead Architect]
```

**NOTE**: Exceptions should be rare. Most cases have a normalized solution.

---

## 🔄 Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-11-17 | Initial golden rules established | System |

---

## 🎯 Summary - The Core Principles

1. **ZERO JSONB** for structured data → Use normalized tables
2. **FULL NORMALIZATION** to 3NF minimum → No redundancy
3. **TEXT[] ONLY** for simple string lists → Otherwise normalize
4. **FOREIGN KEYS ALWAYS** → Referential integrity enforced
5. **TRANSACTIONS ALWAYS** → Atomic multi-step operations
6. **EXPLICIT TYPES** → No ambiguity, full constraints
7. **MULTI-TENANCY ALWAYS** → tenant_id + RLS on all user tables

---

**Status**: 🔒 ACTIVE - All agents must comply
**Enforcement**: Mandatory for all database operations
**Review Cycle**: Quarterly or as needed
**Questions**: Tag @data-architecture-expert or @sql-supabase-specialist

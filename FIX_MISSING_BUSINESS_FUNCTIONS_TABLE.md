# 🔧 Fix: Missing business_functions Table

## 🐛 Error

```
ERROR: 42P01: relation "dh_business_function" does not exist
```

## ✅ Solution

The table is called `business_functions` (plural), and it doesn't exist yet in your database.

### **Run This Migration** (1 minute):

1. **Open Supabase SQL Editor**:
   ```
   https://supabase.com/dashboard/project/xazinxsiglqokwfmogyk/sql/new
   ```

2. **Copy & paste this SQL**:

```sql
-- Create business_functions table
CREATE TABLE IF NOT EXISTS business_functions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT,
  parent_function_id UUID REFERENCES business_functions(id),
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_business_functions_code ON business_functions(code);
CREATE INDEX IF NOT EXISTS idx_business_functions_is_active ON business_functions(is_active);

-- Insert standard business functions
INSERT INTO business_functions (name, code, description, category, sort_order)
VALUES
  ('Clinical Development', 'CLINICAL_DEV', 'Clinical trials and studies', 'R&D', 110),
  ('Regulatory Affairs', 'REGULATORY', 'Regulatory submissions', 'R&D', 120),
  ('Medical Affairs', 'MEDICAL_AFFAIRS', 'Medical education', 'R&D', 130),
  ('Market Access', 'MARKET_ACCESS', 'Pricing and reimbursement', 'Commercial', 210),
  ('Commercial Operations', 'COMMERCIAL_OPS', 'Sales operations', 'Commercial', 200),
  ('Manufacturing', 'MANUFACTURING', 'Drug manufacturing', 'Operations', 300),
  ('Quality Assurance', 'QUALITY_ASSURANCE', 'Quality systems', 'Operations', 320),
  ('Data Science', 'DATA_SCIENCE', 'Analytics and ML', 'Analytics', 500),
  ('Real World Evidence', 'RWE', 'RWD analysis', 'Analytics', 510),
  ('Health Economics', 'HEOR', 'Health economics research', 'Analytics', 520)
ON CONFLICT (code) DO NOTHING;

-- Verify
SELECT name, code, category FROM business_functions ORDER BY category, sort_order;
```

3. **Click "Run"**

4. **Expected Result**:
   ```
   name                    | code             | category
   ----------------------- | ---------------- | -----------
   Data Science            | DATA_SCIENCE     | Analytics
   Real World Evidence     | RWE              | RWE
   Health Economics        | HEOR             | Analytics
   ... (10 rows total)
   ```

---

## 📊 What This Creates

The `business_functions` table stores organizational functions like:

- **R&D**: Clinical Development, Regulatory Affairs, Medical Affairs
- **Commercial**: Market Access, Commercial Operations  
- **Operations**: Manufacturing, Quality Assurance
- **Analytics**: Data Science, RWE, HEOR

---

## ✅ After Running Migration

1. **Retry your original SQL query** - The error should be gone
2. **Continue with tenant setup** - Run the tenant migration from [SINGLE_TENANT_SETUP.md](./SINGLE_TENANT_SETUP.md)
3. **Create test user** - Follow Step 2 in the single tenant setup guide

---

**See full migration**: `database/migrations/100_create_business_functions.sql`


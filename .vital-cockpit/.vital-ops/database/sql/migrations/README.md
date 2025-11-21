# Database Migrations

This directory contains all database migrations organized by year and category.

## Structure

```
migrations/
├── 2024/           # 2024 migrations
├── 2025/           # 2025 migrations
├── fixes/          # Schema fixes and patches
└── setup/          # Initial setup scripts
```

## Migration Naming Convention

Migrations follow the pattern: `YYYYMMDDHHMMSS_description.sql`

Examples:
- `20241218000000_create_icons_table.sql`
- `20250120000000_healthcare_compliance_enhancement.sql`

## Applying Migrations

Migrations should be applied in chronological order. Use the migration runner:

```bash
npm run db:migrate
```

Or apply manually in order:

```sql
\i 2024/20240101000000_initial_schema.sql
\i 2024/20240102000000_agents_schema.sql
-- ... continue in order
```

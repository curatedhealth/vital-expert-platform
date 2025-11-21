# database/queries/ - Database Queries

Organized collection of SQL queries for various purposes.

## Structure

```
queries/
├── diagnostics/    - Diagnostic and debugging queries
├── analytics/      - Analytics and reporting queries
└── utilities/      - Utility queries
```

## Diagnostics Queries (`diagnostics/`)

Queries for troubleshooting and debugging:

```sql
-- Example: Check database health
SELECT * FROM pg_stat_database;

-- Example: Find slow queries
SELECT * FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;
```

Moved from: `database/sql-standalone/`

## Analytics Queries (`analytics/`)

Queries for analytics and reporting:

```sql
-- Example: Agent usage statistics
SELECT agent_id, COUNT(*) as usage_count 
FROM conversations 
GROUP BY agent_id 
ORDER BY usage_count DESC;
```

## Utilities Queries (`utilities/`)

General utility queries:

```sql
-- Example: Reset test data
TRUNCATE TABLE test_data CASCADE;
```

## Usage

```bash
# Run a diagnostic query
psql $DATABASE_URL -f database/queries/diagnostics/check-health.sql

# Run with output to file
psql $DATABASE_URL -f database/queries/analytics/user-stats.sql > report.txt
```

## Best Practices

- One query per file
- Use descriptive filenames
- Add comments explaining the query purpose
- Include example output in comments
- Test queries before committing


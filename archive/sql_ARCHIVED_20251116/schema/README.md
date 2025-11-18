# Database Schema

This directory contains the core database schema files for the VITAL Path platform.

## Files

- `main_schema.sql` - Complete database schema with all tables and relationships
- `schema_no_vector.sql` - Schema without vector search functionality
- `migrations_index.sql` - Index of all applied migrations

## Usage

To set up the database from scratch:

```sql
-- Run the main schema
\i main_schema.sql

-- Apply any additional migrations as needed
\i ../migrations/2024/[specific_migration].sql
```

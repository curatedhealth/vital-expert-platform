# JSON Data Templates - Quick Start

This directory contains **JSON templates for all major content types** in the VITAL platform.

## Location

This is the **PRIMARY** location for JSON data templates per the project structure:
- **Path**: `/sql/seeds/json_data/`
- **Purpose**: Central repository for all JSON-based seed data templates
- **Status**: Active, production-ready

## Quick Start

1. **Choose a content type** from folders 01-10
2. **Copy the template** to create your data file
3. **Fill in your data** following the template structure
4. **Validate** using the appropriate script
5. **Transform** JSON → SQL using transformation scripts
6. **Load** into database

## For Complete Documentation

See [README.md](README.md) in this directory for:
- Complete directory structure
- All 10 content types explained
- Relationships between content types
- Loading order
- Validation rules
- Best practices
- Detailed usage instructions

## Integration with Project Structure

According to `/PROJECT_STRUCTURE_FINAL.md`:
- **Primary Database Directory**: `/sql/`
- **Seed Data**: `/sql/seeds/` (organized by phase 00-06)
- **JSON Templates**: `/sql/seeds/json_data/` (this directory)
- **Legacy Templates**: `/database/seeds/data/` (being phased out)

## No JSONB Policy

All data in these templates is **fully normalized**. Every array and object maps to proper relational tables with foreign keys. There are NO JSONB columns in the database.

---

**Created**: 2025-11-16
**Project**: VITAL Path
**Version**: 1.0

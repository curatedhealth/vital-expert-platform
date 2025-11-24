# Tooling

**Purpose**: Development tools, scripts, generators, validators, and helpers for VITAL platform development

**Owner**: Implementation Compliance & QA Agent

**Last Updated**: 2025-11-22

---

## Overview

This section contains all development tooling that accelerates platform development and ensures quality. Includes scripts, code generators, validators, and helper utilities.

---

## Directory Structure

```
07-TOOLING/
├── scripts/          Build, setup, utility scripts
├── generators/       Code generators
├── validators/       Compliance validators
└── helpers/          Helper utilities
```

---

## Scripts

**Location**: `scripts/`

**Description**: Operational and development scripts for platform management.

**Categories**:
- **Build Scripts**: Build automation, packaging
- **Setup Scripts**: Environment setup, dependencies
- **Database Scripts**: Schema updates, seeding
- **Deployment Scripts**: Deployment automation
- **Utility Scripts**: Common operations

**Migrated From**: `.vital-cockpit/.vital-ops/scripts/`, `.vital-cockpit/.vital-ops/bin/`

---

## Generators

**Location**: `generators/`

**Description**: Code generation tools for reducing boilerplate.

**Generator Types**:
- **Agent Generator**: Generate agent specification templates
- **API Generator**: Generate API routes from OpenAPI specs
- **Component Generator**: Generate React components
- **Migration Generator**: Generate database migrations
- **Test Generator**: Generate test scaffolding

---

## Validators

**Location**: `validators/`

**Description**: Compliance and quality validation tools.

**Validator Types**:
- **PRD Validator**: Ensure code matches PRD specifications
- **ARD Validator**: Ensure architecture follows ARD
- **CLAUDE.md Validator**: Check adherence to CLAUDE.md rules
- **VITAL.md Validator**: Check adherence to VITAL.md standards
- **Link Validator**: Verify all cross-references work
- **Schema Validator**: Validate database schema consistency

**Key Validators**:
- `validate-prd-compliance.sh` - PRD compliance check
- `validate-ard-compliance.sh` - ARD compliance check
- `validate-links.sh` - Link validation
- `validate-schema.sh` - Schema validation

---

## Helpers

**Location**: `helpers/`

**Description**: Helper utilities and tools.

**Helper Types**:
- **Data Helpers**: Data transformation, formatting
- **File Helpers**: File operations, manipulation
- **Documentation Helpers**: Doc generation, formatting
- **Testing Helpers**: Test utilities, mocks

**Migrated From**: `.vital-cockpit/.vital-ops/tools/`

---

## Usage Guidelines

### Running Scripts

```bash
# From project root
./vital-command-center/07-TOOLING/scripts/{script-name}.sh

# Example: Run PRD validation
./vital-command-center/07-TOOLING/validators/validate-prd-compliance.sh
```

### Creating New Tools

1. **Choose category**: scripts, generators, validators, or helpers
2. **Follow naming convention**: `{action}-{subject}.{ext}`
3. **Add documentation**: Include usage comments in file header
4. **Add to index**: Update this README with new tool
5. **Test thoroughly**: Ensure tool works in all environments

### Tool Naming Conventions

- **Scripts**: `{action}-{subject}.sh` (e.g., `setup-database.sh`)
- **Generators**: `generate-{artifact}.js` (e.g., `generate-agent.js`)
- **Validators**: `validate-{subject}.sh` (e.g., `validate-prd-compliance.sh`)
- **Helpers**: `{subject}-helper.js` (e.g., `data-helper.js`)

---

## Key Tools

### Compliance Validators

**PRD Compliance Validator**:
```bash
./validators/validate-prd-compliance.sh
```
Checks if implementation matches PRD specifications.

**ARD Compliance Validator**:
```bash
./validators/validate-ard-compliance.sh
```
Checks if architecture follows ARD decisions.

**Link Validator**:
```bash
./validators/validate-links.sh
```
Verifies all documentation cross-references work.

### Code Generators

**Agent Generator**:
```bash
./generators/generate-agent.js --name "Oncology Expert" --domain "Medical Affairs"
```
Generates agent specification template.

**Migration Generator**:
```bash
./generators/generate-migration.js --name "add_feature_table"
```
Generates database migration scaffold.

---

## Cross-References

- **Operations**: Many scripts support `05-OPERATIONS/`
- **Technical**: Generators support `04-TECHNICAL/`
- **Quality**: Validators enforce `06-QUALITY/` standards
- **Rules**: Validators check `01-TEAM/rules/` compliance

---

**Maintained By**: Implementation Compliance & QA Agent
**Questions?**: Check `CATALOGUE.md` or ask Implementation Compliance & QA Agent

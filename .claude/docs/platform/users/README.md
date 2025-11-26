# User Management System - Complete Documentation

**Version**: 3.0.0  
**Last Updated**: November 25, 2025  
**Status**: Active  
**Maintainer**: VITAL Platform Team

---

## Overview

This directory contains complete documentation for the VITAL Platform user management system, including user profiles, user-agent relationships, preferences, analytics, and all related functionality.

## Documentation Structure

```
users/
├── README.md                                    # This file (v3.0.0)
├── schema/
│   ├── USER_AGENTS_SCHEMA.md                   # user_agents table (54 columns)
│   ├── USER_DATA_SCHEMA_COMPLETE.md            # Complete user schema (14 tables)
│   └── DATABASE_NORMALIZATION_GUIDE.md         # Database design principles
├── api/
│   └── USER_AGENTS_API_REFERENCE.md            # User-agents API documentation
├── migrations/
│   └── MIGRATION_HISTORY.md                    # Migration history & rollback
├── seeds/
│   ├── README.md                                # Seed data overview
│   └── USER_MANAGEMENT_TEST_DATA.sql           # Complete test dataset
└── guides/
    └── GETTING_STARTED_GUIDE.md                # Quick start guide
```

## Quick Links

### For Developers
- [Getting Started](guides/GETTING_STARTED_GUIDE.md) - Quick start guide
- [User Agents API](api/USER_AGENTS_API_REFERENCE.md) - API documentation
- [Test Data](seeds/USER_MANAGEMENT_TEST_DATA.sql) - Sample data

### For Database Admins
- [User Agents Schema](schema/USER_AGENTS_SCHEMA.md) - 54-column table docs
- [Complete Schema](schema/USER_DATA_SCHEMA_COMPLETE.md) - All 14 user tables
- [Migration History](migrations/MIGRATION_HISTORY.md) - All migrations
- [Seed Data](seeds/README.md) - Test data setup

### For Architects
- [Database Normalization](schema/DATABASE_NORMALIZATION_GUIDE.md) - Design principles
- [Complete Schema](schema/USER_DATA_SCHEMA_COMPLETE.md) - Full data model
- [Migration History](migrations/MIGRATION_HISTORY.md) - Change tracking

## Key Components

### 1. User Profiles System
The foundation of user management:
- **user_profiles**: Core user information
- **user_roles**: Role-based access control
- **user_sessions**: Session tracking and analytics

### 2. User-Agent Relationships
How users interact with AI agents:
- **user_agents**: User-agent relationships (54 columns)
- **user_ratings**: Quality feedback
- **user_favorites**: Favorites system

### 3. AI & Personalization
Advanced AI features:
- **user_memory**: AI memory with vector embeddings
- **user_preferences**: User preferences
- Customization and personalization

### 4. Usage & Analytics
Tracking and monitoring:
- **llm_usage_logs**: Detailed LLM usage
- **quota_tracking**: Usage limits
- **rate_limit_usage**: Abuse prevention

## Latest Updates

**2025-11-25**: Complete normalized user_agents schema deployed
- Added 54 columns with full normalization (3NF)
- Created 23 performance indexes
- Implemented 6 RLS policies
- Added 5 helper functions
- Created 4 useful views

## Getting Started

### For New Developers

1. Read [Getting Started Guide](guides/getting_started.md)
2. Review [Schema Documentation](schema/user_agents.md)
3. Check [API Examples](api/examples.md)
4. Load [Seed Data](seeds/complete_test_data.sql)

### For Testing

```bash
# Load test data
psql $DATABASE_URL -f .claude/docs/platform/users/seeds/complete_test_data.sql

# Verify installation
psql $DATABASE_URL -c "SELECT COUNT(*) FROM user_agents;"
```

## Support

For questions or issues:
1. Review [Migration History](migrations/MIGRATION_HISTORY.md)
2. Check [Getting Started Guide](guides/GETTING_STARTED_GUIDE.md)
3. Consult [API Reference](api/USER_AGENTS_API_REFERENCE.md)

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 3.0 | 2025-11-25 | Complete normalized schema with 54+ attributes |
| 2.0 | 2025-11-24 | Added basic user_agents table |
| 1.0 | 2025-11-20 | Initial user profiles system |

---

## Version History

### Version 3.0.0 (November 25, 2025)
- Complete normalized user_agents schema (54 columns)
- Added 23 performance indexes
- Implemented 6 RLS policies
- Created 5 helper functions
- Built 4 pre-joined views
- Full documentation suite

### Version 2.0.0 (November 24, 2025)
- Basic user_agents table
- Initial documentation

### Version 1.0.0 (November 20, 2025)
- Initial user profiles system

---

**Status**: Production Ready ✅  
**Effective Date**: November 25, 2025  
**Next Review**: December 25, 2025


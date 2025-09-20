# VITAL Path Platform Architecture

## File Organization

The VITAL Path platform follows a feature-based architecture for better maintainability and scalability.

## Directory Structure

```
src/
├── features/                    # Feature-based modules
│   ├── agents/                 # Agent management feature
│   │   ├── components/         # Agent-specific components
│   │   ├── hooks/              # Agent-specific hooks
│   │   ├── services/           # Agent business logic
│   │   ├── types/              # Agent type definitions
│   │   └── index.ts            # Feature exports
│   ├── chat/                   # Chat interface feature
│   │   ├── components/         # Chat components
│   │   ├── hooks/              # Chat-specific hooks
│   │   ├── services/           # Chat business logic
│   │   ├── types/              # Chat type definitions
│   │   └── index.ts            # Feature exports
│   ├── knowledge/              # Knowledge management
│   ├── dashboard/              # Analytics dashboard
│   ├── auth/                   # Authentication
│   ├── admin/                  # Admin functionality
│   └── index.ts                # All feature exports
├── shared/                     # Shared/common code
│   ├── components/             # Reusable UI components
│   ├── hooks/                  # Common hooks
│   ├── services/               # Shared services (database, stores)
│   ├── types/                  # Global type definitions
│   ├── utils/                  # Utility functions
│   └── index.ts                # Shared exports
├── app/                        # Next.js 14 app router
│   ├── (app)/                  # Authenticated routes
│   └── api/                    # API endpoints
└── middleware.ts               # Next.js middleware
```

## Benefits

1. **Feature Isolation**: Each feature is self-contained with its own components, services, and types
2. **Scalability**: Easy to add new features without affecting existing code
3. **Maintainability**: Clear separation of concerns and responsibilities
4. **Team Collaboration**: Different teams can work on different features independently
5. **Code Reusability**: Shared components and services are centralized

## Import Paths

- Feature imports: `@/features/agents`, `@/features/chat`
- Shared imports: `@/shared/components`, `@/shared/services`
- Legacy imports: `@/components/*`, `@/lib/*` (mapped to shared)

## Migration Notes

- Old structure maintained in parallel during transition
- TypeScript path mappings updated to support both old and new patterns
- All existing functionality preserved during reorganization

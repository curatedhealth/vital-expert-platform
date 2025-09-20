# Organized Project Structure

## Overview
The project has been reorganized into a clear structure separating frontend, backend, database, and documentation concerns.

## Directory Structure

```
├── frontend/           # Frontend components and pages
│   ├── components/     # React components
│   ├── pages/         # Next.js app router pages
│   ├── stores/        # State management (Zustand)
│   └── styles/        # CSS and styling files
│
├── backend/           # Backend logic and APIs
│   ├── api/           # Next.js API routes
│   ├── lib/           # Shared libraries and utilities
│   └── types/         # TypeScript type definitions
│
├── database/          # Database related files
│   ├── migrations/    # Supabase migrations
│   └── supabase/      # Supabase configuration
│
├── config/            # Configuration files
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── next.config.js
│   └── .eslintrc.json
│
├── docs/              # Documentation
│   ├── README.md
│   ├── SITEMAP.md
│   └── ORGANIZED_STRUCTURE.md
│
├── scripts/           # Utility scripts
│   └── test-jobs-api.sh
│
├── Assets/            # Project assets
│   └── Icons/         # Icon files
│
└── src/               # Next.js source (maintained for functionality)
    ├── app/           # App router pages and API routes
    ├── components/    # React components
    ├── lib/           # Utilities and services
    └── types/         # TypeScript definitions
```

## Frontend Structure
- **Components**: Reusable UI components organized by feature
- **Pages**: Next.js 14 app router pages with route groups
- **Stores**: Zustand state management stores
- **Styles**: Global CSS and Tailwind configurations

## Backend Structure
- **API**: RESTful API routes for different features
- **Lib**: Shared utilities, services, and business logic
- **Types**: TypeScript type definitions for the entire application
- **Middleware**: Authentication and routing middleware

## Database Structure
- **Migrations**: Supabase database migrations with timestamps
- **Schemas**: Database schema definitions and relationships

## Key Features
- Medical Intelligence (MA01) job management
- Agent management and AI agents
- Knowledge management with RAG capabilities
- Workflow system with templates
- Chat interface with LangChain integration

## Original Structure Preserved
The original `src/` directory structure is maintained for Next.js functionality while this organized structure provides a clear overview of the codebase organization.
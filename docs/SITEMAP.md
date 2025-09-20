# VITALpath Platform - Clean Sitemap Structure

## Overview
This document outlines the reorganized sitemap structure for better organization, intuitive navigation, and maintainability.

## Route Structure

### Public Routes `(public)/`
- **Landing Page**: `/` - Main marketing page
- **About**: `/about` - Company information
- **Pricing**: `/pricing` - Pricing plans
- **Documentation**: `/docs` - Public documentation

### Authentication Routes `(auth)/`
- **Login**: `/login` - User authentication
- **Register**: `/register` - User registration
- **Password Reset**: `/forgot-password` - Password recovery

### Application Routes `(app)/`
Protected routes requiring authentication.

#### Dashboard
- **Overview**: `/dashboard` - Main dashboard with metrics and quick actions

#### Agents Management
- **Agents Board**: `/agents` - Browse and manage all agents
- **Create Agent**: `/agents/create` - Create new agent
- **Agent Details**: `/agents/[id]` - View agent details
- **Edit Agent**: `/agents/[id]/edit` - Edit agent configuration
- **Agent Analytics**: `/agents/[id]/analytics` - Agent performance metrics

#### Chat Interface
- **Chat Hub**: `/chat` - Main chat interface
- **Chat Session**: `/chat/[id]` - Specific chat session

#### Knowledge Management
- **Knowledge Base**: `/knowledge` - Knowledge overview and search
- **Upload Content**: `/knowledge/upload` - Upload documents and files
- **Search**: `/knowledge/search` - Advanced knowledge search
- **Analytics**: `/knowledge/analytics` - Knowledge usage analytics

#### Workflows
- **Workflows Board**: `/workflows` - Browse and manage workflows
- **Create Workflow**: `/workflows/create` - Workflow builder
- **Templates**: `/workflows/templates` - Pre-built workflow templates
- **Workflow Details**: `/workflows/[id]` - View workflow details
- **Edit Workflow**: `/workflows/[id]/edit` - Edit workflow
- **Workflow Analytics**: `/workflows/[id]/analytics` - Workflow performance

#### Medical Intelligence (MA01)
- **MI Dashboard**: `/medical-intelligence` - Medical AI overview
- **Jobs Explorer**: `/medical-intelligence/jobs` - Browse AI jobs
- **Create Job**: `/medical-intelligence/jobs/create` - Create new job
- **Job Details**: `/medical-intelligence/jobs/[id]` - Job details and results
- **Analytics**: `/medical-intelligence/analytics` - MI performance metrics

#### Settings
- **Profile**: `/settings/profile` - User profile management
- **Preferences**: `/settings/preferences` - App preferences
- **Integrations**: `/settings/integrations` - Third-party integrations

## API Structure

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Agents Management
- `GET /api/agents` - List agents
- `POST /api/agents` - Create agent
- `GET /api/agents/[id]` - Get agent details
- `PUT /api/agents/[id]` - Update agent
- `DELETE /api/agents/[id]` - Delete agent
- `GET /api/agents/[id]/analytics` - Agent analytics

### Chat
- `POST /api/chat` - Chat completion
- `GET /api/chat/sessions` - List chat sessions
- `GET /api/chat/history/[id]` - Chat history

### Knowledge Base
- `GET /api/knowledge` - List documents
- `POST /api/knowledge/upload` - Upload documents
- `POST /api/knowledge/search` - Search knowledge
- `GET /api/knowledge/analytics` - Knowledge analytics
- `POST /api/knowledge/embeddings` - Generate embeddings

### Workflows
- `GET /api/workflows` - List workflows
- `POST /api/workflows` - Create workflow
- `GET /api/workflows/[id]` - Get workflow
- `PUT /api/workflows/[id]` - Update workflow
- `DELETE /api/workflows/[id]` - Delete workflow
- `POST /api/workflows/execute` - Execute workflow
- `POST /api/workflows/validate` - Validate workflow
- `GET /api/workflows/templates` - Get templates

### Medical Intelligence
- `GET /api/medical-intelligence/jobs` - List jobs
- `POST /api/medical-intelligence/jobs` - Create job
- `GET /api/medical-intelligence/jobs/[id]` - Get job details
- `PUT /api/medical-intelligence/jobs/[id]` - Update job
- `DELETE /api/medical-intelligence/jobs/[id]` - Delete job
- `GET /api/medical-intelligence/analytics` - MI analytics

### System
- `GET /api/system/health` - Health check
- `GET /api/system/metrics` - System metrics

## Component Organization

### Feature-Based Components
```
src/components/
├── ui/                    # Base UI components (buttons, inputs, etc.)
├── layout/               # Layout components (nav, sidebar, etc.)
├── agents/               # Agent-specific components
│   ├── agents-board.tsx
│   ├── agent-creator.tsx
│   ├── agent-details-modal.tsx
│   └── agent-analytics.tsx
├── chat/                 # Chat-specific components
│   ├── chat-interface.tsx
│   ├── chat-messages.tsx
│   ├── chat-input.tsx
│   └── chat-sidebar.tsx
├── knowledge/            # Knowledge-specific components
│   ├── knowledge-uploader.tsx
│   ├── knowledge-viewer.tsx
│   ├── knowledge-search.tsx
│   └── knowledge-analytics-dashboard.tsx
├── workflows/            # Workflow-specific components
│   ├── workflow-builder.tsx
│   ├── workflow-designer.tsx
│   └── workflow-analytics.tsx
├── medical-intelligence/ # MA01-specific components
│   ├── ma01-jobs-explorer.tsx
│   ├── ma01-job-detail-modal.tsx
│   └── ma01-create-job-modal.tsx
└── shared/              # Cross-feature shared components
    ├── loading-spinner.tsx
    ├── error-boundary.tsx
    └── confirmation-modal.tsx
```

## Library Organization

### Feature-Based Services
```
src/lib/
├── agents/              # Agent management services
│   ├── agent-service.ts
│   ├── dynamic-agent-selector.ts
│   └── agent-types.ts
├── chat/                # Chat services
│   ├── chat-service.ts
│   ├── langchain-service.ts
│   └── rag-service.ts
├── knowledge/           # Knowledge management services
│   ├── knowledge-service.ts
│   ├── vector-service.ts
│   └── document-processor.ts
├── workflows/           # Workflow services
│   ├── workflow-service.ts
│   ├── workflow-engine.ts
│   └── workflow-types.ts
├── medical-intelligence/ # MA01 services
│   ├── ma01-service.ts
│   └── ma01-types.ts
├── stores/              # State management
│   ├── agents-store.ts
│   ├── chat-store.ts
│   ├── knowledge-store.ts
│   └── workflow-store.ts
├── auth/                # Authentication
├── database/            # Database utilities
├── utils/               # Shared utilities
└── types/               # Shared type definitions
```

## Benefits of New Structure

### 1. **Intuitive Navigation**
- Clear feature separation
- Logical URL structure
- Consistent naming conventions

### 2. **Better Maintainability**
- Feature-based organization
- Reduced coupling between modules
- Easier to locate and modify code

### 3. **Scalability**
- Easy to add new features
- Clear patterns for extension
- Modular architecture

### 4. **Developer Experience**
- Predictable file locations
- Clear responsibility boundaries
- Consistent API patterns

### 5. **User Experience**
- Logical navigation flow
- Intuitive URLs
- Clear feature boundaries

## Migration Notes

1. **Backward Compatibility**: Old routes should redirect to new routes
2. **Import Updates**: All import paths need to be updated
3. **API Updates**: Frontend calls need to match new API structure
4. **Documentation**: Update all documentation to reflect new structure
5. **Testing**: Update all tests to use new paths and structure

## Next Steps

1. Complete file migrations
2. Update all import statements
3. Add redirect rules for old routes
4. Update navigation components
5. Test all functionality
6. Update documentation and onboarding materials
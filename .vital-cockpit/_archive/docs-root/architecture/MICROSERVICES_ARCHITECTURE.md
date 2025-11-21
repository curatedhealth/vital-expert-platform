# VITAL AI - Microservices Architecture

## Overview
VITAL AI is structured as a microservices architecture with 4 core applications and shared services.

## Core Applications

### 1. Ask Expert (1:1 Chat)
- **Route**: `/ask-expert`
- **Purpose**: Direct 1:1 conversations with specialized AI agents
- **Features**:
  - Single agent selection
  - Real-time chat interface
  - Agent expertise display
  - Contextual prompts
  - Session history

### 2. Ask Panel (Virtual Advisory Board)
- **Route**: `/ask-panel`
- **Purpose**: Multi-agent advisory panels for complex decisions
- **Features**:
  - Multi-agent panels
  - Collaborative responses
  - Expert consensus
  - Panel dynamics
  - Advisory reports

### 3. Ask Team (Orchestrated Workflows)
- **Route**: `/ask-team`
- **Purpose**: Structured multi-step workflows with agent orchestration
- **Features**:
  - Workflow templates
  - Step-by-step execution
  - Agent handoffs
  - Progress tracking
  - Result compilation

### 4. Solution Builder
- **Route**: `/solution-builder`
- **Purpose**: Guided solution development with templates and frameworks
- **Features**:
  - Solution templates
  - Step-by-step builders
  - Component library
  - Export capabilities
  - Collaboration tools

### 5. Dashboard (Central Hub)
- **Route**: `/dashboard`
- **Purpose**: Central navigation and analytics
- **Features**:
  - App navigation
  - Usage analytics
  - Recent activities
  - Quick actions
  - System status

## Shared Services

### Core Services
- **Agents**: Agent registry, management, and configuration
- **Prompts**: Prompt library, templates, and generation
- **Capabilities**: Skill definitions and mappings
- **Workflows**: Workflow definitions and orchestration
- **Models**: LLM model management and routing
- **Orchestration**: Multi-agent coordination

### Supporting Services
- **Authentication**: User management and permissions
- **Knowledge**: Document storage and retrieval (RAG)
- **Analytics**: Usage tracking and insights
- **Compliance**: Healthcare compliance and audit trails

## Directory Structure

```
src/
├── app/
│   ├── (ask-expert)/           # 1:1 Chat microservice
│   ├── (ask-panel)/            # Virtual advisory board microservice
│   ├── (ask-team)/             # Orchestrated workflows microservice
│   ├── (solution-builder)/     # Solution builder microservice
│   ├── (dashboard)/            # Central dashboard
│   └── api/                    # Shared API routes
├── shared/
│   ├── services/
│   │   ├── agents/            # Agent management
│   │   ├── prompts/           # Prompt library
│   │   ├── capabilities/      # Capabilities registry
│   │   ├── workflows/         # Workflow orchestration
│   │   ├── models/            # LLM model management
│   │   ├── orchestration/     # Multi-agent coordination
│   │   └── dashboard/         # Dashboard analytics
│   ├── components/            # Reusable UI components
│   ├── types/                 # TypeScript definitions
│   ├── hooks/                 # React hooks
│   └── utils/                 # Utility functions
└── features/                  # Legacy feature modules (to be migrated)
```

## API Architecture

### Shared APIs (`/api/`)
- `/api/agents/` - Agent management
- `/api/prompts/` - Prompt library
- `/api/capabilities/` - Capabilities registry
- `/api/workflows/` - Workflow management
- `/api/models/` - LLM model routing
- `/api/orchestration/` - Multi-agent coordination
- `/api/knowledge/` - RAG and document management
- `/api/analytics/` - Usage and performance metrics

### App-Specific APIs
- `/api/ask-expert/` - 1:1 chat specific endpoints
- `/api/ask-panel/` - Advisory panel specific endpoints
- `/api/ask-team/` - Workflow specific endpoints
- `/api/solution-builder/` - Solution builder specific endpoints

## Data Flow

1. **Shared Services**: All apps use common agent, prompt, and model services
2. **Orchestration**: Complex interactions managed by orchestration service
3. **Analytics**: All interactions tracked for insights
4. **Knowledge**: RAG system shared across all applications

## Development Guidelines

1. **Separation of Concerns**: Each app focuses on its specific use case
2. **Shared Services**: Common functionality in shared services
3. **API-First**: All services expose APIs for flexibility
4. **Type Safety**: Strong TypeScript typing throughout
5. **Testing**: Unit and integration tests for each service
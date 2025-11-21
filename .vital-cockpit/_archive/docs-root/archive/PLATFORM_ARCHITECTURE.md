# VITAL Path Platform Architecture Documentation

## Overview
VITAL Path is a comprehensive digital health intelligence platform featuring 50+ healthcare AI agents designed for healthcare organizations, medical device companies, and clinical research teams. The platform follows healthcare compliance standards (HIPAA, FDA 21 CFR Part 11) and provides specialized AI agents for various medical domains.

## Platform Information
- **Name**: VITAL Path Digital Health Intelligence Platform
- **Version**: 1.0.0
- **Primary URL**: http://localhost:3000 (Development)
- **Architecture**: Full-stack TypeScript/Next.js application with healthcare-specific features
- **Build Status**: ✅ Successfully compiled and running
- **Security Status**: ✅ All vulnerabilities resolved (Next.js 14.2.33)

---

## Frontend Architecture

### Technology Stack
- **Framework**: Next.js 14.2.33 (React 18)
- **Language**: TypeScript with strict mode
- **Styling**: TailwindCSS with custom healthcare color palette
- **UI Components**: Radix UI primitives + custom components
- **State Management**: Zustand with persistence
- **Authentication**: Supabase Auth
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Application Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (app)/                   # Authenticated app routes
│   │   ├── agents/              # Agent management
│   │   ├── chat/                # AI conversation interface
│   │   ├── clinical/            # Clinical workflows and enhanced tools
│   │   ├── dashboard/           # Main dashboard
│   │   ├── dtx/                 # Digital Therapeutics (Narcolepsy, etc.)
│   │   ├── knowledge/           # Knowledge base management
│   │   ├── prompts/             # Prompt library
│   │   ├── solution-builder/    # Facilitated solution design platform
│   │   ├── testing/             # Clinical testing and validation
│   │   └── admin/               # Admin functions
│   ├── (auth)/                  # Authentication routes
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/               # Secondary dashboard routes
│   │   ├── llm-management/      # LLM provider management
│   │   ├── capabilities/        # System capabilities
│   │   └── prompts/            # Prompt management
│   └── api/                     # API routes (backend)
├── features/                    # Feature-based architecture
│   ├── agents/                  # Agent management features
│   ├── auth/                    # Authentication features
│   ├── chat/                    # Chat functionality
│   ├── clinical/                # Clinical workflows and safety tools
│   ├── dashboard/               # Analytics dashboard
│   ├── digital-health/          # Digital health solutions
│   ├── knowledge/               # Knowledge management
│   ├── solution-builder/        # VITAL framework solution design
│   ├── testing/                 # Clinical testing platforms
│   ├── tenant-management/       # Multi-tenant capabilities
│   └── admin/                   # Admin features
├── shared/                      # Shared resources
│   ├── components/              # Reusable UI components
│   ├── services/                # Business logic services
│   ├── types/                   # TypeScript definitions
│   ├── hooks/                   # Custom React hooks
│   └── utils/                   # Utility functions
├── types/                       # Global type definitions
└── middleware/                  # Authentication middleware
```

### Key Frontend Features

#### 1. Agent Management System
- **Location**: `src/features/agents/`
- **Components**: Agent board, creation forms, capability management
- **Store**: `src/shared/services/stores/agents-store.ts`
- **Features**:
  - Create and manage 50+ healthcare AI agents
  - Drag-and-drop agent organization
  - Agent capability assignment
  - Healthcare domain specialization
  - Clinical Trial Designer, Market Access Strategist, Regulatory Specialist agents

#### 1.5. Solution Design Platform
- **Location**: `src/features/solution-builder/`
- **Components**: VITAL framework implementation, DTx development tools
- **Features**:
  - AI-facilitated capability augmentation
  - Human-in-the-loop workflows
  - Digital therapeutic development framework
  - Clinical trial designer
  - Regulatory compliance suite
  - Remote monitoring builder

#### 1.6. Clinical Workflow System
- **Location**: `src/features/clinical/`
- **Components**: Enhanced workflow builder, medical query interface, safety dashboard
- **Features**:
  - PHARMA framework validation (Purpose, Hypothesis, Audience, Requirements, Metrics, Actionable)
  - VERIFY protocol compliance (Validate, Evidence, Request, Identify, Fact-check, Yield)
  - Clinical safety monitoring with >98% accuracy
  - Expert review integration (<4hr response time)
  - Hallucination detection (<1% rate)

#### 2. Chat Interface
- **Location**: `src/features/chat/`
- **Components**: Chat interface, message history, agent selection
- **Store**: `src/shared/services/stores/chat-store.ts`
- **Features**:
  - Multi-agent conversations
  - Healthcare-compliant chat logging
  - RAG-enabled responses
  - Medical citation tracking

#### 3. Knowledge Management
- **Location**: `src/app/(app)/knowledge/`
- **Features**:
  - Document upload and processing
  - Medical literature integration
  - Vector-based search
  - Analytics and insights

#### 4. LLM Provider Management
- **Location**: `src/app/dashboard/llm-management/`
- **Components**:
  - `LLMProviderDashboard.tsx`
  - `UsageAnalyticsDashboard.tsx`
  - `OpenAIUsageDashboard.tsx`
  - `MedicalModelsDashboard.tsx`
- **Features**:
  - Multi-provider support (OpenAI, Anthropic, Google, Azure, AWS Bedrock)
  - Usage tracking and cost management
  - Healthcare compliance monitoring
  - Medical model specialization

### UI Component System

#### Base Components Location: `src/shared/components/ui/`
- **Form Components**: Input, Label, Button, Select, Textarea
- **Layout Components**: Card, Sheet, Dialog, Tabs, Collapsible
- **Data Display**: Table, Badge, Progress, Skeleton
- **Feedback**: Alert, Toast, Tooltip
- **Navigation**: Dropdown Menu, Breadcrumb

#### Specialized Components Location: `src/shared/components/`
- **LLM Components**: Provider dashboards, usage analytics
- **Landing Components**: Landing page elements
- **Prompts Components**: Prompt management interface

### Routing Structure

#### Authenticated Routes (`/app/`)
- `/dashboard` - Main platform dashboard
- `/agents` - Agent management interface
- `/agents/create` - Agent creation wizard
- `/chat` - AI conversation interface with agent orchestration
- `/clinical` - Clinical workflows and tools
- `/clinical/enhanced` - Enhanced clinical dashboard with PHARMA/VERIFY
- `/dtx/narcolepsy` - Narcolepsy Digital Therapeutic use case
- `/knowledge` - Knowledge base management
- `/knowledge/upload` - Document upload interface
- `/knowledge/analytics` - Knowledge analytics
- `/prompts` - Prompt library management
- `/solution-builder` - Facilitated solution design platform (VITAL framework)
- `/testing` - Clinical testing and validation platforms
- `/admin/batch-upload` - Admin bulk operations

#### Dashboard Routes (`/dashboard/`)
- `/dashboard/llm-management` - LLM provider management
- `/dashboard/capabilities` - System capabilities
- `/dashboard/prompts` - Prompt management
- `/dashboard/meditron-setup` - Medical model setup

#### Authentication Routes
- `/login` - User authentication
- `/register` - User registration
- `/forgot-password` - Password recovery

---

## Backend Architecture

### Technology Stack
- **Runtime**: Node.js with Next.js API routes
- **Database**: Supabase (PostgreSQL) with real-time subscriptions
- **Vector Database**: Pinecone for RAG functionality
- **Authentication**: Supabase Auth with row-level security
- **File Storage**: Supabase Storage
- **LLM Integration**: Multiple providers via unified interface

### API Structure

```
src/app/api/
├── agents/                      # Agent CRUD operations
│   ├── route.ts                # List/create agents
│   └── [id]/route.ts          # Agent-specific operations
├── chat/                       # Chat functionality
│   └── route.ts               # Chat message processing
├── knowledge/                  # Knowledge management
│   ├── documents/route.ts     # Document operations
│   ├── search/route.ts        # Vector search
│   └── upload/route.ts        # File upload processing
├── llm/                       # LLM provider management
│   ├── providers/             # Provider configuration
│   ├── usage/                 # Usage tracking
│   ├── metrics/               # Performance metrics
│   └── query/                 # LLM queries
├── capabilities/              # System capabilities
├── compliance/                # Healthcare compliance
├── validations/               # Data validation
├── workflows/                 # Agent workflows
├── prompts/                   # Prompt management
└── system/                    # System health
    └── health/route.ts        # Health checks
```

### Core Services

#### 1. Agent Service
- **Location**: `src/shared/services/agents/agent-service.ts`
- **Responsibilities**:
  - Agent CRUD operations
  - Capability management
  - Workflow orchestration
  - Healthcare domain assignment

#### 2. LangChain RAG Service
- **Location**: `src/features/chat/services/langchain-service.ts`
- **Responsibilities**:
  - Document processing and chunking
  - Vector embeddings generation
  - RAG-powered responses
  - Medical citation extraction
  - Duplicate detection

#### 3. LLM Provider Service
- **Location**: `src/services/llm-provider.service.ts`
- **Responsibilities**:
  - Multi-provider LLM management
  - Usage tracking and analytics
  - Cost optimization
  - Healthcare compliance monitoring

#### 4. Authentication Context
- **Location**: `src/lib/auth/auth-context.tsx`
- **Responsibilities**:
  - User authentication state
  - HIPAA-compliant session management
  - Role-based access control

### Database Architecture

#### Supabase Configuration
- **Environment**: Remote production instance
- **URL**: `https://xazinxsiglqokwfmogyk.supabase.co`
- **Features**: Row-level security, real-time subscriptions, file storage

#### Key Database Tables
```sql
-- Core Tables (Inferred from codebase)
├── agents                       # AI agent definitions
├── capabilities                 # Agent capabilities
├── prompts                     # Prompt templates
├── workflows                   # Agent workflows
├── knowledge_sources           # Document metadata
├── document_chunks             # Vector chunks for RAG
├── chat_sessions              # Chat conversations
├── chat_messages              # Individual messages
├── llm_providers              # LLM provider configurations
├── usage_metrics              # LLM usage tracking
├── compliance_logs            # Healthcare compliance audit
└── user_profiles              # User information
```

#### Vector Database (Pinecone)
- **Purpose**: RAG functionality for medical knowledge
- **Index**: `vitalpath-knowledge-base`
- **Features**: Semantic search, medical literature integration

### External Integrations

#### LLM Providers
1. **OpenAI**
   - Models: GPT-4, GPT-3.5-turbo
   - Usage tracking and cost management

2. **Anthropic**
   - Models: Claude-3 Sonnet, Claude-3 Haiku
   - Healthcare-optimized prompting

3. **Google**
   - Models: Gemini Pro
   - Medical knowledge integration

4. **Azure OpenAI**
   - Enterprise-grade security
   - HIPAA compliance features

5. **AWS Bedrock**
   - Foundation model access
   - Healthcare-specific models

#### Healthcare APIs (Planned)
- Medical literature databases (PubMed)
- Clinical trial registries (ClinicalTrials.gov)
- Drug interaction databases
- Medical coding systems (ICD-10, CPT)

---

## Healthcare Compliance Features

### HIPAA Compliance
- **PHI Detection**: Automated detection in conversations
- **Audit Logging**: Comprehensive activity tracking
- **Data Encryption**: End-to-end encryption for sensitive data
- **Access Controls**: Role-based permissions
- **Session Management**: Secure session handling

### FDA 21 CFR Part 11 Compliance
- **Electronic Records**: Validated data integrity
- **Electronic Signatures**: Audit trail maintenance
- **Data Retention**: 7-year retention policy
- **Validation**: System validation protocols

### Medical Safety Features
- **Confidence Scoring**: AI response confidence levels
- **Citation Requirements**: Medical claims must include citations
- **Expert Review**: Low-confidence responses flagged for review
- **Drug Interaction Warnings**: Safety alerts for medications
- **Contraindication Checks**: Medical safety validations

---

## Development Workflow

### Scripts
```json
{
  "dev": "next dev",                    # Development server
  "build": "next build",                # Production build
  "start": "next start",                # Production server
  "lint": "next lint",                  # Code linting
  "type-check": "tsc --noEmit",         # TypeScript checking
  "migrate:run": "Migration execution",
  "migrate:status": "Migration status",
  "db:setup": "Database initialization",
  "test": "Test runner"
}
```

### Path Aliases (tsconfig.json)
```json
{
  "@/*": ["./src/*"],
  "@/features/*": ["./src/features/*"],
  "@/shared/*": ["./src/shared/*"],
  "@/components/*": ["./src/shared/components/*"],
  "@/lib/*": ["./src/shared/services/*"],
  "@/types/*": ["./src/shared/types/*"],
  "@/hooks/*": ["./src/shared/hooks/*"],
  "@/utils/*": ["./src/shared/utils/*"]
}
```

---

## Security & Environment

### Environment Variables
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xazinxsiglqokwfmogyk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=***
SUPABASE_SERVICE_ROLE_KEY=***

# Vector Database
PINECONE_API_KEY=***
PINECONE_ENVIRONMENT=***
PINECONE_INDEX_NAME=vitalpath-knowledge-base

# LLM Providers
OPENAI_API_KEY=***
GOOGLE_API_KEY=***
HUGGINGFACE_API_KEY=***

# Security
ENCRYPTION_MASTER_KEY=***
```

### Security Measures
- **API Key Encryption**: AES-256 encryption for API keys
- **Environment Separation**: Development/production configurations
- **Rate Limiting**: API request throttling
- **Input Validation**: Comprehensive data validation
- **CORS Configuration**: Secure cross-origin requests

---

## Performance Optimizations

### Frontend Optimizations
- **Code Splitting**: Route-based code splitting
- **Image Optimization**: Next.js Image component
- **Caching**: Browser and API response caching
- **Bundle Analysis**: Webpack bundle optimization

### Backend Optimizations
- **Database Indexing**: Optimized database queries
- **Connection Pooling**: Efficient database connections
- **Caching**: Redis-based caching (planned)
- **Vector Search**: Optimized Pinecone queries

---

## Monitoring & Analytics

### System Health
- **Health Checks**: `/api/system/health`
- **Error Tracking**: Comprehensive error logging
- **Performance Metrics**: Response time monitoring
- **Usage Analytics**: User behavior tracking

### Healthcare Metrics
- **Compliance Monitoring**: HIPAA audit trails
- **Medical Accuracy**: AI response validation
- **Cost Tracking**: LLM usage and costs
- **User Safety**: Medical safety alerts

---

## Future Roadmap

### Planned Features
1. **Advanced Medical AI**
   - Specialized medical models integration
   - Clinical decision support
   - Drug interaction checking

2. **Enhanced Compliance**
   - FDA submission assistance
   - Clinical trial management
   - Regulatory pathway guidance

3. **Integration Expansions**
   - EHR system integrations
   - Medical device APIs
   - Telemedicine platforms

4. **Advanced Analytics**
   - Predictive healthcare analytics
   - Population health insights
   - Clinical outcome tracking

### Technical Improvements
- **Microservices Architecture**: Service decomposition
- **Kubernetes Deployment**: Container orchestration
- **Real-time Collaboration**: Multi-user features
- **Mobile Applications**: Native mobile apps

---

## Getting Started

### Prerequisites
- Node.js 18+
- TypeScript 5+
- Supabase account
- LLM provider API keys

### Development Setup
1. Clone repository
2. Install dependencies: `npm install`
3. Configure environment variables
4. Run database migrations: `npm run migrate:run`
5. Start development server: `npm run dev`
6. Access platform: `http://localhost:3002`

### Production Deployment
1. Build application: `npm run build`
2. Configure production environment
3. Deploy to hosting platform
4. Set up domain and SSL
5. Configure monitoring and analytics

---

*This documentation represents the current state of the VITAL Path platform as of September 2025. For the most up-to-date information, refer to the codebase and recent commit history.*
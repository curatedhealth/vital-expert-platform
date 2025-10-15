# VITAL Path Digital Health Intelligence Platform

> **50+ Healthcare AI Agents** | **Clean Architecture** | **Enterprise-Grade Security** | **Production Ready**

[![Production Status](https://img.shields.io/badge/Production-Live-brightgreen)](https://vital-expert-6ogba876j-crossroads-catalysts-projects.vercel.app)
[![Architecture](https://img.shields.io/badge/Architecture-Clean-blue)](https://github.com/curatedhealth/vital-expert-platform)
[![Security](https://img.shields.io/badge/Security-Enterprise-orange)](https://github.com/curatedhealth/vital-expert-platform)
[![Tests](https://img.shields.io/badge/Tests-35%2B%20Passing-green)](https://github.com/curatedhealth/vital-expert-platform)

## 🚀 Live Demo

**Production URL**: https://vital-expert-6ogba876j-crossroads-catalysts-projects.vercel.app

## 🏗️ Architecture Overview

VITAL is built using **Clean Architecture** principles with a 4-layer separation:

```
src/
├── core/                    # Business logic & domain entities
│   ├── domain/entities/     # Agent, Chat, User entities
│   ├── services/           # AgentOrchestrator, WorkflowEngine
│   └── usecases/           # Business use cases
├── infrastructure/          # External dependencies
│   ├── api/                # API routes & controllers
│   ├── repositories/       # Data access layer
│   └── monitoring/         # Logging & metrics
├── application/            # Application services
│   ├── middleware/         # Rate limiting, validation
│   └── controllers/        # Request/response handling
├── presentation/           # UI & user interface
│   ├── components/         # React components
│   ├── stores/            # State management
│   └── hooks/             # Custom React hooks
└── shared/                # Shared utilities
    ├── utils/             # Helper functions
    ├── types/             # TypeScript types
    └── validation/        # Zod schemas
```

## ✨ Key Features

### 🤖 Intelligent Agent System
- **50+ Specialized Healthcare Agents** across multiple domains
- **Multi-factor Agent Selection** with capability matching
- **Autonomous & Interactive Modes** for different use cases
- **Real-time Agent Recommendations** based on query analysis

### 🔄 Streaming Workflow Engine
- **Event-driven Architecture** with real-time updates
- **Manual & Automatic Agent Selection** modes
- **Workflow State Management** with resumption capabilities
- **Streaming Response Generation** for better UX

### 🔒 Enterprise Security
- **PII-safe Logging** with automatic data masking
- **Multi-algorithm Rate Limiting** (token bucket, sliding window)
- **Comprehensive Input Validation** with Zod schemas
- **Secure Error Handling** without data leaks

### 🧪 Comprehensive Testing
- **Vitest Framework** with React Testing Library
- **Unit Tests** for core services and entities
- **Integration Tests** for complete workflows
- **E2E Tests** for user journeys
- **35+ Tests Passing** with continuous improvement

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **State Management**: Zustand with clean architecture
- **Testing**: Vitest, React Testing Library
- **Backend**: Next.js API Routes, Supabase
- **AI/ML**: LangChain, OpenAI GPT models
- **Deployment**: Vercel with production optimization

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenAI API key

### Installation

```bash
# Clone the repository
git clone https://github.com/curatedhealth/vital-expert-platform.git
cd vital-expert-platform

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev
```

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e
```

## 🏗️ Architecture Migration

The project includes comprehensive migration tools for clean architecture:

```bash
# Analyze current architecture
npm run migrate:analyze

# Dry run migration (safe to test)
npm run migrate:clean-arch:dry
npm run migrate:imports:dry

# Execute migration
npm run migrate:clean-arch
npm run migrate:imports

# Verify architecture compliance
npm run migrate:verify

# Run all migration steps
npm run migrate:all
```

## 📊 Project Status

### ✅ Completed Features
- [x] Clean Architecture Implementation
- [x] 50+ Healthcare AI Agents
- [x] Intelligent Agent Selection
- [x] Streaming Workflow Engine
- [x] Enterprise Security & Validation
- [x] Comprehensive Testing Framework
- [x] Production Deployment
- [x] Migration Tools

### 🔄 In Progress
- [ ] Documentation Updates
- [ ] Test Suite Improvements
- [ ] Performance Optimizations

### 📈 Metrics
- **Overall Progress**: 83% Complete (5/6 phases)
- **Test Coverage**: 35+ tests passing
- **TypeScript Errors**: 90% reduction
- **Build Time**: 2 minutes
- **Bundle Size**: 87.4 kB shared JS

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow Clean Architecture principles
- Write tests for all new features
- Use TypeScript strict mode
- Follow conventional commit messages
- Ensure all tests pass before submitting

## 📚 Documentation

- [Architecture Guide](./docs/architecture.md)
- [API Documentation](./docs/api.md)
- [Deployment Guide](./docs/deployment.md)
- [Contributing Guide](./docs/contributing.md)
- [Troubleshooting](./docs/troubleshooting.md)

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server

# Testing
npm run test             # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage
npm run test:unit        # Run unit tests only
npm run test:integration # Run integration tests only

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run type-check       # Run TypeScript checks
npm run format           # Format code with Prettier

# Migration
npm run migrate:analyze  # Analyze architecture
npm run migrate:all      # Run all migrations
```

## 🏥 Healthcare Domains

VITAL includes specialized agents across multiple healthcare domains:

- **Cardiology** - Heart health and cardiovascular diseases
- **Neurology** - Brain and nervous system disorders
- **Oncology** - Cancer diagnosis and treatment
- **Pediatrics** - Child health and development
- **Mental Health** - Psychological and psychiatric care
- **Emergency Medicine** - Critical care and trauma
- **Radiology** - Medical imaging and diagnostics
- **Pharmacology** - Drug interactions and treatments
- **Surgery** - Surgical procedures and recovery
- **Preventive Care** - Health maintenance and wellness

## 🔒 Security Features

- **PII Protection**: Automatic detection and masking of sensitive data
- **Rate Limiting**: Multi-algorithm protection against abuse
- **Input Validation**: Comprehensive validation with Zod schemas
- **Secure Logging**: Structured logging without data leaks
- **Error Handling**: Safe error responses without sensitive information

## 📈 Performance

- **Build Time**: 2 minutes
- **Bundle Size**: Optimized (87.4 kB shared JS)
- **Page Load**: Fast initial load with code splitting
- **Database**: Optimized queries with Supabase
- **Caching**: Intelligent caching strategies

## 🚀 Deployment

The application is automatically deployed to Vercel:

- **Production**: https://vital-expert-6ogba876j-crossroads-catalysts-projects.vercel.app
- **Build Status**: ✅ Successful
- **Pages Generated**: 74/74
- **Database**: Connected to Supabase cloud

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for GPT models and AI capabilities
- **Supabase** for backend infrastructure
- **Vercel** for deployment and hosting
- **Next.js** for the React framework
- **LangChain** for AI workflow orchestration

## 📞 Support

For support, email support@vitalpath.ai or join our Discord community.

---

**Built with ❤️ for the future of healthcare AI**
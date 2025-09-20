# VITAL Path Digital Health Intelligence Platform

🏥 **V**ision • **I**ntelligence • **T**rials • **A**ctivation • **L**earning

A comprehensive digital health intelligence platform featuring 50+ specialized AI agents for healthcare organizations.

## 🚀 Overview

VITAL Path empowers healthcare organizations through AI-powered expertise across regulatory, clinical, and market access domains. Built with Next.js 14, TypeScript, and Supabase.

## ✨ Key Features

- **🤖 50+ Specialized AI Agents** - FDA Regulatory, Clinical Trial Design, HIPAA Compliance, and more
- **👥 User Agent Management** - Personal copies of admin agents with edit/delete capabilities
- **💬 Real-time Chat Interface** - Interactive conversations with specialized healthcare experts
- **📚 Knowledge Management** - Upload, analyze, and search healthcare documents
- **🔧 Admin Tools** - Bulk upload and management of agents, capabilities, and prompts
- **🔒 HIPAA Compliance** - Built-in healthcare data protection and audit trails
- **📊 Analytics Dashboard** - Usage tracking and performance metrics

## 🏗️ Architecture

- **Frontend**: Next.js 14 with TypeScript and React 18
- **Database**: Supabase PostgreSQL with Row Level Security (RLS)
- **Styling**: Tailwind CSS with custom healthcare color scheme
- **State Management**: Zustand stores for agents and chat
- **Authentication**: Supabase Auth with role-based access control

## 🤖 Agent Categories

### Tier 1 Agents (Phase 1)
- **FDA Regulatory Strategist** - 510(k), PMA, De Novo pathways
- **Clinical Trial Designer** - Protocol development and study design
- **HIPAA Compliance Officer** - Privacy and security compliance
- **Reimbursement Strategist** - Market access and payer relations
- **QMS Architect** - Quality management systems

### Additional Specializations
- Regulatory Intelligence Expert
- HTA & Value Assessment Expert
- And 45+ more specialized agents

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/curatedhealth/vital-path-digital-health-platform.git
   cd vital-path-digital-health-platform
   ```

2. **Run automated setup**
   ```bash
   ./scripts/setup/setup-dev-environment.sh
   ```

### Manual Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```

   Update `.env.local` with your credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   OPENAI_API_KEY=your_openai_api_key
   ANTHROPIC_API_KEY=your_anthropic_api_key
   ```

3. **Database Setup**
   ```bash
   npm run db:migrate
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

Visit `http://localhost:3000` to access the platform.

## 📖 Usage

### For Healthcare Organizations

1. **Explore Agents** - Browse 50+ specialized healthcare AI agents
2. **Add to Chat** - Create personal copies of agents for customization
3. **Ask Questions** - Get expert guidance on regulatory, clinical, and business topics
4. **Upload Knowledge** - Build your organization's knowledge base
5. **Track Usage** - Monitor AI interactions and insights

### For Administrators

1. **Batch Upload** - Import agents, capabilities, and prompts in bulk
2. **User Management** - Control access and permissions
3. **Analytics** - Monitor platform usage and performance
4. **Configuration** - Customize agents and workflows

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - TypeScript type checking
- `npm run db:migrate` - Run database migrations
- `npm run db:status` - Check migration status
- `npm run test` - Run test suite

### Project Structure

```
src/
├── app/                     # Next.js 14 app router
│   ├── (app)/              # Authenticated app routes
│   │   ├── agents/         # Agent management pages
│   │   ├── chat/           # Chat interface
│   │   ├── dashboard/      # Analytics dashboard
│   │   └── knowledge/      # Knowledge management
│   └── api/                # API routes
│       ├── admin/          # Admin endpoints
│       ├── agents/         # Agent CRUD operations
│       ├── chat/           # Chat functionality
│       ├── debug/          # Debug utilities
│       └── llm/            # LLM provider integration
├── components/             # Reusable React components
│   ├── agents/             # Agent-specific components
│   ├── chat/               # Chat interface components
│   ├── ui/                 # Base UI components
│   └── ...                 # Feature-specific components
├── lib/                    # Utilities and services
│   ├── auth/               # Authentication logic
│   ├── database/           # Database utilities
│   ├── stores/             # Zustand state management
│   └── supabase/           # Supabase configuration
├── types/                  # TypeScript definitions
└── services/               # External service integrations

scripts/                    # Utility scripts
├── setup/                  # Environment setup
├── migration/              # Database migrations
├── testing/                # Test utilities
└── maintenance/            # Maintenance scripts

docs/                       # Documentation
├── Agents_Cap_Libraries/   # Agent configuration guides
└── prompt-library/         # Prompt templates
```

## 🔒 Security & Compliance

- **HIPAA Compliance** - Built-in privacy and security controls
- **Data Encryption** - At-rest and in-transit encryption
- **Audit Logging** - Comprehensive activity tracking
- **Role-Based Access** - Granular permission controls
- **Row Level Security** - Database-level access control

## 📊 Database Schema

The platform uses a comprehensive PostgreSQL schema including:

- `agents` - AI agent configurations and metadata
- `capabilities` - Agent capabilities and specializations
- `prompts` - Prompt templates and instructions
- `chats` - Conversation history and messages
- `knowledge_documents` - Uploaded documents and processing
- `user_profiles` - User accounts and permissions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Claude Code](https://claude.ai/code)
- Powered by [Supabase](https://supabase.com)
- UI components from [shadcn/ui](https://ui.shadcn.com)

## 📞 Support

For support, email [your-email@domain.com] or create an issue in this repository.

---

**🧩 Generated with Claude Code**

**Co-Authored-By: Claude <noreply@anthropic.com>**
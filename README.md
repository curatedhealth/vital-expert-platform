# VITAL Path Platform

A Digital Health Transformation Platform that guides healthcare organizations through the VITAL Framework: **Vision, Integrate, Test, Activate, Learn**.

## Overview

VITAL Path orchestrates multiple LLMs to provide expert-level guidance across clinical development, regulatory affairs, and market access. The platform helps healthcare organizations reduce development time by 40% and accelerate regulatory approval by 6-8 months.

## Tech Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Edge Functions)
- **Vector DB**: Pinecone for RAG (Retrieval Augmented Generation)
- **LLM Orchestration**: OpenAI, Anthropic, custom models via API
- **Workflow Automation**: n8n (self-hosted)
- **Deployment**: Vercel (frontend) + Supabase Cloud + Pinecone Cloud

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Pinecone account and index
- OpenAI API key
- Anthropic API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vital-path
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.template .env.local
   # Edit .env.local with your actual values
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
VITAL path/
├── src/                      # Source code
│   ├── app/                  # Next.js 14 App Router
│   ├── components/           # React components
│   ├── lib/                  # Utilities and integrations
│   ├── types/                # TypeScript definitions
│   └── hooks/                # Custom React hooks
│
├── docs/                     # Documentation
│   ├── architecture/         # System architecture docs
│   ├── guides/               # User and developer guides
│   ├── api/                  # API documentation
│   ├── compliance/           # HIPAA, regulatory docs
│   ├── prompt-library/       # AI prompt templates
│   ├── Agents_Cap_Libraries/ # Agent capabilities
│   └── archive/              # Historical documentation
│
├── database/                 # Database files
│   └── sql/
│       ├── migrations/       # Database migrations
│       │   ├── 2024/        # 2024 migrations
│       │   ├── 2025/        # 2025 migrations
│       │   └── fixes/       # Bug fixes
│       ├── schema/          # Schema definitions
│       ├── seeds/           # Seed data
│       ├── functions/       # Stored procedures
│       ├── policies/        # RLS policies
│       └── setup/           # Setup scripts
│
├── supabase/                # Supabase configuration
│   └── migrations/          # Supabase-specific migrations
│
├── config/                  # Configuration files
│   ├── environments/        # Environment configs
│   └── compliance/          # HIPAA compliance configs
│
├── scripts/                 # Utility scripts
│   ├── setup/              # Setup scripts
│   ├── migration/          # Migration utilities
│   ├── testing/            # Test scripts
│   └── archive/            # Archived scripts
│
├── data/                    # Data files
│   └── batch-uploads/      # Batch upload templates
│
└── tests/                   # Test suites
```

## Key Features

### Multi-Tenant SaaS
- Complete data isolation between organizations
- Role-based access control (RBAC)
- Usage-based billing
- White-label options for enterprise

### HIPAA Compliance
- End-to-end encryption
- Audit logging
- Access controls
- Data retention policies

### AI-Powered Guidance
- Multi-LLM orchestration for specialized expertise
- 250+ expert AI agents across healthcare domains
- Regulatory expert models for FDA/EMA guidance
- Clinical specialist models for trial design
- Market analyst models for reimbursement pathways

### Real-time Collaboration
- Live updates using Supabase Realtime
- Team collaboration features
- Progress tracking across the VITAL journey

## Documentation

For comprehensive documentation, see the `/docs` folder:

- **[Architecture Documentation](docs/architecture/)** - System design and architecture
- **[User Guides](docs/guides/)** - How-to guides and tutorials
- **[API Documentation](docs/api/)** - API reference and schemas
- **[Prompt Library](docs/prompt-library/)** - AI prompt templates
- **[Agent Capabilities](docs/Agents_Cap_Libraries/)** - Agent specifications

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run e2e tests

## Environment Variables

See `.env.local.template` for the complete list of required environment variables.

Key variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `PINECONE_API_KEY` - Pinecone API key for vector search
- `OPENAI_API_KEY` - OpenAI API key for LLM
- `ANTHROPIC_API_KEY` - Anthropic API key for Claude

## Database Management

### Migrations

Migrations are organized by year in `database/sql/migrations/`:
- `2024/` - All 2024 migrations
- `2025/` - All 2025 migrations
- `fixes/` - Bug fixes and patches

To run migrations:
```bash
npx supabase db push
```

### Seeds

Seed data is in `database/sql/seeds/`:
```bash
npx supabase db seed
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in this repository
- Check the documentation in the `/docs` folder
- Use the [Prompt Library](docs/prompt-library/) for AI-assisted development

---

**VITAL Path** - Transforming Digital Health, One Journey at a Time.
# Force rebuild Tue Oct  7 20:06:34 +01 2025

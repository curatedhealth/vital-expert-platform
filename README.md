# VITALpath Platform

A Digital Health Transformation Platform that guides healthcare organizations through the VITAL Framework: **Vision, Integrate, Test, Activate, Learn**.

## 🎯 Overview

VITALpath orchestrates multiple LLMs to provide expert-level guidance across clinical development, regulatory affairs, and market access. The platform helps healthcare organizations reduce development time by 40% and accelerate regulatory approval by 6-8 months.

## 🏗️ Tech Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Edge Functions)
- **Vector DB**: Pinecone for RAG (Retrieval Augmented Generation)
- **LLM Orchestration**: OpenAI, Anthropic, custom models via API
- **Workflow Automation**: n8n (self-hosted)
- **Deployment**: Vercel (frontend) + Supabase Cloud + Pinecone Cloud

## 🎨 Brand Identity

- **Primary Colors**: Trust Blue (#0B4F8C), Progress Teal (#00A19C), Deep Charcoal (#1A1A2E)
- **Secondary**: Regulatory Gold (#F5A623), Clinical Green (#27AE60), Market Purple (#7B68EE)
- **Typography**: Inter font family
- **Design**: 5-phase journey visualization with progressive opacity (35% to 100%)

## 🚀 Getting Started

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
   cd vitalpath-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your actual values
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
src/
├── app/                    # Next.js 14 App Router
│   ├── (auth)/            # Authentication routes
│   ├── (platform)/        # Main platform routes
│   ├── (admin)/           # Admin panel routes
│   └── api/               # API routes
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── platform/          # Platform-specific components
│   ├── journey/           # VITAL journey components
│   └── citations/         # Citation components
├── lib/
│   ├── supabase/          # Supabase client and utilities
│   ├── pinecone/          # Pinecone client and RAG
│   ├── llm/               # LLM orchestration
│   └── utils/             # Utility functions
├── types/                 # TypeScript type definitions
├── hooks/                 # Custom React hooks
└── styles/                # Additional styles
```

## 🔐 Key Features

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
- Regulatory expert models for FDA/EMA guidance
- Clinical specialist models for trial design
- Market analyst models for reimbursement pathways

### Real-time Collaboration
- Live updates using Supabase Realtime
- Team collaboration features
- Progress tracking across the VITAL journey

## 🔧 Environment Variables

See `.env.example` for the complete list of required environment variables.

Key variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `PINECONE_API_KEY` - Pinecone API key for vector search
- `OPENAI_API_KEY` - OpenAI API key for LLM
- `ANTHROPIC_API_KEY` - Anthropic API key for Claude

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Run type checking
npm run type-check
```

## 🚢 Deployment

The platform is designed for deployment on:
- **Frontend**: Vercel
- **Backend**: Supabase Cloud
- **Vector DB**: Pinecone Cloud
- **Workflows**: Self-hosted n8n

See the deployment guide in the docs for detailed instructions.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in this repository
- Contact the VITALpath team
- Check the documentation in the `/docs` folder

---

**VITALpath** - Transforming Digital Health, One Journey at a Time.
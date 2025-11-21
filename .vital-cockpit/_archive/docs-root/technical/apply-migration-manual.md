# 🗄️ Apply Database Migration Manually

## Step 1: Access Supabase SQL Editor

1. **Go to your Supabase dashboard:**
   https://supabase.com/dashboard/project/xazinxsiglqokwfmogyk/sql

2. **Click "New Query"**

## Step 2: Apply the Migration

Copy and paste the entire content from this file:
`supabase/migrations/20251007222509_complete_vital_schema.sql`

## Step 3: Execute the Migration

1. **Click "Run"** to execute the migration
2. **Wait for completion** (this may take a few minutes)

## Step 4: Verify the Migration

After the migration completes, you should see these tables created:

### Core Tables:
- ✅ `profiles` - User profiles
- ✅ `organizations` - Organization management
- ✅ `user_organizations` - User-organization relationships

### AI Agents System:
- ✅ `agents` - AI agents
- ✅ `agent_capabilities` - Agent capabilities
- ✅ `agent_knowledge_domains` - Agent knowledge domains

### LLM & Usage:
- ✅ `llm_providers` - LLM service providers
- ✅ `llm_models` - Available models
- ✅ `llm_usage_logs` - Usage tracking

### Knowledge Management:
- ✅ `knowledge_domains` - Knowledge categories
- ✅ `knowledge_documents` - Documents
- ✅ `document_embeddings` - RAG embeddings

### Chat & Workflows:
- ✅ `chat_sessions` - Chat sessions
- ✅ `chat_messages` - Chat messages
- ✅ `workflows` - Workflow definitions
- ✅ `workflow_executions` - Workflow runs

### Analytics & Compliance:
- ✅ `analytics_events` - User analytics
- ✅ `performance_metrics` - System metrics
- ✅ `audit_logs` - Audit trail
- ✅ `compliance_records` - Compliance tracking

## Step 5: Seed Initial Data

After the migration, run this to seed initial agents:

```sql
-- Insert comprehensive agent set (21 core agents)
INSERT INTO public.agents (name, display_name, description, avatar, color, system_prompt, model, temperature, max_tokens, capabilities, business_function, department, role, tier, status) VALUES

-- Tier 1 - Essential (5 agents)
('fda-regulatory-strategist', 'FDA Regulatory Strategist', 'Expert FDA regulatory strategist with 15+ years experience in medical device submissions. Ensures 100% regulatory compliance while optimizing approval timelines.', '🏛️', '#DC2626', 'You are an expert FDA Regulatory Strategist with 15+ years experience in medical device submissions. Your primary responsibility is to ensure 100% regulatory compliance while optimizing approval timelines.

## EXPERTISE AREAS:
- FDA regulatory pathways (510(k), PMA, De Novo, 513(g))
- Software as Medical Device (SaMD) classification per IMDRF framework
- Predicate device analysis and substantial equivalence arguments
- Pre-Submission strategy and Q-Sub meeting preparation
- Quality System Regulation (QSR) compliance
- Post-market surveillance and adverse event reporting

## RESPONSE GUIDELINES:
- Always cite specific FDA guidance documents and regulations
- Provide actionable timelines and next steps
- Highlight potential risks and mitigation strategies
- Reference relevant predicate devices when applicable
- Ensure all recommendations align with current FDA policies

You maintain the highest standards of regulatory expertise and provide guidance that directly supports successful FDA submissions.', 'gpt-4', 0.3, 2000, ARRAY['FDA Strategy', '510(k) Submissions', 'PMA Applications', 'De Novo Pathways', 'Q-Sub Meetings', 'Regulatory Compliance'], 'Regulatory Affairs', 'Regulatory Strategy', 'Senior Regulatory Strategist', 1, 'active'),

('clinical-protocol-designer', 'Clinical Protocol Designer', 'Expert clinical research professional specializing in digital health clinical trial design. Designs robust, FDA-compliant protocols that generate high-quality evidence for regulatory submissions.', '🔬', '#059669', 'You are an expert Clinical Protocol Designer specializing in digital health and medical device clinical trials. Your expertise ensures protocols generate high-quality evidence for regulatory submissions.

## EXPERTISE AREAS:
- Clinical trial design for digital health technologies
- Statistical analysis plans and endpoint selection
- Patient recruitment and retention strategies
- Real-world evidence (RWE) study design
- Health economics and outcomes research (HEOR)
- Clinical data management and quality assurance

## RESPONSE GUIDELINES:
- Design protocols that meet FDA and international standards
- Optimize for patient safety and data quality
- Consider practical implementation challenges
- Provide statistical justification for sample sizes
- Include comprehensive monitoring and safety plans
- Ensure protocols support intended regulatory claims

You create protocols that maximize the probability of regulatory success while maintaining scientific rigor and patient safety.', 'gpt-4', 0.4, 2000, ARRAY['Protocol Design', 'Statistical Planning', 'Endpoint Selection', 'Patient Recruitment', 'RWE Studies', 'HEOR Analysis'], 'Clinical Development', 'Clinical Operations', 'Senior Clinical Research Manager', 1, 'active'),

('quality-systems-architect', 'Quality Systems Architect', 'ISO 13485 and FDA QSR expert who designs and implements comprehensive quality management systems. Ensures full regulatory compliance while optimizing operational efficiency.', '⚙️', '#7C3AED', 'You are a Quality Systems Architect with deep expertise in ISO 13485 and FDA Quality System Regulation (QSR). You design and implement comprehensive quality management systems that ensure full regulatory compliance.

## EXPERTISE AREAS:
- ISO 13485:2016 implementation and maintenance
- FDA Quality System Regulation (21 CFR 820)
- Risk management per ISO 14971:2019
- Design controls and design history files
- CAPA (Corrective and Preventive Action) systems
- Supplier quality management and auditing

## RESPONSE GUIDELINES:
- Provide practical implementation strategies
- Ensure compliance with both FDA and international standards
- Focus on risk-based approaches to quality management
- Include specific procedures and documentation requirements
- Address integration with existing business processes
- Provide audit preparation and management guidance

You create quality systems that not only meet regulatory requirements but also drive business value through improved efficiency and reduced risk.', 'gpt-4', 0.3, 2000, ARRAY['ISO 13485', 'FDA QSR', 'Risk Management', 'Design Controls', 'CAPA Systems', 'Supplier Quality'], 'Quality Assurance', 'Quality Management', 'Senior Quality Systems Manager', 1, 'active'),

('market-access-strategist', 'Market Access Strategist', 'Healthcare economics and reimbursement expert who develops comprehensive market access strategies. Maximizes commercial success through evidence-based value propositions and payer engagement.', '💰', '#EA580C', 'You are a Market Access Strategist specializing in healthcare economics and reimbursement for digital health technologies. You develop comprehensive strategies that maximize commercial success.

## EXPERTISE AREAS:
- Health Technology Assessment (HTA) and value dossiers
- Reimbursement strategy and coding (CPT, HCPCS, ICD-10)
- Payer engagement and evidence requirements
- Health economics and outcomes research (HEOR)
- Budget impact modeling and cost-effectiveness analysis
- International market access and pricing strategies

## RESPONSE GUIDELINES:
- Develop evidence-based value propositions
- Address payer evidence requirements and timelines
- Provide specific coding and reimbursement guidance
- Include budget impact and cost-effectiveness considerations
- Address both US and international market access
- Provide practical implementation roadmaps

You create market access strategies that demonstrate clear value to payers while supporting sustainable business models.', 'gpt-4', 0.4, 2000, ARRAY['Market Access', 'Reimbursement Strategy', 'HEOR Analysis', 'Payer Engagement', 'Value Dossiers', 'Budget Impact Modeling'], 'Commercial', 'Market Access', 'Senior Market Access Director', 1, 'active'),

('hipaa-compliance-officer', 'HIPAA Compliance Officer', 'Healthcare privacy and security expert who ensures full HIPAA compliance. Protects patient data while enabling innovative digital health solutions.', '🔒', '#DC2626', 'You are a HIPAA Compliance Officer with extensive experience in healthcare privacy and security. You ensure full compliance with HIPAA regulations while enabling innovative digital health solutions.

## EXPERTISE AREAS:
- HIPAA Privacy Rule and Security Rule compliance
- Business Associate Agreement (BAA) management
- Risk assessment and mitigation strategies
- Incident response and breach notification procedures
- Workforce training and awareness programs
- Technical, administrative, and physical safeguards

## RESPONSE GUIDELINES:
- Provide specific compliance requirements and procedures
- Address both technical and administrative safeguards
- Include risk assessment methodologies
- Provide incident response and breach notification guidance
- Ensure practical implementation strategies
- Address integration with existing security frameworks

You create compliance programs that protect patient privacy while supporting business innovation and growth.', 'gpt-4', 0.3, 2000, ARRAY['HIPAA Compliance', 'Privacy Protection', 'Security Safeguards', 'Risk Assessment', 'Incident Response', 'BAA Management'], 'Compliance', 'Privacy & Security', 'Senior Compliance Officer', 1, 'active');

-- Add more agents as needed...
```

## Step 6: Test the Platform

After completing the migration and seeding:

1. **Refresh your platform:** https://vital-expert-qfd5gvdlp-crossroads-catalysts-projects.vercel.app/agents
2. **You should now see:**
   - ✅ 5+ agents in the dashboard
   - ✅ Agent statistics showing counts
   - ✅ Working authentication system
   - ✅ Functional database

## Troubleshooting

If you encounter any issues:

1. **Check the migration logs** in Supabase dashboard
2. **Verify all tables were created** in the Table Editor
3. **Check RLS policies** are enabled
4. **Test authentication** by signing up/in

The migration includes:
- ✅ **Complete database schema** with all relations
- ✅ **Row Level Security** policies
- ✅ **Proper indexes** for performance
- ✅ **Audit trails** and compliance tracking
- ✅ **Initial seed data** for agents and providers

#!/usr/bin/env node

/**
 * Load Expert Agents for the Enhanced VITAL AI System
 * Simplified version matching the existing agents table schema
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
);

// Expert agents matching the agents table structure
const expert_agents = [
  {
    name: 'dr-sarah-chen-ux-expert',
    display_name: 'Dr. Sarah Chen',
    description: 'Chief Design Officer at Mayo Clinic specializing in healthcare UX design, patient-centered interfaces, and clinical workflow integration.',
    avatar: '👩‍💻',
    color: '#3B82F6',
    model: 'gpt-4',
    system_prompt: 'You are Dr. Sarah Chen, a healthcare UX expert with 15 years of experience. You help design patient-centered digital health interfaces that integrate seamlessly with clinical workflows while maintaining accessibility standards. Focus on empathy-driven design and evidence-based UX patterns.',
    temperature: 0.7,
    max_tokens: 2000,
    rag_enabled: true,
    capabilities: ['user-experience-design', 'healthcare-accessibility', 'clinical-workflow-integration', 'patient-centered-design'],
    knowledge_domains: ['Healthcare UX', 'Clinical Workflows', 'Accessibility Standards', 'Medical Device Design'],
    domain_expertise: 'medical',
    business_function: 'Design & User Experience',
    role: 'UX Expert',
    tier: 1,
    priority: 100,
    implementation_phase: 1,
    is_custom: true,
    cost_per_query: 0.05,
    medical_specialty: 'Healthcare Design',
    hipaa_compliant: true,
    pharma_enabled: true,
    verify_enabled: true
  },
  {
    name: 'dr-robert-kim-clinical-ai',
    display_name: 'Dr. Robert Kim',
    description: 'Chief Medical Informatics Officer at Johns Hopkins specializing in clinical decision support systems and evidence-based medicine AI.',
    avatar: '👨‍⚕️',
    color: '#10B981',
    model: 'gpt-4',
    system_prompt: 'You are Dr. Robert Kim, a clinical informaticist with 20 years of experience in evidence-based medicine and clinical AI. You help design and validate clinical decision support systems, diagnostic algorithms, and clinical protocols. Always prioritize patient safety and evidence-based recommendations.',
    temperature: 0.3,
    max_tokens: 3000,
    rag_enabled: true,
    capabilities: ['clinical-decision-support', 'evidence-based-medicine', 'diagnostic-algorithms', 'clinical-protocols'],
    knowledge_domains: ['Clinical Medicine', 'Medical Informatics', 'Evidence-Based Medicine', 'Clinical Guidelines'],
    domain_expertise: 'medical',
    business_function: 'Clinical Decision Support',
    role: 'Clinical AI Expert',
    tier: 1,
    priority: 95,
    implementation_phase: 1,
    is_custom: true,
    cost_per_query: 0.08,
    medical_specialty: 'Internal Medicine',
    hipaa_compliant: true,
    pharma_enabled: true,
    verify_enabled: true
  },
  {
    name: 'dr-priya-sharma-ai-researcher',
    display_name: 'Dr. Priya Sharma',
    description: 'Principal AI Research Scientist at Google Health specializing in medical AI, machine learning, and computer vision for healthcare.',
    avatar: '👩‍🔬',
    color: '#8B5CF6',
    model: 'gpt-4',
    system_prompt: 'You are Dr. Priya Sharma, an AI research scientist with expertise in medical AI and machine learning. You help design and implement AI systems for healthcare, focusing on deep learning, computer vision, and NLP applications. Emphasize ethical AI development and robust validation.',
    temperature: 0.6,
    max_tokens: 2500,
    rag_enabled: true,
    capabilities: ['medical-ai', 'machine-learning', 'computer-vision', 'natural-language-processing'],
    knowledge_domains: ['AI/ML', 'Medical Imaging', 'Clinical NLP', 'Federated Learning'],
    domain_expertise: 'technical',
    business_function: 'AI Research & Development',
    role: 'AI Research Scientist',
    tier: 1,
    priority: 90,
    implementation_phase: 1,
    is_custom: true,
    cost_per_query: 0.06,
    medical_specialty: 'Medical AI',
    hipaa_compliant: true,
    pharma_enabled: true,
    verify_enabled: true
  },
  {
    name: 'dr-thomas-anderson-fda-regulatory',
    display_name: 'Dr. Thomas Anderson',
    description: 'Deputy Director of Digital Health at FDA specializing in medical device regulation, software as medical device, and AI/ML guidance.',
    avatar: '⚖️',
    color: '#DC2626',
    model: 'gpt-4',
    system_prompt: 'You are Dr. Thomas Anderson, an FDA regulatory expert with 25 years of experience in medical device regulation. You provide guidance on FDA pathways, software as medical device frameworks, and AI/ML regulatory requirements. Focus on regulatory compliance and safety.',
    temperature: 0.2,
    max_tokens: 3000,
    rag_enabled: true,
    capabilities: ['fda-regulation', 'medical-device-compliance', 'software-medical-device', 'regulatory-strategy'],
    knowledge_domains: ['FDA Regulations', 'Medical Device Law', 'AI/ML Guidance', 'Regulatory Science'],
    domain_expertise: 'regulatory',
    business_function: 'Regulatory Affairs',
    role: 'Regulatory Expert',
    tier: 1,
    priority: 85,
    implementation_phase: 1,
    is_custom: true,
    cost_per_query: 0.10,
    medical_specialty: 'Regulatory Science',
    hipaa_compliant: true,
    pharma_enabled: true,
    verify_enabled: true
  },
  {
    name: 'dr-david-wilson-strategy',
    display_name: 'Dr. David Wilson',
    description: 'Senior Partner at McKinsey Health Institute specializing in digital health strategy, healthcare transformation, and value-based care.',
    avatar: '💼',
    color: '#F59E0B',
    model: 'gpt-4',
    system_prompt: 'You are Dr. David Wilson, a healthcare strategy consultant with 18 years of experience in digital health transformation. You help organizations develop go-to-market strategies, assess market opportunities, and implement value-based care models. Focus on business viability and scalable solutions.',
    temperature: 0.7,
    max_tokens: 2500,
    rag_enabled: true,
    capabilities: ['digital-health-strategy', 'market-analysis', 'value-based-care', 'go-to-market-strategy'],
    knowledge_domains: ['Healthcare Strategy', 'Market Analysis', 'Business Development', 'Health Economics'],
    domain_expertise: 'business',
    business_function: 'Strategy & Business Development',
    role: 'Strategy Consultant',
    tier: 2,
    priority: 80,
    implementation_phase: 1,
    is_custom: true,
    cost_per_query: 0.12,
    medical_specialty: 'Healthcare Strategy',
    hipaa_compliant: true,
    pharma_enabled: true,
    verify_enabled: true
  },
  {
    name: 'maria-gonzalez-patient-advocate',
    display_name: 'Maria Gonzalez',
    description: 'Chief Patient Officer at Patient Advocate Foundation specializing in patient-centered care, health equity, and digital literacy.',
    avatar: '🤝',
    color: '#EC4899',
    model: 'gpt-4',
    system_prompt: 'You are Maria Gonzalez, a patient advocate with 15 years of experience championing patient rights and health equity. You help ensure digital health solutions are patient-centered, accessible, and equitable. Focus on patient voice, user experience, and reducing health disparities.',
    temperature: 0.8,
    max_tokens: 2000,
    rag_enabled: true,
    capabilities: ['patient-advocacy', 'health-equity', 'patient-engagement', 'digital-literacy'],
    knowledge_domains: ['Patient Advocacy', 'Health Equity', 'Patient Experience', 'Digital Divide'],
    domain_expertise: 'medical',
    business_function: 'Patient Advocacy',
    role: 'Patient Advocate',
    tier: 1,
    priority: 88,
    implementation_phase: 1,
    is_custom: true,
    cost_per_query: 0.04,
    medical_specialty: 'Patient Advocacy',
    hipaa_compliant: true,
    pharma_enabled: true,
    verify_enabled: true
  }
];

async function loadExpertAgents() {
  console.log('\n🚀 Loading Expert Agents for VITAL AI System\n');

  try {
    console.log(`👥 Loading ${expert_agents.length} expert agents...`);

    for (const agent of expert_agents) {
      console.log(`Loading: ${agent.display_name}`);

      const { data, error } = await supabase
        .from('agents')
        .insert(agent);

      if (error) {
        console.error(`❌ Error loading ${agent.display_name}:`, error.message);
      } else {
        console.log(`✅ Loaded: ${agent.display_name}`);
      }
    }

    console.log('\n📊 EXPERT AGENT LOADING SUMMARY:');
    console.log(`✅ Total agents loaded: ${expert_agents.length}`);

    // Summary by domain expertise
    const domains = {};
    expert_agents.forEach(agent => {
      domains[agent.domain_expertise] = (domains[agent.domain_expertise] || 0) + 1;
    });

    console.log('\n🏢 Agents by Domain Expertise:');
    Object.entries(domains).forEach(([domain, count]) => {
      console.log(`   ${domain}: ${count} agents`);
    });

    // Summary by tier
    const tiers = {};
    expert_agents.forEach(agent => {
      tiers[`tier_${agent.tier}`] = (tiers[`tier_${agent.tier}`] || 0) + 1;
    });

    console.log('\n🎯 Agents by Tier:');
    Object.entries(tiers).forEach(([tier, count]) => {
      console.log(`   ${tier}: ${count} agents`);
    });

    console.log('\n🎉 Expert agent loading complete!\n');

  } catch (error) {
    console.error('\n❌ Expert agent loading failed:', error);
  }
}

// Run if called directly
if (require.main === module) {
  loadExpertAgents();
}

module.exports = { loadExpertAgents, expert_agents };
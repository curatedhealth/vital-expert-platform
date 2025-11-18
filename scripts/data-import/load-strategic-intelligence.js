#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
);

const strategicIntelligenceAgent = {
  name: "strategic_intelligence_enhanced",
  display_name: "Strategic Intelligence Agent v2.0",
  description: "Market and competitive intelligence gathering agent with enhanced AI-driven insights. Monitors competitor pipelines, tracks regulatory approvals, analyzes market dynamics, predicts competitive responses, and provides strategic recommendations for pharmaceutical companies.",
  avatar: "🎯",
  color: "#FF6F00",
  system_prompt: `You are a Strategic Intelligence Agent specializing in pharmaceutical market analysis and competitive intelligence. You provide actionable insights on market dynamics, competitor strategies, and strategic opportunities.

CORE RESPONSIBILITIES:
1. Competitive Intelligence - Pipeline monitoring and analysis, Competitor strategy assessment, Patent landscape evaluation, M&A activity tracking, Partnership analysis
2. Market Analysis - Market sizing and segmentation, Growth driver identification, Pricing dynamics, Access landscape, Prescriber behavior
3. Strategic Insights - Scenario planning, War gaming exercises, Opportunity identification, Threat assessment, Strategic recommendations
4. Intelligence Synthesis - Executive briefings, Competitive dashboards, Early warning systems, Trend analysis, Impact assessments

PROMPT STARTERS:
• Analyze competitive landscape for [THERAPEUTIC AREA] including pipeline assets and market dynamics
• What is [COMPETITOR]'s likely launch strategy based on their recent activities and communications?
• Provide strategic assessment of recent partnership between [COMPANY A] and [COMPANY B]
• Generate early warning indicators for competitive threats to our [PRODUCT] franchise
• Analyze patent expiry impact and generic entry scenarios for top 5 products in [MARKET]
• What market access strategies are competitors using for similar products in [COUNTRY]?
• Develop war game scenarios for potential competitor responses to our pricing strategy
• Track and analyze [COMPETITOR]'s clinical trial modifications and their strategic implications
• Identify white space opportunities in [THERAPEUTIC AREA] based on unmet needs and pipeline gaps
• Create competitive intelligence briefing for board meeting on [STRATEGIC TOPIC]`,
  model: "gpt-4-turbo-preview",
  temperature: 0.7,
  max_tokens: 4000,
  capabilities: [
    "competitive_analysis",
    "market_research",
    "strategic_planning",
    "trend_analysis",
    "scenario_modeling",
    "intelligence_gathering",
    "risk_assessment",
    "opportunity_identification",
    "war_gaming",
    "executive_briefing"
  ],
  specializations: [
    "Strategic Intelligence",
    "Competitive Analysis",
    "Market Research"
  ],
  tools: [
    "competitor-tracker",
    "market-analyzer",
    "intelligence-synthesizer",
    "war-game-simulator",
    "trend-predictor"
  ],
  tier: 2,
  priority: 1,
  implementation_phase: 2,
  rag_enabled: true,
  knowledge_domains: [
    "Market Intelligence",
    "Competitive Strategy",
    "Pharmaceutical Industry",
    "Business Intelligence",
    "Strategic Analysis",
    "Market Research",
    "Patent Analysis",
    "Regulatory Intelligence",
    "Financial Analysis",
    "Technology Assessment"
  ],
  data_sources: [
    "Competitor Intelligence Database",
    "Market Dynamics Knowledge Base",
    "Strategic Analysis Frameworks",
    "Industry Reports",
    "Patent Databases"
  ],
  roi_metrics: {
    cost_reduction: 30,
    efficiency_gain: 85,
    accuracy_improvement: 94
  },
  use_cases: [
    "Competitive landscape analysis",
    "Market opportunity assessment",
    "Strategic planning",
    "Risk assessment",
    "Intelligence synthesis"
  ],
  target_users: [
    "executives",
    "strategy-teams",
    "business-development",
    "market-research"
  ],
  required_integrations: [
    "market-intelligence-platforms",
    "competitive-monitoring-tools",
    "strategic-planning-systems"
  ],
  security_level: "high",
  compliance_requirements: [
    "Strategy",
    "Competitive Intelligence",
    "Market Research",
    "Business"
  ],
  status: "active",
  is_custom: false,
  business_function: "Strategy",
  role: "Specialist",
  medical_specialty: "Cross-functional",
  hipaa_compliant: false,
  pharma_enabled: true,
  verify_enabled: true,
  metadata: {
    version: "2.0.0",
    enhanced_features: ["prompt_starters", "rag_integration", "advanced_analytics"],
    rag_configuration: {
      global_rags: ["market_intelligence", "pubmed_literature", "drug_databases"],
      specific_rags: {
        competitor_tracking: {
          name: "Competitor Intelligence Database",
          sources: ["SEC filings and earnings calls", "Clinical trial registries", "Patent databases", "Conference presentations", "Press releases and news", "Analyst reports"],
          embedding_model: "text-embedding-ada-002",
          chunk_size: 2000,
          update_frequency: "daily"
        }
      }
    },
    competency_levels: {
      market_analysis: 0.94,
      competitive_intelligence: 0.96,
      strategic_thinking: 0.92,
      data_synthesis: 0.90
    }
  },
  domain_expertise: "strategy",
  cost_per_query: 0.09,
  validation_status: "validated",
  validation_metadata: {
    validator: "strategy-team",
    last_validated: "2024-12-20"
  },
  performance_metrics: {
    citation_accuracy: 0.94,
    average_latency_ms: 1300,
    hallucination_rate: 0.03,
    medical_error_rate: 0.003,
    medical_accuracy_score: 0.94
  },
  accuracy_score: 0.94,
  evidence_required: true,
  regulatory_context: {
    is_regulated: false,
    considerations: ["antitrust", "sec_disclosure", "insider_trading"],
    compliance: ["competition_law", "disclosure_requirements"]
  },
  compliance_tags: ["strategy", "competitive_intelligence", "market_research", "business"],
  gdpr_compliant: true,
  audit_trail_enabled: true,
  data_classification: "confidential",
  is_public: true,
  clinical_validation_status: "pending", // Change to valid value
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

async function loadStrategicIntelligence() {
  try {
    console.log('🎯 Loading Strategic Intelligence Agent...\n');

    const { data, error } = await supabase
      .from('agents')
      .insert([strategicIntelligenceAgent])
      .select();

    if (error) {
      console.error('Error loading agent:', error.message);
      return;
    }

    console.log('✅ Successfully loaded Strategic Intelligence Agent v2.0');
    console.log('   Enhanced features: ✅ Prompt Starters, ✅ RAG Config, ✅ Advanced Analytics');

    return data[0];
  } catch (error) {
    console.error('Failed to load strategic intelligence agent:', error);
  }
}

loadStrategicIntelligence();
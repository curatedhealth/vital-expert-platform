/**
 * Script to insert panel templates into Supabase
 * Run with: node scripts/insert-panels.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Use service role key for admin operations, fallback to anon key
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const panels = [
  {
    slug: 'structured_panel',
    name: 'Structured Panel',
    description: 'Structured multi-expert panel with moderator, opening statements, multiple discussion rounds, consensus and documentation.',
    category: 'panel',
    mode: 'sequential',
    framework: 'langgraph',
    suggested_agents: [
      'fda-regulatory-strategist',
      'clinical-trial-designer',
      'hipaa-compliance-officer',
      'biostatistician-digital-health',
      'medical-science-liaison',
      'health-economics-modeler',
      'real-world-evidence-analyst',
      'product-launch-strategist',
      'payer-strategy-advisor',
      'risk-management-officer'
    ],
    default_settings: {
      userGuidance: 'high',
      allowDebate: true,
      maxRounds: 3,
      requireConsensus: true
    },
    metadata: {
      icon: '👥',
      tags: ['panel', 'structured', 'consensus', 'multi-expert'],
      popularity: 92
    }
  },
  {
    slug: 'open_panel',
    name: 'Open Panel',
    description: 'Open, collaborative panel format optimized for brainstorming, innovation and exploratory discussions.',
    category: 'panel',
    mode: 'collaborative',
    framework: 'autogen',
    suggested_agents: [
      'product-launch-strategist',
      'digital-marketing-strategist',
      'real-world-evidence-analyst',
      'clinical-trial-designer',
      'fda-regulatory-strategist',
      'payer-strategy-advisor',
      'health-economics-modeler',
      'medical-science-liaison',
      'personalized-medicine-specialist',
      'nlp-expert'
    ],
    default_settings: {
      userGuidance: 'medium',
      allowDebate: true,
      maxRounds: 4,
      requireConsensus: false
    },
    metadata: {
      icon: '💬',
      tags: ['panel', 'open-discussion', 'brainstorming', 'innovation'],
      popularity: 88
    }
  },
  {
    slug: 'expert_panel',
    name: 'Expert Panel',
    description: 'Focused expert consensus panel where domain specialists provide opinions and converge on a recommendation.',
    category: 'panel',
    mode: 'sequential',
    framework: 'langgraph',
    suggested_agents: [
      'clinical-trial-designer',
      'fda-regulatory-strategist',
      'health-economics-modeler',
      'biostatistician-digital-health',
      'hipaa-compliance-officer',
      'payer-strategy-advisor',
      'product-launch-strategist',
      'real-world-evidence-analyst',
      'medical-science-liaison',
      'risk-management-officer'
    ],
    default_settings: {
      userGuidance: 'high',
      allowDebate: true,
      maxRounds: 3,
      requireConsensus: true
    },
    metadata: {
      icon: '🧠',
      tags: ['panel', 'expert', 'consensus', 'advisory-board'],
      popularity: 94
    }
  }
];

async function insertPanels() {
  console.log('🔄 Inserting panel templates...');
  
  for (const panel of panels) {
    const { data, error } = await supabase
      .from('panels')
      .upsert(panel, { onConflict: 'slug' })
      .select();

    if (error) {
      console.error(`❌ Error inserting ${panel.slug}:`, error);
    } else {
      console.log(`✅ Inserted/Updated: ${panel.slug}`);
    }
  }

  console.log('✅ Done!');
}

insertPanels();


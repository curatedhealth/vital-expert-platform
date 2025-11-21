import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyAgents() {
  console.log('🔍 Verifying agents in database...\n');

  try {
    // Get total count
    const { count, error: countError } = await supabase
      .from('agents')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    if (countError) throw countError;

    console.log(`📊 Total Active Agents: ${count}\n`);

    // Get breakdown by tier
    const { data: tierData, error: tierError } = await supabase
      .from('agents')
      .select('tier')
      .eq('status', 'active');

    if (tierError) throw tierError;

    const tierCounts = tierData!.reduce((acc: any, agent: any) => {
      acc[agent.tier] = (acc[agent.tier] || 0) + 1;
      return acc;
    }, {});

    console.log('🎯 Agents by Tier:');
    Object.keys(tierCounts).sort().forEach(tier => {
      console.log(`  Tier ${tier}: ${tierCounts[tier]} agents`);
    });
    console.log('');

    // Get breakdown by model
    const { data: modelData, error: modelError } = await supabase
      .from('agents')
      .select('model, tier')
      .eq('status', 'active');

    if (modelError) throw modelError;

    const modelCounts = modelData!.reduce((acc: any, agent: any) => {
      const key = `${agent.model} (Tier ${agent.tier})`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    console.log('🤖 Agents by Model:');
    Object.keys(modelCounts).sort().forEach(key => {
      console.log(`  ${key}: ${modelCounts[key]} agents`);
    });
    console.log('');

    // Show sample agents
    const { data: sampleAgents, error: sampleError } = await supabase
      .from('agents')
      .select('display_name, model, tier, business_function')
      .eq('status', 'active')
      .order('tier')
      .order('priority')
      .limit(10);

    if (sampleError) throw sampleError;

    console.log('📋 Sample Agents (first 10):');
    sampleAgents!.forEach((agent: any, i: number) => {
      console.log(`  ${i + 1}. ${agent.display_name} (${agent.model}) - Tier ${agent.tier}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

verifyAgents();

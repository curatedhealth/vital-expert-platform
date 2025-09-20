import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key for server-side operations (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface AgentData {
  name: string;
  display_name: string;
  description: string;
  system_prompt: string;
  model: string;
  avatar: string;
  color: string;
  capabilities: string[];
  rag_enabled: boolean;
  temperature: number;
  max_tokens: number;
  is_custom: boolean;
  status: string;
  tier: number;
  priority: number;
  implementation_phase: number;
  knowledge_domains?: string[];
  business_function?: string;
  role?: string;
  medical_specialty?: string;
  clinical_validation_status?: string;
  medical_accuracy_score?: number;
  hipaa_compliant?: boolean;
  pharma_enabled?: boolean;
  verify_enabled?: boolean;
  fda_samd_class?: string;
}

interface BulkUploadRequest {
  agents: AgentData[];
  overwrite?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: BulkUploadRequest = await request.json();

    if (!body.agents || !Array.isArray(body.agents)) {
      return NextResponse.json({
        error: 'Invalid request format',
        message: 'Expected an object with an "agents" array'
      }, { status: 400 });
    }

    console.log(`🚀 Bulk upload: Processing ${body.agents.length} agents...`);

    const results = {
      successful: [] as any[],
      failed: [] as any[],
      skipped: [] as any[]
    };

    for (const agentData of body.agents) {
      try {
        // Validate required fields
        if (!agentData.name || !agentData.display_name) {
          results.failed.push({
            agent: agentData.name || 'Unknown',
            error: 'Missing required fields: name and display_name are required'
          });
          continue;
        }

        // Check if agent already exists
        const { data: existingAgent, error: checkError } = await supabaseAdmin
          .from('agents')
          .select('id, name')
          .eq('name', agentData.name)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          results.failed.push({
            agent: agentData.name,
            error: `Error checking existing agent: ${checkError.message}`
          });
          continue;
        }

        if (existingAgent && !body.overwrite) {
          results.skipped.push({
            agent: agentData.name,
            reason: 'Agent already exists (use overwrite=true to replace)'
          });
          continue;
        }

        // Prepare agent data for insertion
        const agentForInsert = {
          name: agentData.name,
          display_name: agentData.display_name,
          description: agentData.description,
          system_prompt: agentData.system_prompt,
          model: agentData.model || 'gpt-4',
          avatar: agentData.avatar || '🤖',
          color: agentData.color || '#3B82F6',
          capabilities: agentData.capabilities || [],
          rag_enabled: agentData.rag_enabled ?? false,
          temperature: agentData.temperature ?? 0.7,
          max_tokens: agentData.max_tokens ?? 2000,
          is_custom: agentData.is_custom ?? true,
          status: agentData.status || 'active',
          tier: agentData.tier ?? 1,
          priority: agentData.priority ?? 100,
          implementation_phase: agentData.implementation_phase ?? 1,
          knowledge_domains: agentData.knowledge_domains || [],
          business_function: agentData.business_function || null,
          role: agentData.role || null,
          medical_specialty: agentData.medical_specialty || null,
          clinical_validation_status: agentData.clinical_validation_status || 'pending',
          medical_accuracy_score: agentData.medical_accuracy_score || null,
          hipaa_compliant: agentData.hipaa_compliant ?? false,
          pharma_enabled: agentData.pharma_enabled ?? false,
          verify_enabled: agentData.verify_enabled ?? false,
          fda_samd_class: agentData.fda_samd_class || null
        };

        let result;
        if (existingAgent && body.overwrite) {
          // Update existing agent
          result = await supabaseAdmin
            .from('agents')
            .update(agentForInsert)
            .eq('id', existingAgent.id)
            .select();
        } else {
          // Insert new agent
          result = await supabaseAdmin
            .from('agents')
            .insert([agentForInsert])
            .select();
        }

        if (result.error) {
          results.failed.push({
            agent: agentData.name,
            error: result.error.message,
            code: result.error.code
          });
        } else {
          results.successful.push({
            agent: agentData.name,
            id: result.data[0].id,
            action: existingAgent ? 'updated' : 'created'
          });
          console.log(`✅ ${existingAgent ? 'Updated' : 'Created'}: ${agentData.display_name}`);
        }

      } catch (error) {
        results.failed.push({
          agent: agentData.name || 'Unknown',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    console.log(`\n📊 Bulk upload complete:`);
    console.log(`   ✅ Successful: ${results.successful.length}`);
    console.log(`   ❌ Failed: ${results.failed.length}`);
    console.log(`   ⏭️ Skipped: ${results.skipped.length}`);

    return NextResponse.json({
      success: true,
      summary: {
        total: body.agents.length,
        successful: results.successful.length,
        failed: results.failed.length,
        skipped: results.skipped.length
      },
      results: results
    });

  } catch (error) {
    console.error('❌ Bulk upload error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process bulk upload',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
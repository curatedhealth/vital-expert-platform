import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Validation schema for agent batch upload
const AgentBatchSchema = z.object({
  agents: z.array(z.object({
    name: z.string().regex(/^[a-z0-9-]+$/, 'Name must be lowercase with hyphens'),
    display_name: z.string().max(255),
    description: z.string().max(1000),
    avatar: z.string().optional(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    model: z.enum(['gpt-4', 'gpt-4-turbo', 'claude-3-opus', 'claude-3-sonnet']),
    system_prompt: z.string().min(50),
    temperature: z.number().min(0).max(1).optional(),
    max_tokens: z.number().min(100).max(10000).optional(),
    rag_enabled: z.boolean().optional(),
    capabilities: z.array(z.string()).optional(),
    knowledge_domains: z.array(z.string()).optional(),
    tier: z.number().min(1).max(3),
    priority: z.number().min(0).max(999),
    implementation_phase: z.number().min(1).max(3),
    status: z.enum(['development', 'testing', 'active', 'deprecated']).optional(),
    business_function: z.string().optional(),
    role: z.string().optional(),
    domain_expertise: z.enum(['medical', 'regulatory', 'legal', 'financial', 'business', 'technical', 'commercial', 'access', 'general']).optional(),

    // Healthcare compliance fields
    medical_specialty: z.string().optional(),
    clinical_validation_status: z.enum(['pending', 'validated', 'expired', 'under_review']).optional(),
    medical_accuracy_score: z.number().min(0).max(1).optional(),
    citation_accuracy: z.number().min(0).max(1).optional(),
    hallucination_rate: z.number().min(0).max(1).optional(),
    medical_error_rate: z.number().min(0).max(1).optional(),
    fda_samd_class: z.enum(['', 'I', 'IIa', 'IIb', 'III']).optional(),
    hipaa_compliant: z.boolean().optional(),
    pharma_enabled: z.boolean().optional(),
    verify_enabled: z.boolean().optional(),
    cost_per_query: z.number().min(0).optional(),
    average_latency_ms: z.number().min(0).optional(),
    is_custom: z.boolean().optional()
  })),
  options: z.object({
    validate_only: z.boolean().optional(),
    skip_duplicates: z.boolean().optional(),
    update_existing: z.boolean().optional()
  }).optional()
});

export async function POST(request: NextRequest) {
  try {
    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Parse and validate request body
    const body = await request.json();
    const validatedData = AgentBatchSchema.parse(body);

    const { agents, options = {} } = validatedData;
    const { validate_only = false, skip_duplicates = true, update_existing = false } = options;

    console.log(`🚀 Batch agent upload: ${agents.length} agents, validate_only: ${validate_only}`);

    // Validation results
    const results = {
      total: agents.length,
      processed: 0,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [] as Array<{ agent: string; error: string }>,
      warnings: [] as Array<{ agent: string; warning: string }>
    };

    // If validation only, return after schema validation
    if (validate_only) {
      return NextResponse.json({
        success: true,
        message: 'Validation successful',
        results: {
          ...results,
          processed: agents.length
        }
      });
    }

    // Process each agent
    for (const agent of agents) {
      try {
        console.log(`Processing agent: ${agent.name}`);

        // Check if agent already exists
        const { data: existing, error: checkError } = await supabase
          .from('agents')
          .select('id, name')
          .eq('name', agent.name)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          throw new Error(`Error checking existing agent: ${checkError.message}`);
        }

        if (existing) {
          if (skip_duplicates && !update_existing) {
            console.log(`Skipping duplicate agent: ${agent.name}`);
            results.skipped++;
            results.warnings.push({
              agent: agent.name,
              warning: 'Agent already exists, skipped'
            });
            continue;
          }

          if (update_existing) {
            // Update existing agent
            const { error: updateError } = await supabase
              .from('agents')
              .update({
                display_name: agent.display_name,
                description: agent.description,
                avatar: agent.avatar || '🤖',
                color: agent.color || '#6366f1',
                model: agent.model,
                system_prompt: agent.system_prompt,
                temperature: agent.temperature || 0.7,
                max_tokens: agent.max_tokens || 2000,
                rag_enabled: agent.rag_enabled ?? true,
                capabilities: agent.capabilities || [],
                knowledge_domains: agent.knowledge_domains || [],
                tier: agent.tier,
                priority: agent.priority,
                implementation_phase: agent.implementation_phase,
                status: agent.status || 'active',
                business_function: agent.business_function,
                role: agent.role,
                domain_expertise: agent.domain_expertise || 'general',
                medical_specialty: agent.medical_specialty,
                clinical_validation_status: agent.clinical_validation_status || 'pending',
                medical_accuracy_score: agent.medical_accuracy_score,
                citation_accuracy: agent.citation_accuracy,
                hallucination_rate: agent.hallucination_rate,
                medical_error_rate: agent.medical_error_rate,
                fda_samd_class: agent.fda_samd_class || '',
                hipaa_compliant: agent.hipaa_compliant ?? false,
                pharma_enabled: agent.pharma_enabled ?? false,
                verify_enabled: agent.verify_enabled ?? false,
                cost_per_query: agent.cost_per_query,
                average_latency_ms: agent.average_latency_ms,
                is_custom: agent.is_custom ?? true,
                updated_at: new Date().toISOString()
              })
              .eq('id', existing.id);

            if (updateError) {
              throw new Error(`Update failed: ${updateError.message}`);
            }

            console.log(`✅ Updated agent: ${agent.name}`);
            results.updated++;
          }
        } else {
          // Create new agent
          const { error: insertError } = await supabase
            .from('agents')
            .insert({
              name: agent.name,
              display_name: agent.display_name,
              description: agent.description,
              avatar: agent.avatar || '🤖',
              color: agent.color || '#6366f1',
              model: agent.model,
              system_prompt: agent.system_prompt,
              temperature: agent.temperature || 0.7,
              max_tokens: agent.max_tokens || 2000,
              rag_enabled: agent.rag_enabled ?? true,
              capabilities: agent.capabilities || [],
              knowledge_domains: agent.knowledge_domains || [],
              tier: agent.tier,
              priority: agent.priority,
              implementation_phase: agent.implementation_phase,
              status: agent.status || 'active',
              business_function: agent.business_function,
              role: agent.role,
              domain_expertise: agent.domain_expertise || 'general',
              medical_specialty: agent.medical_specialty,
              clinical_validation_status: agent.clinical_validation_status || 'pending',
              medical_accuracy_score: agent.medical_accuracy_score,
              citation_accuracy: agent.citation_accuracy,
              hallucination_rate: agent.hallucination_rate,
              medical_error_rate: agent.medical_error_rate,
              fda_samd_class: agent.fda_samd_class || '',
              hipaa_compliant: agent.hipaa_compliant ?? false,
              pharma_enabled: agent.pharma_enabled ?? false,
              verify_enabled: agent.verify_enabled ?? false,
              cost_per_query: agent.cost_per_query,
              average_latency_ms: agent.average_latency_ms,
              is_custom: agent.is_custom ?? true
            });

          if (insertError) {
            throw new Error(`Insert failed: ${insertError.message}`);
          }

          console.log(`✅ Created agent: ${agent.name}`);
          results.created++;
        }

        results.processed++;

      } catch (error) {
        console.error(`❌ Error processing agent ${agent.name}:`, error);
        results.errors.push({
          agent: agent.name,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Return results
    const success = results.errors.length === 0;
    const message = success
      ? `Successfully processed ${results.processed} agents`
      : `Processed ${results.processed} agents with ${results.errors.length} errors`;

    return NextResponse.json({
      success,
      message,
      results
    }, { status: success ? 200 : 207 }); // 207 = Multi-Status for partial success

  } catch (error) {
    console.error('Batch agent upload error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        errors: error.errors
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
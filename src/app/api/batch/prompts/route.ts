import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema for prompts batch upload
const PromptBatchSchema = z.object({
  prompts: z.array(z.object({
    name: z.string().regex(/^[a-z0-9-]+$/, 'Name must be lowercase with hyphens'),
    display_name: z.string().max(255),
    description: z.string().max(1000),
    domain: z.string(),
    complexity_level: z.enum(['simple', 'moderate', 'complex']),
    estimated_duration_hours: z.number().min(0).optional(),

    // Core prompt configuration
    system_prompt: z.string().min(50),
    user_prompt_template: z.string().min(20),

    // Input/Output specifications
    input_schema: z.record(z.any()),
    output_schema: z.record(z.any()),

    // Quality and validation
    success_criteria: z.object({
      description: z.string(),
      metrics: z.array(z.string()).optional()
    }),
    validation_rules: z.object({
      input_requirements: z.array(z.string()).optional(),
      output_validation: z.array(z.string()).optional()
    }).optional(),

    // Prerequisites and dependencies
    prerequisite_capabilities: z.array(z.string()).optional(),
    prerequisite_prompts: z.array(z.string()).optional(),
    model_requirements: z.object({
      model: z.string(),
      temperature: z.number().min(0).max(1),
      max_tokens: z.number().min(100).max(10000)
    }),

    // Metadata
    compliance_tags: z.array(z.string()).optional(),
    estimated_tokens: z.number().min(0).optional(),
    version: z.string().optional()
  })),
  options: z.object({
    validate_only: z.boolean().optional(),
    link_capabilities: z.boolean().optional(),
    validate_templates: z.boolean().optional()
  }).optional()
});

// Template validation function
function validatePromptTemplate(template: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check for unmatched braces
  const openBraces = (template.match(/\{/g) || []).length;
  const closeBraces = (template.match(/\}/g) || []).length;

  if (openBraces !== closeBraces) {
    errors.push('Unmatched braces in template');
  }

  // Extract placeholder variables
  const placeholders = template.match(/\{([^}]+)\}/g) || [];
  const variables = placeholders.map(p => p.slice(1, -1));

  // Check for empty placeholders
  if (variables.some(v => v.trim() === '')) {
    errors.push('Empty placeholder variables found');
  }

  // Check for duplicate variables
  const uniqueVars = new Set(variables);
  if (uniqueVars.size !== variables.length) {
    errors.push('Duplicate placeholder variables found');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export async function POST(request: NextRequest) {
  try {
    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Parse and validate request body
    const body = await request.json();
    const validatedData = PromptBatchSchema.parse(body);

    const { prompts, options = { /* TODO: implement */ } } = validatedData;
    const { validate_only = false, link_capabilities = true, validate_templates = true } = options;
    // Validation results
    const results = {
      total: prompts.length,
      processed: 0,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [] as Array<{ prompt: string; error: string }>,
      warnings: [] as Array<{ prompt: string; warning: string }>
    };

    // Additional template validation if requested
    if (validate_templates) {
      for (const prompt of prompts) {
        const templateValidation = validatePromptTemplate(prompt.user_prompt_template);
        if (!templateValidation.valid) {
          results.errors.push({
            prompt: prompt.name,
            error: `Template validation failed: ${templateValidation.errors.join(', ')}`
          });
        }
      }
    }

    // If validation only, return after schema validation
    if (validate_only) {
      return NextResponse.json({
        success: results.errors.length === 0,
        message: results.errors.length === 0 ? 'Validation successful' : 'Validation failed',
        results: {
          ...results,
          processed: prompts.length
        }
      });
    }

    // Process each prompt
    for (const prompt of prompts) {
      try {
        // Check if prompt already exists
        const { data: existing, error: checkError } = await supabase
          .from('prompts')
          .select('id, name')
          .eq('name', prompt.name)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          throw new Error(`Error checking existing prompt: ${checkError.message}`);
        }

        const promptData = {
          name: prompt.name,
          display_name: prompt.display_name,
          description: prompt.description,
          domain: prompt.domain,
          complexity_level: prompt.complexity_level,
          estimated_duration_hours: prompt.estimated_duration_hours,
          system_prompt: prompt.system_prompt,
          user_prompt_template: prompt.user_prompt_template,
          input_schema: prompt.input_schema,
          output_schema: prompt.output_schema,
          success_criteria: prompt.success_criteria,
          validation_rules: prompt.validation_rules || { /* TODO: implement */ },
          prerequisite_capabilities: prompt.prerequisite_capabilities || [],
          prerequisite_prompts: prompt.prerequisite_prompts || [],
          model_requirements: prompt.model_requirements,
          compliance_tags: prompt.compliance_tags || [],
          estimated_tokens: prompt.estimated_tokens,
          version: prompt.version || '1.0.0',
          updated_at: new Date().toISOString()
        };

        if (existing) {
          // Update existing prompt
          const { error: updateError } = await supabase
            .from('prompts')
            .update(promptData)
            .eq('id', existing.id);

          if (updateError) {
            throw new Error(`Update failed: ${updateError.message}`);
          }
          results.updated++;
        } else {
          // Create new prompt
          const { data: newPrompt, error: insertError } = await supabase
            .from('prompts')
            .insert(promptData)
            .select('id')
            .single();

          if (insertError) {
            throw new Error(`Insert failed: ${insertError.message}`);
          }
          results.created++;

          // Link capabilities if requested and prompt was created
          if (link_capabilities && newPrompt && prompt.prerequisite_capabilities) {
            try {
              // Get capability IDs
              const { data: capabilities } = await supabase
                .from('capabilities')
                .select('id, name')
                .in('name', prompt.prerequisite_capabilities);

              if (capabilities && capabilities.length > 0) {
                // Create prompt-capability links
                const links = capabilities.map(cap => ({
                  prompt_id: newPrompt.id,
                  capability_id: cap.id
                }));

                await supabase
                  .from('prompt_capabilities')
                  .insert(links);
              }
            } catch (linkError) {
              console.warn(`Warning: Could not link capabilities to prompt ${prompt.name}:`, linkError);
              results.warnings.push({
                prompt: prompt.name,
                warning: 'Could not link some capabilities'
              });
            }
          }
        }

        results.processed++;

      } catch (error) {
        console.error(`❌ Error processing prompt ${prompt.name}:`, error);
        results.errors.push({
          prompt: prompt.name,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Return results
    const success = results.errors.length === 0;
    const message = success
      ? `Successfully processed ${results.processed} prompts`
      : `Processed ${results.processed} prompts with ${results.errors.length} errors`;

    return NextResponse.json({
      success,
      message,
      results
    }, { status: success ? 200 : 207 });

  } catch (error) {
    console.error('Batch prompt upload error:', error);

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
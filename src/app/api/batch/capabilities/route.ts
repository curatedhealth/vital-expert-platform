import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Validation schema for capabilities batch upload
const CapabilityBatchSchema = z.object({
  capabilities: z.array(z.object({
    name: z.string().regex(/^[a-z0-9-]+$/, 'Name must be lowercase with hyphens'),
    display_name: z.string().max(255),
    description: z.string().max(1000),
    category: z.string(),
    domain: z.string(),
    complexity_level: z.enum(['basic', 'intermediate', 'advanced', 'expert']),
    status: z.enum(['active', 'inactive', 'deprecated']).optional(),
    estimated_duration_hours: z.number().min(0).optional(),

    // Core configuration
    methodology: z.object({
      approach: z.string(),
      steps: z.array(z.string())
    }).optional(),
    quality_metrics: z.object({
      accuracy_target: z.string(),
      time_target: z.string(),
      compliance_requirements: z.array(z.string())
    }),
    output_format: z.object({
      primary: z.string(),
      secondary: z.string().optional(),
      deliverables: z.array(z.string()).optional()
    }).optional(),

    // Prerequisites and dependencies
    prerequisite_capabilities: z.array(z.string()).optional(),
    prerequisite_knowledge: z.array(z.string()).optional(),
    tools_required: z.array(z.string()).optional(),

    // Validation and compliance
    validation_requirements: z.object({
      medical_review_required: z.boolean().optional(),
      regulatory_review_required: z.boolean().optional(),
      peer_review_required: z.boolean().optional(),
      quality_review_required: z.boolean().optional(),
      statistical_review_required: z.boolean().optional(),
      clinical_review_required: z.boolean().optional(),
      economic_review_required: z.boolean().optional(),
      legal_review_required: z.boolean().optional(),
      technical_review_required: z.boolean().optional(),
      management_review_required: z.boolean().optional(),
      data_review_required: z.boolean().optional()
    }).optional(),
    compliance_tags: z.array(z.string()).optional(),
    examples: z.array(z.string()).optional(),
    limitations: z.array(z.string()).optional()
  })),
  options: z.object({
    validate_only: z.boolean().optional(),
    skip_duplicates: z.boolean().optional(),
    create_categories: z.boolean().optional()
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
    const validatedData = CapabilityBatchSchema.parse(body);

    const { capabilities, options = {} } = validatedData;
    const { validate_only = false, skip_duplicates = true, create_categories = true } = options;

    console.log(`🚀 Batch capability upload: ${capabilities.length} capabilities, validate_only: ${validate_only}`);

    // Validation results
    const results = {
      total: capabilities.length,
      processed: 0,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [] as Array<{ capability: string; error: string }>,
      warnings: [] as Array<{ capability: string; warning: string }>
    };

    // If validation only, return after schema validation
    if (validate_only) {
      return NextResponse.json({
        success: true,
        message: 'Validation successful',
        results: {
          ...results,
          processed: capabilities.length
        }
      });
    }

    // Create capability categories if needed
    if (create_categories) {
      const categories = [...new Set(capabilities.map(cap => cap.category))];

      for (const categoryName of categories) {
        try {
          const { data: existingCategory } = await supabase
            .from('capability_categories')
            .select('id')
            .eq('name', categoryName)
            .single();

          if (!existingCategory) {
            await supabase
              .from('capability_categories')
              .insert({
                name: categoryName,
                description: `Auto-created category for ${categoryName} capabilities`,
                is_active: true,
                sort_order: 100
              });
            console.log(`Created category: ${categoryName}`);
          }
        } catch (error) {
          console.warn(`Warning: Could not create category ${categoryName}:`, error);
        }
      }
    }

    // Process each capability
    for (const capability of capabilities) {
      try {
        console.log(`Processing capability: ${capability.name}`);

        // Check if capability already exists
        const { data: existing, error: checkError } = await supabase
          .from('capabilities')
          .select('id, name')
          .eq('name', capability.name)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          throw new Error(`Error checking existing capability: ${checkError.message}`);
        }

        if (existing) {
          if (skip_duplicates) {
            console.log(`Skipping duplicate capability: ${capability.name}`);
            results.skipped++;
            results.warnings.push({
              capability: capability.name,
              warning: 'Capability already exists, skipped'
            });
            continue;
          }

          // Update existing capability
          const { error: updateError } = await supabase
            .from('capabilities')
            .update({
              display_name: capability.display_name,
              description: capability.description,
              category: capability.category,
              domain: capability.domain,
              complexity_level: capability.complexity_level,
              status: capability.status || 'active',
              estimated_duration_hours: capability.estimated_duration_hours,
              methodology: capability.methodology || {},
              quality_metrics: capability.quality_metrics,
              output_format: capability.output_format || {},
              prerequisite_capabilities: capability.prerequisite_capabilities || [],
              prerequisite_knowledge: capability.prerequisite_knowledge || [],
              tools_required: capability.tools_required || [],
              validation_requirements: capability.validation_requirements || {},
              compliance_tags: capability.compliance_tags || [],
              examples: capability.examples || [],
              limitations: capability.limitations || [],
              updated_at: new Date().toISOString()
            })
            .eq('id', existing.id);

          if (updateError) {
            throw new Error(`Update failed: ${updateError.message}`);
          }

          console.log(`✅ Updated capability: ${capability.name}`);
          results.updated++;
        } else {
          // Create new capability
          const { error: insertError } = await supabase
            .from('capabilities')
            .insert({
              name: capability.name,
              display_name: capability.display_name,
              description: capability.description,
              category: capability.category,
              domain: capability.domain,
              complexity_level: capability.complexity_level,
              status: capability.status || 'active',
              estimated_duration_hours: capability.estimated_duration_hours,
              methodology: capability.methodology || {},
              quality_metrics: capability.quality_metrics,
              output_format: capability.output_format || {},
              prerequisite_capabilities: capability.prerequisite_capabilities || [],
              prerequisite_knowledge: capability.prerequisite_knowledge || [],
              tools_required: capability.tools_required || [],
              validation_requirements: capability.validation_requirements || {},
              compliance_tags: capability.compliance_tags || [],
              examples: capability.examples || [],
              limitations: capability.limitations || []
            });

          if (insertError) {
            throw new Error(`Insert failed: ${insertError.message}`);
          }

          console.log(`✅ Created capability: ${capability.name}`);
          results.created++;
        }

        results.processed++;

      } catch (error) {
        console.error(`❌ Error processing capability ${capability.name}:`, error);
        results.errors.push({
          capability: capability.name,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Return results
    const success = results.errors.length === 0;
    const message = success
      ? `Successfully processed ${results.processed} capabilities`
      : `Processed ${results.processed} capabilities with ${results.errors.length} errors`;

    return NextResponse.json({
      success,
      message,
      results
    }, { status: success ? 200 : 207 });

  } catch (error) {
    console.error('Batch capability upload error:', error);

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
import { NextRequest, NextResponse } from 'next/server';
import { schemaDrivenGenerator, type GenerationRequest } from '@/lib/services/generation/schema-driven-generator';
import { listSchemas, type SchemaType } from '@/lib/services/generation/response-schemas';

export const dynamic = 'force-dynamic';

/**
 * POST /api/generate/structured
 *
 * Generate structured documents from extracted entities
 *
 * Request body:
 * {
 *   schema_type: 'clinical_summary' | 'regulatory_document' | 'research_report' | 'market_access',
 *   extraction_run_id: string,
 *   user_preferences?: {
 *     include_unverified?: boolean,
 *     min_confidence?: number,
 *     required_medical_codes?: boolean
 *   },
 *   template_params?: Record<string, any>
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      schema_type,
      extraction_run_id,
      user_preferences,
      template_params
    } = body as GenerationRequest;

    // Validate required fields
    if (!schema_type || !extraction_run_id) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          required: ['schema_type', 'extraction_run_id']
        },
        { status: 400 }
      );
    }

    // Validate schema type
    const validSchemas = listSchemas();
    if (!validSchemas.includes(schema_type)) {
      return NextResponse.json(
        {
          error: 'Invalid schema type',
          valid_schemas: validSchemas
        },
        { status: 400 }
      );
    }

    // Generate structured response
    const result = await schemaDrivenGenerator.generate({
      schema_type,
      extraction_run_id,
      user_preferences,
      template_params
    });

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Generation failed',
          validation_errors: result.validation_errors,
          metadata: result.metadata
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      schema_type: result.schema_type,
      data: result.data,
      metadata: result.metadata
    });

  } catch (error) {
    console.error('Structured generation API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/generate/structured
 *
 * Get list of available schemas
 */
export async function GET() {
  try {
    const schemas = listSchemas();

    return NextResponse.json({
      success: true,
      schemas: schemas.map(schemaType => ({
        type: schemaType,
        description: getSchemaDescription(schemaType)
      }))
    });
  } catch (error) {
    console.error('Schema list API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to list schemas',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function getSchemaDescription(schemaType: SchemaType): string {
  const descriptions: Record<SchemaType, string> = {
    clinical_summary: 'Comprehensive clinical summary with medications, diagnoses, procedures, and lab results',
    regulatory_document: 'FDA/EMA regulatory submission document with safety, efficacy, and compliance data',
    research_report: 'Academic research report with introduction, methods, results, and discussion',
    market_access: 'Market access dossier with clinical and economic value propositions'
  };

  return descriptions[schemaType];
}

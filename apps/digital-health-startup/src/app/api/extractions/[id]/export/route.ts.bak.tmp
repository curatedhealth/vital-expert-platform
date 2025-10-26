import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/extractions/[id]/export?format=json|csv|fhir|hl7|pdf
 *
 * Export extraction data in various formats
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const extractionId = params.id;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';

    // Get all entities for this extraction
    const { data: entities, error } = await supabase
      .from('extracted_entities')
      .select('*')
      .eq('extraction_run_id', extractionId)
      .order('char_start', { ascending: true });

    if (error) {
      console.error('Failed to fetch entities:', error);
      return NextResponse.json(
        { error: 'Failed to fetch entities', details: error.message },
        { status: 500 }
      );
    }

    if (!entities || entities.length === 0) {
      return NextResponse.json(
        { error: 'Extraction not found' },
        { status: 404 }
      );
    }

    // Get entity relationships
    const entityIds = entities.map(e => e.id);
    const { data: relationships } = await supabase
      .from('entity_relationships')
      .select('*')
      .in('source_entity_id', entityIds);

    // Format data based on requested format
    switch (format.toLowerCase()) {
      case 'json':
        return exportJSON(extractionId, entities, relationships || []);

      case 'csv':
        return exportCSV(extractionId, entities);

      case 'fhir':
        return exportFHIR(extractionId, entities, relationships || []);

      case 'hl7':
        return exportHL7(extractionId, entities);

      case 'pdf':
        return exportPDF(extractionId, entities, relationships || []);

      default:
        return NextResponse.json(
          { error: `Unsupported format: ${format}` },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Export API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to export data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function exportJSON(extractionId: string, entities: any[], relationships: any[]) {
  const data = {
    extraction_id: extractionId,
    exported_at: new Date().toISOString(),
    format: 'json',
    entities: entities.map(e => ({
      id: e.id,
      type: e.entity_type,
      text: e.entity_text,
      attributes: e.attributes,
      confidence: e.confidence,
      source: {
        document_id: e.document_id,
        chunk_id: e.chunk_id,
        char_start: e.char_start,
        char_end: e.char_end,
        context_before: e.context_before,
        context_after: e.context_after
      },
      medical_codes: {
        icd10: e.icd10_code,
        snomed: e.snomed_code,
        rxnorm: e.rxnorm_code,
        cpt: e.cpt_code,
        loinc: e.loinc_code
      },
      verification: {
        status: e.verification_status,
        verified_by: e.verified_by,
        verified_at: e.verified_at,
        notes: e.verification_notes
      },
      metadata: {
        extraction_model: e.extraction_model,
        extraction_version: e.extraction_version,
        created_at: e.created_at,
        updated_at: e.updated_at
      }
    })),
    relationships: relationships.map(r => ({
      id: r.id,
      source_entity_id: r.source_entity_id,
      target_entity_id: r.target_entity_id,
      relationship_type: r.relationship_type,
      confidence: r.confidence,
      evidence: r.evidence
    })),
    summary: {
      total_entities: entities.length,
      total_relationships: relationships.length,
      by_type: entities.reduce((acc: Record<string, number>, e) => {
        acc[e.entity_type] = (acc[e.entity_type] || 0) + 1;
        return acc;
      }, {}),
      avg_confidence: entities.reduce((sum, e) => sum + (e.confidence || 0), 0) / entities.length
    }
  };

  return new NextResponse(JSON.stringify(data, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="extraction_${extractionId}.json"`
    }
  });
}

function exportCSV(extractionId: string, entities: any[]) {
  const headers = [
    'ID',
    'Type',
    'Text',
    'Confidence',
    'ICD-10',
    'RxNorm',
    'CPT',
    'SNOMED',
    'LOINC',
    'Char Start',
    'Char End',
    'Verification Status',
    'Verified At',
    'Created At'
  ];

  const rows = entities.map(e => [
    e.id,
    e.entity_type,
    `"${(e.entity_text || '').replace(/"/g, '""')}"`,
    e.confidence?.toFixed(2) || '',
    e.icd10_code || '',
    e.rxnorm_code || '',
    e.cpt_code || '',
    e.snomed_code || '',
    e.loinc_code || '',
    e.char_start,
    e.char_end,
    e.verification_status || 'pending',
    e.verified_at || '',
    e.created_at
  ]);

  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="extraction_${extractionId}.csv"`
    }
  });
}

function exportFHIR(extractionId: string, entities: any[], relationships: any[]) {
  // FHIR R4 Bundle resource
  const fhirBundle = {
    resourceType: 'Bundle',
    id: extractionId,
    type: 'collection',
    timestamp: new Date().toISOString(),
    entry: entities.map(e => ({
      fullUrl: `urn:uuid:${e.id}`,
      resource: convertEntityToFHIR(e)
    }))
  };

  return new NextResponse(JSON.stringify(fhirBundle, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/fhir+json',
      'Content-Disposition': `attachment; filename="extraction_${extractionId}_fhir.json"`
    }
  });
}

function convertEntityToFHIR(entity: any): any {
  // Map entity types to FHIR resources
  switch (entity.entity_type) {
    case 'medication':
      return {
        resourceType: 'MedicationStatement',
        id: entity.id,
        status: 'active',
        medicationCodeableConcept: {
          text: entity.entity_text,
          coding: entity.rxnorm_code ? [{
            system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
            code: entity.rxnorm_code,
            display: entity.entity_text
          }] : []
        },
        dosage: entity.attributes?.dosage ? [{
          text: entity.attributes.dosage,
          route: entity.attributes.route ? {
            text: entity.attributes.route
          } : undefined,
          timing: entity.attributes.frequency ? {
            repeat: {
              frequency: parseInt(entity.attributes.frequency) || 1,
              period: 1,
              periodUnit: 'd'
            }
          } : undefined
        }] : [],
        meta: {
          tag: [{
            system: 'http://vital.ai/extraction-confidence',
            code: String(entity.confidence),
            display: `Confidence: ${Math.round((entity.confidence || 0) * 100)}%`
          }]
        }
      };

    case 'diagnosis':
    case 'condition':
      return {
        resourceType: 'Condition',
        id: entity.id,
        clinicalStatus: {
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
            code: 'active'
          }]
        },
        code: {
          text: entity.entity_text,
          coding: entity.icd10_code ? [{
            system: 'http://hl7.org/fhir/sid/icd-10',
            code: entity.icd10_code,
            display: entity.entity_text
          }] : []
        },
        meta: {
          tag: [{
            system: 'http://vital.ai/extraction-confidence',
            code: String(entity.confidence),
            display: `Confidence: ${Math.round((entity.confidence || 0) * 100)}%`
          }]
        }
      };

    case 'procedure':
      return {
        resourceType: 'Procedure',
        id: entity.id,
        status: 'completed',
        code: {
          text: entity.entity_text,
          coding: entity.cpt_code ? [{
            system: 'http://www.ama-assn.org/go/cpt',
            code: entity.cpt_code,
            display: entity.entity_text
          }] : []
        },
        meta: {
          tag: [{
            system: 'http://vital.ai/extraction-confidence',
            code: String(entity.confidence),
            display: `Confidence: ${Math.round((entity.confidence || 0) * 100)}%`
          }]
        }
      };

    case 'lab_result':
      return {
        resourceType: 'Observation',
        id: entity.id,
        status: 'final',
        code: {
          text: entity.entity_text,
          coding: entity.loinc_code ? [{
            system: 'http://loinc.org',
            code: entity.loinc_code,
            display: entity.entity_text
          }] : []
        },
        valueString: entity.attributes?.value || entity.entity_text,
        meta: {
          tag: [{
            system: 'http://vital.ai/extraction-confidence',
            code: String(entity.confidence),
            display: `Confidence: ${Math.round((entity.confidence || 0) * 100)}%`
          }]
        }
      };

    default:
      return {
        resourceType: 'Basic',
        id: entity.id,
        code: {
          text: entity.entity_type
        },
        subject: {
          display: entity.entity_text
        }
      };
  }
}

function exportHL7(extractionId: string, entities: any[]) {
  // HL7 v2.x message format (simplified)
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').slice(0, 14);

  const segments = [
    // Message Header
    `MSH|^~\\&|VITAL|EXTRACTION|EHR|SYSTEM|${timestamp}||ORU^R01|${extractionId}|P|2.5`,
    // Patient Identification (placeholder)
    `PID|1||PATIENT_ID^^^VITAL||DOE^JOHN||19800101|M`,
  ];

  // Add observation segments for each entity
  entities.forEach((entity, index) => {
    const obsId = `OBS${index + 1}`;
    segments.push(`OBR|${index + 1}|${obsId}||${entity.entity_type}|||${timestamp}`);
    segments.push(
      `OBX|${index + 1}|TX|${entity.entity_type}||${entity.entity_text}||||||F|||${timestamp}||^VITAL_AI^CONFIDENCE:${entity.confidence}`
    );
  });

  const hl7Message = segments.join('\r\n') + '\r\n';

  return new NextResponse(hl7Message, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Content-Disposition': `attachment; filename="extraction_${extractionId}.hl7"`
    }
  });
}

function exportPDF(extractionId: string, entities: any[], relationships: any[]) {
  // For now, return HTML that can be printed to PDF
  // In production, use a library like puppeteer or pdfkit
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>VITAL Extraction Report - ${extractionId}</title>
  <style>
    @media print {
      @page { margin: 2cm; }
      body { margin: 0; }
    }
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
    }
    .header {
      border-bottom: 3px solid #2563eb;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    h1 { color: #1e40af; margin: 0; }
    .metadata { color: #6b7280; font-size: 14px; margin-top: 10px; }
    .summary {
      background: #f3f4f6;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .entity {
      border: 1px solid #e5e7eb;
      padding: 15px;
      margin-bottom: 15px;
      border-radius: 6px;
      page-break-inside: avoid;
    }
    .entity-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
    }
    .entity-type {
      font-weight: bold;
      text-transform: uppercase;
      font-size: 12px;
      color: #2563eb;
    }
    .confidence {
      font-size: 12px;
      color: #059669;
    }
    .entity-text {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 10px;
    }
    .attributes {
      background: #f9fafb;
      padding: 10px;
      border-radius: 4px;
      font-size: 13px;
    }
    .codes {
      margin-top: 10px;
      font-size: 12px;
      color: #6b7280;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🏥 VITAL Extraction Report</h1>
    <div class="metadata">
      <strong>Extraction ID:</strong> ${extractionId}<br>
      <strong>Generated:</strong> ${new Date().toLocaleString()}<br>
      <strong>Total Entities:</strong> ${entities.length}<br>
      <strong>Total Relationships:</strong> ${relationships.length}
    </div>
  </div>

  <div class="summary">
    <h2>Summary</h2>
    <p><strong>Average Confidence:</strong> ${Math.round(entities.reduce((sum, e) => sum + (e.confidence || 0), 0) / entities.length * 100)}%</p>
    <p><strong>Entity Types:</strong></p>
    <ul>
      ${Object.entries(entities.reduce((acc: Record<string, number>, e) => {
        acc[e.entity_type] = (acc[e.entity_type] || 0) + 1;
        return acc;
      }, {})).map(([type, count]) => `<li>${type}: ${count}</li>`).join('')}
    </ul>
  </div>

  <h2>Extracted Entities</h2>
  ${entities.map(e => `
    <div class="entity">
      <div class="entity-header">
        <span class="entity-type">${e.entity_type}</span>
        <span class="confidence">Confidence: ${Math.round((e.confidence || 0) * 100)}%</span>
      </div>
      <div class="entity-text">${escapeHtml(e.entity_text)}</div>
      ${e.attributes && Object.keys(e.attributes).length > 0 ? `
        <div class="attributes">
          ${Object.entries(e.attributes).map(([key, value]) =>
            `<div><strong>${key}:</strong> ${escapeHtml(String(value))}</div>`
          ).join('')}
        </div>
      ` : ''}
      ${e.icd10_code || e.rxnorm_code || e.cpt_code ? `
        <div class="codes">
          ${e.icd10_code ? `ICD-10: ${e.icd10_code} ` : ''}
          ${e.rxnorm_code ? `RxNorm: ${e.rxnorm_code} ` : ''}
          ${e.cpt_code ? `CPT: ${e.cpt_code}` : ''}
        </div>
      ` : ''}
    </div>
  `).join('')}

  <script>
    window.onload = () => window.print();
  </script>
</body>
</html>
  `;

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html',
      'Content-Disposition': `inline; filename="extraction_${extractionId}.html"`
    }
  });
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

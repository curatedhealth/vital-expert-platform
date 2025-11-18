import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/extractions/[id]/verify
 *
 * Serve the interactive verification UI for a specific extraction
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return new NextResponse('Supabase configuration missing', { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { id: extractionId } = await params;

    // Get all entities for this extraction
    const { data: entities, error } = await supabase
      .from('extracted_entities')
      .select('*')
      .eq('extraction_run_id', extractionId)
      .order('char_start', { ascending: true });

    if (error) {
      console.error('Failed to fetch entities:', error);
      return new NextResponse('Failed to fetch entities', { status: 500 });
    }

    if (!entities || entities.length === 0) {
      return new NextResponse('Extraction not found', { status: 404 });
    }

    // Get entity relationships
    const entityIds = entities.map((e: any) => e.id);
    const { data: relationships } = await supabase
      .from('entity_relationships')
      .select('*')
      .in('source_entity_id', entityIds);

    // Calculate metrics
    const totalEntities = entities.length;
    const avgConfidence = entities.reduce((sum, e) => sum + (e.confidence || 0), 0) / totalEntities;
    const byType = entities.reduce((acc: Record<string, number>, e) => {
      acc[e.entity_type] = (acc[e.entity_type] || 0) + 1;
      return acc;
    }, {});

    // Generate verification HTML
    const html = generateVerificationHTML({
      extractionId,
      entities,
      relationships: relationships || [],
      metrics: {
        totalEntities,
        avgConfidence: Math.round(avgConfidence * 100),
        byType
      }
    });

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
    });

  } catch (error) {
    console.error('Verification UI API error:', error);
    return new NextResponse('Failed to generate verification UI', { status: 500 });
  }
}

function generateVerificationHTML(data: {
  extractionId: string;
  entities: any[];
  relationships: any[];
  metrics: any;
}): string {
  const { extractionId, entities, relationships, metrics } = data;

  // Group entities by document
  const entityCards = entities.map(entity => `
    <div class="entity-card" data-entity-id="${entity.id}">
      <div class="entity-header">
        <span class="entity-type entity-type-${entity.entity_type}">${entity.entity_type}</span>
        <span class="confidence-badge confidence-${getConfidenceLevel(entity.confidence)}">
          ${Math.round((entity.confidence || 0) * 100)}% confidence
        </span>
      </div>
      <div class="entity-text">${escapeHtml(entity.entity_text)}</div>
      ${entity.attributes && Object.keys(entity.attributes).length > 0 ? `
        <div class="entity-attributes">
          ${Object.entries(entity.attributes).map(([key, value]) => `
            <div class="attribute">
              <span class="attribute-key">${key}:</span>
              <span class="attribute-value">${escapeHtml(String(value))}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
      ${entity.icd10_code || entity.rxnorm_code || entity.cpt_code ? `
        <div class="medical-codes">
          ${entity.icd10_code ? `<span class="code">ICD-10: ${entity.icd10_code}</span>` : ''}
          ${entity.rxnorm_code ? `<span class="code">RxNorm: ${entity.rxnorm_code}</span>` : ''}
          ${entity.cpt_code ? `<span class="code">CPT: ${entity.cpt_code}</span>` : ''}
        </div>
      ` : ''}
      <div class="entity-source">
        <small>Position: ${entity.char_start}-${entity.char_end}</small>
      </div>
      <div class="entity-actions">
        <button class="btn btn-approve" onclick="verifyEntity('${entity.id}', 'approve')">
          ✓ Approve
        </button>
        <button class="btn btn-reject" onclick="verifyEntity('${entity.id}', 'reject')">
          ✗ Reject
        </button>
        <button class="btn btn-flag" onclick="verifyEntity('${entity.id}', 'flag')">
          ⚠ Flag
        </button>
      </div>
      <div class="entity-status" id="status-${entity.id}"></div>
    </div>
  `).join('');

  const relationshipCards = relationships.map(rel => `
    <div class="relationship-card">
      <div class="relationship-type">${rel.relationship_type}</div>
      <div class="relationship-confidence">${Math.round((rel.confidence || 0) * 100)}%</div>
    </div>
  `).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VITAL Extraction Verification - ${extractionId}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: #f5f7fa;
      color: #2d3748;
      line-height: 1.6;
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px;
    }

    .header {
      background: white;
      padding: 30px;
      border-radius: 12px;
      margin-bottom: 30px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .header h1 {
      font-size: 28px;
      font-weight: 700;
      color: #1a202c;
      margin-bottom: 10px;
    }

    .header p {
      color: #718096;
      font-size: 14px;
    }

    .metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .metric-card {
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .metric-label {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      color: #718096;
      margin-bottom: 8px;
    }

    .metric-value {
      font-size: 32px;
      font-weight: 700;
      color: #1a202c;
    }

    .entities-grid {
      display: grid;
      gap: 20px;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    }

    .entity-card {
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      transition: all 0.2s;
    }

    .entity-card:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .entity-card.verified {
      border-left: 4px solid #48bb78;
    }

    .entity-card.rejected {
      border-left: 4px solid #f56565;
    }

    .entity-card.flagged {
      border-left: 4px solid #ed8936;
    }

    .entity-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .entity-type {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      text-transform: capitalize;
    }

    .entity-type-medication { background: #c6f6d5; color: #22543d; }
    .entity-type-diagnosis { background: #fed7d7; color: #742a2a; }
    .entity-type-procedure { background: #bee3f8; color: #2c5282; }
    .entity-type-condition { background: #feebc8; color: #7c2d12; }
    .entity-type-lab_result { background: #e9d8fd; color: #44337a; }

    .confidence-badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
    }

    .confidence-high { background: #c6f6d5; color: #22543d; }
    .confidence-medium { background: #feebc8; color: #7c2d12; }
    .confidence-low { background: #fed7d7; color: #742a2a; }

    .entity-text {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 12px;
      color: #1a202c;
    }

    .entity-attributes {
      margin-bottom: 12px;
      padding: 12px;
      background: #f7fafc;
      border-radius: 6px;
    }

    .attribute {
      margin-bottom: 4px;
      font-size: 13px;
    }

    .attribute-key {
      font-weight: 600;
      color: #4a5568;
      margin-right: 6px;
    }

    .attribute-value {
      color: #2d3748;
    }

    .medical-codes {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
      flex-wrap: wrap;
    }

    .code {
      padding: 4px 8px;
      background: #edf2f7;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      color: #4a5568;
    }

    .entity-source {
      margin-bottom: 12px;
      color: #a0aec0;
      font-size: 12px;
    }

    .entity-actions {
      display: flex;
      gap: 8px;
    }

    .btn {
      flex: 1;
      padding: 10px;
      border: none;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-approve {
      background: #48bb78;
      color: white;
    }

    .btn-approve:hover {
      background: #38a169;
    }

    .btn-reject {
      background: #f56565;
      color: white;
    }

    .btn-reject:hover {
      background: #e53e3e;
    }

    .btn-flag {
      background: #ed8936;
      color: white;
    }

    .btn-flag:hover {
      background: #dd6b20;
    }

    .entity-status {
      margin-top: 12px;
      padding: 8px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      text-align: center;
      display: none;
    }

    .entity-status.success {
      display: block;
      background: #c6f6d5;
      color: #22543d;
    }

    .entity-status.error {
      display: block;
      background: #fed7d7;
      color: #742a2a;
    }

    .export-section {
      background: white;
      padding: 20px;
      border-radius: 12px;
      margin-top: 30px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .export-section h2 {
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 15px;
    }

    .export-buttons {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .export-btn {
      padding: 10px 20px;
      background: #4299e1;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .export-btn:hover {
      background: #3182ce;
    }

    @media (max-width: 768px) {
      .entities-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏥 VITAL Extraction Verification</h1>
      <p>Extraction ID: ${extractionId}</p>
    </div>

    <div class="metrics">
      <div class="metric-card">
        <div class="metric-label">Total Entities</div>
        <div class="metric-value">${metrics.totalEntities}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Avg Confidence</div>
        <div class="metric-value">${metrics.avgConfidence}%</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Relationships</div>
        <div class="metric-value">${relationships.length}</div>
      </div>
    </div>

    <div class="entities-grid">
      ${entityCards}
    </div>

    <div class="export-section">
      <h2>📤 Export Options</h2>
      <div class="export-buttons">
        <button class="export-btn" onclick="exportData('json')">Export JSON</button>
        <button class="export-btn" onclick="exportData('csv')">Export CSV</button>
        <button class="export-btn" onclick="exportData('fhir')">Export FHIR</button>
        <button class="export-btn" onclick="exportData('hl7')">Export HL7</button>
        <button class="export-btn" onclick="exportData('pdf')">Export PDF</button>
      </div>
    </div>
  </div>

  <script>
    async function verifyEntity(entityId, action) {
      const card = document.querySelector(\`[data-entity-id="\${entityId}"]\`);
      const statusDiv = document.getElementById(\`status-\${entityId}\`);
      const buttons = card.querySelectorAll('.btn');

      // Disable buttons
      buttons.forEach(btn => btn.disabled = true);

      try {
        const response = await fetch('/api/extractions/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            entity_id: entityId,
            action: action,
            user_id: null // TODO: Get from session
          })
        });

        const result = await response.json();

        if (result.success) {
          statusDiv.className = 'entity-status success';
          statusDiv.textContent = \`✓ \${action.charAt(0).toUpperCase() + action.slice(1)}d successfully\`;

          if (action === 'approve') {
            card.classList.add('verified');
          } else if (action === 'reject') {
            card.classList.add('rejected');
          } else if (action === 'flag') {
            card.classList.add('flagged');
          }

          // Keep buttons disabled after successful verification
        } else {
          throw new Error(result.error || 'Verification failed');
        }
      } catch (error) {
        statusDiv.className = 'entity-status error';
        statusDiv.textContent = \`✗ Error: \${error.message}\`;

        // Re-enable buttons on error
        buttons.forEach(btn => btn.disabled = false);
      }
    }

    async function exportData(format) {
      try {
        const response = await fetch(\`/api/extractions/${extractionId}/export?format=\${format}\`);

        if (!response.ok) {
          throw new Error('Export failed');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = \`extraction_${extractionId}.\${format}\`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        alert(\`Export failed: \${error.message}\`);
      }
    }
  </script>
</body>
</html>
  `;
}

function getConfidenceLevel(confidence: number): string {
  if (confidence >= 0.8) return 'high';
  if (confidence >= 0.5) return 'medium';
  return 'low';
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

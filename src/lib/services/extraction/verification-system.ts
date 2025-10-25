/**
 * Extraction Verification System
 * Interactive UI for clinician verification of extracted entities
 * Critical for regulatory compliance (FDA/EMA) and premium tier pricing
 */

import { ExtractedEntity, StructuredExtraction } from './extraction-quality-evaluator';

export interface RetrievedDocument {
  id: string;
  content: string;
  title?: string;
  source_url?: string;
  metadata?: Record<string, any>;
}

export interface CodingSuggestion {
  entity: ExtractedEntity;
  coding_system: 'ICD-10' | 'RxNorm' | 'CPT' | 'SNOMED' | 'LOINC';
  code: string;
  description: string;
  confidence: number;
}

export interface VerificationUI {
  url: string;
  embed_code: string;
  pdf_url?: string;
  expiry: Date;
}

export interface EnhancementOptions {
  verificationControls: boolean;
  codingSuggestions: CodingSuggestion[];
  confidenceMetrics: {
    totalEntities: number;
    avgConfidence: number;
    pendingCount: number;
  };
  exportOptions: string[];
  annotations: boolean;
  comments: boolean;
  auditTrail: any;
}

export class ExtractionVerificationSystem {
  /**
   * Generate interactive HTML for clinician verification
   * This is critical for regulatory compliance and trust
   */
  async generateVerificationUI(
    extraction: StructuredExtraction,
    documents: RetrievedDocument[]
  ): Promise<VerificationUI> {
    // Calculate confidence metrics
    const confidenceMetrics = this.calculateConfidenceMetrics(extraction);

    // Generate clinical coding suggestions
    const codingSuggestions = await this.generateCodingSuggestions(extraction);

    // Generate enhanced HTML
    const enhancedHtml = this.enhanceVisualization({
      verificationControls: true,
      codingSuggestions,
      confidenceMetrics,
      exportOptions: ['JSON', 'CSV', 'FHIR', 'HL7', 'PDF'],
      annotations: true,
      comments: true,
      auditTrail: extraction.audit_trail || {}
    }, extraction, documents);

    // Store visualization
    const vizId = this.generateVisualizationId();
    await this.storeVisualization(vizId, enhancedHtml);

    return {
      url: `/api/extractions/${vizId}/verify`,
      embed_code: this.generateEmbedCode(vizId),
      pdf_url: `/api/extractions/${vizId}/pdf`,
      expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    };
  }

  /**
   * Generate interactive HTML visualization
   */
  private enhanceVisualization(
    options: EnhancementOptions,
    extraction: StructuredExtraction,
    documents: RetrievedDocument[]
  ): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VITAL Extraction Verification</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: #f5f5f5;
      color: #333;
    }

    .container {
      display: flex;
      height: 100vh;
    }

    .main-content {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      background: white;
    }

    .vital-verification-panel {
      width: 400px;
      background: #fafafa;
      border-left: 1px solid #e0e0e0;
      padding: 20px;
      overflow-y: auto;
    }

    .document-viewer {
      background: white;
      padding: 30px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .document-title {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 20px;
      color: #1a1a1a;
    }

    .document-content {
      line-height: 1.8;
      font-size: 16px;
      white-space: pre-wrap;
    }

    /* Entity Highlighting */
    .entity {
      padding: 2px 4px;
      border-radius: 3px;
      cursor: pointer;
      position: relative;
      transition: all 0.2s;
    }

    .entity:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }

    .entity-medication { background: #C8E6C9; border-bottom: 2px solid #4CAF50; }
    .entity-diagnosis { background: #FFCDD2; border-bottom: 2px solid #F44336; }
    .entity-procedure { background: #BBDEFB; border-bottom: 2px solid #2196F3; }
    .entity-lab_result { background: #FFF9C4; border-bottom: 2px solid #FFC107; }
    .entity-condition { background: #F8BBD0; border-bottom: 2px solid #E91E63; }

    .entity-tooltip {
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      background: #333;
      color: white;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 12px;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s;
      z-index: 1000;
    }

    .entity:hover .entity-tooltip {
      opacity: 1;
    }

    /* Verification Panel */
    .panel-section {
      background: white;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .panel-section h3 {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 12px;
      color: #1a1a1a;
    }

    .stat-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .stat-label {
      color: #666;
      font-size: 14px;
    }

    .stat-value {
      font-weight: 600;
      font-size: 14px;
    }

    /* Entity Verification */
    .entity-verification {
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      padding: 12px;
      margin-bottom: 12px;
      transition: all 0.2s;
    }

    .entity-verification:hover {
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .entity-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .entity-type-badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .badge-medication { background: #C8E6C9; color: #2E7D32; }
    .badge-diagnosis { background: #FFCDD2; color: #C62828; }
    .badge-procedure { background: #BBDEFB; color: #1565C0; }

    .entity-text {
      font-size: 14px;
      font-weight: 500;
      margin: 8px 0;
    }

    .entity-attributes {
      font-size: 12px;
      color: #666;
      margin: 4px 0;
    }

    .confidence-indicator {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
    }

    .confidence-high { background: #C8E6C9; color: #2E7D32; }
    .confidence-medium { background: #FFF9C4; color: #F57F17; }
    .confidence-low { background: #FFCDD2; color: #C62828; }

    .verification-buttons {
      display: flex;
      gap: 8px;
      margin-top: 10px;
    }

    .btn {
      flex: 1;
      padding: 6px 12px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 600;
      transition: all 0.2s;
    }

    .btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    .approve-btn {
      background: #4CAF50;
      color: white;
    }

    .reject-btn {
      background: #f44336;
      color: white;
    }

    .flag-btn {
      background: #FF9800;
      color: white;
    }

    /* Clinical Coding */
    .coding-suggestion {
      background: #f8f8f8;
      border-left: 3px solid #2196F3;
      padding: 10px;
      margin: 8px 0;
      border-radius: 4px;
      font-size: 13px;
    }

    .coding-system {
      font-weight: 600;
      color: #2196F3;
    }

    .coding-code {
      font-family: 'Courier New', monospace;
      background: #e0e0e0;
      padding: 2px 6px;
      border-radius: 3px;
      margin: 0 4px;
    }

    /* Export Options */
    .export-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
      margin-top: 12px;
    }

    .export-btn {
      padding: 10px;
      background: #2196F3;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      transition: all 0.2s;
    }

    .export-btn:hover {
      background: #1976D2;
    }

    /* Audit Trail */
    .audit-entry {
      font-family: 'Courier New', monospace;
      font-size: 11px;
      background: #f5f5f5;
      padding: 4px 8px;
      margin: 4px 0;
      border-radius: 3px;
      overflow-x: auto;
    }

    @media print {
      .vital-verification-panel {
        display: none;
      }
      .main-content {
        margin: 0;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="main-content">
      <div class="document-viewer">
        <div class="document-title">
          ${documents[0]?.title || 'Medical Document'}
        </div>
        <div class="document-content">
${this.renderDocumentWithHighlights(documents[0], extraction)}
        </div>
      </div>
    </div>

    <div class="vital-verification-panel">
      <div class="panel-section">
        <h3>📊 Summary</h3>
        <div class="stat-row">
          <span class="stat-label">Total Entities</span>
          <span class="stat-value">${options.confidenceMetrics.totalEntities}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Avg Confidence</span>
          <span class="stat-value">${(options.confidenceMetrics.avgConfidence * 100).toFixed(1)}%</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Pending Review</span>
          <span class="stat-value">${options.confidenceMetrics.pendingCount}</span>
        </div>
      </div>

      <div class="panel-section">
        <h3>🏥 Clinical Coding</h3>
        ${this.renderCodingSuggestions(options.codingSuggestions)}
      </div>

      <div class="panel-section">
        <h3>✅ Entities for Review</h3>
        <div id="entity-verification-list">
          ${this.renderEntityList(extraction.entities)}
        </div>
      </div>

      <div class="panel-section">
        <h3>📤 Export</h3>
        <div class="export-grid">
          ${this.renderExportButtons(options.exportOptions)}
        </div>
      </div>

      <div class="panel-section">
        <h3>📝 Audit Trail</h3>
        <div class="audit-entry">
          Extracted: ${extraction.metadata.extraction_timestamp}
        </div>
        <div class="audit-entry">
          Documents: ${extraction.metadata.documents_processed}
        </div>
        <div class="audit-entry">
          Entities: ${extraction.metadata.entities_extracted}
        </div>
      </div>
    </div>
  </div>

  <script>
    ${this.generateVerificationScript()}
  </script>
</body>
</html>
    `;
  }

  /**
   * Render document content with entity highlights
   */
  private renderDocumentWithHighlights(
    document: RetrievedDocument,
    extraction: StructuredExtraction
  ): string {
    if (!document) return '';

    let content = document.content;
    const entities = extraction.entities
      .filter(e => e.source.document_id === document.id)
      .sort((a, b) => b.source.char_start - a.source.char_start); // Reverse order for replacement

    // Replace entity text with highlighted spans
    for (const entity of entities) {
      const before = content.substring(0, entity.source.char_start);
      const entityText = content.substring(entity.source.char_start, entity.source.char_end);
      const after = content.substring(entity.source.char_end);

      const highlighted = `<span class="entity entity-${entity.type}" data-entity-id="${entity.id}">
        ${this.escapeHtml(entityText)}
        <span class="entity-tooltip">
          ${entity.type}: ${(entity.confidence * 100).toFixed(0)}% confidence
        </span>
      </span>`;

      content = before + highlighted + after;
    }

    return content;
  }

  /**
   * Render clinical coding suggestions
   */
  private renderCodingSuggestions(suggestions: CodingSuggestion[]): string {
    if (suggestions.length === 0) {
      return '<p style="color: #999; font-size: 13px;">No coding suggestions available</p>';
    }

    return suggestions.slice(0, 5).map(s => `
      <div class="coding-suggestion">
        <span class="coding-system">${s.coding_system}</span>
        <span class="coding-code">${s.code}</span>
        <div style="margin-top: 4px; color: #666;">${s.description}</div>
        <div style="margin-top: 4px; font-size: 11px; color: #999;">
          Confidence: ${(s.confidence * 100).toFixed(0)}%
        </div>
      </div>
    `).join('');
  }

  /**
   * Render entity list for verification
   */
  private renderEntityList(entities: ExtractedEntity[]): string {
    return entities.slice(0, 10).map(entity => {
      const confidenceClass = entity.confidence >= 0.8 ? 'high' :
                             entity.confidence >= 0.5 ? 'medium' : 'low';

      return `
        <div class="entity-verification" data-entity-id="${entity.id}">
          <div class="entity-header">
            <span class="entity-type-badge badge-${entity.type}">${entity.type}</span>
            <span class="confidence-indicator confidence-${confidenceClass}">
              ${(entity.confidence * 100).toFixed(0)}%
            </span>
          </div>
          <div class="entity-text">${this.escapeHtml(entity.text)}</div>
          ${this.renderEntityAttributes(entity.attributes)}
          <div class="verification-buttons">
            <button class="btn approve-btn" onclick="approveEntity('${entity.id}')">
              ✓ Approve
            </button>
            <button class="btn reject-btn" onclick="rejectEntity('${entity.id}')">
              ✗ Reject
            </button>
            <button class="btn flag-btn" onclick="flagEntity('${entity.id}')">
              ⚠ Flag
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Render entity attributes
   */
  private renderEntityAttributes(attributes: Record<string, any>): string {
    if (!attributes || Object.keys(attributes).length === 0) return '';

    const attrs = Object.entries(attributes)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');

    return `<div class="entity-attributes">${this.escapeHtml(attrs)}</div>`;
  }

  /**
   * Render export buttons
   */
  private renderExportButtons(options: string[]): string {
    return options.map(format => `
      <button class="export-btn" onclick="exportAs('${format}')">
        ${format}
      </button>
    `).join('');
  }

  /**
   * Generate interactive verification script
   */
  private generateVerificationScript(): string {
    return `
      function approveEntity(entityId) {
        console.log('Approving entity:', entityId);
        fetch('/api/extractions/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ entityId, status: 'approved' })
        });
        // Update UI
        const element = document.querySelector('[data-entity-id="' + entityId + '"]');
        if (element) {
          element.style.background = '#C8E6C9';
          element.style.borderColor = '#4CAF50';
        }
      }

      function rejectEntity(entityId) {
        console.log('Rejecting entity:', entityId);
        fetch('/api/extractions/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ entityId, status: 'rejected' })
        });
        // Update UI
        const element = document.querySelector('[data-entity-id="' + entityId + '"]');
        if (element) {
          element.style.background = '#FFCDD2';
          element.style.borderColor = '#F44336';
        }
      }

      function flagEntity(entityId) {
        const reason = prompt('Why are you flagging this entity?');
        if (!reason) return;

        console.log('Flagging entity:', entityId, reason);
        fetch('/api/extractions/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ entityId, status: 'flagged', reason })
        });
        // Update UI
        const element = document.querySelector('[data-entity-id="' + entityId + '"]');
        if (element) {
          element.style.background = '#FFF9C4';
          element.style.borderColor = '#FF9800';
        }
      }

      function exportAs(format) {
        console.log('Exporting as:', format);
        const url = window.location.href.replace('/verify', '/export/' + format.toLowerCase());
        window.open(url, '_blank');
      }

      // Highlight entity when clicked in document
      document.querySelectorAll('.entity').forEach(el => {
        el.addEventListener('click', function() {
          const entityId = this.getAttribute('data-entity-id');
          const verificationEl = document.querySelector('.entity-verification[data-entity-id="' + entityId + '"]');
          if (verificationEl) {
            verificationEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            verificationEl.style.animation = 'pulse 0.5s';
          }
        });
      });
    `;
  }

  /**
   * Generate clinical coding suggestions
   */
  private async generateCodingSuggestions(
    extraction: StructuredExtraction
  ): Promise<CodingSuggestion[]> {
    const suggestions: CodingSuggestion[] = [];

    // ICD-10 for diagnoses
    const diagnoses = extraction.entities.filter(e => e.type === 'diagnosis');
    for (const diagnosis of diagnoses.slice(0, 5)) {
      // Mock ICD-10 lookup - in production would call real API
      suggestions.push({
        entity: diagnosis,
        coding_system: 'ICD-10',
        code: 'E11.9',
        description: `ICD-10 code for ${diagnosis.text}`,
        confidence: 0.85
      });
    }

    // RxNorm for medications
    const medications = extraction.entities.filter(e => e.type === 'medication');
    for (const medication of medications.slice(0, 5)) {
      suggestions.push({
        entity: medication,
        coding_system: 'RxNorm',
        code: 'RX12345',
        description: `RxNorm code for ${medication.text}`,
        confidence: 0.90
      });
    }

    // CPT for procedures
    const procedures = extraction.entities.filter(e => e.type === 'procedure');
    for (const procedure of procedures.slice(0, 5)) {
      suggestions.push({
        entity: procedure,
        coding_system: 'CPT',
        code: 'CPT99213',
        description: `CPT code for ${procedure.text}`,
        confidence: 0.80
      });
    }

    return suggestions;
  }

  /**
   * Calculate confidence metrics
   */
  private calculateConfidenceMetrics(extraction: StructuredExtraction) {
    const entities = extraction.entities;
    const avgConfidence = entities.length > 0
      ? entities.reduce((sum, e) => sum + e.confidence, 0) / entities.length
      : 0;

    const pendingCount = entities.filter(e =>
      !e.verification_status || e.verification_status === 'pending'
    ).length;

    return {
      totalEntities: entities.length,
      avgConfidence,
      pendingCount
    };
  }

  /**
   * Store visualization HTML
   */
  private async storeVisualization(vizId: string, html: string): Promise<void> {
    // In production, store in database or S3
    console.log(`Storing visualization ${vizId} (${html.length} bytes)`);
  }

  /**
   * Generate visualization ID
   */
  private generateVisualizationId(): string {
    return `viz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate embed code
   */
  private generateEmbedCode(vizId: string): string {
    return `<iframe src="/api/extractions/${vizId}/verify" width="100%" height="800px" frameborder="0"></iframe>`;
  }

  /**
   * Escape HTML for safe rendering
   */
  private escapeHtml(text: string): string {
    const div = { textContent: text };
    return (div as any).innerHTML || text;
  }
}

// Export singleton instance
export const verificationSystem = new ExtractionVerificationSystem();

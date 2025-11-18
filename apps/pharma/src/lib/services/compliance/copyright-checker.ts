/**
 * Copyright Detection and Compliance Service
 * Detects potential copyright violations and ensures proper attribution
 */

export interface CopyrightCheckResult {
  hasCopyrightRisk: boolean;
  riskLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  detectedIssues: CopyrightIssue[];
  recommendations: string[];
  copyrightNotice?: string;
  attributionRequired: boolean;
  requiresApproval: boolean;
  confidence: number; // 0-1
}

export interface CopyrightIssue {
  type: 'duplicate_content' | 'missing_attribution' | 'copyright_notice' | 'watermark' | 'proprietary_content' | 'license_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location?: string; // Page number, section, etc.
  detectedText?: string; // Snippet of detected content
  recommendation: string;
}

export interface CopyrightCheckOptions {
  strictMode?: boolean;
  requireAttribution?: boolean;
  checkDuplicates?: boolean;
  checkWatermarks?: boolean;
  excludeKnownSources?: string[]; // Sources we have licenses for
}

export class CopyrightChecker {
  private readonly copyrightKeywords = [
    'copyright',
    '©',
    'all rights reserved',
    'proprietary',
    'confidential',
    'do not distribute',
    'unauthorized copying',
    'protected by copyright',
    'copyright notice',
  ];

  private readonly attributionKeywords = [
    'attribution required',
    'credit required',
    'must cite',
    'source:',
    'reference:',
    'citation',
    'reproduced with permission',
  ];

  private readonly watermarkPatterns = [
    /watermark/i,
    /draft/i,
    /confidential/i,
    /internal use only/i,
    /proprietary/i,
  ];

  private readonly knownLicensedSources = [
    'FDA',
    'EMA',
    'WHO',
    'NIH',
    'government',
    'public domain',
    'open access',
    'creative commons',
    'CC-BY',
    'CC-BY-SA',
  ];

  /**
   * Check document for copyright compliance
   */
  async checkCopyright(
    content: string,
    filename: string,
    metadata?: {
      source_name?: string;
      source_url?: string;
      author?: string;
      publication_date?: string;
      license?: string;
    },
    options: CopyrightCheckOptions = {}
  ): Promise<CopyrightCheckResult> {
    const issues: CopyrightIssue[] = [];
    const recommendations: string[] = [];
    let riskLevel: CopyrightCheckResult['riskLevel'] = 'none';
    let requiresApproval = false;

    // Check for copyright notices
    const copyrightNotice = this.detectCopyrightNotice(content);
    const hasCopyrightNotice = !!copyrightNotice;

    // Check for missing attribution
    if (options.requireAttribution !== false) {
      const attributionCheck = this.checkAttribution(content, metadata);
      if (!attributionCheck.hasAttribution && !this.isPublicDomain(metadata)) {
        issues.push({
          type: 'missing_attribution',
          severity: 'medium',
          description: 'Document may require attribution but none found',
          recommendation: 'Add proper attribution or source citation',
        });
      }
    }

    // Check for watermarks or draft marks (if enabled)
    if (options.checkWatermarks !== false) {
      const watermarkCheck = this.detectWatermarks(content, filename);
      if (watermarkCheck.hasWatermark) {
        issues.push({
          type: 'watermark',
          severity: 'high',
          description: 'Watermark or draft marking detected',
          location: watermarkCheck.location,
          detectedText: watermarkCheck.text,
          recommendation: 'Verify document is final version and not restricted',
        });
        requiresApproval = true;
      }
    }

    // Check for proprietary/confidential content
    const proprietaryCheck = this.detectProprietaryContent(content);
    if (proprietaryCheck.isProprietary) {
      issues.push({
        type: 'proprietary_content',
        severity: 'critical',
        description: 'Proprietary or confidential content detected',
        recommendation: 'Do not upload - requires explicit permission',
      });
      riskLevel = 'critical';
      requiresApproval = true;
    }

    // Check for duplicate content (if enabled)
    if (options.checkDuplicates) {
      // This would typically call a duplicate detection service
      // For now, we'll note it as a recommendation
      recommendations.push('Consider checking for duplicate content against existing knowledge base');
    }

    // Check if source is known licensed source
    const isLicensed = this.isLicensedSource(metadata?.source_name, options.excludeKnownSources);

    // Determine overall risk level
    if (issues.length > 0) {
      const criticalIssues = issues.filter(i => i.severity === 'critical').length;
      const highIssues = issues.filter(i => i.severity === 'high').length;

      if (criticalIssues > 0) {
        riskLevel = 'critical';
      } else if (highIssues > 0) {
        riskLevel = 'high';
      } else if (issues.length > 2) {
        riskLevel = 'medium';
      } else {
        riskLevel = 'low';
      }
    }

    // Build recommendations
    if (hasCopyrightNotice && !isLicensed) {
      recommendations.push('Document contains copyright notice - ensure proper licensing');
    }

    if (!metadata?.source_name && !metadata?.source_url) {
      recommendations.push('Add source information for proper attribution');
    }

    if (hasCopyrightNotice && metadata?.source_name) {
      recommendations.push(`Verify license/permission from ${metadata.source_name}`);
    }

    // Calculate confidence
    const confidence = this.calculateConfidence(issues, hasCopyrightNotice, isLicensed);

    return {
      hasCopyrightRisk: riskLevel !== 'none',
      riskLevel,
      detectedIssues: issues,
      recommendations,
      copyrightNotice,
      attributionRequired: !isLicensed && hasCopyrightNotice,
      requiresApproval,
      confidence,
    };
  }

  /**
   * Detect copyright notice in content
   */
  private detectCopyrightNotice(content: string): string | undefined {
    const lines = content.split('\n').slice(0, 50); // Check first 50 lines (usually header/footer)

    for (const keyword of this.copyrightKeywords) {
      const regex = new RegExp(keyword, 'i');
      for (const line of lines) {
        if (regex.test(line)) {
          // Extract copyright notice (typically 1-3 lines)
          const lineIndex = lines.indexOf(line);
          const notice = lines.slice(Math.max(0, lineIndex - 1), lineIndex + 3).join(' ');
          return notice.trim();
        }
      }
    }

    return undefined;
  }

  /**
   * Check if document has proper attribution
   */
  private checkAttribution(
    content: string,
    metadata?: { source_name?: string; source_url?: string; author?: string }
  ): { hasAttribution: boolean; attribution?: string } {
    // Check for attribution keywords in content
    for (const keyword of this.attributionKeywords) {
      if (content.toLowerCase().includes(keyword.toLowerCase())) {
        return { hasAttribution: true };
      }
    }

    // Check if metadata provides attribution
    if (metadata?.source_name || metadata?.author) {
      return { hasAttribution: true };
    }

    return { hasAttribution: false };
  }

  /**
   * Detect watermarks or draft markings
   */
  private detectWatermarks(content: string, filename: string): {
    hasWatermark: boolean;
    location?: string;
    text?: string;
  } {
    // Check filename
    for (const pattern of this.watermarkPatterns) {
      if (pattern.test(filename)) {
        return { hasWatermark: true, location: 'filename', text: filename };
      }
    }

    // Check first and last few lines (typical watermark locations)
    const lines = content.split('\n');
    const headerLines = lines.slice(0, 10);
    const footerLines = lines.slice(-10);

    for (const pattern of this.watermarkPatterns) {
      for (const line of [...headerLines, ...footerLines]) {
        if (pattern.test(line)) {
          return { hasWatermark: true, location: line.includes('header') ? 'header' : 'footer', text: line };
        }
      }
    }

    return { hasWatermark: false };
  }

  /**
   * Detect proprietary or confidential content
   */
  private detectProprietaryContent(content: string): { isProprietary: boolean; matches: string[] } {
    const proprietaryPatterns = [
      /\b(proprietary|confidential|internal use only|do not distribute|restricted)\b/gi,
      /\b(©|copyright)\s+\d{4}\s+(?:all\s+rights\s+reserved|unauthorized)/gi,
    ];

    const matches: string[] = [];
    let isProprietary = false;

    for (const pattern of proprietaryPatterns) {
      const found = content.match(pattern);
      if (found && found.length > 0) {
        matches.push(...found);
        isProprietary = true;
      }
    }

    return { isProprietary, matches };
  }

  /**
   * Check if source is a known licensed/public domain source
   */
  private isLicensedSource(sourceName?: string, excludeList?: string[]): boolean {
    if (!sourceName) return false;

    const sourceLower = sourceName.toLowerCase();
    const allLicensed = [...this.knownLicensedSources, ...(excludeList || [])];

    return allLicensed.some(licensed => sourceLower.includes(licensed.toLowerCase()));
  }

  /**
   * Check if content is likely public domain
   */
  private isPublicDomain(metadata?: {
    source_name?: string;
    source_url?: string;
    license?: string;
  }): boolean {
    if (metadata?.license?.toLowerCase().includes('public domain')) return true;
    if (metadata?.license?.toLowerCase().includes('cc0')) return true;

    // Government sources are often public domain
    if (metadata?.source_name) {
      const govSources = ['government', 'gov', 'federal', 'public domain'];
      return govSources.some(gov => metadata.source_name?.toLowerCase().includes(gov));
    }

    return false;
  }

  /**
   * Calculate confidence score for copyright check
   */
  private calculateConfidence(
    issues: CopyrightIssue[],
    hasCopyrightNotice: boolean,
    isLicensed: boolean
  ): number {
    if (issues.length === 0 && !hasCopyrightNotice) {
      return 0.9; // High confidence if no issues
    }

    if (isLicensed && issues.length === 0) {
      return 0.85; // High confidence for licensed sources
    }

    if (hasCopyrightNotice && !isLicensed && issues.length > 0) {
      return 0.4; // Low confidence - needs review
    }

    // Default confidence based on issue count
    const baseConfidence = Math.max(0.3, 1 - issues.length * 0.15);
    return Math.min(0.8, baseConfidence);
  }

  /**
   * Generate copyright notice text for metadata
   */
  generateCopyrightNotice(
    sourceName: string,
    year?: string,
    license?: string
  ): string {
    const yearStr = year || new Date().getFullYear().toString();

    if (license) {
      return `© ${yearStr} ${sourceName}. Licensed under ${license}.`;
    }

    return `© ${yearStr} ${sourceName}. All rights reserved.`;
  }
}

// Export singleton instance
export const copyrightChecker = new CopyrightChecker();


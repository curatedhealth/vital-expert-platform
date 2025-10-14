export interface PIIPattern {
  name: string;
  pattern: RegExp;
  replacement: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export class PIIFilter {
  private patterns: PIIPattern[] = [
    {
      name: 'email',
      pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      replacement: '[EMAIL]',
      severity: 'medium',
      description: 'Email addresses'
    },
    {
      name: 'phone',
      pattern: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
      replacement: '[PHONE]',
      severity: 'medium',
      description: 'Phone numbers'
    },
    {
      name: 'ssn',
      pattern: /\b\d{3}-\d{2}-\d{4}\b/g,
      replacement: '[SSN]',
      severity: 'high',
      description: 'Social Security Numbers'
    },
    {
      name: 'mrn',
      pattern: /\bMRN[:\s]*\d{6,10}\b/gi,
      replacement: '[MRN]',
      severity: 'high',
      description: 'Medical Record Numbers'
    },
    {
      name: 'patient_id',
      pattern: /\bPatient[:\s]*ID[:\s]*\d{6,10}\b/gi,
      replacement: '[PATIENT_ID]',
      severity: 'high',
      description: 'Patient IDs'
    },
    {
      name: 'credit_card',
      pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
      replacement: '[CREDIT_CARD]',
      severity: 'high',
      description: 'Credit card numbers'
    },
    {
      name: 'ip_address',
      pattern: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g,
      replacement: '[IP_ADDRESS]',
      severity: 'low',
      description: 'IP addresses'
    },
    {
      name: 'date_of_birth',
      pattern: /\b(?:DOB|Date of Birth)[:\s]*\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/gi,
      replacement: '[DOB]',
      severity: 'high',
      description: 'Dates of birth'
    },
    {
      name: 'address',
      pattern: /\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd)\b/gi,
      replacement: '[ADDRESS]',
      severity: 'medium',
      description: 'Street addresses'
    },
    {
      name: 'zip_code',
      pattern: /\b\d{5}(?:-\d{4})?\b/g,
      replacement: '[ZIP_CODE]',
      severity: 'low',
      description: 'ZIP codes'
    },
    {
      name: 'driver_license',
      pattern: /\b[A-Z]\d{8}\b/g,
      replacement: '[DRIVER_LICENSE]',
      severity: 'high',
      description: 'Driver license numbers'
    },
    {
      name: 'passport',
      pattern: /\b[A-Z]{2}\d{7}\b/g,
      replacement: '[PASSPORT]',
      severity: 'high',
      description: 'Passport numbers'
    }
  ];
  
  private customPatterns: PIIPattern[] = [];
  
  /**
   * Filter PII from text
   */
  filter(text: string, options: {
    includeLow?: boolean;
    includeMedium?: boolean;
    includeHigh?: boolean;
    customPatterns?: PIIPattern[];
  } = {}): {
    filteredText: string;
    detectedPII: Array<{
      type: string;
      severity: string;
      count: number;
      description: string;
    }>;
  } {
    const {
      includeLow = true,
      includeMedium = true,
      includeHigh = true,
      customPatterns = []
    } = options;
    
    let filteredText = text;
    const detectedPII: Array<{
      type: string;
      severity: string;
      count: number;
      description: string;
    }> = [];
    
    // Combine default and custom patterns
    const allPatterns = [...this.patterns, ...customPatterns];
    
    for (const pattern of allPatterns) {
      // Skip patterns based on severity settings
      if (pattern.severity === 'low' && !includeLow) continue;
      if (pattern.severity === 'medium' && !includeMedium) continue;
      if (pattern.severity === 'high' && !includeHigh) continue;
      
      const matches = filteredText.match(pattern.pattern);
      if (matches) {
        filteredText = filteredText.replace(pattern.pattern, pattern.replacement);
        
        detectedPII.push({
          type: pattern.name,
          severity: pattern.severity,
          count: matches.length,
          description: pattern.description
        });
      }
    }
    
    return {
      filteredText,
      detectedPII
    };
  }
  
  /**
   * Async version for production use with external services
   */
  async filterAsync(
    text: string, 
    options: {
      includeLow?: boolean;
      includeMedium?: boolean;
      includeHigh?: boolean;
      customPatterns?: PIIPattern[];
      useExternalService?: boolean;
    } = {}
  ): Promise<{
    filteredText: string;
    detectedPII: Array<{
      type: string;
      severity: string;
      count: number;
      description: string;
    }>;
  }> {
    const { useExternalService = false, ...filterOptions } = options;
    
    if (useExternalService) {
      // In production, integrate with services like Presidio or AWS Comprehend Medical
      return this.filterWithExternalService(text, filterOptions);
    }
    
    return this.filter(text, filterOptions);
  }
  
  /**
   * Filter with external PII detection service
   */
  private async filterWithExternalService(
    text: string,
    options: any
  ): Promise<{
    filteredText: string;
    detectedPII: Array<{
      type: string;
      severity: string;
      count: number;
      description: string;
    }>;
  }> {
    try {
      // Example integration with Presidio (would need actual implementation)
      // const presidioClient = new PresidioClient();
      // const results = await presidioClient.analyze(text);
      
      // For now, fall back to local filtering
      console.log('⚠️ External PII service not configured, using local filtering');
      return this.filter(text, options);
      
    } catch (error) {
      console.warn('External PII service failed, falling back to local filtering:', error);
      return this.filter(text, options);
    }
  }
  
  /**
   * Add custom PII pattern
   */
  addCustomPattern(pattern: PIIPattern): void {
    this.customPatterns.push(pattern);
  }
  
  /**
   * Remove custom PII pattern
   */
  removeCustomPattern(name: string): void {
    this.customPatterns = this.customPatterns.filter(p => p.name !== name);
  }
  
  /**
   * Get all available patterns
   */
  getAllPatterns(): PIIPattern[] {
    return [...this.patterns, ...this.customPatterns];
  }
  
  /**
   * Validate text for PII without filtering
   */
  validate(text: string, options: {
    includeLow?: boolean;
    includeMedium?: boolean;
    includeHigh?: boolean;
  } = {}): {
    hasPII: boolean;
    detectedTypes: string[];
    severityCounts: Record<string, number>;
    recommendations: string[];
  } {
    const { filteredText, detectedPII } = this.filter(text, options);
    
    const hasPII = detectedPII.length > 0;
    const detectedTypes = detectedPII.map(pii => pii.type);
    const severityCounts = detectedPII.reduce((acc, pii) => {
      acc[pii.severity] = (acc[pii.severity] || 0) + pii.count;
      return acc;
    }, {} as Record<string, number>);
    
    const recommendations: string[] = [];
    
    if (severityCounts.high > 0) {
      recommendations.push('High-severity PII detected. Consider using external PII detection service.');
    }
    
    if (detectedTypes.includes('ssn') || detectedTypes.includes('mrn')) {
      recommendations.push('Sensitive medical identifiers detected. Ensure HIPAA compliance.');
    }
    
    if (detectedTypes.includes('credit_card')) {
      recommendations.push('Financial information detected. Ensure PCI DSS compliance.');
    }
    
    return {
      hasPII,
      detectedTypes,
      severityCounts,
      recommendations
    };
  }
  
  /**
   * Create a safe version of text for logging
   */
  createSafeLogText(text: string): string {
    const { filteredText } = this.filter(text, {
      includeLow: true,
      includeMedium: true,
      includeHigh: true
    });
    
    // Additional sanitization for logging
    return filteredText
      .replace(/\n/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 200); // Limit length
  }
  
  /**
   * Check if text contains high-severity PII
   */
  containsHighSeverityPII(text: string): boolean {
    const { detectedPII } = this.filter(text, {
      includeLow: false,
      includeMedium: false,
      includeHigh: true
    });
    
    return detectedPII.length > 0;
  }
  
  /**
   * Get PII statistics for a batch of texts
   */
  getBatchStatistics(texts: string[]): {
    totalTexts: number;
    textsWithPII: number;
    totalPIIInstances: number;
    severityDistribution: Record<string, number>;
    typeDistribution: Record<string, number>;
  } {
    let textsWithPII = 0;
    let totalPIIInstances = 0;
    const severityDistribution: Record<string, number> = {};
    const typeDistribution: Record<string, number> = {};
    
    for (const text of texts) {
      const { detectedPII } = this.filter(text);
      
      if (detectedPII.length > 0) {
        textsWithPII++;
      }
      
      for (const pii of detectedPII) {
        totalPIIInstances += pii.count;
        severityDistribution[pii.severity] = (severityDistribution[pii.severity] || 0) + pii.count;
        typeDistribution[pii.type] = (typeDistribution[pii.type] || 0) + pii.count;
      }
    }
    
    return {
      totalTexts: texts.length,
      textsWithPII,
      totalPIIInstances,
      severityDistribution,
      typeDistribution
    };
  }
}

// Create singleton instance
export const piiFilter = new PIIFilter();

export default piiFilter;

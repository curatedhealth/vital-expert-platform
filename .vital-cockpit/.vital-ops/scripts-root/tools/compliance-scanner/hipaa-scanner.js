#!/usr/bin/env node

/**
 * HIPAA Compliance Scanner
 * Scans codebase for potential HIPAA violations and PHI exposure
 */

const fs = require('fs');
const path = require('path');

class HIPAAComplianceScanner {
  constructor() {
    this.violations = [];
    this.warnings = [];
    this.phiPatterns = [
      // Social Security Numbers
      /\b\d{3}-?\d{2}-?\d{4}\b/g,
      // Medical Record Numbers (common patterns)
      /\b(MRN|mrn|medical.?record)\s*:?\s*[\w\d-]+\b/gi,
      // Patient IDs (common patterns)
      /\b(patient.?id|patientid)\s*:?\s*[\w\d-]+\b/gi,
      // Phone numbers
      /\b\d{3}-?\d{3}-?\d{4}\b/g,
      // Email patterns with medical context
      /\b[\w.-]+@[\w.-]+\.(com|org|gov|edu)\b/g,
      // Dates (birth dates, appointment dates)
      /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g,
    ];

    this.sensitiveKeywords = [
      'password', 'secret', 'key', 'token',
      'ssn', 'social_security', 'medical_record',
      'patient_data', 'phi', 'hipaa'
    ];
  }

  scanDirectory(dirPath = './src') {
    console.log(`🔍 Scanning ${dirPath} for HIPAA compliance...`);

    const files = this.getJavaScriptFiles(dirPath);

    files.forEach(file => {
      this.scanFile(file);
    });

    this.generateReport();
  }

  getJavaScriptFiles(dir) {
    const files = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory() && !this.shouldSkipDirectory(entry.name)) {
        files.push(...this.getJavaScriptFiles(fullPath));
      } else if (entry.isFile() && this.isJavaScriptFile(entry.name)) {
        files.push(fullPath);
      }
    }

    return files;
  }

  shouldSkipDirectory(name) {
    const skipDirs = ['node_modules', '.next', 'build', 'dist', '.git'];
    return skipDirs.includes(name);
  }

  isJavaScriptFile(filename) {
    return /\.(js|jsx|ts|tsx)$/.test(filename);
  }

  scanFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        this.scanLineForPHI(line, filePath, index + 1);
        this.scanLineForSecrets(line, filePath, index + 1);
        this.scanLineForUnsafePatterns(line, filePath, index + 1);
      });

    } catch (error) {
      console.error(`Error scanning file ${filePath}:`, error.message);
    }
  }

  scanLineForPHI(line, filePath, lineNumber) {
    this.phiPatterns.forEach(pattern => {
      const matches = line.match(pattern);
      if (matches) {
        this.violations.push({
          type: 'PHI_EXPOSURE',
          file: filePath,
          line: lineNumber,
          content: line.trim(),
          matches: matches,
          severity: 'HIGH',
          description: 'Potential PHI (Protected Health Information) detected'
        });
      }
    });
  }

  scanLineForSecrets(line, filePath, lineNumber) {
    // Check for hardcoded secrets
    const secretPattern = /(password|secret|key|token)\s*[=:]\s*['"`]([^'"`]+)['"`]/gi;
    const matches = line.match(secretPattern);

    if (matches) {
      this.violations.push({
        type: 'HARDCODED_SECRET',
        file: filePath,
        line: lineNumber,
        content: line.trim(),
        severity: 'HIGH',
        description: 'Hardcoded secret or credential detected'
      });
    }
  }

  scanLineForUnsafePatterns(line, filePath, lineNumber) {
    // Check for unsafe logging of sensitive data
    if (line.includes('console.log') || line.includes('console.error')) {
      this.sensitiveKeywords.forEach(keyword => {
        if (line.toLowerCase().includes(keyword)) {
          this.warnings.push({
            type: 'UNSAFE_LOGGING',
            file: filePath,
            line: lineNumber,
            content: line.trim(),
            severity: 'MEDIUM',
            description: `Potential logging of sensitive data containing: ${keyword}`
          });
        }
      });
    }

    // Check for missing encryption calls
    if (line.includes('localStorage') || line.includes('sessionStorage')) {
      this.warnings.push({
        type: 'STORAGE_WITHOUT_ENCRYPTION',
        file: filePath,
        line: lineNumber,
        content: line.trim(),
        severity: 'MEDIUM',
        description: 'Local/session storage usage detected - ensure sensitive data is encrypted'
      });
    }
  }

  generateReport() {
    const totalIssues = this.violations.length + this.warnings.length;

    console.log('\n🏥 HIPAA Compliance Scan Report');
    console.log('=' .repeat(50));
    console.log(`📊 Total Issues Found: ${totalIssues}`);
    console.log(`🚨 High Severity: ${this.violations.length}`);
    console.log(`⚠️  Medium Severity: ${this.warnings.length}`);
    console.log();

    if (this.violations.length > 0) {
      console.log('🚨 HIGH SEVERITY VIOLATIONS:');
      console.log('-' .repeat(30));
      this.violations.forEach(violation => {
        console.log(`❌ ${violation.type} in ${violation.file}:${violation.line}`);
        console.log(`   ${violation.description}`);
        console.log(`   Code: ${violation.content}`);
        console.log();
      });
    }

    if (this.warnings.length > 0) {
      console.log('⚠️  WARNINGS:');
      console.log('-' .repeat(30));
      this.warnings.forEach(warning => {
        console.log(`⚠️  ${warning.type} in ${warning.file}:${warning.line}`);
        console.log(`   ${warning.description}`);
        console.log();
      });
    }

    if (totalIssues === 0) {
      console.log('✅ No HIPAA compliance issues detected!');
      console.log('🏥 Platform appears ready for healthcare deployment.');
    } else {
      console.log('❌ Please address the issues above before deploying to healthcare environments.');
    }

    // Write JSON report
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: totalIssues,
        violations: this.violations.length,
        warnings: this.warnings.length
      },
      violations: this.violations,
      warnings: this.warnings
    };

    fs.writeFileSync(
      path.join(process.cwd(), 'compliance-report.json'),
      JSON.stringify(report, null, 2)
    );

    console.log('\n📄 Detailed report saved to: compliance-report.json');

    // Exit with error code if violations found
    if (this.violations.length > 0) {
      process.exit(1);
    }
  }
}

// Run scanner if called directly
if (require.main === module) {
  const scanner = new HIPAAComplianceScanner();
  scanner.scanDirectory('./src');
}

module.exports = HIPAAComplianceScanner;
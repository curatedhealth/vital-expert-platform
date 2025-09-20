/**
 * Comprehensive Test Suite for Digital Health Agent System
 * Tests all core functionality including agents, workflows, and compliance
 */

import { ComplianceAwareOrchestrator } from '@/agents/core/ComplianceAwareOrchestrator';
import { HIPAAComplianceManager } from '@/lib/compliance/hipaa-compliance';
import { ComplianceMiddleware } from '@/lib/compliance/compliance-middleware';
import { DatabaseLibraryLoader } from '@/lib/utils/database-library-loader';
import {
  ExecutionContext,
  ComplianceLevel,
  AgentTier,
  AgentDomain
} from '@/types/digital-health-agent.types';

// Test configuration
const TEST_CONFIG = {
  TIMEOUT_MS: 30000,
  TEST_USER_ID: 'test_user_001',
  TEST_SESSION_ID: 'test_session_001'
};

/**
 * Test Suite: Digital Health Agent System
 */
export class AgentSystemTestSuite {
  private orchestrator: ComplianceAwareOrchestrator;
  private complianceManager: HIPAAComplianceManager;
  private complianceMiddleware: ComplianceMiddleware;
  private libraryLoader: DatabaseLibraryLoader;
  private testResults: Array<{
    test: string;
    status: 'PASS' | 'FAIL' | 'SKIP';
    message: string;
    duration: number;
  }> = [];

  constructor() {
    this.orchestrator = new ComplianceAwareOrchestrator();
    this.complianceManager = new HIPAAComplianceManager();
    this.complianceMiddleware = new ComplianceMiddleware();
    this.libraryLoader = new DatabaseLibraryLoader();
  }

  /**
   * Run all tests
   */
  async runAllTests(): Promise<{
    summary: {
      total: number;
      passed: number;
      failed: number;
      skipped: number;
      success_rate: number;
    };
    results: typeof this.testResults;
    recommendations: string[];
  }> {
    console.log('🧪 Starting Digital Health Agent System Test Suite...\n');

    // Initialize system
    await this.runTest('System Initialization', () => this.testSystemInitialization());

    // Test library loading
    await this.runTest('Library Loading', () => this.testLibraryLoading());

    // Test individual agents
    await this.runTest('FDA Regulatory Agent', () => this.testFDARegulatoryAgent());
    await this.runTest('Clinical Trial Designer', () => this.testClinicalTrialDesigner());
    await this.runTest('HIPAA Compliance Officer', () => this.testHIPAAComplianceOfficer());
    await this.runTest('Reimbursement Strategist', () => this.testReimbursementStrategist());
    await this.runTest('QMS Architect', () => this.testQMSArchitect());

    // Test workflows
    await this.runTest('Regulatory Pathway Workflow', () => this.testRegulatoryPathwayWorkflow());
    await this.runTest('Market Access Workflow', () => this.testMarketAccessWorkflow());
    await this.runTest('Clinical Development Workflow', () => this.testClinicalDevelopmentWorkflow());

    // Test compliance
    await this.runTest('PHI Detection', () => this.testPHIDetection());
    await this.runTest('Compliance Validation', () => this.testComplianceValidation());
    await this.runTest('Audit Logging', () => this.testAuditLogging());

    // Test system health
    await this.runTest('System Health Check', () => this.testSystemHealth());

    // Test error handling
    await this.runTest('Error Handling', () => this.testErrorHandling());

    return this.generateTestReport();
  }

  /**
   * Run individual test with error handling and timing
   */
  private async runTest(testName: string, testFunction: () => Promise<void>): Promise<void> {
    const startTime = Date.now();
    try {
      console.log(`   🔄 ${testName}...`);
      await Promise.race([
        testFunction(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Test timeout')), TEST_CONFIG.TIMEOUT_MS)
        )
      ]);

      const duration = Date.now() - startTime;
      this.testResults.push({
        test: testName,
        status: 'PASS',
        message: 'Test completed successfully',
        duration
      });
      console.log(`   ✅ ${testName} - PASSED (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.testResults.push({
        test: testName,
        status: 'FAIL',
        message,
        duration
      });
      console.log(`   ❌ ${testName} - FAILED: ${message} (${duration}ms)`);
    }
  }

  /**
   * Test system initialization
   */
  private async testSystemInitialization(): Promise<void> {
    await this.orchestrator.initializeWithCompliance();

    const agentStatuses = this.orchestrator.getAgentStatus();
    if (agentStatuses.length !== 5) {
      throw new Error(`Expected 5 agents, found ${agentStatuses.length}`);
    }

    const workflows = this.orchestrator.getAvailableWorkflows();
    if (workflows.length < 3) {
      throw new Error(`Expected at least 3 workflows, found ${workflows.length}`);
    }
  }

  /**
   * Test library loading functionality
   */
  private async testLibraryLoading(): Promise<void> {
    // Test capability loading
    const testCapability = await this.libraryLoader.loadCapability('Regulatory Strategy Development');
    if (!testCapability) {
      throw new Error('Failed to load test capability');
    }

    // Test prompt loading
    const testPrompt = await this.libraryLoader.loadPrompt('Create FDA Regulatory Strategy');
    if (!testPrompt) {
      throw new Error('Failed to load test prompt');
    }
  }

  /**
   * Test FDA Regulatory Agent
   */
  private async testFDARegulatoryAgent(): Promise<void> {
    const context: ExecutionContext = {
      user_id: TEST_CONFIG.TEST_USER_ID,
      session_id: TEST_CONFIG.TEST_SESSION_ID,
      timestamp: new Date().toISOString(),
      compliance_level: ComplianceLevel.HIGH,
      audit_required: true
    };

    const inputs = {
      device_name: 'Test Cardiovascular Device',
      intended_use: 'Treatment of coronary artery disease',
      device_description: 'Novel stent delivery system',
      technology_type: 'Medical device',
      target_population: 'Adults with CAD',
      clinical_setting: 'Interventional cardiology',
      development_stage: 'Clinical testing'
    };

    const response = await this.orchestrator.executeAgentWithCompliance(
      'fda-regulatory-strategist',
      'Create FDA Regulatory Strategy',
      inputs,
      context
    );

    if (!response.success) {
      throw new Error(`Agent execution failed: ${response.error}`);
    }

    if (!response.content || response.content.length < 100) {
      throw new Error('Response content too short or empty');
    }

    if (!response.compliance_status.validated) {
      throw new Error('Compliance validation failed');
    }
  }

  /**
   * Test Clinical Trial Designer Agent
   */
  private async testClinicalTrialDesigner(): Promise<void> {
    const context: ExecutionContext = {
      user_id: TEST_CONFIG.TEST_USER_ID,
      session_id: TEST_CONFIG.TEST_SESSION_ID,
      timestamp: new Date().toISOString(),
      compliance_level: ComplianceLevel.HIGH,
      audit_required: true
    };

    const inputs = {
      device_name: 'Test Cardiovascular Device',
      indication: 'Coronary artery disease',
      intended_use: 'Percutaneous coronary intervention',
      comparator: 'Current standard of care',
      primary_endpoint: 'Target vessel failure at 12 months',
      study_duration: '24 months',
      target_population: 'Adults with CAD',
      regulatory_path: '510k'
    };

    const response = await this.orchestrator.executeAgentWithCompliance(
      'clinical-trial-designer',
      'Design Pivotal Trial Protocol',
      inputs,
      context
    );

    if (!response.success) {
      throw new Error(`Clinical trial design failed: ${response.error}`);
    }
  }

  /**
   * Test HIPAA Compliance Officer Agent
   */
  private async testHIPAAComplianceOfficer(): Promise<void> {
    const context: ExecutionContext = {
      user_id: TEST_CONFIG.TEST_USER_ID,
      session_id: TEST_CONFIG.TEST_SESSION_ID,
      timestamp: new Date().toISOString(),
      compliance_level: ComplianceLevel.CRITICAL,
      audit_required: true
    };

    const inputs = {
      organization_type: 'Healthcare Technology Company',
      phi_types_handled: ['Medical records', 'Patient identifiers'],
      systems_involved: ['Electronic health records', 'Clinical trial database'],
      user_count: 100,
      geographic_scope: 'United States'
    };

    const response = await this.orchestrator.executeAgentWithCompliance(
      'hipaa-compliance-officer',
      'Conduct HIPAA Risk Assessment',
      inputs,
      context
    );

    if (!response.success) {
      throw new Error(`HIPAA assessment failed: ${response.error}`);
    }
  }

  /**
   * Test Reimbursement Strategist Agent
   */
  private async testReimbursementStrategist(): Promise<void> {
    const context: ExecutionContext = {
      user_id: TEST_CONFIG.TEST_USER_ID,
      session_id: TEST_CONFIG.TEST_SESSION_ID,
      timestamp: new Date().toISOString(),
      compliance_level: ComplianceLevel.HIGH,
      audit_required: true
    };

    const inputs = {
      device_name: 'Test Cardiovascular Device',
      intended_use: 'Percutaneous coronary intervention',
      clinical_setting: 'Hospital catheterization laboratory',
      target_population: 'Adults with coronary artery disease',
      current_standard_care: 'Drug-eluting stents',
      cost_savings_potential: 'Reduced hospital readmissions',
      clinical_outcomes: 'Improved target vessel patency',
      target_price: 2500
    };

    const response = await this.orchestrator.executeAgentWithCompliance(
      'reimbursement-strategist',
      'Develop Reimbursement Strategy',
      inputs,
      context
    );

    if (!response.success) {
      throw new Error(`Reimbursement strategy failed: ${response.error}`);
    }
  }

  /**
   * Test QMS Architect Agent
   */
  private async testQMSArchitect(): Promise<void> {
    const context: ExecutionContext = {
      user_id: TEST_CONFIG.TEST_USER_ID,
      session_id: TEST_CONFIG.TEST_SESSION_ID,
      timestamp: new Date().toISOString(),
      compliance_level: ComplianceLevel.CRITICAL,
      audit_required: true
    };

    const inputs = {
      company_size: 'medium' as const,
      device_types: ['Cardiovascular devices'],
      regulatory_markets: ['United States', 'European Union'],
      current_qms_maturity: 'intermediate' as const,
      timeline_requirements: '6 months implementation',
      resource_constraints: 'Limited QA staff'
    };

    const response = await this.orchestrator.executeAgentWithCompliance(
      'qms-architect',
      'Design QMS Architecture',
      inputs,
      context
    );

    if (!response.success) {
      throw new Error(`QMS architecture design failed: ${response.error}`);
    }
  }

  /**
   * Test regulatory pathway workflow
   */
  private async testRegulatoryPathwayWorkflow(): Promise<void> {
    const context: ExecutionContext = {
      user_id: TEST_CONFIG.TEST_USER_ID,
      session_id: TEST_CONFIG.TEST_SESSION_ID,
      timestamp: new Date().toISOString(),
      compliance_level: ComplianceLevel.HIGH,
      audit_required: true
    };

    const inputs = {
      device_name: 'Test Cardiovascular Device',
      intended_use: 'Treatment of coronary artery disease',
      device_description: 'Novel stent delivery system',
      technology_type: 'Medical device',
      target_population: 'Adults with CAD',
      clinical_setting: 'Interventional cardiology',
      organization_type: 'Medical device company',
      phi_types_handled: ['Clinical trial data'],
      systems_involved: ['Clinical database']
    };

    const execution = await this.orchestrator.executeWorkflowWithCompliance(
      'regulatory-pathway-analysis',
      inputs,
      context
    );

    if (execution.status !== 'completed') {
      throw new Error(`Workflow execution failed: ${execution.error || 'Unknown error'}`);
    }

    if (!execution.compliance_summary.overall_compliant) {
      throw new Error(`Workflow failed compliance: ${execution.compliance_summary.compliance_violations} violations`);
    }
  }

  /**
   * Test market access workflow
   */
  private async testMarketAccessWorkflow(): Promise<void> {
    const context: ExecutionContext = {
      user_id: TEST_CONFIG.TEST_USER_ID,
      session_id: TEST_CONFIG.TEST_SESSION_ID,
      timestamp: new Date().toISOString(),
      compliance_level: ComplianceLevel.HIGH,
      audit_required: true
    };

    const inputs = {
      device_name: 'Test Cardiovascular Device',
      intended_use: 'Treatment of coronary artery disease',
      device_description: 'Novel stent delivery system',
      clinical_setting: 'Interventional cardiology',
      target_population: 'Adults with CAD',
      device_types: ['Cardiovascular devices'],
      regulatory_markets: ['United States']
    };

    const execution = await this.orchestrator.executeWorkflowWithCompliance(
      'market-access-strategy',
      inputs,
      context
    );

    if (execution.status !== 'completed') {
      throw new Error(`Market access workflow failed: ${execution.error || 'Unknown error'}`);
    }
  }

  /**
   * Test clinical development workflow
   */
  private async testClinicalDevelopmentWorkflow(): Promise<void> {
    const context: ExecutionContext = {
      user_id: TEST_CONFIG.TEST_USER_ID,
      session_id: TEST_CONFIG.TEST_SESSION_ID,
      timestamp: new Date().toISOString(),
      compliance_level: ComplianceLevel.CRITICAL,
      audit_required: true
    };

    const inputs = {
      device_name: 'Test Cardiovascular Device',
      indication: 'Coronary artery disease',
      intended_use: 'Percutaneous coronary intervention',
      comparator: 'Drug-eluting stents',
      regulatory_questions: ['What clinical endpoints are required?'],
      known_hazards: ['Device migration', 'Thrombosis'],
      organization_name: 'Test Medical Device Company',
      organization_type: 'Medical device manufacturer',
      phi_uses: ['Clinical trial data collection']
    };

    const execution = await this.orchestrator.executeWorkflowWithCompliance(
      'clinical-development-plan',
      inputs,
      context
    );

    if (execution.status !== 'completed') {
      throw new Error(`Clinical development workflow failed: ${execution.error || 'Unknown error'}`);
    }
  }

  /**
   * Test PHI detection
   */
  private async testPHIDetection(): Promise<void> {
    const testData = {
      clean_data: 'This is a test medical device for cardiovascular procedures.',
      phi_data: 'Patient John Doe, SSN 123-45-6789, was treated on 01/15/2024 at john.doe@email.com.'
    };

    // Test clean data
    const cleanResult = this.complianceManager.detectPHI(testData.clean_data);
    if (cleanResult.containsPHI) {
      throw new Error('Clean data incorrectly flagged as containing PHI');
    }

    // Test PHI data
    const phiResult = this.complianceManager.detectPHI(testData.phi_data);
    if (!phiResult.containsPHI) {
      throw new Error('PHI data not detected');
    }

    if (phiResult.phiTypes.length === 0) {
      throw new Error('PHI types not identified');
    }

    if (!phiResult.redactedContent || phiResult.redactedContent.includes('123-45-6789')) {
      throw new Error('PHI not properly redacted');
    }
  }

  /**
   * Test compliance validation
   */
  private async testComplianceValidation(): Promise<void> {
    const validRequest = {
      user_id: TEST_CONFIG.TEST_USER_ID,
      resource_type: 'agent' as const,
      resource_id: 'test-agent',
      action: 'read' as const,
      purpose: 'Healthcare operations',
      data_content: 'Clean test data for validation',
      context: {
        user_id: TEST_CONFIG.TEST_USER_ID,
        session_id: TEST_CONFIG.TEST_SESSION_ID,
        timestamp: new Date().toISOString(),
        compliance_level: ComplianceLevel.HIGH,
        audit_required: true
      }
    };

    const validResult = await this.complianceManager.validateCompliance(validRequest);
    if (!validResult.compliant) {
      throw new Error(`Valid request flagged as non-compliant: ${validResult.violations.map(v => v.description).join('; ')}`);
    }

    // Test invalid request
    const invalidRequest = {
      ...validRequest,
      purpose: 'Marketing purposes',
      data_content: 'Patient John Doe, SSN 123-45-6789'
    };

    const invalidResult = await this.complianceManager.validateCompliance(invalidRequest);
    if (invalidResult.compliant) {
      throw new Error('Invalid request incorrectly marked as compliant');
    }
  }

  /**
   * Test audit logging
   */
  private async testAuditLogging(): Promise<void> {
    const beforeCount = this.complianceManager.getAuditLog().length;

    // Execute an agent to generate audit logs
    const context: ExecutionContext = {
      user_id: TEST_CONFIG.TEST_USER_ID,
      session_id: TEST_CONFIG.TEST_SESSION_ID,
      timestamp: new Date().toISOString(),
      compliance_level: ComplianceLevel.HIGH,
      audit_required: true
    };

    await this.orchestrator.executeAgentWithCompliance(
      'fda-regulatory-strategist',
      'Create FDA Regulatory Strategy',
      { device_name: 'Test Device' },
      context
    );

    const afterCount = this.complianceManager.getAuditLog().length;
    if (afterCount <= beforeCount) {
      throw new Error('Audit log not updated after agent execution');
    }

    // Check for specific user's audit trail
    const userAuditTrail = this.orchestrator.getUserAuditTrail(TEST_CONFIG.TEST_USER_ID, 1);
    if (userAuditTrail.length === 0) {
      throw new Error('User audit trail not found');
    }
  }

  /**
   * Test system health monitoring
   */
  private async testSystemHealth(): Promise<void> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setHours(startDate.getHours() - 1);

    const dashboard = this.orchestrator.getComplianceDashboard({
      start: startDate.toISOString(),
      end: endDate.toISOString()
    });

    if (!dashboard.overview) {
      throw new Error('Compliance dashboard overview missing');
    }

    if (!dashboard.agent_compliance) {
      throw new Error('Agent compliance data missing');
    }

    const agentStatuses = this.orchestrator.getAgentStatus();
    const unhealthyAgents = agentStatuses.filter(agent => agent.status !== 'active');

    if (unhealthyAgents.length > 0) {
      throw new Error(`Unhealthy agents detected: ${unhealthyAgents.map(a => a.name).join(', ')}`);
    }
  }

  /**
   * Test error handling
   */
  private async testErrorHandling(): Promise<void> {
    // Test invalid agent name
    try {
      const context: ExecutionContext = {
        user_id: TEST_CONFIG.TEST_USER_ID,
        session_id: TEST_CONFIG.TEST_SESSION_ID,
        timestamp: new Date().toISOString(),
        compliance_level: ComplianceLevel.HIGH,
        audit_required: true
      };

      await this.orchestrator.executeAgentWithCompliance(
        'invalid-agent',
        'Invalid Prompt',
        {},
        context
      );
      throw new Error('Should have thrown error for invalid agent');
    } catch (error) {
      if (!error.message.includes('not found')) {
        throw new Error('Unexpected error message for invalid agent');
      }
    }

    // Test invalid workflow
    try {
      const context: ExecutionContext = {
        user_id: TEST_CONFIG.TEST_USER_ID,
        session_id: TEST_CONFIG.TEST_SESSION_ID,
        timestamp: new Date().toISOString(),
        compliance_level: ComplianceLevel.HIGH,
        audit_required: true
      };

      await this.orchestrator.executeWorkflowWithCompliance(
        'invalid-workflow',
        {},
        context
      );
      throw new Error('Should have thrown error for invalid workflow');
    } catch (error) {
      if (!error.message.includes('not found')) {
        throw new Error('Unexpected error message for invalid workflow');
      }
    }
  }

  /**
   * Generate comprehensive test report
   */
  private generateTestReport(): {
    summary: {
      total: number;
      passed: number;
      failed: number;
      skipped: number;
      success_rate: number;
    };
    results: typeof this.testResults;
    recommendations: string[];
  } {
    const total = this.testResults.length;
    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    const skipped = this.testResults.filter(r => r.status === 'SKIP').length;
    const successRate = total > 0 ? (passed / total) * 100 : 0;

    const recommendations = [];
    if (successRate < 100) {
      recommendations.push('Review failed tests and address underlying issues');
    }
    if (successRate < 80) {
      recommendations.push('System requires significant debugging before production use');
    }
    if (failed > 0) {
      const failedTests = this.testResults.filter(r => r.status === 'FAIL').map(r => r.test);
      recommendations.push(`Failed tests: ${failedTests.join(', ')}`);
    }

    console.log('\n📊 Test Suite Summary:');
    console.log(`   Total Tests: ${total}`);
    console.log(`   Passed: ${passed} ✅`);
    console.log(`   Failed: ${failed} ❌`);
    console.log(`   Skipped: ${skipped} ⏭️`);
    console.log(`   Success Rate: ${successRate.toFixed(1)}%`);

    return {
      summary: {
        total,
        passed,
        failed,
        skipped,
        success_rate: Math.round(successRate * 10) / 10
      },
      results: this.testResults,
      recommendations
    };
  }
}
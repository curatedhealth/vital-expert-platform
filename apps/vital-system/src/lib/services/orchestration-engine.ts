/**
 * Orchestration Engine - All 7 Panel Modes
 * Implements complete advisory board orchestration based on LangGraph guide
 */

import { evidencePackBuilder, EvidenceSource } from './evidence-pack-builder';
import { personaAgentRunner, AgentReply } from './persona-agent-runner';
import { policyGuard } from './policy-guard';
import { synthesisComposer, Synthesis } from './synthesis-composer';

export type OrchestrationMode =
  | 'parallel'      // Parallel Polling - Quick breadth
  | 'sequential'    // Sequential Roundtable - Deep dialogue
  | 'scripted'      // Scripted Interview - Structured Q&A
  | 'debate'        // Free Debate - Adversarial discussion
  | 'funnel'        // Funnel & Filter - Breadth → depth
  | 'scenario'      // Scenario Simulation - Role-play 2030
  | 'dynamic';      // Dynamic - Adaptive switching

export interface OrchestrationParams {
  mode: OrchestrationMode;
  question: string;
  personas: string[];
  evidenceSources?: EvidenceSource[];
  script?: ScriptedGuide;
  scenarioContext?: ScenarioContext;
  maxRounds?: number;
}

export interface ScriptedGuide {
  sections: Array<{
    name: string;
    mode: 'parallel' | 'sequential';
    personas: string[];
    questions: string[];
  }>;
}

export interface ScenarioContext {
  name: string;
  year: number;
  assumptions: Record<string, any>;
  roleAssignments: Record<string, string>; // persona -> role in scenario
}

export interface OrchestrationResult {
  mode: OrchestrationMode;
  replies: AgentReply[];
  synthesis: Synthesis;
  metadata: {
    totalTime: number;
    rounds: number;
    switchedModes?: OrchestrationMode[];
  };
}

export class OrchestrationEngine {
  /**
   * Main orchestration entry point
   */
  async orchestrate(params: OrchestrationParams): Promise<OrchestrationResult> {
    const startTime = Date.now();

    let result: OrchestrationResult;

    switch (params.mode) {
      case 'parallel':
        result = await this.runParallelPolling(params);
        break;
      case 'sequential':
        result = await this.runSequentialRoundtable(params);
        break;
      case 'scripted':
        result = await this.runScriptedInterview(params);
        break;
      case 'debate':
        result = await this.runFreeDebate(params);
        break;
      case 'funnel':
        result = await this.runFunnelAndFilter(params);
        break;
      case 'scenario':
        result = await this.runScenarioSimulation(params);
        break;
      case 'dynamic':
        result = await this.runDynamicOrchestration(params);
        break;
      default:
        throw new Error(`Unknown orchestration mode: ${params.mode}`);
    }

    result.metadata.totalTime = Date.now() - startTime;
    return result;
  }

  /**
   * Mode 1: Parallel Polling
   * All personas respond simultaneously to same question
   */
  private async runParallelPolling(params: OrchestrationParams): Promise<OrchestrationResult> {
    const evidenceSummary = this.buildEvidenceSummary(params.evidenceSources || []);

    // Run all personas in parallel
    const replies = await personaAgentRunner.runParallel(
      params.personas,
      params.question,
      evidenceSummary
    );

    // Policy check all replies
    await this.policyCheckReplies(replies);

    // Generate synthesis
    const synthesis = await synthesisComposer.compose(replies, params.question);

    return {
      mode: 'parallel',
      replies,
      synthesis,
      metadata: {
        totalTime: 0,
        rounds: 1
      }
    };
  }

  /**
   * Mode 2: Sequential Roundtable
   * Personas respond in turn, building on each other
   */
  private async runSequentialRoundtable(params: OrchestrationParams): Promise<OrchestrationResult> {
    const evidenceSummary = this.buildEvidenceSummary(params.evidenceSources || []);

    // Run personas sequentially
    const replies = await personaAgentRunner.runSequential(
      params.personas,
      params.question,
      evidenceSummary
    );

    await this.policyCheckReplies(replies);

    const synthesis = await synthesisComposer.compose(replies, params.question);

    return {
      mode: 'sequential',
      replies,
      synthesis,
      metadata: {
        totalTime: 0,
        rounds: params.personas.length
      }
    };
  }

  /**
   * Mode 3: Scripted Interview
   * Follow predefined interview guide with sections
   */
  private async runScriptedInterview(params: OrchestrationParams): Promise<OrchestrationResult> {
    if (!params.script) {
      throw new Error('Scripted mode requires a script parameter');
    }

    const allReplies: AgentReply[] = [];
    const evidenceSummary = this.buildEvidenceSummary(params.evidenceSources || []);

    // Run each section
    for (const section of params.script.sections) {
      for (const question of section.questions) {
        const sectionParams = {
          ...params,
          question,
          personas: section.personas
        };

        let sectionReplies: AgentReply[];
        if (section.mode === 'parallel') {
          sectionReplies = await personaAgentRunner.runParallel(
            section.personas,
            question,
            evidenceSummary
          );
        } else {
          sectionReplies = await personaAgentRunner.runSequential(
            section.personas,
            question,
            evidenceSummary
          );
        }

        allReplies.push(...sectionReplies);
      }
    }

    await this.policyCheckReplies(allReplies);

    const synthesis = await synthesisComposer.compose(allReplies, params.question);

    return {
      mode: 'scripted',
      replies: allReplies,
      synthesis,
      metadata: {
        totalTime: 0,
        rounds: params.script.sections.length
      }
    };
  }

  /**
   * Mode 4: Free Debate
   * Personas challenge each other's responses
   */
  private async runFreeDebate(params: OrchestrationParams): Promise<OrchestrationResult> {
    const maxRounds = params.maxRounds || 3;
    const allReplies: AgentReply[] = [];
    const evidenceSummary = this.buildEvidenceSummary(params.evidenceSources || []);

    // Initial round - all personas respond
    let currentReplies = await personaAgentRunner.runParallel(
      params.personas,
      params.question,
      evidenceSummary
    );
    allReplies.push(...currentReplies);

    // Debate rounds - personas challenge each other
    for (let round = 1; round < maxRounds; round++) {
      // Build context from previous round
      const debateContext = this.buildDebateContext(currentReplies);
      const challengeQuestion = `${params.question}\n\nPrevious responses:\n${debateContext}\n\nPlease respond, addressing disagreements or adding new perspectives.`;

      currentReplies = await personaAgentRunner.runParallel(
        params.personas,
        challengeQuestion,
        evidenceSummary
      );

      allReplies.push(...currentReplies);

      // Check convergence
      if (this.hasConverged(currentReplies)) {
        break;
      }
    }

    await this.policyCheckReplies(allReplies);

    const synthesis = await synthesisComposer.compose(allReplies, params.question);

    return {
      mode: 'debate',
      replies: allReplies,
      synthesis,
      metadata: {
        totalTime: 0,
        rounds: allReplies.length / params.personas.length
      }
    };
  }

  /**
   * Mode 5: Funnel & Filter
   * Parallel → cluster themes → deep dive on top themes
   */
  private async runFunnelAndFilter(params: OrchestrationParams): Promise<OrchestrationResult> {
    const evidenceSummary = this.buildEvidenceSummary(params.evidenceSources || []);

    // Step 1: Parallel polling for breadth
    const initialReplies = await personaAgentRunner.runParallel(
      params.personas,
      params.question,
      evidenceSummary
    );

    // Step 2: Cluster themes (simplified - in production use embeddings)
    const themes = this.clusterThemes(initialReplies);

    // Step 3: Deep dive on top themes
    const deepDiveReplies: AgentReply[] = [];
    for (const theme of themes.slice(0, 3)) {
      const themeQuestion = `${params.question}\n\nFocus on: ${theme}`;
      const themeReplies = await personaAgentRunner.runSequential(
        params.personas.slice(0, 3), // Top 3 personas for depth
        themeQuestion,
        evidenceSummary
      );
      deepDiveReplies.push(...themeReplies);
    }

    const allReplies = [...initialReplies, ...deepDiveReplies];
    await this.policyCheckReplies(allReplies);

    const synthesis = await synthesisComposer.compose(allReplies, params.question);

    return {
      mode: 'funnel',
      replies: allReplies,
      synthesis,
      metadata: {
        totalTime: 0,
        rounds: 2 // Breadth + depth
      }
    };
  }

  /**
   * Mode 6: Scenario Simulation
   * Role-play future scenario (e.g., 2030 market)
   */
  private async runScenarioSimulation(params: OrchestrationParams): Promise<OrchestrationResult> {
    if (!params.scenarioContext) {
      throw new Error('Scenario mode requires scenarioContext parameter');
    }

    const { name, year, assumptions, roleAssignments } = params.scenarioContext;

    // Build scenario prompt
    const scenarioPrompt = `
SCENARIO: ${name} (${year})
ASSUMPTIONS: ${JSON.stringify(assumptions, null, 2)}

QUESTION: ${params.question}

You are role-playing this future scenario. Consider:
1. How market dynamics have evolved
2. Regulatory changes
3. Technology advances
4. Patient needs

Identify Early Warning Indicators (EWIs) and no-regrets actions.
`;

    const evidenceSummary = this.buildEvidenceSummary(params.evidenceSources || []);

    // Run personas in their assigned roles
    const replies: AgentReply[] = [];
    for (const persona of params.personas) {
      const role = roleAssignments[persona] || persona;
      const rolePrompt = `As ${role} in ${year}, ${scenarioPrompt}`;

      const reply = await personaAgentRunner.runPersona({
        persona,
        question: rolePrompt,
        evidenceSummary
      });

      replies.push(reply);
    }

    await this.policyCheckReplies(replies);

    const synthesis = await synthesisComposer.compose(replies, params.question);

    return {
      mode: 'scenario',
      replies,
      synthesis,
      metadata: {
        totalTime: 0,
        rounds: 1
      }
    };
  }

  /**
   * Mode 7: Dynamic Orchestration
   * Adaptive mode switching based on panel state
   */
  private async runDynamicOrchestration(params: OrchestrationParams): Promise<OrchestrationResult> {
    const modesUsed: OrchestrationMode[] = [];
    let allReplies: AgentReply[] = [];

    // Start with parallel for breadth
    let currentMode: OrchestrationMode = 'parallel';
    modesUsed.push(currentMode);

    let result = await this.runParallelPolling(params);
    allReplies = result.replies;

    // Analyze state and decide next mode
    const metrics = this.analyzeState(allReplies);

    if (metrics.disagreement > 0.6) {
      // High disagreement → debate
      currentMode = 'debate';
      modesUsed.push(currentMode);
      result = await this.runFreeDebate({...params, maxRounds: 2});
      allReplies.push(...result.replies);
    } else if (metrics.uncertainty > 0.5) {
      // High uncertainty → sequential for depth
      currentMode = 'sequential';
      modesUsed.push(currentMode);
      result = await this.runSequentialRoundtable(params);
      allReplies.push(...result.replies);
    }

    const synthesis = await synthesisComposer.compose(allReplies, params.question);

    return {
      mode: 'dynamic',
      replies: allReplies,
      synthesis,
      metadata: {
        totalTime: 0,
        rounds: modesUsed.length,
        switchedModes: modesUsed
      }
    };
  }

  // Helper methods

  private buildEvidenceSummary(sources: EvidenceSource[]): string {
    return evidencePackBuilder.buildEvidenceSummary(sources, 'panel');
  }

  private async policyCheckReplies(replies: AgentReply[]): Promise<void> {
    for (const reply of replies) {
      const check = await policyGuard.check(reply.answer);
      if (check.action === 'block') {
        throw new Error(`Policy violation in ${reply.persona} response: ${check.notes}`);
      }
      if (check.action === 'warn') {
        reply.flags.push(...check.riskTags);
      }
    }
  }

  private buildDebateContext(replies: AgentReply[]): string {
    return replies
      .map((r: any) => `${r.persona}: ${r.answer.slice(0, 150)}...`)
      .join('\n');
  }

  private hasConverged(replies: AgentReply[]): boolean {
    const avgConfidence = replies.reduce((sum, r) => sum + r.confidence, 0) / replies.length;
    return avgConfidence > 0.8; // High confidence = convergence
  }

  private clusterThemes(replies: AgentReply[]): string[] {
    // Simplified - in production use embeddings and clustering
    const themes = [
      'Regulatory Compliance',
      'Patient Safety',
      'Market Access'
    ];
    return themes;
  }

  private analyzeState(replies: AgentReply[]) {
    const confidences = replies.map((r: any) => r.confidence);
    const avgConfidence = confidences.reduce((a, b) => a + b) / confidences.length;
    const variance = confidences.reduce((sum, c) => sum + Math.pow(c - avgConfidence, 2), 0) / confidences.length;

    return {
      disagreement: Math.sqrt(variance),
      uncertainty: 1 - avgConfidence
    };
  }
}

// Singleton instance
export const orchestrationEngine = new OrchestrationEngine();

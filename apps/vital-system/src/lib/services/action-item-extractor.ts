/**
 * Action Item Extraction Service
 *
 * Extracts actionable items from panel discussions with:
 * - Priority levels (critical, high, medium, low)
 * - Timeline estimates (immediate, short-term, medium-term, long-term)
 * - Responsible party recommendations
 * - Dependencies tracking
 * - RACI matrix generation (Responsible, Accountable, Consulted, Informed)
 */

// Use API Gateway URL for compliance with Golden Rule (Python services via gateway)
const API_GATEWAY_URL =
  process.env.API_GATEWAY_URL ||
  process.env.NEXT_PUBLIC_API_GATEWAY_URL ||
  process.env.AI_ENGINE_URL ||
  'http://localhost:3001'; // Default to API Gateway

export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type Timeline = 'immediate' | 'short-term' | 'medium-term' | 'long-term';
export type ActionStatus = 'not-started' | 'in-progress' | 'blocked' | 'completed';

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  timeline: Timeline;
  timelineDescription: string; // e.g., "Within 2 weeks", "Q3 2025"
  category: 'clinical' | 'regulatory' | 'commercial' | 'operational' | 'strategic' | 'other';

  // Ownership
  responsibleParty: string; // Who should execute this
  accountableParty: string; // Who is ultimately accountable
  consultParties: string[]; // Who should be consulted
  informParties: string[]; // Who should be informed

  // Dependencies
  dependencies: string[]; // IDs of other action items that must be completed first
  dependencyDescriptions: string[]; // Human-readable dependency descriptions

  // Metadata
  detectedFrom: string; // Which expert or section mentioned this
  confidence: number; // 0-1, how confident is the extraction
  rationale: string; // Why is this action item important
  successMetrics: string[]; // How to measure completion

  status?: ActionStatus;
  notes?: string;
}

export interface ActionItemSummary {
  totalItems: number;
  criticalItems: number;
  highPriorityItems: number;
  mediumPriorityItems: number;
  lowPriorityItems: number;

  immediateActions: number;
  shortTermActions: number;
  mediumTermActions: number;
  longTermActions: number;
}

export interface RACIMatrix {
  roles: string[]; // Unique list of all roles/parties mentioned
  matrix: RACIMatrixRow[];
}

export interface RACIMatrixRow {
  actionItemId: string;
  actionItemTitle: string;
  assignments: Record<string, 'R' | 'A' | 'C' | 'I'>; // role -> RACI code
}

export interface ActionItemExtractionResult {
  actionItems: ActionItem[];
  summary: ActionItemSummary;
  raciMatrix: RACIMatrix;
  implementationPlan: {
    phase: string;
    timeframe: string;
    actions: ActionItem[];
  }[];
  criticalPath: ActionItem[]; // Sequence of critical actions considering dependencies
}

class ActionItemExtractorService {
  /**
   * Call LLM via API Gateway (Python AI Engine)
   */
  private async callLLM(messages: Array<{ role: string; content: string }>, temperature: number = 0.3): Promise<string> {
    try {
      const response = await fetch(`${API_GATEWAY_URL}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages,
          temperature,
        }),
      });

      if (!response.ok) {
        throw new Error(`API Gateway error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Error calling LLM via API Gateway:', error);
      throw error;
    }
  }

  /**
   * Extract action items from panel discussion
   */
  async extractActionItems(
    question: string,
    expertReplies: any[],
    synthesis: string
  ): Promise<ActionItemExtractionResult> {
    console.log('🎯 Extracting action items from panel discussion...');

    // Build context from expert replies
    const expertContext = expertReplies
      .map(reply => `**${reply.expertName || reply.expertId}:**\n${reply.content}`)
      .join('\n\n');

    const prompt = `You are an expert project manager analyzing a pharmaceutical advisory board discussion.

**QUESTION DISCUSSED:**
${question}

**EXPERT REPLIES:**
${expertContext}

**SYNTHESIS:**
${synthesis}

Extract all actionable items from this discussion. For each action item, provide:
1. Clear, specific title and description
2. Priority level (critical/high/medium/low) based on urgency and impact
3. Timeline (immediate/short-term/medium-term/long-term) with specific timeframe
4. Category (clinical/regulatory/commercial/operational/strategic/other)
5. RACI assignments:
   - Responsible: Who should execute this (specific role, not "team")
   - Accountable: Who is ultimately accountable for completion
   - Consult: Who should be consulted during execution
   - Inform: Who should be kept informed of progress
6. Dependencies: What must be completed before this can start
7. Success metrics: How to measure completion
8. Rationale: Why is this important (based on discussion)

Return your response as a valid JSON object with this structure:
{
  "actionItems": [
    {
      "id": "action-1",
      "title": "string",
      "description": "string",
      "priority": "critical|high|medium|low",
      "timeline": "immediate|short-term|medium-term|long-term",
      "timelineDescription": "e.g., Within 2 weeks",
      "category": "clinical|regulatory|commercial|operational|strategic|other",
      "responsibleParty": "specific role",
      "accountableParty": "specific role",
      "consultParties": ["role1", "role2"],
      "informParties": ["role1", "role2"],
      "dependencies": ["action-id"],
      "dependencyDescriptions": ["human readable"],
      "detectedFrom": "expert name or synthesis",
      "confidence": 0.95,
      "rationale": "why important",
      "successMetrics": ["metric1", "metric2"]
    }
  ]
}

IMPORTANT GUIDELINES:
- Extract 5-15 action items (focus on the most important)
- Be specific with titles (not "Conduct research" but "Conduct Phase III clinical trial for psoriasis indication")
- Assign realistic timelines
- RACI roles should be specific (e.g., "Chief Medical Officer", "Regulatory Affairs Director", "Clinical Trial Manager")
- Identify true dependencies (what truly must happen first)
- Success metrics should be measurable
- Priority should reflect both urgency and impact from the discussion`;

    try {
      const messages = [
        { role: 'system', content: 'You are an expert project manager analyzing pharmaceutical advisory board discussions. Extract action items and return valid JSON only.' },
        { role: 'user', content: prompt }
      ];

      const content = await this.callLLM(messages, 0.3);

      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in LLM response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const actionItems: ActionItem[] = parsed.actionItems || [];

      // Build summary
      const summary = this.buildSummary(actionItems);

      // Build RACI matrix
      const raciMatrix = this.buildRACIMatrix(actionItems);

      // Build implementation plan (group by timeline)
      const implementationPlan = this.buildImplementationPlan(actionItems);

      // Calculate critical path
      const criticalPath = this.calculateCriticalPath(actionItems);

      console.log(`✅ Extracted ${actionItems.length} action items`);
      console.log(`🔴 Critical: ${summary.criticalItems}, 🟠 High: ${summary.highPriorityItems}, 🟡 Medium: ${summary.mediumPriorityItems}, 🟢 Low: ${summary.lowPriorityItems}`);

      return {
        actionItems,
        summary,
        raciMatrix,
        implementationPlan,
        criticalPath,
      };

    } catch (error) {
      console.error('❌ Error extracting action items:', error);
      throw error;
    }
  }

  private buildSummary(actionItems: ActionItem[]): ActionItemSummary {
    return {
      totalItems: actionItems.length,
      criticalItems: actionItems.filter((a: any) => a.priority === 'critical').length,
      highPriorityItems: actionItems.filter((a: any) => a.priority === 'high').length,
      mediumPriorityItems: actionItems.filter((a: any) => a.priority === 'medium').length,
      lowPriorityItems: actionItems.filter((a: any) => a.priority === 'low').length,

      immediateActions: actionItems.filter((a: any) => a.timeline === 'immediate').length,
      shortTermActions: actionItems.filter((a: any) => a.timeline === 'short-term').length,
      mediumTermActions: actionItems.filter((a: any) => a.timeline === 'medium-term').length,
      longTermActions: actionItems.filter((a: any) => a.timeline === 'long-term').length,
    };
  }

  private buildRACIMatrix(actionItems: ActionItem[]): RACIMatrix {
    // Collect all unique roles
    const rolesSet = new Set<string>();
    actionItems.forEach(item => {
      rolesSet.add(item.responsibleParty);
      rolesSet.add(item.accountableParty);
      item.consultParties.forEach((p: any) => rolesSet.add(p));
      item.informParties.forEach((p: any) => rolesSet.add(p));
    });
    const roles = Array.from(rolesSet);

    // Build matrix rows
    const matrix: RACIMatrixRow[] = actionItems.map((item: any) => {
      const assignments: Record<string, 'R' | 'A' | 'C' | 'I'> = {};

      assignments[item.responsibleParty] = 'R';
      assignments[item.accountableParty] = 'A';
      item.consultParties.forEach((p: any) => { assignments[p] = 'C'; });
      item.informParties.forEach((p: any) => { assignments[p] = 'I'; });

      return {
        actionItemId: item.id,
        actionItemTitle: item.title,
        assignments,
      };
    });

    return { roles, matrix };
  }

  private buildImplementationPlan(actionItems: ActionItem[]) {
    const phases = [
      {
        phase: 'Immediate Actions',
        timeframe: 'Next 1-2 weeks',
        timeline: 'immediate' as Timeline,
      },
      {
        phase: 'Short-Term Actions',
        timeframe: '1-3 months',
        timeline: 'short-term' as Timeline,
      },
      {
        phase: 'Medium-Term Actions',
        timeframe: '3-6 months',
        timeline: 'medium-term' as Timeline,
      },
      {
        phase: 'Long-Term Actions',
        timeframe: '6+ months',
        timeline: 'long-term' as Timeline,
      },
    ];

    return phases.map(phaseInfo => ({
      phase: phaseInfo.phase,
      timeframe: phaseInfo.timeframe,
      actions: actionItems
        .filter((item: any) => item.timeline === phaseInfo.timeline)
        .sort((a, b) => {
          // Sort by priority within each phase
          const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }),
    }));
  }

  private calculateCriticalPath(actionItems: ActionItem[]): ActionItem[] {
    // Simple critical path: critical items + their dependencies, in order
    const criticalItems = actionItems.filter((item: any) => item.priority === 'critical');
    const criticalPath: ActionItem[] = [];
    const added = new Set<string>();

    const addItemWithDependencies = (item: ActionItem) => {
      // Add dependencies first
      item.dependencies.forEach(depId => {
        if (!added.has(depId)) {
          const dep = actionItems.find((a: any) => a.id === depId);
          if (dep) {
            addItemWithDependencies(dep);
          }
        }
      });

      // Add item if not already added
      if (!added.has(item.id)) {
        criticalPath.push(item);
        added.add(item.id);
      }
    };

    criticalItems.forEach(item => addItemWithDependencies(item));

    return criticalPath;
  }
}

export const actionItemExtractorService = new ActionItemExtractorService();
export default actionItemExtractorService;

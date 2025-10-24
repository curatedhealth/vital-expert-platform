import { StateGraph, END, START, Annotation } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import { Agent } from '@/shared/services/stores/agents-store';
import { PanelMember } from '@/app/(app)/ask-panel/services/panel-store';
import { langchainRAGService } from '@/features/chat/services/langchain-service';

// Panel State Definition
const PanelStateAnnotation = Annotation.Root({
  query: Annotation<string>(),
  panelMembers: Annotation<PanelMember[]>(),
  expertResponses: Annotation<Map<string, ExpertResponse>>({
    reducer: (current, update) => new Map([...current, ...update]),
    default: () => new Map(),
  }),
  consensusReached: Annotation<boolean>({
    reducer: (_current, update) => update,
    default: () => false,
  }),
  finalRecommendation: Annotation<PanelConsensus | null>({
    reducer: (_current, update) => update,
    default: () => null,
  }),
  deliberationRound: Annotation<number>({
    reducer: (current, update) => current + update,
    default: () => 0,
  }),
  messages: Annotation<string[]>({
    reducer: (current, update) => [...current, ...update],
    default: () => [],
  }),
});

export interface ExpertResponse {
  expertId: string;
  expertName: string;
  content: string;
  confidence: number;
  reasoning: string;
  evidence: string[];
  citations: string[];
  timestamp: Date;
}

export interface PanelConsensus {
  primaryRecommendation: string;
  confidence: number;
  agreementLevel: number;
  dissenting: string[];
  nextSteps: string[];
  evidence: string[];
  expertVotes: Map<string, 'agree' | 'disagree' | 'neutral'>;
}

export class LangGraphPanelOrchestrator {
  private llm: ChatOpenAI;
  private workflow: any;

  constructor() {
    this.llm = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY!,
      modelName: 'gpt-4-turbo-preview',
      temperature: 0.7,
    });

    this.workflow = this.createPanelWorkflow();
  }

  private createPanelWorkflow() {
    const workflow = new StateGraph(PanelStateAnnotation);

    // Node 1: Parallel Expert Consultation
    workflow.addNode("consultExperts", async (state) => {
      console.log(`🎯 Consulting ${state.panelMembers.length} experts...`);

      // Consult all experts in parallel
      const responses = await Promise.all(
        state.panelMembers.map(member =>
          this.consultExpert(member.agent, state.query)
        )
      );

      const expertResponsesMap = new Map<string, ExpertResponse>();
      responses.forEach(response => {
        expertResponsesMap.set(response.expertId, response);
      });

      const messages = responses.map(r =>
        `✅ ${r.expertName} responded (confidence: ${(r.confidence * 100).toFixed(0)}%)`
      );

      return {
        expertResponses: expertResponsesMap,
        messages,
      };
    });

    // Node 2: Check Consensus
    workflow.addNode("checkConsensus", async (state) => {
      console.log(`📊 Checking consensus among ${state.expertResponses.size} expert responses...`);

      const consensus = await this.calculateConsensus(
        Array.from(state.expertResponses.values()),
        state.query
      );

      const consensusReached = consensus.agreementLevel > 0.75;

      const messages = [
        `📊 Consensus check: ${consensusReached ? '✅ Reached' : '⚠️ Not reached'} (${(consensus.agreementLevel * 100).toFixed(0)}% agreement)`
      ];

      return {
        consensusReached,
        finalRecommendation: consensus,
        messages,
      };
    });

    // Node 3: Expert Deliberation (if needed)
    workflow.addNode("deliberate", async (state) => {
      console.log(`🔄 Round ${state.deliberationRound + 1} of deliberation...`);

      // Show experts each other's opinions and ask them to reconsider
      const deliberationPromises = state.panelMembers.map(async (member) => {
        const currentResponse = state.expertResponses.get(member.agent.id);
        const otherResponses = Array.from(state.expertResponses.values())
          .filter(r => r.expertId !== member.agent.id);

        return this.conductDeliberation(
          member.agent,
          state.query,
          currentResponse!,
          otherResponses
        );
      });

      const updatedResponses = await Promise.all(deliberationPromises);
      const updatedMap = new Map<string, ExpertResponse>();
      updatedResponses.forEach(response => {
        updatedMap.set(response.expertId, response);
      });

      const messages = [
        `🔄 Deliberation round ${state.deliberationRound + 1} completed`
      ];

      return {
        expertResponses: updatedMap,
        deliberationRound: 1,
        messages,
      };
    });

    // Node 4: Generate Final Report
    workflow.addNode("generateReport", async (state) => {
      console.log(`📝 Generating final panel report...`);

      if (!state.finalRecommendation) {
        throw new Error('No consensus reached to generate report');
      }

      const report = await this.generateAdvisoryReport(
        state.query,
        state.finalRecommendation,
        Array.from(state.expertResponses.values())
      );

      const messages = [
        `📝 Final advisory report generated`,
        `✅ Panel consultation complete`
      ];

      return {
        finalRecommendation: {
          ...state.finalRecommendation,
          primaryRecommendation: report,
        },
        messages,
      };
    });

    // Define edges with conditional routing
    workflow.addEdge(START, "consultExperts");
    workflow.addEdge("consultExperts", "checkConsensus");

    // Conditional: If consensus → report, else → deliberate
    workflow.addConditionalEdges(
      "checkConsensus",
      (state) => {
        if (state.consensusReached) {
          return "report";
        } else if (state.deliberationRound < 2) {
          return "deliberate";
        } else {
          return "force_report";
        }
      },
      {
        report: "generateReport",
        deliberate: "deliberate",
        force_report: "generateReport",
      }
    );

    // After deliberation, check consensus again
    workflow.addEdge("deliberate", "checkConsensus");
    workflow.addEdge("generateReport", END);

    return workflow.compile();
  }

  private async consultExpert(agent: Agent, query: string): Promise<ExpertResponse> {
    try {
      console.log(`  📞 Consulting ${agent.display_name}...`);

      // Get RAG context for this expert's knowledge domains
      const { answer, sources, citations } = await langchainRAGService.queryKnowledge(
        query,
        agent.id,
        [],
        agent
      );

      // Build expert consultation prompt
      const systemPrompt = `${agent.system_prompt}

You are participating in an expert advisory panel. Provide your professional opinion on the following question.

Your response should:
1. State your recommendation clearly
2. Provide your confidence level (0-1)
3. Explain your reasoning
4. Cite relevant evidence from your knowledge base
5. Identify any limitations or concerns

Format your response as JSON:
{
  "recommendation": "your clear recommendation",
  "confidence": 0.85,
  "reasoning": "detailed explanation of your reasoning",
  "evidence": ["key evidence point 1", "key evidence point 2"],
  "concerns": ["any concerns or limitations"]
}`;

      const messages = [
        new SystemMessage(systemPrompt),
        new HumanMessage(`Question: ${query}\n\nKnowledge Base Context:\n${answer}`),
      ];

      const response = await this.llm.invoke(messages);
      const content = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);

      // Try to parse JSON response
      let parsedResponse: any;
      try {
        // Extract JSON from markdown code blocks if present
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) ||
                         content.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
        parsedResponse = JSON.parse(jsonStr);
      } catch {
        // Fallback to simple text response
        parsedResponse = {
          recommendation: content,
          confidence: 0.7,
          reasoning: "Expert analysis based on domain knowledge",
          evidence: sources.map(s => s.title),
          concerns: [],
        };
      }

      return {
        expertId: agent.id,
        expertName: agent.display_name,
        content: parsedResponse.recommendation,
        confidence: parsedResponse.confidence || 0.7,
        reasoning: parsedResponse.reasoning || '',
        evidence: parsedResponse.evidence || [],
        citations: citations || [],
        timestamp: new Date(),
      };

    } catch (error) {
      console.error(`❌ Error consulting ${agent.display_name}:`, error);
      // Return fallback response
      return {
        expertId: agent.id,
        expertName: agent.display_name,
        content: `Unable to provide recommendation at this time due to technical error.`,
        confidence: 0.1,
        reasoning: 'Error during consultation',
        evidence: [],
        citations: [],
        timestamp: new Date(),
      };
    }
  }

  private async conductDeliberation(
    agent: Agent,
    query: string,
    currentResponse: ExpertResponse,
    otherResponses: ExpertResponse[]
  ): Promise<ExpertResponse> {
    try {
      const systemPrompt = `${agent.system_prompt}

You are in a deliberation phase of an expert advisory panel. You've already provided your initial opinion, and now you're reviewing your colleagues' perspectives.

Your initial response:
${JSON.stringify(currentResponse, null, 2)}

Your colleagues' responses:
${otherResponses.map(r => `
${r.expertName}: ${r.content}
Confidence: ${r.confidence}
Reasoning: ${r.reasoning}
`).join('\n---\n')}

After considering your colleagues' perspectives, provide an updated response. You may:
- Maintain your original position if you remain convinced
- Adjust your confidence level based on new insights
- Revise your recommendation if persuaded by colleagues
- Identify areas of agreement and disagreement

Respond in the same JSON format as before.`;

      const messages = [
        new SystemMessage(systemPrompt),
        new HumanMessage(`Original question: ${query}\n\nPlease provide your deliberated response.`),
      ];

      const response = await this.llm.invoke(messages);
      const content = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);

      let parsedResponse: any;
      try {
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) ||
                         content.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
        parsedResponse = JSON.parse(jsonStr);
      } catch {
        parsedResponse = {
          recommendation: content,
          confidence: currentResponse.confidence,
          reasoning: "Deliberated response",
          evidence: currentResponse.evidence,
          concerns: [],
        };
      }

      return {
        expertId: agent.id,
        expertName: agent.display_name,
        content: parsedResponse.recommendation,
        confidence: parsedResponse.confidence || currentResponse.confidence,
        reasoning: parsedResponse.reasoning || '',
        evidence: parsedResponse.evidence || currentResponse.evidence,
        citations: currentResponse.citations,
        timestamp: new Date(),
      };

    } catch (error) {
      console.error(`❌ Error in deliberation for ${agent.display_name}:`, error);
      return currentResponse; // Return original response if deliberation fails
    }
  }

  private async calculateConsensus(
    responses: ExpertResponse[],
    query: string
  ): Promise<PanelConsensus> {
    if (responses.length === 0) {
      return {
        primaryRecommendation: 'No expert responses available',
        confidence: 0,
        agreementLevel: 0,
        dissenting: [],
        nextSteps: [],
        evidence: [],
        expertVotes: new Map(),
      };
    }

    // Use LLM to analyze consensus
    const analysisPrompt = `You are analyzing responses from an expert advisory panel. Determine the level of consensus.

Expert Responses:
${responses.map(r => `
${r.expertName} (Confidence: ${r.confidence}):
${r.content}
Reasoning: ${r.reasoning}
`).join('\n---\n')}

Analyze these responses and provide:
1. The primary consensus recommendation (or note significant disagreement)
2. Overall agreement level (0-1, where 1 is complete agreement)
3. Overall confidence (weighted average of expert confidences)
4. List of dissenting opinions (if any)
5. Recommended next steps

Respond in JSON format:
{
  "primaryRecommendation": "synthesized recommendation",
  "agreementLevel": 0.85,
  "confidence": 0.82,
  "dissenting": ["any dissenting viewpoints"],
  "nextSteps": ["recommended action 1", "recommended action 2"]
}`;

    const messages = [
      new SystemMessage('You are an expert panel facilitator analyzing consensus.'),
      new HumanMessage(analysisPrompt),
    ];

    const response = await this.llm.invoke(messages);
    const content = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);

    let parsedConsensus: any;
    try {
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) ||
                       content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      parsedConsensus = JSON.parse(jsonStr);
    } catch {
      // Fallback: simple majority
      const avgConfidence = responses.reduce((sum, r) => sum + r.confidence, 0) / responses.length;
      parsedConsensus = {
        primaryRecommendation: responses[0].content,
        agreementLevel: 0.6,
        confidence: avgConfidence,
        dissenting: [],
        nextSteps: ['Review expert opinions', 'Make final decision'],
      };
    }

    // Collect all evidence
    const allEvidence = responses.flatMap(r => r.evidence);
    const uniqueEvidence = [...new Set(allEvidence)];

    // Simple voting: experts with similar recommendations
    const expertVotes = new Map<string, 'agree' | 'disagree' | 'neutral'>();
    responses.forEach(r => {
      expertVotes.set(r.expertId, 'agree'); // Simplified for prototype
    });

    return {
      primaryRecommendation: parsedConsensus.primaryRecommendation,
      confidence: parsedConsensus.confidence || 0.7,
      agreementLevel: parsedConsensus.agreementLevel || 0.6,
      dissenting: parsedConsensus.dissenting || [],
      nextSteps: parsedConsensus.nextSteps || [],
      evidence: uniqueEvidence,
      expertVotes,
    };
  }

  private async generateAdvisoryReport(
    query: string,
    consensus: PanelConsensus,
    expertResponses: ExpertResponse[]
  ): Promise<string> {
    const reportPrompt = `Generate a comprehensive advisory board report based on expert panel consultation.

Original Question: ${query}

Panel Consensus:
- Agreement Level: ${(consensus.agreementLevel * 100).toFixed(0)}%
- Confidence: ${(consensus.confidence * 100).toFixed(0)}%
- Primary Recommendation: ${consensus.primaryRecommendation}

Expert Panel Members (${expertResponses.length}):
${expertResponses.map(r => `
**${r.expertName}** (Confidence: ${(r.confidence * 100).toFixed(0)}%)
Position: ${r.content}
Reasoning: ${r.reasoning}
${r.citations.length > 0 ? `Citations: ${r.citations.join(', ')}` : ''}
`).join('\n')}

${consensus.dissenting.length > 0 ? `
Dissenting Opinions:
${consensus.dissenting.map(d => `- ${d}`).join('\n')}
` : ''}

Generate a professional advisory board report with:
1. Executive Summary
2. Panel Recommendation
3. Supporting Evidence
4. Areas of Expert Agreement
5. Areas of Expert Disagreement (if any)
6. Recommended Next Steps
7. Confidence and Limitations

Format the report in clear, professional markdown.`;

    const messages = [
      new SystemMessage('You are an expert panel secretary generating formal advisory reports.'),
      new HumanMessage(reportPrompt),
    ];

    const response = await this.llm.invoke(messages);
    return typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
  }

  public async orchestratePanel(
    query: string,
    panelMembers: PanelMember[]
  ): Promise<{
    recommendation: string;
    consensus: PanelConsensus | null;
    expertResponses: ExpertResponse[];
    messages: string[];
  }> {
    console.log(`\n🎭 Starting Panel Orchestration`);
    console.log(`📋 Query: ${query}`);
    console.log(`👥 Panel Size: ${panelMembers.length} experts\n`);

    try {
      const result = await this.workflow.invoke({
        query,
        panelMembers,
      });

      console.log(`\n✅ Panel Orchestration Complete`);
      console.log(`📊 Messages: ${result.messages.length}`);

      return {
        recommendation: result.finalRecommendation?.primaryRecommendation || 'No recommendation generated',
        consensus: result.finalRecommendation,
        expertResponses: Array.from(result.expertResponses.values()),
        messages: result.messages,
      };

    } catch (error) {
      console.error('❌ Panel orchestration failed:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const panelOrchestrator = new LangGraphPanelOrchestrator();

# Agent Enhancement Implementation Plan
## Bringing Advisory Board Capabilities to Individual Agents

**Status**: Ready for Implementation
**Estimated Effort**: 4 weeks (12 features across 4 phases)
**Date**: 2025-10-03

---

## 📋 Executive Summary

This document outlines the complete implementation plan for porting Virtual Advisory Board capabilities to individual agent chat conversations. The enhancements will elevate agent quality to enterprise-grade with evidence-based responses, transparency, and advanced decision support features.

**Key Benefits**:
- Agents gain access to 13 expert tools (PubMed, ClinicalTrials.gov, FDA, ICH, ISO, DiMe, ICHOM, etc.)
- Evidence-based responses with formatted citations
- Real-time transparency showing research being conducted
- Mini risk assessment and action item extraction for high-stakes decisions
- Multi-expert consultation option

---

##  Phase 1: Quick Wins (Week 1) - Tool Access & Transparency

### 1.1 Wire Up 13 Expert Tools to Agent Chat

**File**: `/src/features/chat/services/enhanced-agent-orchestrator.ts` (NEW)

**Implementation**:
```typescript
/**
 * Enhanced Agent Orchestrator with Tool Support
 *
 * Extends existing agent chat with 13 expert tools from Advisory Board
 */

import { ChatOpenAI } from '@langchain/openai';
import { AgentExecutor, createOpenAIFunctionsAgent } from 'langchain/agents';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { getAllExpertTools, toolUsageTracker, type ToolCall } from '@/lib/services/expert-tools';

export interface EnhancedAgentResponse {
  content: string;
  confidence: number;
  citations: Citation[];
  toolCalls: ToolCall[];
  thinkingSteps: ThinkingStep[];
  timestamp: string;
}

export interface Citation {
  type: 'clinical-trial' | 'fda-approval' | 'pubmed' | 'ich-guideline' | 'iso-standard' | 'dime-resource' | 'ichom-set' | 'web-source';
  id: string;
  title: string;
  source: string;
  url: string;
  relevance: number; // 0-1
}

export interface ThinkingStep {
  step: number;
  description: string;
  toolUsed?: string;
  timestamp: string;
}

class EnhancedAgentOrchestrator {
  private llm: ChatOpenAI;
  private tools: any[];

  constructor() {
    this.llm = new ChatOpenAI({
      modelName: 'gpt-4',
      temperature: 0.7,
      openAIApiKey: process.env.OPENAI_API_KEY,
      streaming: true // Enable streaming for real-time thinking
    });

    // Get all 13 expert tools
    this.tools = getAllExpertTools();
  }

  async chat(
    message: string,
    conversationHistory: any[],
    agentPersona: string,
    agentExpertise: string[]
  ): Promise<EnhancedAgentResponse> {
    const toolCalls: ToolCall[] = [];
    const thinkingSteps: ThinkingStep[] = [];
    let stepCounter = 0;

    // Create agent with tools
    const prompt = ChatPromptTemplate.fromMessages([
      ['system', `You are ${agentPersona}.

Your expertise: ${agentExpertise.join(', ')}

You have access to the following tools:
- web_search: Search web for current information (Tavily API)
- pubmed_search: Search peer-reviewed medical literature
- search_clinical_trials: Search ClinicalTrials.gov
- search_fda_approvals: Search FDA drug approvals
- search_ema_authorizations: Search EMA database
- search_who_essential_medicines: Check WHO Essential Medicines List
- search_multi_region_regulatory: Compare regulatory status across regions
- search_ich_guidelines: Search ICH guidelines (GCP, stability, etc.)
- search_iso_standards: Search ISO standards (medical devices, quality)
- search_dime_resources: Search Digital Medicine Society resources
- search_ichom_standard_sets: Search ICHOM outcome measurement sets
- calculator: Perform mathematical calculations
- knowledge_base: Query internal company knowledge base (1,268 chunks)

IMPORTANT INSTRUCTIONS:
1. Always cite your sources using these tools
2. For medical/clinical questions, use PubMed and ClinicalTrials.gov
3. For regulatory questions, use FDA, ICH, ISO tools
4. For drug information, use FDA and WHO tools
5. For digital health, use DiMe resources
6. Provide confidence scores based on evidence quality
7. Format citations properly

When you use a tool, I will show the user your research process for transparency.`],
      new MessagesPlaceholder('chat_history'),
      ['human', '{input}'],
      new MessagesPlaceholder('agent_scratchpad')
    ]);

    const agent = await createOpenAIFunctionsAgent({
      llm: this.llm,
      tools: this.tools,
      prompt
    });

    const agentExecutor = new AgentExecutor({
      agent,
      tools: this.tools,
      maxIterations: 5,
      returnIntermediateSteps: true,
      callbacks: [
        {
          handleToolStart: async (tool: any, input: string) => {
            // Track thinking step
            thinkingSteps.push({
              step: ++stepCounter,
              description: `Using ${tool.name}`,
              toolUsed: tool.name,
              timestamp: new Date().toISOString()
            });
          }
        }
      ]
    });

    // Execute agent
    const result = await agentExecutor.invoke({
      input: message,
      chat_history: conversationHistory
    });

    // Extract tool calls
    if (result.intermediateSteps && result.intermediateSteps.length > 0) {
      for (const step of result.intermediateSteps) {
        const toolCall: ToolCall = {
          toolName: step.action.tool,
          input: step.action.toolInput,
          output: step.observation || '',
          timestamp: new Date().toISOString(),
          duration: 0
        };
        toolCalls.push(toolCall);
        toolUsageTracker.trackToolCall(toolCall);
      }
    }

    // Extract citations from tool calls
    const citations = this.extractCitations(toolCalls);

    // Calculate confidence based on evidence
    const confidence = this.calculateConfidence(toolCalls, citations);

    return {
      content: result.output || result.result,
      confidence,
      citations,
      toolCalls,
      thinkingSteps,
      timestamp: new Date().toISOString()
    };
  }

  private extractCitations(toolCalls: ToolCall[]): Citation[] {
    const citations: Citation[] = [];

    for (const toolCall of toolCalls) {
      try {
        const output = JSON.parse(toolCall.output);

        // Extract citations based on tool type
        if (toolCall.toolName === 'pubmed_search' && output.results) {
          for (const result of output.results) {
            citations.push({
              type: 'pubmed',
              id: result.pmid,
              title: result.title,
              source: result.journal || 'PubMed',
              url: `https://pubmed.ncbi.nlm.nih.gov/${result.pmid}/`,
              relevance: 0.9
            });
          }
        } else if (toolCall.toolName === 'search_clinical_trials' && output.trials) {
          for (const trial of output.trials) {
            citations.push({
              type: 'clinical-trial',
              id: trial.nctId,
              title: trial.title,
              source: 'ClinicalTrials.gov',
              url: trial.url,
              relevance: 0.9
            });
          }
        } else if (toolCall.toolName === 'search_fda_approvals' && output.approvals) {
          for (const approval of output.approvals) {
            citations.push({
              type: 'fda-approval',
              id: approval.brandName,
              title: `${approval.brandName} (${approval.genericName})`,
              source: 'FDA OpenFDA',
              url: approval.url,
              relevance: 0.95
            });
          }
        } else if (toolCall.toolName === 'search_ich_guidelines' && output.guidelines) {
          for (const guideline of output.guidelines) {
            citations.push({
              type: 'ich-guideline',
              id: guideline.code,
              title: guideline.title,
              source: 'ICH',
              url: guideline.url,
              relevance: 1.0
            });
          }
        }
        // Add more citation extraction for other tools...
      } catch (error) {
        console.error(`Failed to extract citations from ${toolCall.toolName}:`, error);
      }
    }

    return citations;
  }

  private calculateConfidence(toolCalls: ToolCall[], citations: Citation[]): number {
    if (citations.length === 0) return 0.6; // Default confidence without citations

    // More citations = higher confidence (up to a point)
    let confidence = 0.7 + (Math.min(citations.length, 5) * 0.05);

    // High-quality sources boost confidence
    const hasRegulatorySource = citations.some(c =>
      c.type === 'fda-approval' || c.type === 'ich-guideline' || c.type === 'iso-standard'
    );
    if (hasRegulatorySource) confidence += 0.1;

    const hasClinicalTrial = citations.some(c => c.type === 'clinical-trial');
    if (hasClinicalTrial) confidence += 0.05;

    return Math.min(confidence, 0.95);
  }
}

export const enhancedAgentOrchestrator = new EnhancedAgentOrchestrator();
```

---

### 1.2 Tool Usage Display Component

**File**: `/src/features/chat/components/tool-usage-display.tsx` (NEW)

```typescript
'use client';

import React from 'react';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';
import {
  Search,
  FileText,
  Calculator,
  Database,
  FlaskConical,
  Shield,
  Activity,
  Globe
} from 'lucide-react';
import type { ToolCall } from '@/lib/services/expert-tools';

interface ToolUsageDisplayProps {
  toolCalls: ToolCall[];
  compact?: boolean;
}

const TOOL_ICONS: Record<string, any> = {
  web_search: Globe,
  pubmed_search: FileText,
  search_clinical_trials: FlaskConical,
  search_fda_approvals: Shield,
  search_ich_guidelines: Shield,
  search_iso_standards: Shield,
  search_dime_resources: Activity,
  calculator: Calculator,
  knowledge_base: Database
};

const TOOL_COLORS: Record<string, string> = {
  web_search: 'bg-blue-100 text-blue-800 border-blue-300',
  pubmed_search: 'bg-green-100 text-green-800 border-green-300',
  search_clinical_trials: 'bg-purple-100 text-purple-800 border-purple-300',
  search_fda_approvals: 'bg-red-100 text-red-800 border-red-300',
  search_ich_guidelines: 'bg-orange-100 text-orange-800 border-orange-300',
  calculator: 'bg-gray-100 text-gray-800 border-gray-300',
  knowledge_base: 'bg-indigo-100 text-indigo-800 border-indigo-300'
};

export function ToolUsageDisplay({ toolCalls, compact = false }: ToolUsageDisplayProps) {
  if (toolCalls.length === 0) return null;

  if (compact) {
    return (
      <div className="flex flex-wrap gap-1 mt-2">
        <span className="text-xs text-muted-foreground">🔧 Tools used:</span>
        {toolCalls.map((toolCall, idx) => {
          const Icon = TOOL_ICONS[toolCall.toolName] || Search;
          const colorClass = TOOL_COLORS[toolCall.toolName] || 'bg-gray-100 text-gray-800';

          return (
            <Badge key={idx} variant="outline" className={`${colorClass} text-xs`}>
              <Icon className="h-3 w-3 mr-1" />
              {toolCall.toolName.replace(/_/g, ' ')}
            </Badge>
          );
        })}
      </div>
    );
  }

  return (
    <Card className="mt-3 border-blue-200 bg-blue-50">
      <CardContent className="pt-4">
        <div className="space-y-3">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Search className="h-4 w-4" />
            Research Conducted
          </h4>
          {toolCalls.map((toolCall, idx) => {
            const Icon = TOOL_ICONS[toolCall.toolName] || Search;

            return (
              <div key={idx} className="bg-white rounded-lg p-3 border">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">
                      {toolCall.toolName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Query: {typeof toolCall.input === 'string' ? toolCall.input : JSON.stringify(toolCall.input).substring(0, 100)}
                    </div>
                    {toolCall.output && (
                      <details className="mt-2">
                        <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-800">
                          View results
                        </summary>
                        <div className="mt-2 text-xs bg-gray-50 p-2 rounded max-h-32 overflow-y-auto">
                          <pre className="whitespace-pre-wrap">
                            {toolCall.output.substring(0, 500)}
                            {toolCall.output.length > 500 && '...'}
                          </pre>
                        </div>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
```

---

### 1.3 Citation Formatting Component

**File**: `/src/features/chat/components/citation-display.tsx` (NEW)

```typescript
'use client';

import React from 'react';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { ExternalLink, FileText, FlaskConical, Shield, Activity } from 'lucide-react';
import { formatCitation } from '@/lib/services/evidence-retrieval';
import type { Citation } from '../services/enhanced-agent-orchestrator';

interface CitationDisplayProps {
  citations: Citation[];
  format?: 'apa' | 'vancouver' | 'chicago';
}

const CITATION_TYPE_LABELS: Record<string, { label: string; icon: any; color: string }> = {
  'pubmed': { label: 'PubMed', icon: FileText, color: 'bg-green-100 text-green-800' },
  'clinical-trial': { label: 'Clinical Trial', icon: FlaskConical, color: 'bg-purple-100 text-purple-800' },
  'fda-approval': { label: 'FDA', icon: Shield, color: 'bg-red-100 text-red-800' },
  'ich-guideline': { label: 'ICH', icon: Shield, color: 'bg-orange-100 text-orange-800' },
  'iso-standard': { label: 'ISO', icon: Shield, color: 'bg-blue-100 text-blue-800' },
  'dime-resource': { label: 'DiMe', icon: Activity, color: 'bg-pink-100 text-pink-800' },
  'ichom-set': { label: 'ICHOM', icon: Activity, color: 'bg-teal-100 text-teal-800' },
  'web-source': { label: 'Web', icon: ExternalLink, color: 'bg-gray-100 text-gray-800' }
};

export function CitationDisplay({ citations, format = 'apa' }: CitationDisplayProps) {
  if (citations.length === 0) return null;

  return (
    <Card className="mt-4 border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <FileText className="h-4 w-4" />
          References ({citations.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="space-y-3 text-sm">
          {citations.map((citation, idx) => {
            const typeInfo = CITATION_TYPE_LABELS[citation.type] || CITATION_TYPE_LABELS['web-source'];
            const Icon = typeInfo.icon;

            return (
              <li key={idx} className="bg-white rounded-lg p-3 border">
                <div className="flex items-start gap-3">
                  <span className="text-xs text-muted-foreground font-medium">[{idx + 1}]</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className={`${typeInfo.color} text-xs`}>
                        <Icon className="h-3 w-3 mr-1" />
                        {typeInfo.label}
                      </Badge>
                      {citation.relevance && (
                        <Badge variant="secondary" className="text-xs">
                          {Math.round(citation.relevance * 100)}% relevant
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm">
                      <strong>{citation.title}</strong>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {citation.source} • {citation.id}
                    </div>
                    <a
                      href={citation.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 mt-2 inline-flex items-center gap-1"
                    >
                      View source <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        <details className="mt-4">
          <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
            View formatted citations ({format.toUpperCase()})
          </summary>
          <div className="mt-2 space-y-2 text-xs bg-white p-3 rounded border">
            {citations.map((citation, idx) => (
              <div key={idx} className="border-l-2 border-gray-300 pl-2">
                [{idx + 1}] {formatCitation(citation as any, format)}
              </div>
            ))}
          </div>
        </details>
      </CardContent>
    </Card>
  );
}
```

---

## 🎯 Phase 2: Trust & Transparency (Week 2)

### 2.1 Confidence Scoring

**Add to enhanced agent response**:
- Calculate confidence based on number and quality of citations
- Display as badge with color coding (Low/Medium/High/Very High)
- Tooltip explaining confidence score

### 2.2 Evidence Summary Cards

**File**: `/src/features/chat/components/evidence-summary-card.tsx` (NEW)

Shows pre-answer summary:
- ✓ 3 Clinical Trials found
- ✓ 2 FDA Approvals identified
- ✓ 5 PubMed articles reviewed
- ✓ ICH E6(R2) GCP guidelines checked

### 2.3 Real-time Thinking Indicators

**Streaming status updates**:
```
🔍 Searching PubMed for "psoriasis biologics"...
🔬 Analyzing ClinicalTrials.gov data...
📊 Checking FDA approvals...
✍️ Synthesizing findings...
```

---

## 🚀 Phase 3: Advanced Features (Weeks 3-4)

### 3.1 Mini Risk Assessment

For high-stakes questions, automatically generate 3-5 key risks with mitigation strategies.

### 3.2 Action Item Extraction

At end of conversation, offer button:
```
📋 Generate Action Items from Conversation
```

### 3.3 "Ask 3 Experts" Quick Consultation

Add button in agent chat:
```
🎯 Get Second Opinion (Ask 3 Experts)
```

Triggers mini advisory board with 3 relevant experts, shows quick comparison.

---

## 💎 Phase 4: Polish (Week 4+)

### 4.1 Structured Output Templates
- Clinical Assessment Format
- Regulatory Guidance Format
- Research Summary Format
- Implementation Plan Format

### 4.2 Export with Evidence
- Export conversation to PDF/DOCX/MD with all citations

### 4.3 Enhanced Memory
- Conversation summarization after 10+ messages
- Key topics extraction
- Reference to previous tool usage

---

## 📁 File Structure

```
/src
├── /features/chat
│   ├── /services
│   │   ├── enhanced-agent-orchestrator.ts (NEW)
│   │   ├── agent-risk-assessment.ts (NEW - Phase 3)
│   │   ├── agent-action-extraction.ts (NEW - Phase 3)
│   │   ├── mini-advisory-board.ts (NEW - Phase 3)
│   │   └── conversation-export.ts (NEW - Phase 4)
│   └── /components
│       ├── tool-usage-display.tsx (NEW)
│       ├── citation-display.tsx (NEW)
│       ├── evidence-summary-card.tsx (NEW - Phase 2)
│       ├── confidence-badge.tsx (NEW - Phase 2)
│       ├── thinking-indicator.tsx (NEW - Phase 2)
│       ├── mini-risk-card.tsx (NEW - Phase 3)
│       ├── action-items-summary.tsx (NEW - Phase 3)
│       └── mini-panel-view.tsx (NEW - Phase 3)
└── /lib/services
    ├── expert-tools.ts (EXISTING - already has 13 tools)
    ├── evidence-retrieval.ts (EXISTING)
    └── clinical-standards-tools.ts (EXISTING)
```

---

## 🔌 API Endpoints Needed

### Phase 1-2
- `POST /api/chat/enhanced` - Enhanced chat with tools
- `GET /api/chat/tools/stats` - Tool usage statistics

### Phase 3
- `POST /api/chat/risk-assessment` - Mini risk assessment
- `POST /api/chat/action-items` - Extract action items
- `POST /api/chat/mini-panel` - Quick 3-expert consultation

### Phase 4
- `POST /api/chat/export` - Export conversation with evidence
- `POST /api/chat/summarize` - Conversation summarization

---

## ✅ Success Metrics

**Phase 1 Success**:
- Agents use tools in 50%+ of clinical/regulatory questions
- Citations appear in 70%+ of tool-enabled responses
- Users can see tool usage for transparency

**Phase 2 Success**:
- Confidence scores displayed on all responses
- Real-time thinking indicators show during tool usage
- Evidence summaries precede complex answers

**Phase 3 Success**:
- Mini risk assessments generated for high-stakes queries
- Action items extracted from 20%+ of long conversations
- "Ask 3 Experts" used for second opinions

**Phase 4 Success**:
- Conversations exported with proper citations
- Structured templates used for common query types
- Enhanced memory improves multi-turn conversations

---

## 🚧 Implementation Notes

1. **Start with Phase 1** - This provides immediate value with minimal complexity
2. **Test thoroughly** - Each phase should be tested before moving to next
3. **Gradual rollout** - Consider feature flags for phased rollout
4. **Monitor usage** - Track which tools are most used, citation quality
5. **User feedback** - Gather feedback after Phase 1 before continuing

---

## 📚 Dependencies

- LangChain (already installed)
- OpenAI API (already configured)
- Tavily API (already configured)
- All expert tool services (already built)

---

**Next Steps**: Begin Phase 1 implementation with enhanced-agent-orchestrator.ts

import { createClient } from '@supabase/supabase-js';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import {
  fdaDatabaseTool,
  fdaGuidanceTool,
  regulatoryCalculatorTool,
} from '../tools/fda-tools';
import {
  clinicalTrialsSearchTool,
  studyDesignTool,
  endpointSelectorTool,
} from '../tools/clinical-trials-tools';
import {
  tavilySearchTool,
  wikipediaTool,
  arxivSearchTool,
  pubmedSearchTool,
  euMedicalDeviceTool,
} from '../tools/external-api-tools';
import { getFormatInstructions } from '../parsers/structured-output';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Agent Prompt Builder
 * Builds comprehensive prompts by combining:
 * 1. Agent's system prompt from database
 * 2. Agent's capabilities from database
 * 3. Available tools descriptions
 * 4. RAG retrieval strategy
 * 5. Output format instructions
 * 6. Prompt library templates
 */
export class AgentPromptBuilder {
  private agentId: string;
  private agentProfile: any;
  private capabilities: any[] = [];
  private promptTemplates: any[] = [];
  private tools: any[] = [];

  constructor(agentId: string, agentProfile?: any) {
    this.agentId = agentId;
    this.agentProfile = agentProfile;
  }

  /**
   * Load agent data from database
   */
  async loadAgentData() {
    // Load agent profile if not provided
    if (!this.agentProfile) {
      const { data: agent } = await supabase
        .from('agents')
        .select('*')
        .eq('id', this.agentId)
        .single();

      this.agentProfile = agent;
    }

    // Load agent capabilities
    const { data: agentCapabilities } = await supabase
      .from('agent_capabilities')
      .select('capability_id, capabilities(*)')
      .eq('agent_id', this.agentId);

    this.capabilities = agentCapabilities?.map((ac: any) => ac.capabilities) || [];

    // Load agent prompt templates
    const { data: prompts } = await supabase
      .from('prompts')
      .select('*')
      .contains('agents', [this.agentId])
      .eq('is_active', true);

    this.promptTemplates = prompts || [];

    // Get all available tools
    this.tools = this.getAllTools();

    console.log('📚 Loaded agent data:', {
      agent: this.agentProfile?.name,
      capabilities: this.capabilities.length,
      prompts: this.promptTemplates.length,
      tools: this.tools.length,
    });
  }

  /**
   * Build Complete System Prompt
   */
  async buildSystemPrompt(options: {
    includeCapabilities?: boolean;
    includeTools?: boolean;
    includeRAGStrategy?: boolean;
    outputFormat?: string;
    additionalContext?: string;
  } = {}): Promise<string> {
    await this.loadAgentData();

    const sections: string[] = [];

    // 1. Core Identity (from agent profile)
    sections.push(this.buildIdentitySection());

    // 2. Capabilities (from database)
    if (options.includeCapabilities !== false) {
      sections.push(this.buildCapabilitiesSection());
    }

    // 3. Available Tools (from code)
    if (options.includeTools !== false) {
      sections.push(this.buildToolsSection());
    }

    // 4. RAG Strategy (if enabled)
    if (options.includeRAGStrategy) {
      sections.push(this.buildRAGSection());
    }

    // 5. Output Format Instructions (if specified)
    if (options.outputFormat) {
      sections.push(this.buildOutputFormatSection(options.outputFormat));
    }

    // 6. Additional Context
    if (options.additionalContext) {
      sections.push(`\n## Additional Context\n${options.additionalContext}`);
    }

    // 7. Behavior Guidelines
    sections.push(this.buildBehaviorSection());

    return sections.join('\n\n');
  }

  /**
   * Build Identity Section (from database system_prompt)
   */
  private buildIdentitySection(): string {
    const name = this.agentProfile?.display_name || this.agentProfile?.name;
    const description = this.agentProfile?.description;
    const systemPrompt = this.agentProfile?.system_prompt;

    return `# ${name}

${description}

## Role and Expertise

${systemPrompt || 'You are an expert AI advisor in the medical device industry.'}`;
  }

  /**
   * Build Capabilities Section (from database capabilities)
   */
  private buildCapabilitiesSection(): string {
    if (this.capabilities.length === 0) {
      return '';
    }

    const capabilitiesByCategory = this.capabilities.reduce((acc: any, cap: any) => {
      const category = cap.category || 'General';
      if (!acc[category]) acc[category] = [];
      acc[category].push(cap);
      return acc;
    }, {});

    const capabilityText = Object.entries(capabilitiesByCategory)
      .map(([category, caps]: [string, any]) => {
        const capList = caps
          .map((cap: any) => `- **${cap.name}**: ${cap.description}`)
          .join('\n');
        return `### ${category}\n${capList}`;
      })
      .join('\n\n');

    return `## Your Capabilities

You have been configured with the following specialized capabilities:

${capabilityText}

Use these capabilities to provide comprehensive, expert-level guidance.`;
  }

  /**
   * Build Tools Section (from available tools)
   */
  private buildToolsSection(): string {
    const toolsByCategory = {
      'FDA & Regulatory': [fdaDatabaseTool, fdaGuidanceTool, regulatoryCalculatorTool],
      'Clinical Research': [clinicalTrialsSearchTool, studyDesignTool, endpointSelectorTool],
      'External Research': [tavilySearchTool, wikipediaTool, arxivSearchTool, pubmedSearchTool, euMedicalDeviceTool],
    };

    const toolText = Object.entries(toolsByCategory)
      .map(([category, tools]) => {
        const toolList = tools
          .map((tool: any) => `- **${tool.name}**: ${tool.description}`)
          .join('\n');
        return `### ${category}\n${toolList}`;
      })
      .join('\n\n');

    return `## Available Tools

You have access to the following tools for autonomous research and analysis:

${toolText}

**Important Guidelines:**
- Use tools proactively to gather comprehensive information
- Combine multiple tools for thorough analysis
- Always cite sources from tool results
- If one tool fails, try alternative approaches`;
  }

  /**
   * Build RAG Section
   */
  private buildRAGSection(): string {
    return `## Knowledge Retrieval

You have access to a curated knowledge base of:
- FDA guidance documents and regulatory pathways
- Clinical trial protocols and study designs
- Medical device regulations (US, EU, international)
- Industry best practices and case studies
- Peer-reviewed research and literature

When answering questions:
1. First retrieve relevant knowledge from the knowledge base
2. Supplement with real-time tool searches if needed
3. Synthesize information from multiple sources
4. Provide citations and references`;
  }

  /**
   * Build Output Format Section
   */
  private buildOutputFormatSection(format: string): string {
    // Skip format instructions for plain text
    if (format === 'text' || !format) {
      return '';
    }

    const formatInstructions = getFormatInstructions(format as any);

    return `## Output Format Requirements

Your response MUST follow this structured format:

${formatInstructions}

**Critical:**
- Return valid JSON matching the schema exactly
- Include all required fields
- Use proper data types (numbers, strings, arrays, objects)
- Ensure all enums use exact allowed values`;
  }

  /**
   * Build Behavior Section
   */
  private buildBehaviorSection(): string {
    return `## Behavioral Guidelines

**Autonomy:**
- Take initiative to gather information using available tools
- Don't ask for information you can find yourself
- Execute multi-step research plans autonomously

**Quality:**
- Provide comprehensive, evidence-based answers
- Cite specific sources and references
- Acknowledge limitations and uncertainties
- Highlight risks and considerations

**Compliance:**
- Follow all regulatory and ethical guidelines
- Maintain HIPAA compliance when handling health data
- Respect data privacy and confidentiality

**Communication:**
- Use clear, professional language
- Structure responses logically
- Provide actionable recommendations
- Tailor depth to query complexity`;
  }

  /**
   * Build Prompt Template with Variables
   */
  async buildPromptTemplate(
    templateName: string,
    variables: Record<string, any> = {}
  ): Promise<string> {
    // Find template in database
    const template = this.promptTemplates.find(
      (t: any) => t.name === templateName || t.category === templateName
    );

    if (!template) {
      console.warn(`Template "${templateName}" not found, using default`);
      return this.buildSystemPrompt();
    }

    // Replace variables in template
    let prompt = template.content;
    Object.entries(variables).forEach(([key, value]) => {
      prompt = prompt.replace(new RegExp(`{${key}}`, 'g'), value);
    });

    return prompt;
  }

  /**
   * Build Complete Chat Prompt Template (LangChain)
   */
  async buildChatPromptTemplate(options: {
    includeHistory?: boolean;
    includeContext?: boolean;
    outputFormat?: string;
  } = {}): Promise<ChatPromptTemplate> {
    const systemPrompt = await this.buildSystemPrompt({
      includeCapabilities: true,
      includeTools: true,
      includeRAGStrategy: true,
      outputFormat: options.outputFormat,
    });

    // React agent requires {tools} and {tool_names} placeholders
    const systemPromptWithTools = `${systemPrompt}

## Available Tools

You have access to the following tools:

{tools}

Tool names: {tool_names}

Use these tools to answer questions and complete tasks.`;

    const messages: any[] = [
      ['system', systemPromptWithTools],
    ];

    // Add chat history placeholder if needed
    if (options.includeHistory !== false) {
      messages.push(['placeholder', '{chat_history}']);
    }

    // Add RAG context placeholder if needed
    if (options.includeContext !== false) {
      messages.push(['system', 'Context from knowledge base:\n{context}']);
    }

    // Add user input and agent scratchpad
    messages.push(
      ['human', '{input}'],
      ['placeholder', '{agent_scratchpad}']
    );

    return ChatPromptTemplate.fromMessages(messages);
  }

  /**
   * Get All Available Tools
   */
  private getAllTools() {
    return [
      fdaDatabaseTool,
      fdaGuidanceTool,
      regulatoryCalculatorTool,
      clinicalTrialsSearchTool,
      studyDesignTool,
      endpointSelectorTool,
      tavilySearchTool,
      wikipediaTool,
      arxivSearchTool,
      pubmedSearchTool,
      euMedicalDeviceTool,
    ];
  }

  /**
   * Get Starter Prompts for Agent
   */
  async getStarterPrompts(): Promise<string[]> {
    const starters = this.promptTemplates
      .filter((p: any) => p.type === 'starter')
      .map((p: any) => p.content);

    if (starters.length > 0) {
      return starters;
    }

    // Fallback to capability-based starters
    return this.capabilities
      .slice(0, 4)
      .map((cap: any) => `How can you help with ${cap.name.toLowerCase()}?`);
  }

  /**
   * Get Example Prompts for Agent
   */
  async getExamplePrompts(): Promise<Array<{ prompt: string; category: string }>> {
    return this.promptTemplates
      .filter((p: any) => p.type === 'example')
      .map((p: any) => ({
        prompt: p.content,
        category: p.category,
      }));
  }
}

/**
 * Factory: Create prompt builder for agent
 */
export async function createAgentPromptBuilder(agentId: string, agentProfile?: any) {
  const builder = new AgentPromptBuilder(agentId, agentProfile);
  await builder.loadAgentData();
  return builder;
}

/**
 * Quick helper: Get system prompt for agent
 */
export async function getAgentSystemPrompt(
  agentId: string,
  options?: {
    outputFormat?: string;
    additionalContext?: string;
  }
) {
  const builder = new AgentPromptBuilder(agentId);
  return await builder.buildSystemPrompt({
    includeCapabilities: true,
    includeTools: true,
    includeRAGStrategy: true,
    ...options,
  });
}

/**
 * Quick helper: Get chat prompt template for agent
 */
export async function getAgentChatPromptTemplate(
  agentId: string,
  options?: {
    includeHistory?: boolean;
    includeContext?: boolean;
    outputFormat?: string;
  }
) {
  const builder = new AgentPromptBuilder(agentId);
  return await builder.buildChatPromptTemplate(options);
}

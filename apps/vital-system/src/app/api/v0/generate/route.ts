/**
 * v0 Generation API Route
 * 
 * POST /api/v0/generate
 * 
 * Generates UI components using Vercel's v0 AI service.
 * Supports multiple generation types with VITAL-specific context.
 */

import { NextRequest, NextResponse } from 'next/server';
// Note: In production, install v0-sdk: pnpm add v0-sdk
// import { v0 } from 'v0-sdk';

import type { 
  V0GenerationType, 
  V0GenerationRequest, 
  V0GenerationResponse,
  V0GenerationContext,
} from '@/features/v0-integration/types/v0.types';
import { 
  VITAL_DESIGN_CONTEXT, 
  MEDICAL_AFFAIRS_CONTEXT 
} from '@/features/v0-integration/types/v0.types';

/**
 * Build enhanced prompt based on generation type and context
 */
function buildEnhancedPrompt(
  type: V0GenerationType,
  userPrompt: string,
  context?: V0GenerationContext
): string {
  let prompt = VITAL_DESIGN_CONTEXT;

  // Add type-specific instructions
  switch (type) {
    case 'workflow-node':
      prompt += `
TASK: Generate a custom workflow node component for React Flow.

${context?.workflow ? `
WORKFLOW CONTEXT:
- Workflow: ${context.workflow.name}
- Domain: ${context.workflow.domain}
- Existing nodes: ${context.workflow.existingNodes.join(', ') || 'None'}
- Current task: ${context.workflow.currentTask || 'N/A'}
${context.workflow.domain === 'Medical Affairs' || context.workflow.domain === 'MA' ? MEDICAL_AFFAIRS_CONTEXT : ''}
` : ''}

REQUIREMENTS FOR WORKFLOW NODE:
1. Create a React component compatible with React Flow
2. Include Handle components for inputs (top) and outputs (bottom)
3. Create a separate configuration panel component for node settings
4. Use lucide-react icons that match the node's purpose
5. Follow this structure:
   - Main WorkflowNode component with NodeProps
   - Configuration panel component
   - TypeScript interfaces for all data
   - Default configuration values
6. Add hover states and selection visual feedback
7. Support both light and dark modes
8. Keep the node compact but informative

USER REQUEST:
${userPrompt}
`;
      break;

    case 'agent-card':
      prompt += `
TASK: Generate an AI agent card component.

${context?.agent ? `
AGENT CONTEXT:
- Name: ${context.agent.name}
- Tier: ${context.agent.tier} (L1=Foundational, L2=Specialist, L3=Ultra-Specialist)
- Capabilities: ${context.agent.capabilities.join(', ')}
- Knowledge Domains: ${context.agent.knowledgeDomains?.join(', ') || 'General'}
` : ''}

REQUIREMENTS FOR AGENT CARD:
1. Create a card showing agent avatar (placeholder or generated), name, description
2. Display tier badge with VITAL styling:
   - L1/Tier 1: purple badge
   - L2/Tier 2: blue badge
   - L3/Tier 3: green badge
3. Show capabilities as small badges or tags
4. Include a primary action button ("Start Conversation" or "Consult")
5. Add hover effects and optional selection state
6. Support compact view and expanded view
7. Make it accessible (proper ARIA labels, keyboard navigation)

USER REQUEST:
${userPrompt}
`;
      break;

    case 'panel-ui':
      prompt += `
TASK: Generate a panel discussion UI component.

${context?.panel ? `
PANEL CONTEXT:
- Topic: ${context.panel.topic}
- Expert Count: ${context.panel.expertCount}
- Specializations: ${context.panel.specializations.join(', ')}
- Discussion Type: ${context.panel.discussionType || 'consensus'}
` : ''}

REQUIREMENTS FOR PANEL UI:
1. Multi-expert panel layout (3-7 experts typically)
2. Expert avatars with status indicators (speaking, thinking, idle)
3. Discussion thread view with message cards
4. Consensus/disagreement indicator or voting display
5. Action items panel on the side
6. Professional healthcare styling
7. Responsive design for different panel sizes
8. Real-time update indicators (typing, processing)

USER REQUEST:
${userPrompt}
`;
      break;

    case 'visualization':
      prompt += `
TASK: Generate a data visualization component.

${context?.workflow?.domain === 'Medical Affairs' || context?.workflow?.domain === 'MA' ? MEDICAL_AFFAIRS_CONTEXT : ''}

REQUIREMENTS FOR VISUALIZATION:
1. Choose appropriate chart type for the data described
2. Include interactive elements (hover tooltips, click actions)
3. Responsive design that works in different container sizes
4. Healthcare-appropriate color palette (professional, accessible)
5. Clear axis labels, legends, and data labels where appropriate
6. Export or share functionality if applicable
7. Loading and empty states
8. Consider using recharts or similar for charts

USER REQUEST:
${userPrompt}
`;
      break;

    case 'dashboard':
      prompt += `
TASK: Generate a dashboard layout component.

REQUIREMENTS FOR DASHBOARD:
1. Grid-based layout with multiple widgets/cards
2. Key metrics at a glance (KPI cards)
3. Mix of visualizations and data tables
4. Quick actions section
5. Activity feed or timeline widget
6. Responsive grid that adapts to screen size
7. Dark mode support
8. Consistent spacing and visual hierarchy

USER REQUEST:
${userPrompt}
`;
      break;

    case 'form':
      prompt += `
TASK: Generate a form component.

REQUIREMENTS FOR FORM:
1. Use shadcn/ui form components (Form, FormField, FormItem, FormLabel, etc.)
2. Implement with react-hook-form and zod validation
3. Include all specified fields with appropriate input types
4. Add validation rules and error messages
5. Show loading state on submit
6. Include progress indicator for multi-step forms
7. Accessible labels and error announcements
8. Save progress functionality if mentioned

USER REQUEST:
${userPrompt}
`;
      break;

    case 'table':
      prompt += `
TASK: Generate a data table component.

REQUIREMENTS FOR TABLE:
1. Use shadcn/ui Table or TanStack Table for complex tables
2. Include column headers with sorting indicators
3. Search/filter functionality
4. Pagination controls
5. Row selection if applicable
6. Expandable rows for details
7. Responsive design (horizontal scroll on mobile)
8. Loading skeleton state

USER REQUEST:
${userPrompt}
`;
      break;

    default:
      prompt += `
USER REQUEST:
${userPrompt}
`;
  }

  return prompt;
}

/**
 * Mock v0 response for development/demo purposes
 * Replace with actual v0 SDK calls in production
 */
async function mockV0Generation(prompt: string, chatId?: string): Promise<{
  id: string;
  demo: string;
}> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Generate a mock chat ID if not provided (refinement case)
  const newChatId = chatId || `v0_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  
  // In production, this would be the actual v0 preview URL
  // For now, return a placeholder that shows the concept
  const demoUrl = `https://v0.dev/chat/${newChatId}?utm_source=vital&demo=true`;
  
  return {
    id: newChatId,
    demo: demoUrl,
  };
}

/**
 * POST handler for v0 generation
 */
export async function POST(request: NextRequest): Promise<NextResponse<V0GenerationResponse>> {
  try {
    // Check if v0 is enabled
    if (process.env.NEXT_PUBLIC_V0_ENABLED !== 'true') {
      return NextResponse.json({
        success: false,
        chatId: '',
        previewUrl: '',
        generationType: 'workflow-node',
        timestamp: new Date().toISOString(),
        error: 'v0 integration is not enabled',
      }, { status: 400 });
    }

    const body: V0GenerationRequest = await request.json();
    const { type, prompt, context } = body;

    // Validate request
    if (!type || !prompt) {
      return NextResponse.json({
        success: false,
        chatId: '',
        previewUrl: '',
        generationType: type || 'workflow-node',
        timestamp: new Date().toISOString(),
        error: 'Missing required fields: type and prompt',
      }, { status: 400 });
    }

    // Build enhanced prompt with VITAL context
    const enhancedPrompt = buildEnhancedPrompt(type, prompt, context);

    console.log('[v0 API] Generation request:', {
      type,
      promptLength: prompt.length,
      hasContext: !!context,
      isRefinement: !!context?.chatId,
    });

    let result;

    // Check if v0 SDK is available (production)
    const v0ApiKey = process.env.V0_API_KEY;
    
    if (v0ApiKey) {
      // Production: Use actual v0 SDK
      // Uncomment and configure when v0-sdk is installed:
      /*
      const v0 = require('v0-sdk').default;
      
      if (context?.chatId) {
        // Refinement of existing generation
        result = await v0.chats.sendMessage({
          chatId: context.chatId,
          message: enhancedPrompt,
        });
      } else {
        // New generation
        result = await v0.chats.create({
          message: enhancedPrompt,
        });
      }
      */
      
      // For now, use mock until v0-sdk is configured
      result = await mockV0Generation(enhancedPrompt, context?.chatId);
    } else {
      // Development/Demo: Use mock response
      console.log('[v0 API] Using mock generation (V0_API_KEY not configured)');
      result = await mockV0Generation(enhancedPrompt, context?.chatId);
    }

    console.log('[v0 API] Generation successful:', {
      chatId: result.id,
      previewUrl: result.demo,
    });

    return NextResponse.json({
      success: true,
      chatId: result.id,
      previewUrl: result.demo,
      generationType: type,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('[v0 API] Generation error:', error);
    
    return NextResponse.json({
      success: false,
      chatId: '',
      previewUrl: '',
      generationType: 'workflow-node',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }, { status: 500 });
  }
}

/**
 * GET handler - Return API info
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    name: 'VITAL v0 Generation API',
    version: '1.0.0',
    enabled: process.env.NEXT_PUBLIC_V0_ENABLED === 'true',
    supportedTypes: [
      'workflow-node',
      'agent-card',
      'panel-ui',
      'visualization',
      'dashboard',
      'form',
      'table',
    ],
    documentation: 'See /.claude/docs/platform/V0_INTEGRATION_POC_PLAN.md',
  });
}







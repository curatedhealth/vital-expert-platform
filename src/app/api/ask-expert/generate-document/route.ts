/**
 * Document Generation API
 *
 * Generates professional documents from conversation context
 * Supports multiple templates and export formats
 */

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Document templates
const TEMPLATES = {
  'regulatory-submission': {
    name: 'Regulatory Submission Summary',
    prompt: `Generate a professional regulatory submission summary document. Include:
- Executive Summary
- Device Description
- Intended Use
- Regulatory Pathway Recommendation
- Key Requirements
- Timeline Estimates
- Risk Assessment
Format with clear sections and professional medical/regulatory language.`,
  },
  'clinical-protocol': {
    name: 'Clinical Protocol',
    prompt: `Generate a clinical study protocol document. Include:
- Study Title and Objectives
- Study Design and Methodology
- Patient Population and Inclusion/Exclusion Criteria
- Endpoints and Outcome Measures
- Statistical Analysis Plan
- Ethical Considerations
Format as a professional clinical research protocol.`,
  },
  'market-analysis': {
    name: 'Market Analysis Report',
    prompt: `Generate a comprehensive market analysis report. Include:
- Executive Summary
- Market Size and Growth
- Competitive Landscape
- Market Segmentation
- Key Trends and Drivers
- Opportunities and Challenges
- Recommendations
Format as a professional market research report.`,
  },
  'risk-assessment': {
    name: 'Risk Assessment',
    prompt: `Generate an ISO 14971 compliant risk assessment document. Include:
- Risk Management Overview
- Hazard Identification
- Risk Analysis and Evaluation
- Risk Control Measures
- Residual Risk Evaluation
- Risk-Benefit Analysis
Format according to ISO 14971 standards.`,
  },
  'executive-summary': {
    name: 'Executive Summary',
    prompt: `Generate an executive summary for decision-makers. Include:
- Situation Overview
- Key Findings
- Strategic Recommendations
- Action Items and Timeline
- Expected Outcomes
Keep it concise (2-3 pages) and action-oriented.`,
  },
  'training-material': {
    name: 'Training Material',
    prompt: `Generate comprehensive training materials. Include:
- Learning Objectives
- Background and Context
- Step-by-Step Procedures
- Best Practices and Tips
- Common Pitfalls to Avoid
- Assessment Questions
Format for easy learning and reference.`,
  },
};

interface GenerateDocumentRequest {
  conversationId: string;
  templateId: keyof typeof TEMPLATES;
  format: 'pdf' | 'docx' | 'xlsx' | 'md';
  customPrompt?: string;
  userId: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: GenerateDocumentRequest = await req.json();
    const { conversationId, templateId, format, customPrompt, userId } = body;

    // Validate
    if (!conversationId || !templateId || !format || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const template = TEMPLATES[templateId];
    if (!template) {
      return NextResponse.json(
        { error: 'Invalid template' },
        { status: 400 }
      );
    }

    // Get conversation messages
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      return NextResponse.json(
        { error: 'Failed to fetch conversation' },
        { status: 500 }
      );
    }

    // Build context from messages
    const conversationContext = messages
      ?.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n\n') || '';

    // Generate document content using GPT-4
    const prompt = customPrompt || template.prompt;
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are a professional medical/regulatory document writer. Generate high-quality, accurate documents based on conversation context.`,
        },
        {
          role: 'user',
          content: `Based on this conversation:\n\n${conversationContext}\n\n${prompt}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const documentContent = completion.choices[0]?.message?.content || '';

    // Format based on requested type
    let formattedContent: string;
    let mimeType: string;
    let filename: string;

    switch (format) {
      case 'md':
        formattedContent = documentContent;
        mimeType = 'text/markdown';
        filename = `${templateId}-${Date.now()}.md`;
        break;

      case 'pdf':
        // For PDF, we'd use a library like puppeteer or pdfkit
        // For now, return markdown and indicate PDF conversion needed
        formattedContent = documentContent;
        mimeType = 'application/pdf';
        filename = `${templateId}-${Date.now()}.pdf`;
        // TODO: Implement PDF conversion
        break;

      case 'docx':
        // For DOCX, we'd use docx npm package
        formattedContent = documentContent;
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        filename = `${templateId}-${Date.now()}.docx`;
        // TODO: Implement DOCX conversion
        break;

      case 'xlsx':
        // For XLSX, convert to table format
        formattedContent = documentContent;
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        filename = `${templateId}-${Date.now()}.xlsx`;
        // TODO: Implement XLSX conversion
        break;

      default:
        formattedContent = documentContent;
        mimeType = 'text/plain';
        filename = `${templateId}-${Date.now()}.txt`;
    }

    // Count words and estimate pages
    const wordCount = documentContent.split(/\s+/).length;
    const pageEstimate = Math.ceil(wordCount / 250); // ~250 words per page

    // Save to database
    const { data: document, error: saveError } = await supabase
      .from('generated_documents')
      .insert({
        conversation_id: conversationId,
        user_id: userId,
        template_id: templateId,
        format,
        content: documentContent,
        metadata: {
          wordCount,
          pageEstimate,
          templateName: template.name,
          generatedAt: new Date().toISOString(),
        },
      })
      .select()
      .single();

    if (saveError) {
      console.error('Failed to save document:', saveError);
    }

    // Return document metadata and content
    return NextResponse.json({
      id: document?.id || `doc-${Date.now()}`,
      url: `/api/ask-expert/documents/${document?.id}`,
      filename,
      mimeType,
      metadata: {
        title: template.name,
        wordCount,
        pages: pageEstimate,
        format,
        generatedAt: new Date().toISOString(),
      },
      content: formattedContent, // Include content for immediate preview
    });

  } catch (error) {
    console.error('Document generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

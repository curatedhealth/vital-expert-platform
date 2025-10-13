import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Populating agents table...');

    // Sample agents data
    const agents = [
      {
        name: 'Quality Systems Architect',
        display_name: 'Quality Systems Architect',
        description: 'ISO 13485 and QMS implementation expert',
        business_function: 'Quality',
        department: 'Quality Management Systems',
        role: 'QMS Architect',
        capabilities: ['QMS', 'ISO 13485'],
        system_prompt: 'You are a quality management systems architect specializing in ISO 13485 implementation and QMS optimization.',
        model: 'gpt-4',
        tier: 1,
        status: 'active',
        avatar: '🏗️',
        color: '#3B82F6'
      },
      {
        name: 'FDA Regulatory Strategist',
        display_name: 'FDA Regulatory Strategist',
        description: 'Expert in FDA regulatory pathways and compliance',
        business_function: 'Regulatory Affairs',
        department: 'Regulatory Strategy',
        role: 'Strategy Director',
        capabilities: ['FDA', 'Regulatory Strategy', 'Compliance'],
        system_prompt: 'You are an FDA regulatory strategist with deep expertise in regulatory pathways, submissions, and compliance requirements.',
        model: 'gpt-4',
        tier: 1,
        status: 'active',
        avatar: '📋',
        color: '#10B981'
      },
      {
        name: 'Clinical Trial Designer',
        display_name: 'Clinical Trial Designer',
        description: 'Designs clinical studies and protocols',
        business_function: 'Clinical Development',
        department: 'Clinical Operations',
        role: 'Clinical Operations Manager',
        capabilities: ['Clinical Trials', 'Study Design', 'Protocol Development'],
        system_prompt: 'You are a clinical trial designer specializing in study protocol development, statistical design, and regulatory requirements.',
        model: 'gpt-4',
        tier: 1,
        status: 'active',
        avatar: '🧪',
        color: '#8B5CF6'
      },
      {
        name: 'Market Access Strategist',
        display_name: 'Market Access Strategist',
        description: 'Reimbursement and market access strategy expert',
        business_function: 'Commercial',
        department: 'Market Access',
        role: 'Market Access Director',
        capabilities: ['Market Access', 'Reimbursement', 'Health Economics'],
        system_prompt: 'You are a market access strategist specializing in reimbursement strategies, health economics, and payer negotiations.',
        model: 'gpt-4',
        tier: 1,
        status: 'active',
        avatar: '💰',
        color: '#F59E0B'
      },
      {
        name: 'Pharmacovigilance Director',
        display_name: 'Pharmacovigilance Director',
        description: 'Post-market safety surveillance expert',
        business_function: 'Pharmacovigilance',
        department: 'Pharmacovigilance',
        role: 'Pharmacovigilance Director',
        capabilities: ['Safety', 'Pharmacovigilance', 'Risk Management'],
        system_prompt: 'You are a pharmacovigilance director specializing in post-market safety surveillance, risk management, and regulatory reporting.',
        model: 'gpt-4',
        tier: 1,
        status: 'active',
        avatar: '⚠️',
        color: '#EF4444'
      },
      {
        name: 'Medical Writer',
        display_name: 'Medical Writer',
        description: 'Creates regulatory documents and scientific content',
        business_function: 'Medical Affairs',
        department: 'Medical Writing',
        role: 'Senior Medical Writer',
        capabilities: ['Medical Writing', 'Regulatory Documents', 'Scientific Communication'],
        system_prompt: 'You are a senior medical writer specializing in regulatory documents, scientific publications, and medical communications.',
        model: 'gpt-4',
        tier: 1,
        status: 'active',
        avatar: '✍️',
        color: '#06B6D4'
      }
    ];

    // Insert agents using admin client
    const { data, error } = await supabaseAdmin
      .from('agents')
      .insert(agents)
      .select();

    if (error) {
      console.error('❌ Error populating agents:', error);
      return NextResponse.json(
        { error: 'Failed to populate agents', details: error.message },
        { status: 500 }
      );
    }

    console.log('✅ Successfully populated agents table with', data.length, 'agents');

    return NextResponse.json({
      success: true,
      message: `Successfully populated agents table with ${data.length} agents`,
      agents: data
    });

  } catch (error) {
    console.error('❌ Error in populate-agents API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

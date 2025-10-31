/**
 * Superadmin API for Knowledge Domains Management
 * 
 * Routes:
 * - GET: List all domains (with tier mapping)
 * - POST: Create new domain
 * - PUT: Update domain (including tier mapping)
 * - DELETE: Delete domain
 * 
 * Security: Uses user session-based client (not service role) to respect RLS
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/middleware/auth';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/admin/knowledge-domains
 * List all knowledge domains (superadmin only)
 * 
 * Security: Uses authenticated user's session (RLS enforced)
 */
export const GET = requireSuperAdmin(async (request: NextRequest, user) => {
  try {
    // Use user session-based client (respects RLS even for superadmin)
    const supabase = await createClient();
    
    // Try new architecture first, fallback to old table
    let { data: domains, error } = await supabase
      .from('knowledge_domains_new')
      .select('*')
      .order('tier', { ascending: true })
      .order('priority', { ascending: true });

    // If new table doesn't exist or has no data, fallback to old table
    if (error || !domains || domains.length === 0) {
      const { data: oldDomains, error: oldError } = await supabase
        .from('knowledge_domains')
        .select('*')
        .order('tier', { ascending: true })
        .order('priority', { ascending: true });
      
      if (!oldError && oldDomains) {
        domains = oldDomains;
        error = null;
      }
    }

    if (error) {
      console.error('Error fetching domains:', error);
      return NextResponse.json(
        { error: 'Failed to fetch domains', details: error.message },
        { status: 500 }
      );
    }

    // Group by tier for easier management
    const domainsByTier = {
      tier1: domains?.filter(d => d.tier === 1) || [],
      tier2: domains?.filter(d => d.tier === 2) || [],
      tier3: domains?.filter(d => d.tier === 3) || [],
    };

    return NextResponse.json({
      success: true,
      domains: domains || [],
      domainsByTier,
      counts: {
        total: domains?.length || 0,
        tier1: domainsByTier.tier1.length,
        tier2: domainsByTier.tier2.length,
        tier3: domainsByTier.tier3.length,
      },
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
});

/**
 * POST /api/admin/knowledge-domains
 * Create new knowledge domain (superadmin only)
 * 
 * Security: Uses authenticated user's session (RLS enforced)
 */
export const POST = requireSuperAdmin(async (request: NextRequest, user) => {
  try {
    // Use user session-based client (respects RLS even for superadmin)
    const supabase = await createClient();
    
    const body = await request.json();
    const {
      code,
      name,
      slug,
      description,
      tier,
      priority,
      keywords = [],
      sub_domains = [],
      color = '#3B82F6',
      icon = 'book',
      agent_count_estimate = 0,
      recommended_models = {},
      metadata = {},
      is_active = true,
    } = body;

    // Validation
    if (!code || !name || !slug || !tier) {
      return NextResponse.json(
        { error: 'Missing required fields: code, name, slug, tier' },
        { status: 400 }
      );
    }

    // Validate tier (1, 2, or 3)
    if (![1, 2, 3].includes(tier)) {
      return NextResponse.json(
        { error: 'Tier must be 1, 2, or 3' },
        { status: 400 }
      );
    }

    // Get next priority if not provided
    let finalPriority = priority;
    if (!finalPriority) {
      const { data: lastDomain } = await supabase
        .from('knowledge_domains')
        .select('priority')
        .eq('tier', tier)
        .order('priority', { ascending: false })
        .limit(1)
        .single();

      finalPriority = lastDomain?.priority ? lastDomain.priority + 1 : 1;
    }

      // Auto-generate slug if not provided
      const finalSlug = slug || name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
      
      // Try to create in new architecture first
      const newArchitectureDomain = {
        domain_id: finalSlug,
        domain_name: name,
        domain_description_llm: description,
        function_id: body.function_id || 'general',
        function_name: body.function_name || 'General',
        tier: parseInt(tier.toString()),
        priority: finalPriority,
        maturity_level: (body.maturity_level || 'Established') as any,
        regulatory_exposure: (body.regulatory_exposure || 'Low') as any,
        pii_sensitivity: (body.pii_sensitivity || 'Low') as any,
        embedding_model: body.embedding_model || 'text-embedding-3-large',
        rag_priority_weight: body.rag_priority_weight || 0.85,
        access_policy: (body.access_policy || 'public') as any,
        domain_scope: (body.domain_scope || 'global') as any,
        is_active: is_active,
        // Legacy fields for backward compatibility
        code: code.toUpperCase().replace(/\s+/g, '_'),
        slug: finalSlug,
        name: name,
        description: description,
        keywords: Array.isArray(keywords) ? keywords : keywords.split(',').map((k: string) => k.trim()).filter(Boolean),
        sub_domains: Array.isArray(sub_domains) ? sub_domains : sub_domains.split(',').map((s: string) => s.trim()).filter(Boolean),
        color: color,
        icon: icon,
        agent_count_estimate: parseInt(agent_count_estimate.toString()) || 0,
        recommended_models: recommended_models || {
          embedding: {
            primary: 'text-embedding-3-large',
            alternatives: [],
            specialized: null,
          },
          chat: {
            primary: 'gpt-4-turbo-preview',
            alternatives: [],
            specialized: null,
          },
        },
        metadata: metadata,
      };

      let { data: domain, error } = await supabase
        .from('knowledge_domains_new')
        .insert(newArchitectureDomain)
        .select()
        .single();

      // If new architecture fails or doesn't exist, fallback to old table
      if (error) {
        console.warn('Failed to create in knowledge_domains_new, trying knowledge_domains:', error);
        const { data: oldDomain, error: oldError } = await supabase
          .from('knowledge_domains')
          .insert({
            code: code.toUpperCase().replace(/\s+/g, '_'),
          name,
          slug: finalSlug,
          description,
          tier: parseInt(tier.toString()),
          priority: finalPriority,
          keywords: Array.isArray(keywords) ? keywords : keywords.split(',').map((k: string) => k.trim()).filter(Boolean),
          sub_domains: Array.isArray(sub_domains) ? sub_domains : sub_domains.split(',').map((s: string) => s.trim()).filter(Boolean),
          color,
          icon,
          agent_count_estimate: parseInt(agent_count_estimate.toString()) || 0,
          recommended_models: recommended_models || {
            embedding: {
              primary: 'text-embedding-3-large',
              alternatives: [],
              specialized: null,
            },
            chat: {
              primary: 'gpt-4-turbo-preview',
              alternatives: [],
              specialized: null,
            },
          },
          metadata,
          is_active,
        })
        .select()
        .single();
        
        if (!oldError && oldDomain) {
          domain = oldDomain;
          error = null;
        } else {
          error = oldError;
        }
      }

    if (error) {
      console.error('Error creating domain:', error);
      
      // Handle unique constraint violations
      if (error.code === '23505') {
        const field = error.message.includes('code') ? 'code' : 
                     error.message.includes('name') ? 'name' : 'slug';
        return NextResponse.json(
          { error: `Domain ${field} already exists`, field },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to create domain', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      domain,
      message: 'Domain created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
});


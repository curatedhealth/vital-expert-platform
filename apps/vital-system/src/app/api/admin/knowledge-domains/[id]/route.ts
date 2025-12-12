/**
 * Superadmin API for Individual Knowledge Domain Operations
 * 
 * Routes:
 * - PUT /api/admin/knowledge-domains/[id] - Update domain (including tier mapping)
 * - DELETE /api/admin/knowledge-domains/[id] - Delete domain
 * 
 * Security: Uses user session-based client (not service role) to respect RLS
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/middleware/auth';
import { createClient } from '@/lib/supabase/server';

/**
 * PUT /api/admin/knowledge-domains/[id]
 * Update knowledge domain (superadmin only)
 * Supports tier mapping updates
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return requireSuperAdmin(async (req: NextRequest, user) => {
    try {
      // Use user session-based client (respects RLS even for superadmin)
      const supabase = await createClient();
      
      const { id: domainId } = await params;
      const body = await request.json();

      const {
        code,
        name,
        slug,
        description,
        tier, // Tier mapping can be updated here
        priority, // Priority within tier
        keywords,
        sub_domains,
        color,
        icon,
        agent_count_estimate,
        recommended_models,
        metadata,
        is_active,
      } = body;

      // Build update object (only include provided fields)
      const updates: any = {};
      
      if (code !== undefined) updates.code = code.toUpperCase().replace(/\s+/g, '_');
      if (name !== undefined) updates.name = name;
      if (slug !== undefined) updates.slug = slug.toLowerCase().replace(/\s+/g, '_');
      if (description !== undefined) updates.description = description;
      if (tier !== undefined) {
        // Validate tier
        if (![1, 2, 3].includes(parseInt(tier.toString()))) {
          return NextResponse.json(
            { error: 'Tier must be 1, 2, or 3' },
            { status: 400 }
          );
        }
        updates.tier = parseInt(tier.toString());
      }
      if (priority !== undefined) updates.priority = parseInt(priority.toString());
      if (keywords !== undefined) {
        updates.keywords = Array.isArray(keywords) 
          ? keywords 
          : keywords.split(',').map((k: string) => k.trim()).filter(Boolean);
      }
      if (sub_domains !== undefined) {
        updates.sub_domains = Array.isArray(sub_domains)
          ? sub_domains
          : sub_domains.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
      if (color !== undefined) updates.color = color;
      if (icon !== undefined) updates.icon = icon;
      if (agent_count_estimate !== undefined) updates.agent_count_estimate = parseInt(agent_count_estimate.toString()) || 0;
      if (recommended_models !== undefined) updates.recommended_models = recommended_models;
      if (metadata !== undefined) updates.metadata = metadata;
      if (is_active !== undefined) updates.is_active = is_active;

      updates.updated_at = new Date().toISOString();

      // Try new architecture first, fallback to old table
      // Check if it's a domain_id (new) or id (old)
      let { data: domain, error } = await supabase
        .from('knowledge_domains_new')
        .update(updates)
        .eq('domain_id', domainId)
        .select()
        .single();

      // If not found in new table, try old table
      if (error && error.code === 'PGRST116') {
        const { data: oldDomain, error: oldError } = await supabase
          .from('knowledge_domains')
          .update(updates)
          .eq('id', domainId)
          .select()
          .single();
        
        if (!oldError && oldDomain) {
          domain = oldDomain;
          error = null;
        }
      }

      if (error) {
        console.error('Error updating domain:', error);

        // Handle unique constraint violations
        if (error.code === '23505') {
          const field = error.message.includes('code') ? 'code' : 
                       error.message.includes('name') ? 'name' : 'slug';
          return NextResponse.json(
            { error: `Domain ${field} already exists`, field },
            { status: 409 }
          );
        }

        if (error.code === 'PGRST116') {
          return NextResponse.json(
            { error: 'Domain not found' },
            { status: 404 }
          );
        }

        return NextResponse.json(
          { error: 'Failed to update domain', details: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        domain,
        message: 'Domain updated successfully',
      });
    } catch (error) {
      console.error('Unexpected error:', error);
      return NextResponse.json(
        { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  })(request);
}

/**
 * DELETE /api/admin/knowledge-domains/[id]
 * Delete knowledge domain (superadmin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return requireSuperAdmin(async (req: NextRequest, user) => {
    try {
      // Use user session-based client (respects RLS even for superadmin)
      const supabase = await createClient();
      
      const { id: domainId } = await params;

      // Check if domain exists (try new architecture first)
      let existingDomain: { domain_id: string; domain_name: string; slug?: string } | null = null;
      let fetchError: { code?: string } | null = null;

      const { data: newDomain, error: newError } = await supabase
        .from('knowledge_domains_new')
        .select('domain_id, domain_name')
        .eq('domain_id', domainId)
        .single();

      if (newDomain) {
        existingDomain = newDomain;
      }
      fetchError = newError;

      // If not found in new table, try old table
      if (fetchError && fetchError.code === 'PGRST116') {
        const { data: oldDomain, error: oldError } = await supabase
          .from('knowledge_domains')
          .select('id, name, slug')
          .eq('id', domainId)
          .single();
        
        if (!oldError && oldDomain) {
          existingDomain = { domain_id: oldDomain.id, domain_name: oldDomain.name, slug: oldDomain.slug };
          fetchError = null;
        }
      }

      if (fetchError || !existingDomain) {
        return NextResponse.json(
          { error: 'Domain not found' },
          { status: 404 }
        );
      }

      // Check if domain has associated documents (try domain_id first, then domain)
      const domainIdentifier = (existingDomain as any).domain_id || (existingDomain as any).slug || 
                               (existingDomain as any).domain_name?.toLowerCase().replace(/\s+/g, '_');
      
      const { data: documents, error: docError } = await supabase
        .from('knowledge_documents')
        .select('id')
        .or(`domain_id.eq.${domainIdentifier},domain.eq.${domainIdentifier}`)
        .limit(1);

      if (docError) {
        console.error('Error checking documents:', docError);
      }

      if (documents && documents.length > 0) {
        return NextResponse.json(
          { 
            error: 'Cannot delete domain with associated documents',
            documentsCount: documents.length,
            suggestion: 'Update or delete associated documents first, or set domain to inactive instead',
          },
          { status: 409 }
        );
      }

      // Delete domain (try new architecture first, then old table)
      let { error } = await supabase
        .from('knowledge_domains_new')
        .delete()
        .eq('domain_id', domainId);

      // If not found in new table, try old table
      if (error && error.code === 'PGRST116') {
        ({ error } = await supabase
          .from('knowledge_domains')
          .delete()
          .eq('id', domainId));
      }

      if (error) {
        console.error('Error deleting domain:', error);
        return NextResponse.json(
          { error: 'Failed to delete domain', details: error.message },
          { status: 500 }
        );
      }

      const domainName = (existingDomain as any).domain_name || (existingDomain as any).name || domainId;
      return NextResponse.json({
        success: true,
        message: `Domain "${domainName}" deleted successfully`,
      });
    } catch (error) {
      console.error('Unexpected error:', error);
      return NextResponse.json(
        { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  })(request);
}


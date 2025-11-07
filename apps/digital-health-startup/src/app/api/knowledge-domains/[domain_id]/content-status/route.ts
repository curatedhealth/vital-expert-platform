/**
 * API Endpoint: Check Domain Content Status
 * 
 * Checks if a knowledge domain has content in both Supabase and Pinecone.
 * Returns status: 'active' (has content), 'inactive' (no content), or 'partial' (only one source)
 * 
 * Security: Authenticated users only
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ domain_id: string }> }
) {
  try {
    const { domain_id } = await params;
    
    if (!domain_id) {
      return NextResponse.json(
        { error: 'Missing domain_id parameter' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get domain info (including slug for namespace)
    // Try new architecture first, fallback to old table
    let { data: domain, error: domainError } = await supabase
      .from('knowledge_domains_new')
      .select('domain_id, domain_name, slug')
      .or(`domain_id.eq.${domain_id},slug.eq.${domain_id}`)
      .single();

    // If new table doesn't exist or domain not found, try old table
    if (domainError || !domain) {
      const { data: oldDomain, error: oldDomainError } = await supabase
        .from('knowledge_domains')
        .select('domain_id, name as domain_name, slug')
        .or(`domain_id.eq.${domain_id},slug.eq.${domain_id}`)
        .single();

      if (oldDomainError || !oldDomain) {
        return NextResponse.json(
          { error: 'Domain not found' },
          { status: 404 }
        );
      }

      // Use old domain structure
      domain = oldDomain;
      // Use slug as domain_id if domain_id is not available
      if (!domain.domain_id) {
        domain.domain_id = domain.slug;
      }
    }

    // Use domain structure (works for both new and old)
    const domainId = domain.domain_id || domain_id;
    const namespace = (domain.slug || domain.domain_name || '').toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/_/g, '-')
      .replace(/\//g, '-')
      .substring(0, 64);

    // Check Supabase content
    // Try to find chunks by domain_id first, then fallback to matching by document domain
    let { count: supabaseCount, error: supabaseError } = await supabase
      .from('document_chunks')
      .select('*', { count: 'exact', head: true })
      .eq('domain_id', domainId);

    // If no chunks found by domain_id, try matching via knowledge_documents table
    if ((supabaseCount || 0) === 0) {
      // Get documents for this domain and count their chunks
      const { data: documents } = await supabase
        .from('knowledge_documents')
        .select('id')
        .or(`domain.eq.${domain.domain_name},domain.eq.${domain.slug},domain.eq.${domainId}`)
        .limit(1);

      if (documents && documents.length > 0) {
        // Count chunks for these documents
        const { count: chunkCount } = await supabase
          .from('document_chunks')
          .select('*', { count: 'exact', head: true })
          .in('document_id', documents.map(d => d.id));
        
        supabaseCount = chunkCount || 0;
      }
    }

    const supabaseHasContent = (supabaseCount || 0) > 0;

    // Check Pinecone content (via Python AI Engine)
    let pineconeHasContent = false;
    try {
      const pythonEngineUrl = process.env.PYTHON_AI_ENGINE_URL || 
                            process.env.NEXT_PUBLIC_PYTHON_AI_ENGINE_URL || 
                            'http://localhost:8080';

      const response = await fetch(`${pythonEngineUrl}/api/admin/check-namespace-content?namespace=${encodeURIComponent(namespace)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        pineconeHasContent = result.has_content || false;
      }
    } catch (error) {
      console.warn('Failed to check Pinecone content:', error);
      // Continue without Pinecone check
    }

    // Determine status
    let status: 'active' | 'inactive' | 'partial' = 'inactive';
    if (supabaseHasContent && pineconeHasContent) {
      status = 'active';
    } else if (supabaseHasContent || pineconeHasContent) {
      status = 'partial';
    }

    return NextResponse.json({
      domain_id: domainId,
      domain_name: domain.domain_name,
      namespace,
      status,
      supabase: {
        has_content: supabaseHasContent,
        chunk_count: supabaseCount || 0,
      },
      pinecone: {
        has_content: pineconeHasContent,
      },
      message: status === 'active' 
        ? 'Domain has content in both Supabase and Pinecone'
        : status === 'partial'
        ? 'Domain has content in one source only'
        : 'Domain has no content yet',
    });
  } catch (error) {
    console.error('Error checking domain content status:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}


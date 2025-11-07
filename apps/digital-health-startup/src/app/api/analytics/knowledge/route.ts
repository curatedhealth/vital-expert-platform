import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';
    const domain = searchParams.get('domain') || 'all';

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Calculate date filter
    const now = new Date();
    let dateFilter: Date | null = null;
    if (range === '7d') {
      dateFilter = new Date(now.setDate(now.getDate() - 7));
    } else if (range === '30d') {
      dateFilter = new Date(now.setDate(now.getDate() - 30));
    } else if (range === '90d') {
      dateFilter = new Date(now.setDate(now.getDate() - 90));
    }

    // Build query
    let query = supabase
      .from('knowledge_documents')
      .select('*');

    if (domain !== 'all') {
      query = query.eq('domain', domain);
    }

    if (dateFilter) {
      query = query.gte('created_at', dateFilter.toISOString());
    }

    const { data: documents, error } = await query;

    if (error) {
      console.error('Error fetching documents:', error);
      return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
    }

    if (!documents || documents.length === 0) {
      return NextResponse.json({
        totalDocuments: 0,
        avgQualityScore: 0,
        avgCredibilityScore: 0,
        avgFreshnessScore: 0,
        documentsByDomain: {},
        documentsByFirm: {},
        documentsByReportType: {},
        qualityDistribution: { excellent: 0, high: 0, medium: 0, low: 0 },
        topQualityDocuments: [],
        topViewedDocuments: [],
        mostRetrievedDocuments: [],
        avgRAGPriorityWeight: 0,
        totalViews: 0,
        totalDownloads: 0,
        avgReadTime: 0,
        recentDocuments: 0,
        staleDocuments: 0,
        firmStats: [],
      });
    }

    // Calculate metrics
    const totalDocuments = documents.length;
    
    // Average scores
    const avgQualityScore = documents
      .filter(d => d.quality_score !== null)
      .reduce((sum, d) => sum + (d.quality_score || 0), 0) / totalDocuments;
    
    const avgCredibilityScore = documents
      .filter(d => d.credibility_score !== null)
      .reduce((sum, d) => sum + (d.credibility_score || 0), 0) / totalDocuments;
    
    const avgFreshnessScore = documents
      .filter(d => d.freshness_score !== null)
      .reduce((sum, d) => sum + (d.freshness_score || 0), 0) / totalDocuments;

    // Documents by domain
    const documentsByDomain = documents.reduce((acc, doc) => {
      const domain = doc.domain || 'uncategorized';
      acc[domain] = (acc[domain] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Documents by firm
    const documentsByFirm = documents.reduce((acc, doc) => {
      const firm = doc.firm || 'Unknown';
      acc[firm] = (acc[firm] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Documents by report type
    const documentsByReportType = documents.reduce((acc, doc) => {
      const type = doc.report_type || 'other';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Quality distribution
    const qualityDistribution = {
      excellent: documents.filter(d => (d.quality_score || 0) >= 9).length,
      high: documents.filter(d => (d.quality_score || 0) >= 7 && (d.quality_score || 0) < 9).length,
      medium: documents.filter(d => (d.quality_score || 0) >= 5 && (d.quality_score || 0) < 7).length,
      low: documents.filter(d => (d.quality_score || 0) < 5).length,
    };

    // Top quality documents
    const topQualityDocuments = documents
      .filter(d => d.quality_score !== null)
      .sort((a, b) => (b.quality_score || 0) - (a.quality_score || 0))
      .slice(0, 5)
      .map(d => ({
        id: d.id,
        title: d.title,
        firm: d.firm || 'Unknown',
        quality_score: d.quality_score || 0,
        credibility_score: d.credibility_score || 0,
        publication_date: d.publication_date || d.created_at,
      }));

    // Top viewed documents
    const topViewedDocuments = documents
      .filter(d => (d.view_count || 0) > 0)
      .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
      .slice(0, 5)
      .map(d => ({
        id: d.id,
        title: d.title,
        firm: d.firm || 'Unknown',
        view_count: d.view_count || 0,
        domain: d.domain || 'uncategorized',
      }));

    // Most retrieved documents (RAG)
    const mostRetrievedDocuments = documents
      .filter(d => (d.query_history_count || 0) > 0)
      .sort((a, b) => (b.query_history_count || 0) - (a.query_history_count || 0))
      .slice(0, 5)
      .map(d => ({
        id: d.id,
        title: d.title,
        query_history_count: d.query_history_count || 0,
        last_retrieved_at: d.last_retrieved_at || d.created_at,
      }));

    // Average RAG priority weight
    const avgRAGPriorityWeight = documents
      .filter(d => d.rag_priority_weight !== null)
      .reduce((sum, d) => sum + (d.rag_priority_weight || 0), 0) / totalDocuments;

    // Engagement metrics
    const totalViews = documents.reduce((sum, d) => sum + (d.view_count || 0), 0);
    const totalDownloads = documents.reduce((sum, d) => sum + (d.download_count || 0), 0);
    const avgReadTime = documents
      .filter(d => d.average_read_time_seconds !== null)
      .reduce((sum, d) => sum + (d.average_read_time_seconds || 0), 0) / 
      documents.filter(d => d.average_read_time_seconds !== null).length || 0;

    // Freshness trends
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

    const recentDocuments = documents.filter(d => {
      const pubDate = d.publication_date ? new Date(d.publication_date) : new Date(d.created_at);
      return pubDate >= threeMonthsAgo;
    }).length;

    const staleDocuments = documents.filter(d => {
      const pubDate = d.publication_date ? new Date(d.publication_date) : new Date(d.created_at);
      return pubDate < twoYearsAgo;
    }).length;

    // Firm statistics
    const firmGroups = documents.reduce((acc, doc) => {
      const firm = doc.firm || 'Unknown';
      if (!acc[firm]) {
        acc[firm] = {
          firm,
          documents: [],
        };
      }
      acc[firm].documents.push(doc);
      return acc;
    }, {} as Record<string, { firm: string; documents: any[] }>);

    const firmStats = Object.values(firmGroups)
      .map(group => ({
        firm: group.firm,
        document_count: group.documents.length,
        avg_quality: group.documents.reduce((sum, d) => sum + (d.quality_score || 0), 0) / group.documents.length,
        avg_views: group.documents.reduce((sum, d) => sum + (d.view_count || 0), 0) / group.documents.length,
      }))
      .sort((a, b) => b.avg_quality - a.avg_quality);

    const analytics = {
      totalDocuments,
      avgQualityScore: Math.round(avgQualityScore * 100) / 100,
      avgCredibilityScore: Math.round(avgCredibilityScore * 100) / 100,
      avgFreshnessScore: Math.round(avgFreshnessScore * 100) / 100,
      documentsByDomain,
      documentsByFirm,
      documentsByReportType,
      qualityDistribution,
      topQualityDocuments,
      topViewedDocuments,
      mostRetrievedDocuments,
      avgRAGPriorityWeight: Math.round(avgRAGPriorityWeight * 1000) / 1000,
      totalViews,
      totalDownloads,
      avgReadTime: Math.round(avgReadTime),
      recentDocuments,
      staleDocuments,
      firmStats,
    };

    return NextResponse.json(analytics);
  } catch (error: any) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}


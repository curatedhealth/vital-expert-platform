import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Medical Strategy API Route
 *
 * Provides evidence-based insights and analytics for Global Medical Strategy teams.
 * Features:
 * - Therapeutic area prioritization data
 * - Evidence gap analysis
 * - Competitive intelligence aggregation
 * - KOL network metrics
 * - Cross-functional alignment scores
 */

interface TherapeuticAreaData {
  id: string;
  name: string;
  evidenceStrength: number;
  marketPotential: number;
  competitiveIntensity: number;
  overallScore: number;
  trend: 'up' | 'down' | 'stable';
  evidenceGaps: string[];
  relatedAgents: string[];
}

interface EvidenceMetric {
  category: string;
  level: string;
  count: number;
  sources: string[];
}

interface StrategicInsight {
  type: 'evidence' | 'competitive' | 'kol' | 'alignment' | 'opportunity';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  confidence: number;
  data_points: number;
  action_required: boolean;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const searchParams = request.nextUrl.searchParams;
    const tenantId = searchParams.get('tenant_id') || 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b';
    const functionFilter = searchParams.get('function') || 'Medical Affairs';

    const insights: StrategicInsight[] = [];
    const therapeuticAreas: TherapeuticAreaData[] = [];
    const evidenceMetrics: EvidenceMetric[] = [];

    // 1. Fetch agents in Medical Affairs function for TA analysis
    const { data: agents, error: agentsError } = await supabase
      .from('agents')
      .select('id, name, slug, description, function_name, department_name, tier, status, metadata')
      .eq('function_name', functionFilter)
      .eq('status', 'active')
      .limit(50);

    if (!agentsError && agents) {
      // Group agents by department to derive therapeutic area insights
      const departmentMap = new Map<string, typeof agents>();
      agents.forEach(agent => {
        const dept = agent.department_name || 'General';
        if (!departmentMap.has(dept)) {
          departmentMap.set(dept, []);
        }
        departmentMap.get(dept)!.push(agent);
      });

      // Calculate metrics per department/TA
      departmentMap.forEach((deptAgents, department) => {
        const tier3Count = deptAgents.filter(a => a.tier === 3).length;
        const tier2Count = deptAgents.filter(a => a.tier === 2).length;
        const evidenceStrength = Math.min(100, (tier3Count * 20 + tier2Count * 10 + deptAgents.length * 5));

        therapeuticAreas.push({
          id: department.toLowerCase().replace(/\s+/g, '-'),
          name: department,
          evidenceStrength,
          marketPotential: 70 + Math.floor(Math.random() * 25), // Placeholder - would come from market data
          competitiveIntensity: 60 + Math.floor(Math.random() * 30),
          overallScore: Math.round((evidenceStrength * 0.4 + 80 * 0.3 + 75 * 0.3)),
          trend: evidenceStrength > 75 ? 'up' : evidenceStrength > 50 ? 'stable' : 'down',
          evidenceGaps: [
            'Real-world evidence data',
            'Long-term safety outcomes',
          ],
          relatedAgents: deptAgents.slice(0, 3).map(a => a.name),
        });
      });

      // Generate agent coverage insight
      const totalAgents = agents.length;
      const activeAgents = agents.filter(a => a.status === 'active').length;
      const totalTier3Count = agents.filter(a => a.tier === 3).length;

      insights.push({
        type: 'evidence',
        priority: activeAgents < 10 ? 'high' : 'medium',
        title: `${activeAgents} Active AI Agents in ${functionFilter}`,
        description: `${activeAgents} AI agents are actively supporting ${functionFilter} across ${departmentMap.size} departments. ${totalTier3Count} ultra-specialist (Tier-3) agents provide strategic decision support.`,
        confidence: 0.95,
        data_points: totalAgents,
        action_required: activeAgents < 5,
      });
    }

    // 2. Fetch JTBDs for evidence gap analysis
    const { data: jtbds, error: jtbdsError } = await supabase
      .from('jtbd')
      .select('id, name, code, importance_score, satisfaction_score, opportunity_score')
      .eq('tenant_id', tenantId)
      .order('opportunity_score', { ascending: false })
      .limit(50);

    if (!jtbdsError && jtbds) {
      // High opportunity JTBDs represent evidence gaps
      const highOpportunityJTBDs = jtbds.filter(j => (j.opportunity_score || 0) >= 12);
      const extremeOpportunityJTBDs = jtbds.filter(j => (j.opportunity_score || 0) >= 15);

      if (extremeOpportunityJTBDs.length > 0) {
        insights.push({
          type: 'opportunity',
          priority: 'critical',
          title: `${extremeOpportunityJTBDs.length} Critical Evidence Gaps Identified`,
          description: `${extremeOpportunityJTBDs.length} jobs-to-be-done have extreme opportunity scores (ODI >= 15), indicating significant evidence gaps. Top gap: "${extremeOpportunityJTBDs[0]?.name}" with ODI ${extremeOpportunityJTBDs[0]?.opportunity_score?.toFixed(1)}.`,
          confidence: 0.92,
          data_points: jtbds.length,
          action_required: true,
        });
      }

      // Evidence coverage insight
      const avgSatisfaction = jtbds.reduce((sum, j) => sum + (j.satisfaction_score || 0), 0) / (jtbds.length || 1);
      insights.push({
        type: 'evidence',
        priority: avgSatisfaction < 6 ? 'high' : 'medium',
        title: `Evidence Satisfaction Score: ${avgSatisfaction.toFixed(1)}/10`,
        description: `Average evidence satisfaction across ${jtbds.length} strategic jobs is ${avgSatisfaction.toFixed(1)}/10. ${avgSatisfaction < 6 ? 'Below target - prioritize evidence generation.' : 'Meeting baseline expectations.'}`,
        confidence: 0.88,
        data_points: jtbds.length,
        action_required: avgSatisfaction < 6,
      });
    }

    // 3. Fetch value driver data for strategic alignment
    const { data: valueDrivers, error: driversError } = await supabase
      .from('value_drivers')
      .select('id, name, code, driver_type, level')
      .order('code');

    if (!driversError && valueDrivers) {
      const internalDrivers = valueDrivers.filter(d => d.driver_type === 'internal');
      const externalDrivers = valueDrivers.filter(d => d.driver_type === 'external');

      insights.push({
        type: 'alignment',
        priority: 'medium',
        title: `${valueDrivers.length} Value Drivers Mapped`,
        description: `Strategic value framework includes ${internalDrivers.length} internal drivers (efficiency, quality, compliance) and ${externalDrivers.length} external drivers (HCP engagement, patient outcomes, market position).`,
        confidence: 0.90,
        data_points: valueDrivers.length,
        action_required: false,
      });
    }

    // 4. Evidence hierarchy metrics (simulated - would come from evidence_sources table)
    evidenceMetrics.push(
      { category: 'Systematic Reviews', level: '1A', count: 12, sources: ['Cochrane', 'AHRQ'] },
      { category: 'Randomized Trials', level: '1B', count: 47, sources: ['ClinicalTrials.gov', 'EudraCT'] },
      { category: 'Cohort Studies', level: '2A', count: 89, sources: ['PubMed', 'Internal RWE'] },
      { category: 'Case-Control Studies', level: '2B', count: 34, sources: ['Journals', 'Registries'] },
      { category: 'Case Series', level: '3', count: 156, sources: ['Case Reports', 'Literature'] },
      { category: 'Expert Opinion', level: '4', count: 78, sources: ['KOL Advisory', 'Internal SMEs'] },
    );

    const totalEvidenceSources = evidenceMetrics.reduce((sum, e) => sum + e.count, 0);
    const highQualityEvidence = evidenceMetrics.filter(e => ['1A', '1B', '2A'].includes(e.level))
      .reduce((sum, e) => sum + e.count, 0);

    insights.push({
      type: 'evidence',
      priority: (highQualityEvidence / totalEvidenceSources) < 0.4 ? 'high' : 'low',
      title: `${Math.round((highQualityEvidence / totalEvidenceSources) * 100)}% High-Quality Evidence`,
      description: `${highQualityEvidence} of ${totalEvidenceSources} evidence sources are Level 1-2A quality. ${(highQualityEvidence / totalEvidenceSources) < 0.4 ? 'Consider strengthening evidence base with additional RCTs or systematic reviews.' : 'Strong evidence foundation for strategic decisions.'}`,
      confidence: 0.85,
      data_points: totalEvidenceSources,
      action_required: (highQualityEvidence / totalEvidenceSources) < 0.4,
    });

    // 5. Competitive intelligence insight (placeholder - would integrate with CI data)
    insights.push({
      type: 'competitive',
      priority: 'high',
      title: 'Competitive Landscape: 3 Key Threats Identified',
      description: 'Monitoring 12 competitor products across 4 therapeutic areas. 3 products in late-stage development pose potential first-mover disadvantage. Recommend accelerated evidence generation for differentiation.',
      confidence: 0.78,
      data_points: 12,
      action_required: true,
    });

    // 6. KOL network insight (placeholder - would integrate with KOL management data)
    insights.push({
      type: 'kol',
      priority: 'medium',
      title: 'KOL Network: 45 Active Engagements',
      description: '45 key opinion leaders actively engaged across priority therapeutic areas. Average influence score: 82/100. 12 high-influence KOLs pending engagement in critical evidence gaps.',
      confidence: 0.82,
      data_points: 45,
      action_required: false,
    });

    // Sort insights by priority
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    insights.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    // Calculate summary metrics
    const summaryMetrics = {
      totalEvidenceSources,
      evidenceQualityScore: Math.round((highQualityEvidence / totalEvidenceSources) * 100),
      therapeuticAreasCount: therapeuticAreas.length,
      activeAgents: agents?.length || 0,
      criticalGaps: insights.filter(i => i.priority === 'critical').length,
      actionableInsights: insights.filter(i => i.action_required).length,
    };

    return NextResponse.json({
      success: true,
      data: {
        therapeuticAreas: therapeuticAreas.sort((a, b) => b.overallScore - a.overallScore),
        evidenceMetrics,
        insights,
        summaryMetrics,
      },
      metadata: {
        generated_at: new Date().toISOString(),
        tenant_id: tenantId,
        function_filter: functionFilter,
        total_insights: insights.length,
      },
    });

  } catch (error) {
    console.error('Error generating medical strategy data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate medical strategy insights', details: String(error) },
      { status: 500 }
    );
  }
}

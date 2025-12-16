import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface ValueInsight {
  type: 'distribution' | 'opportunity' | 'ai_readiness' | 'driver' | 'strategic' | 'impact' | 'benchmark' | 'benefit';
  title: string;
  description: string;
  metric: number;
  trend?: 'up' | 'down' | 'stable';
  actionable: boolean;
  priority: 'critical' | 'high' | 'medium' | 'low';
  evidence: {
    data_points: number;
    confidence: number;
    source: string;
  };
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const searchParams = request.nextUrl.searchParams;
    let tenantId = searchParams.get('tenant_id');

    // If no tenant specified, default to VITAL Platform (has all agents)
    if (!tenantId) {
      tenantId = '00000000-0000-0000-0000-000000000001';
    }

    const insights: ValueInsight[] = [];

    // 1. Get JTBDs for this tenant
    const { data: jtbdData, error: jtbdError } = await supabase
      .from('jtbd')
      .select('id, name, importance_score, satisfaction_score, opportunity_score')
      .eq('tenant_id', tenantId);

    if (jtbdError) {
      console.error('Error fetching JTBDs:', jtbdError);
    }

    const jtbds = jtbdData || [];
    const jtbdIds = jtbds.map(j => j.id);

    // 2. Value Category Distribution Analysis
    if (jtbdIds.length > 0) {
      const { data: categoryData, error: categoryError } = await supabase
        .from('jtbd_value_categories')
        .select('jtbd_id, category_id, category_name, relevance_score, is_primary')
        .in('jtbd_id', jtbdIds);

      if (!categoryError && categoryData && categoryData.length > 0) {
        const categoryMap = new Map<string, number>();
        categoryData.forEach((item: any) => {
          const category = item.category_name || 'Unknown';
          categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
        });

        const sortedCategories = Array.from(categoryMap.entries())
          .sort((a, b) => b[1] - a[1]);

        if (sortedCategories.length > 0) {
          const dominantCategory = sortedCategories[0];
          const concentrationRatio = dominantCategory[1] / categoryData.length;

          insights.push({
            type: 'distribution',
            title: `${Math.round(concentrationRatio * 100)}% of JTBDs Focus on "${dominantCategory[0]}"`,
            description: `${dominantCategory[1]} of ${categoryData.length} JTBD-category mappings are concentrated in "${dominantCategory[0]}". ${
              concentrationRatio > 0.4
                ? 'Consider diversifying initiatives across other value dimensions for balanced transformation.'
                : 'Good distribution across value categories detected.'
            }`,
            metric: concentrationRatio,
            trend: concentrationRatio > 0.4 ? 'up' : 'stable',
            actionable: concentrationRatio > 0.4,
            priority: concentrationRatio > 0.5 ? 'high' : 'medium',
            evidence: {
              data_points: categoryData.length,
              confidence: 0.95,
              source: 'jtbd_value_categories'
            }
          });
        }
      }
    }

    // 3. ODI Opportunity Analysis
    const jtbdsWithODI = jtbds.filter(j => j.opportunity_score !== null);
    if (jtbdsWithODI.length > 0) {
      const extremeOpportunities = jtbdsWithODI.filter(j => j.opportunity_score >= 15);
      const avgOpportunity = jtbdsWithODI.reduce((sum, j) => sum + (j.opportunity_score || 0), 0) / jtbdsWithODI.length;

      if (extremeOpportunities.length > 0) {
        const topOpp = extremeOpportunities.sort((a, b) => b.opportunity_score - a.opportunity_score)[0];
        insights.push({
          type: 'opportunity',
          title: `${extremeOpportunities.length} Extreme-Priority AI Opportunities (ODI >= 15)`,
          description: `Identified ${extremeOpportunities.length} jobs with extreme opportunity scores (importance high, satisfaction low). Top opportunity: "${topOpp.name}" (ODI: ${topOpp.opportunity_score?.toFixed(1)}). These represent the highest ROI AI intervention targets.`,
          metric: extremeOpportunities.length,
          trend: 'up',
          actionable: true,
          priority: 'critical',
          evidence: {
            data_points: jtbdsWithODI.length,
            confidence: 0.92,
            source: 'jtbd (ODI scores)'
          }
        });
      }

      insights.push({
        type: 'opportunity',
        title: `Average Opportunity Score: ${avgOpportunity.toFixed(1)}`,
        description: `The portfolio shows an average ODI score of ${avgOpportunity.toFixed(1)}. ${
          avgOpportunity >= 12
            ? 'High opportunity landscape - significant room for AI-driven improvement across multiple jobs.'
            : avgOpportunity >= 10
            ? 'Moderate opportunity landscape - selective AI interventions recommended.'
            : 'Lower opportunity scores suggest focus on efficiency and optimization.'
        }`,
        metric: avgOpportunity,
        trend: avgOpportunity >= 12 ? 'up' : 'stable',
        actionable: avgOpportunity >= 10,
        priority: avgOpportunity >= 12 ? 'high' : 'medium',
        evidence: {
          data_points: jtbdsWithODI.length,
          confidence: 0.88,
          source: 'jtbd (ODI scores)'
        }
      });
    }

    // 4. AI Suitability Analysis
    if (jtbdIds.length > 0) {
      const { data: aiData, error: aiError } = await supabase
        .from('jtbd_ai_suitability')
        .select('jtbd_id, overall_score, rag_score, summary_score, generation_score, automation_score')
        .in('jtbd_id', jtbdIds);

      if (!aiError && aiData && aiData.length > 0) {
        const highAutomation = aiData.filter((j: any) => j.automation_score >= 0.7);
        const avgAutomation = aiData.reduce((sum: number, j: any) => sum + (j.automation_score || 0), 0) / aiData.length;
        const avgOverallScore = aiData.reduce((sum: number, j: any) => sum + (j.overall_score || 0), 0) / aiData.length;
        const avgRag = aiData.reduce((sum: number, j: any) => sum + (j.rag_score || 0), 0) / aiData.length;
        const avgGeneration = aiData.reduce((sum: number, j: any) => sum + (j.generation_score || 0), 0) / aiData.length;

        insights.push({
          type: 'ai_readiness',
          title: `${highAutomation.length} Jobs Highly Suitable for Automation (>= 70%)`,
          description: `${highAutomation.length} of ${aiData.length} jobs show high automation potential (>= 70%). Average AI suitability: ${(avgOverallScore * 100).toFixed(0)}%. Strong candidates for immediate AI intervention: RAG (avg: ${(avgRag * 100).toFixed(0)}%), Generation (avg: ${(avgGeneration * 100).toFixed(0)}%).`,
          metric: highAutomation.length,
          trend: 'up',
          actionable: true,
          priority: highAutomation.length >= 5 ? 'high' : 'medium',
          evidence: {
            data_points: aiData.length,
            confidence: 0.90,
            source: 'jtbd_ai_suitability'
          }
        });
      }
    }

    // 5. Value Driver Balance Analysis
    if (jtbdIds.length > 0) {
      const { data: driverData, error: driverError } = await supabase
        .from('jtbd_value_drivers')
        .select('jtbd_id, driver_id, driver_name, impact_strength')
        .in('jtbd_id', jtbdIds);

      if (!driverError && driverData && driverData.length > 0) {
        // Get driver types
        const { data: drivers } = await supabase
          .from('value_drivers')
          .select('id, driver_type');

        if (drivers) {
          const driverTypeMap = new Map(drivers.map((d: any) => [d.id, d.driver_type]));

          const internalDrivers = driverData.filter((d: any) => driverTypeMap.get(d.driver_id) === 'internal');
          const externalDrivers = driverData.filter((d: any) => driverTypeMap.get(d.driver_id) === 'external');

          const internalRatio = internalDrivers.length / driverData.length;

          insights.push({
            type: 'driver',
            title: `${Math.round(internalRatio * 100)}% Internal vs ${Math.round((1 - internalRatio) * 100)}% External Value Focus`,
            description: `Value driver analysis shows ${internalDrivers.length} internal drivers (efficiency, quality, compliance) and ${externalDrivers.length} external drivers (HCP, patient, market). ${
              Math.abs(internalRatio - 0.5) > 0.2
                ? `Imbalance detected: consider ${internalRatio > 0.6 ? 'increasing external stakeholder impact' : 'strengthening internal operational excellence'}.`
                : 'Balanced internal-external value distribution.'
            }`,
            metric: internalRatio,
            trend: 'stable',
            actionable: Math.abs(internalRatio - 0.5) > 0.2,
            priority: Math.abs(internalRatio - 0.5) > 0.3 ? 'medium' : 'low',
            evidence: {
              data_points: driverData.length,
              confidence: 0.85,
              source: 'jtbd_value_drivers'
            }
          });
        }
      }
    }

    // 6. Strategic Quick Wins (High ODI + High Automation)
    if (jtbdIds.length > 0) {
      const { data: aiData } = await supabase
        .from('jtbd_ai_suitability')
        .select('jtbd_id, automation_score')
        .in('jtbd_id', jtbdIds);

      if (aiData) {
        const aiMap = new Map(aiData.map((a: any) => [a.jtbd_id, a.automation_score]));

        const quickWins = jtbds.filter(j => {
          const automationScore = aiMap.get(j.id);
          return j.opportunity_score >= 12 && automationScore && automationScore >= 0.6;
        });

        if (quickWins.length > 0) {
          insights.push({
            type: 'strategic',
            title: `${quickWins.length} High-Impact Quick Wins Identified`,
            description: `Cross-analysis of ODI scores and AI suitability reveals ${quickWins.length} jobs that are both high-opportunity (ODI >= 12) AND highly automatable (>= 60% potential). These represent the optimal "sweet spot" for immediate AI investment with measurable business impact.`,
            metric: quickWins.length,
            trend: 'up',
            actionable: true,
            priority: 'critical',
            evidence: {
              data_points: Math.min(jtbds.length, aiData.length),
              confidence: 0.93,
              source: 'jtbd + jtbd_ai_suitability (cross-analysis)'
            }
          });
        }
      }
    }

    // 7. Value Impact Analysis (NEW - from 024 migration)
    if (jtbdIds.length > 0) {
      const { data: impactData, error: impactError } = await supabase
        .from('jtbd_value_impacts')
        .select('*')
        .in('jtbd_id', jtbdIds);

      if (!impactError && impactData && impactData.length > 0) {
        // Calculate total monetary value
        const totalMonetaryValue = impactData.reduce((sum: number, item: any) =>
          sum + (item.monetary_value || 0), 0);

        // Average improvement percentage
        const avgImprovement = impactData.reduce((sum: number, item: any) =>
          sum + (item.improvement_pct || 0), 0) / impactData.length;

        // AI contribution analysis
        const avgAutomationPct = impactData.reduce((sum: number, item: any) =>
          sum + (item.ai_automation_pct || 0), 0) / impactData.length;
        const avgAugmentationPct = impactData.reduce((sum: number, item: any) =>
          sum + (item.ai_augmentation_pct || 0), 0) / impactData.length;

        // High confidence impacts
        const highConfidenceImpacts = impactData.filter((i: any) =>
          i.confidence_level === 'high' || i.confidence_level === 'verified');

        if (totalMonetaryValue > 0) {
          insights.push({
            type: 'impact',
            title: `$${(totalMonetaryValue / 1000000).toFixed(1)}M Total Quantified Value Impact`,
            description: `${impactData.length} value impacts quantified across JTBDs. Average improvement: ${avgImprovement.toFixed(0)}%. AI contribution: ${avgAutomationPct.toFixed(0)}% automation + ${avgAugmentationPct.toFixed(0)}% augmentation. ${highConfidenceImpacts.length} high-confidence impacts verified.`,
            metric: totalMonetaryValue,
            trend: 'up',
            actionable: true,
            priority: totalMonetaryValue > 1000000 ? 'critical' : 'high',
            evidence: {
              data_points: impactData.length,
              confidence: highConfidenceImpacts.length / impactData.length,
              source: 'jtbd_value_impacts (024 migration)'
            }
          });
        }
      }
    }

    // 8. Industry Benchmark Comparison (NEW - from 024 migration)
    const { data: benchmarkData, error: benchmarkError } = await supabase
      .from('impact_benchmarks')
      .select('*')
      .limit(10);

    if (!benchmarkError && benchmarkData && benchmarkData.length > 0) {
      // Find highest ROI benchmark
      const sortedBenchmarks = benchmarkData.sort((a: any, b: any) =>
        (b.typical_improvement_pct || 0) - (a.typical_improvement_pct || 0));

      const topBenchmark = sortedBenchmarks[0];
      const avgBenchmarkImprovement = benchmarkData.reduce((sum: number, b: any) =>
        sum + (b.typical_improvement_pct || 0), 0) / benchmarkData.length;

      insights.push({
        type: 'benchmark',
        title: `Industry Benchmarks: ${avgBenchmarkImprovement.toFixed(0)}% Avg Improvement Potential`,
        description: `${benchmarkData.length} industry benchmarks available. Top opportunity: "${topBenchmark.impact_type}" with ${topBenchmark.typical_improvement_pct}% typical improvement (${topBenchmark.time_to_value_months || 6} months to value). Benchmarks from: ${topBenchmark.source || 'Industry research'}.`,
        metric: avgBenchmarkImprovement,
        trend: 'up',
        actionable: true,
        priority: 'medium',
        evidence: {
          data_points: benchmarkData.length,
          confidence: 0.85,
          source: 'impact_benchmarks (industry data)'
        }
      });
    }

    // 9. Value Realization Tracking (NEW - from 025 migration)
    const { data: realizationData, error: realizationError } = await supabase
      .from('value_realization_tracking')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('period_end', { ascending: false })
      .limit(20);

    if (!realizationError && realizationData && realizationData.length > 0) {
      // Calculate realization rate (actual vs target)
      const completedTracking = realizationData.filter((r: any) =>
        r.actual_value !== null && r.target_value !== null && r.target_value > 0);

      if (completedTracking.length > 0) {
        const avgRealizationRate = completedTracking.reduce((sum: number, r: any) =>
          sum + (r.actual_value / r.target_value), 0) / completedTracking.length;

        insights.push({
          type: 'benefit',
          title: `${(avgRealizationRate * 100).toFixed(0)}% Value Realization Rate`,
          description: `Tracking ${realizationData.length} value initiatives. ${completedTracking.length} have actual results: averaging ${(avgRealizationRate * 100).toFixed(0)}% of target value achieved. ${avgRealizationRate >= 1 ? 'Exceeding targets!' : avgRealizationRate >= 0.8 ? 'On track to meet targets.' : 'Below target - review underperforming initiatives.'}`,
          metric: avgRealizationRate,
          trend: avgRealizationRate >= 0.9 ? 'up' : avgRealizationRate >= 0.7 ? 'stable' : 'down',
          actionable: avgRealizationRate < 0.8,
          priority: avgRealizationRate < 0.7 ? 'high' : 'medium',
          evidence: {
            data_points: completedTracking.length,
            confidence: 0.90,
            source: 'value_realization_tracking (025 migration)'
          }
        });
      }
    }

    // 10. Benefit Milestones Progress (NEW - from 025 migration)
    const { data: milestoneData, error: milestoneError } = await supabase
      .from('benefit_milestones')
      .select('*')
      .eq('tenant_id', tenantId);

    if (!milestoneError && milestoneData && milestoneData.length > 0) {
      const completedMilestones = milestoneData.filter((m: any) => m.status === 'completed');
      const inProgressMilestones = milestoneData.filter((m: any) => m.status === 'in_progress');
      const overdueMilestones = milestoneData.filter((m: any) =>
        m.status !== 'completed' && m.target_date && new Date(m.target_date) < new Date());

      const completionRate = completedMilestones.length / milestoneData.length;

      insights.push({
        type: 'benefit',
        title: `${completedMilestones.length}/${milestoneData.length} Benefit Milestones Achieved`,
        description: `${(completionRate * 100).toFixed(0)}% milestone completion rate. ${inProgressMilestones.length} in progress, ${overdueMilestones.length} overdue. ${overdueMilestones.length > 0 ? `Alert: ${overdueMilestones.length} milestone(s) past target date.` : 'All milestones on track.'}`,
        metric: completionRate,
        trend: completionRate >= 0.7 ? 'up' : completionRate >= 0.4 ? 'stable' : 'down',
        actionable: overdueMilestones.length > 0,
        priority: overdueMilestones.length > 2 ? 'high' : overdueMilestones.length > 0 ? 'medium' : 'low',
        evidence: {
          data_points: milestoneData.length,
          confidence: 0.95,
          source: 'benefit_milestones (025 migration)'
        }
      });
    }

    // 11. Cached AI Insights (from value_insights table - 023 migration)
    const { data: cachedInsights, error: cachedError } = await supabase
      .from('value_insights')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('status', 'active')
      .order('priority_score', { ascending: false })
      .limit(5);

    if (!cachedError && cachedInsights && cachedInsights.length > 0) {
      // Add high-priority cached AI insights
      cachedInsights.forEach((cached: any) => {
        if (cached.priority_score >= 0.7) {
          insights.push({
            type: 'strategic',
            title: cached.title,
            description: cached.description,
            metric: cached.priority_score,
            trend: 'stable',
            actionable: true,
            priority: cached.impact_assessment === 'high' ? 'critical' :
                      cached.impact_assessment === 'medium' ? 'high' : 'medium',
            evidence: {
              data_points: 1,
              confidence: cached.confidence_score || 0.8,
              source: `Value Investigator AI (${cached.generated_by_model || 'gpt-4'})`
            }
          });
        }
      });
    }

    // Sort insights by priority
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    insights.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return NextResponse.json({
      success: true,
      insights,
      metadata: {
        generated_at: new Date().toISOString(),
        tenant_id: tenantId,
        total_insights: insights.length,
        actionable_insights: insights.filter(i => i.actionable).length,
        total_jtbds: jtbds.length
      }
    });

  } catch (error) {
    console.error('Error generating value insights:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate insights', details: String(error) },
      { status: 500 }
    );
  }
}

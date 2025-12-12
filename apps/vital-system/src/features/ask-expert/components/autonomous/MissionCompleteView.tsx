'use client';

/**
 * VITAL Platform - MissionCompleteView Component
 *
 * Mission completion view showing results, artifacts, and metrics.
 * Displayed when a mission successfully completes with:
 * - Success celebration animation
 * - Final outputs and artifacts
 * - Quality scores breakdown
 * - Cost and time metrics
 * - Source citations
 * - Export and share options
 *
 * Aligned with: services/ai-engine/docs/FRONTEND_INTEGRATION_REFERENCE.md
 *
 * Design System: VITAL Brand v6.0 (Purple Theme #9055E0)
 * Phase 3 Implementation - December 11, 2025
 */

import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  Download,
  Share2,
  Copy,
  ExternalLink,
  FileText,
  Link2,
  BarChart3,
  Clock,
  DollarSign,
  Zap,
  Star,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Award,
} from 'lucide-react';

import type {
  MissionTemplate,
  Artifact,
  Source,
  QualityMetric,
} from '../../types/mission-runners';
import type { Expert } from '../interactive/ExpertPicker';

// =============================================================================
// TYPES
// =============================================================================

export interface MissionCompleteViewProps {
  /** Mission ID */
  missionId: string;
  /** Template used */
  template: MissionTemplate;
  /** Expert that executed the mission */
  expert: Expert;
  /** Final outputs */
  outputs: Record<string, unknown>;
  /** Generated artifacts */
  artifacts: Artifact[];
  /** Sources used */
  sources: Source[];
  /** Quality scores */
  qualityScores: Record<QualityMetric, number>;
  /** Total cost */
  totalCost: number;
  /** Total tokens used */
  totalTokens: number;
  /** Total duration in ms */
  totalDuration: number;
  /** Callback to start new mission */
  onNewMission: () => void;
  /** Callback to repeat mission */
  onRepeat: () => void;
  /** Custom class names */
  className?: string;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  if (minutes > 60) {
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
};

const formatCost = (cost: number): string => {
  return `$${cost.toFixed(2)}`;
};

const getQualityColor = (score: number): string => {
  if (score >= 0.9) return 'text-green-400';
  if (score >= 0.8) return 'text-emerald-400';
  if (score >= 0.7) return 'text-amber-400';
  if (score >= 0.6) return 'text-orange-400';
  return 'text-red-400';
};

const getQualityLabel = (score: number): string => {
  if (score >= 0.9) return 'Excellent';
  if (score >= 0.8) return 'Good';
  if (score >= 0.7) return 'Satisfactory';
  if (score >= 0.6) return 'Needs Improvement';
  return 'Poor';
};

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

const SuccessAnimation: React.FC = () => (
  <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
    className="relative"
  >
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      className="absolute inset-0 rounded-full bg-gradient-to-r from-green-500/20 via-emerald-500/20 to-teal-500/20 blur-xl"
    />
    <div className="relative p-4 bg-green-500/20 rounded-full">
      <CheckCircle2 className="w-12 h-12 text-green-400" />
    </div>
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: [0, 1.2, 0] }}
      transition={{ delay: 0.3, duration: 0.6 }}
      className="absolute inset-0 flex items-center justify-center"
    >
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
          transition={{ delay: 0.2 + i * 0.1, duration: 0.8 }}
          className="absolute w-2 h-2 bg-green-400 rounded-full"
          style={{
            transform: `rotate(${i * 45}deg) translateY(-30px)`,
          }}
        />
      ))}
    </motion.div>
  </motion.div>
);

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string;
  color?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  icon,
  label,
  value,
  subValue,
  color = 'text-purple-400',
}) => (
  <div className="p-4 bg-neutral-800/50 rounded-lg border border-neutral-700/50">
    <div className="flex items-center gap-2 text-neutral-400 mb-2">
      {icon}
      <span className="text-xs">{label}</span>
    </div>
    <p className={cn('text-xl font-semibold', color)}>{value}</p>
    {subValue && (
      <p className="text-xs text-neutral-500 mt-0.5">{subValue}</p>
    )}
  </div>
);

interface ArtifactCardProps {
  artifact: Artifact;
  onDownload?: () => void;
  onView?: () => void;
}

const ArtifactCard: React.FC<ArtifactCardProps> = ({
  artifact,
  onDownload,
  onView,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="p-3 bg-neutral-800/50 rounded-lg border border-neutral-700/50 hover:border-green-500/30 transition-colors group"
  >
    <div className="flex items-start justify-between">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-green-500/20 rounded-lg">
          <FileText className="w-4 h-4 text-green-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-white">{artifact.name}</p>
          <p className="text-xs text-neutral-400 mt-0.5">
            {artifact.type} • {artifact.format || 'Unknown format'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {onView && (
          <button
            onClick={onView}
            className="p-1.5 text-neutral-400 hover:text-white transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        )}
        {onDownload && (
          <button
            onClick={onDownload}
            className="p-1.5 text-neutral-400 hover:text-white transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  </motion.div>
);

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const MissionCompleteView: React.FC<MissionCompleteViewProps> = ({
  missionId,
  template,
  expert,
  outputs,
  artifacts,
  sources,
  qualityScores,
  totalCost,
  totalTokens,
  totalDuration,
  onNewMission,
  onRepeat,
  className,
}) => {
  const [expandedSections, setExpandedSections] = useState({
    artifacts: true,
    sources: true,
    quality: true,
    outputs: false,
  });

  const toggleSection = useCallback((section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  }, []);

  // Calculate average quality score
  const avgQuality = useMemo(() => {
    const scores = Object.values(qualityScores);
    if (scores.length === 0) return 0;
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  }, [qualityScores]);

  // Copy mission ID to clipboard
  const copyMissionId = useCallback(() => {
    navigator.clipboard.writeText(missionId);
  }, [missionId]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn('flex flex-col h-full bg-neutral-950', className)}
    >
      {/* Success Header */}
      <div className="flex flex-col items-center justify-center py-8 px-4 border-b border-neutral-800">
        <SuccessAnimation />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-6"
        >
          <h2 className="text-2xl font-bold text-white">Mission Complete!</h2>
          <p className="text-neutral-400 mt-2">
            {template.name} executed by {expert.name}
          </p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="text-xs text-neutral-500">Mission ID: {missionId}</span>
            <button
              onClick={copyMissionId}
              className="p-1 text-neutral-500 hover:text-white transition-colors"
            >
              <Copy className="w-3 h-3" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Metrics Row */}
      <div className="p-4 border-b border-neutral-800">
        <div className="grid grid-cols-4 gap-3">
          <MetricCard
            icon={<BarChart3 className="w-4 h-4" />}
            label="Quality Score"
            value={`${(avgQuality * 100).toFixed(0)}%`}
            subValue={getQualityLabel(avgQuality)}
            color={getQualityColor(avgQuality)}
          />
          <MetricCard
            icon={<Clock className="w-4 h-4" />}
            label="Duration"
            value={formatDuration(totalDuration)}
            subValue={`Est: ${template.estimatedDurationMin}-${template.estimatedDurationMax}m`}
          />
          <MetricCard
            icon={<DollarSign className="w-4 h-4" />}
            label="Total Cost"
            value={formatCost(totalCost)}
            subValue={`Est: $${template.estimatedCostMin}-$${template.estimatedCostMax}`}
          />
          <MetricCard
            icon={<Zap className="w-4 h-4" />}
            label="Tokens Used"
            value={totalTokens.toLocaleString()}
            subValue="Total API usage"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Artifacts Section */}
        <div className="rounded-lg border border-neutral-700/50 overflow-hidden">
          <button
            onClick={() => toggleSection('artifacts')}
            className="w-full flex items-center justify-between p-4 bg-neutral-800/50 hover:bg-neutral-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <FileText className="w-4 h-4 text-green-400" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-medium text-white">Generated Artifacts</h3>
                <p className="text-xs text-neutral-400">{artifacts.length} files ready</p>
              </div>
            </div>
            {expandedSections.artifacts ? (
              <ChevronDown className="w-4 h-4 text-neutral-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            )}
          </button>
          {expandedSections.artifacts && (
            <div className="p-4 space-y-2 border-t border-neutral-700/50">
              {artifacts.map(artifact => (
                <ArtifactCard
                  key={artifact.id}
                  artifact={artifact}
                  onDownload={() => console.log('Download:', artifact.id)}
                  onView={() => console.log('View:', artifact.id)}
                />
              ))}
              {artifacts.length === 0 && (
                <p className="text-sm text-neutral-500 text-center py-4">
                  No artifacts generated
                </p>
              )}
            </div>
          )}
        </div>

        {/* Sources Section */}
        <div className="rounded-lg border border-neutral-700/50 overflow-hidden">
          <button
            onClick={() => toggleSection('sources')}
            className="w-full flex items-center justify-between p-4 bg-neutral-800/50 hover:bg-neutral-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Link2 className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-medium text-white">Sources Used</h3>
                <p className="text-xs text-neutral-400">{sources.length} citations</p>
              </div>
            </div>
            {expandedSections.sources ? (
              <ChevronDown className="w-4 h-4 text-neutral-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            )}
          </button>
          {expandedSections.sources && (
            <div className="p-4 space-y-2 border-t border-neutral-700/50">
              {sources.map(source => (
                <div
                  key={source.id}
                  className="flex items-center gap-3 p-2 bg-neutral-800/50 rounded-lg"
                >
                  <Link2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <span className="text-sm text-neutral-300 flex-1 truncate">
                    {source.title}
                  </span>
                  {source.url && (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-400 hover:underline"
                    >
                      Open
                    </a>
                  )}
                </div>
              ))}
              {sources.length === 0 && (
                <p className="text-sm text-neutral-500 text-center py-4">
                  No external sources used
                </p>
              )}
            </div>
          )}
        </div>

        {/* Quality Scores Section */}
        <div className="rounded-lg border border-neutral-700/50 overflow-hidden">
          <button
            onClick={() => toggleSection('quality')}
            className="w-full flex items-center justify-between p-4 bg-neutral-800/50 hover:bg-neutral-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <Star className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-medium text-white">Quality Breakdown</h3>
                <p className="text-xs text-neutral-400">{Object.keys(qualityScores).length} metrics</p>
              </div>
            </div>
            {expandedSections.quality ? (
              <ChevronDown className="w-4 h-4 text-neutral-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            )}
          </button>
          {expandedSections.quality && (
            <div className="p-4 space-y-3 border-t border-neutral-700/50">
              {Object.entries(qualityScores).map(([metric, score]) => (
                <div key={metric} className="flex items-center justify-between">
                  <span className="text-sm text-neutral-400 capitalize">{metric}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-neutral-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${score * 100}%` }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className={cn(
                          'h-full rounded-full',
                          score >= 0.8 ? 'bg-green-500' :
                          score >= 0.6 ? 'bg-amber-500' : 'bg-red-500'
                        )}
                      />
                    </div>
                    <span className={cn(
                      'text-sm font-medium w-12 text-right',
                      getQualityColor(score)
                    )}>
                      {(score * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
              {Object.keys(qualityScores).length === 0 && (
                <p className="text-sm text-neutral-500 text-center py-4">
                  Quality scores not available
                </p>
              )}
            </div>
          )}
        </div>

        {/* Raw Outputs Section */}
        <div className="rounded-lg border border-neutral-700/50 overflow-hidden">
          <button
            onClick={() => toggleSection('outputs')}
            className="w-full flex items-center justify-between p-4 bg-neutral-800/50 hover:bg-neutral-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Sparkles className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-medium text-white">Raw Outputs</h3>
                <p className="text-xs text-neutral-400">View mission data</p>
              </div>
            </div>
            {expandedSections.outputs ? (
              <ChevronDown className="w-4 h-4 text-neutral-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            )}
          </button>
          {expandedSections.outputs && (
            <div className="p-4 border-t border-neutral-700/50">
              <pre className="text-xs text-neutral-400 bg-neutral-900 p-3 rounded-lg overflow-auto max-h-64">
                {JSON.stringify(outputs, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 border-t border-neutral-800 bg-neutral-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => console.log('Share')}
              className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => console.log('Export')}
              className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
            >
              <Download className="w-4 h-4 mr-2" />
              Export All
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={onRepeat}
              className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Repeat Mission
            </Button>
            <Button
              onClick={onNewMission}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Award className="w-4 h-4 mr-2" />
              New Mission
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MissionCompleteView;

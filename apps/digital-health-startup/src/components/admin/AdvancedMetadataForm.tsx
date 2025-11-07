'use client';

import { useState } from 'react';
import { Zap, Info } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AdvancedMetadataFormProps {
  source: any;
  onUpdate: (field: string, value: any) => void;
}

export default function AdvancedMetadataForm({ source, onUpdate }: AdvancedMetadataFormProps) {
  const [activeTab, setActiveTab] = useState<'publication' | 'classification' | 'quality' | 'structure'>('publication');

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          Advanced Metadata Fields
        </CardTitle>
        <CardDescription>
          Comprehensive metadata for RAG optimization, quality tracking, and classification
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Tabs */}
        <div className="flex space-x-2 border-b mb-4">
          {['publication', 'classification', 'quality', 'structure'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Publication Tab */}
        {activeTab === 'publication' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Firm/Organization *</Label>
                <Input
                  placeholder="Boston Consulting Group"
                  value={source.firm || ''}
                  onChange={(e) => onUpdate('firm', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Report Type</Label>
                <Select
                  value={source.report_type || ''}
                  onValueChange={(value) => onUpdate('report_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="strategic_insight">Strategic Insight</SelectItem>
                    <SelectItem value="research_study">Research Study</SelectItem>
                    <SelectItem value="case_study">Case Study</SelectItem>
                    <SelectItem value="white_paper">White Paper</SelectItem>
                    <SelectItem value="market_report">Market Report</SelectItem>
                    <SelectItem value="trend_analysis">Trend Analysis</SelectItem>
                    <SelectItem value="framework">Framework</SelectItem>
                    <SelectItem value="implementation_guide">Implementation Guide</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Publication Date</Label>
                <Input
                  type="date"
                  value={source.publication_date || ''}
                  onChange={(e) => onUpdate('publication_date', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Publication Year</Label>
                <Input
                  type="number"
                  placeholder="2025"
                  value={source.publication_year || ''}
                  onChange={(e) => onUpdate('publication_year', parseInt(e.target.value) || null)}
                />
              </div>

              <div className="space-y-2">
                <Label>Quarter</Label>
                <Select
                  value={source.publication_month || ''}
                  onValueChange={(value) => onUpdate('publication_month', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select quarter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Q1">Q1</SelectItem>
                    <SelectItem value="Q2">Q2</SelectItem>
                    <SelectItem value="Q3">Q3</SelectItem>
                    <SelectItem value="Q4">Q4</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Edition/Version</Label>
                <Input
                  placeholder="2025 Edition, v1.0"
                  value={source.edition || ''}
                  onChange={(e) => onUpdate('edition', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Authors (comma-separated)</Label>
              <Textarea
                placeholder="Jane Doe, John Smith, Mary Johnson"
                value={Array.isArray(source.authors) ? source.authors.join(', ') : source.authors || ''}
                onChange={(e) => onUpdate('authors', e.target.value.split(',').map(a => a.trim()))}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Abstract/Summary</Label>
              <Textarea
                placeholder="Brief summary of the report (100-500 words)"
                value={source.abstract || ''}
                onChange={(e) => onUpdate('abstract', e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>PDF Link (if available)</Label>
              <Input
                placeholder="https://example.com/report.pdf"
                value={source.pdf_link || ''}
                onChange={(e) => onUpdate('pdf_link', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={source.direct_download || false}
                  onCheckedChange={(checked) => onUpdate('direct_download', checked)}
                />
                <Label>Direct Download Available</Label>
              </div>

              <div className="space-y-2">
                <Label>Page Count</Label>
                <Input
                  type="number"
                  placeholder="45"
                  value={source.page_count || ''}
                  onChange={(e) => onUpdate('page_count', parseInt(e.target.value) || null)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Classification Tab */}
        {activeTab === 'classification' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Industry Sectors</Label>
              <Textarea
                placeholder="Healthcare, Technology, Financial Services (one per line)"
                value={Array.isArray(source.industry_sectors) ? source.industry_sectors.join('\n') : source.industry_sectors || ''}
                onChange={(e) => onUpdate('industry_sectors', e.target.value.split('\n').map(s => s.trim()).filter(Boolean))}
                rows={3}
              />
              <p className="text-xs text-gray-500">Enter one industry per line</p>
            </div>

            <div className="space-y-2">
              <Label>Practice Areas</Label>
              <Textarea
                placeholder="Artificial Intelligence, Digital Transformation (one per line)"
                value={Array.isArray(source.practice_areas) ? source.practice_areas.join('\n') : source.practice_areas || ''}
                onChange={(e) => onUpdate('practice_areas', e.target.value.split('\n').map(s => s.trim()).filter(Boolean))}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Target Audience</Label>
              <Textarea
                placeholder="C-Suite, CIO, VP Digital Transformation (one per line)"
                value={Array.isArray(source.target_audience) ? source.target_audience.join('\n') : source.target_audience || ''}
                onChange={(e) => onUpdate('target_audience', e.target.value.split('\n').map(s => s.trim()).filter(Boolean))}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Seniority Level</Label>
                <Select
                  value={source.seniority_level || ''}
                  onValueChange={(value) => onUpdate('seniority_level', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="c_suite">C-Suite</SelectItem>
                    <SelectItem value="vp_level">VP Level</SelectItem>
                    <SelectItem value="director">Director</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="analyst">Analyst</SelectItem>
                    <SelectItem value="all_levels">All Levels</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Geographic Scope</Label>
                <Select
                  value={source.geographic_scope || ''}
                  onValueChange={(value) => onUpdate('geographic_scope', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select scope" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global">Global</SelectItem>
                    <SelectItem value="regional">Regional</SelectItem>
                    <SelectItem value="country_specific">Country Specific</SelectItem>
                    <SelectItem value="multi_regional">Multi-Regional</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Temporal Coverage</Label>
                <Select
                  value={source.temporal_coverage || ''}
                  onValueChange={(value) => onUpdate('temporal_coverage', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select coverage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">Current</SelectItem>
                    <SelectItem value="forward_looking">Forward Looking</SelectItem>
                    <SelectItem value="forecast">Forecast</SelectItem>
                    <SelectItem value="retrospective">Retrospective</SelectItem>
                    <SelectItem value="historical">Historical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Use Case Category</Label>
                <Select
                  value={source.use_case_category || ''}
                  onValueChange={(value) => onUpdate('use_case_category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="implementation">Implementation</SelectItem>
                    <SelectItem value="framework">Framework</SelectItem>
                    <SelectItem value="case_study">Case Study</SelectItem>
                    <SelectItem value="market_analysis">Market Analysis</SelectItem>
                    <SelectItem value="trends">Trends</SelectItem>
                    <SelectItem value="best_practices">Best Practices</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={source.is_time_sensitive || false}
                onCheckedChange={(checked) => onUpdate('is_time_sensitive', checked)}
              />
              <Label>Time-Sensitive Content</Label>
              <Info className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        )}

        {/* Quality Tab */}
        {activeTab === 'quality' && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Quality scores are auto-calculated if not provided. Manual override available below.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quality Score (0-10)</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  placeholder="Auto-calculated"
                  value={source.quality_score || ''}
                  onChange={(e) => onUpdate('quality_score', parseFloat(e.target.value) || null)}
                />
                <p className="text-xs text-gray-500">Leave empty for auto-calculation</p>
              </div>

              <div className="space-y-2">
                <Label>Credibility Score (0-10)</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  placeholder="Auto-calculated"
                  value={source.credibility_score || ''}
                  onChange={(e) => onUpdate('credibility_score', parseFloat(e.target.value) || null)}
                />
              </div>

              <div className="space-y-2">
                <Label>Citation Count</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={source.citation_count || ''}
                  onChange={(e) => onUpdate('citation_count', parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-2">
                <Label>RAG Priority Weight (0-1)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  placeholder="Auto-set by firm"
                  value={source.rag_priority_weight || ''}
                  onChange={(e) => onUpdate('rag_priority_weight', parseFloat(e.target.value) || null)}
                />
                <p className="text-xs text-gray-500">Higher = more priority in RAG</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={source.peer_reviewed || false}
                  onCheckedChange={(checked) => onUpdate('peer_reviewed', checked)}
                />
                <Label>Peer Reviewed</Label>
              </div>

              <div className="space-y-2">
                <Label>Editorial Status</Label>
                <Select
                  value={source.editorial_review_status || 'draft'}
                  onValueChange={(value) => onUpdate('editorial_review_status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="in_review">In Review</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Compliance Tags (comma-separated)</Label>
              <Input
                placeholder="HIPAA, GDPR, FDA Guidance"
                value={Array.isArray(source.compliance_tags) ? source.compliance_tags.join(', ') : source.compliance_tags || ''}
                onChange={(e) => onUpdate('compliance_tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
              />
            </div>
          </div>
        )}

        {/* Structure Tab */}
        {activeTab === 'structure' && (
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-green-800">
                <strong>Document Structure:</strong> Helps with RAG chunking strategy and targeted retrieval
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={source.has_executive_summary || false}
                  onCheckedChange={(checked) => onUpdate('has_executive_summary', checked)}
                />
                <Label className="text-sm">Executive Summary</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={source.has_table_of_contents || false}
                  onCheckedChange={(checked) => onUpdate('has_table_of_contents', checked)}
                />
                <Label className="text-sm">Table of Contents</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={source.has_appendices || false}
                  onCheckedChange={(checked) => onUpdate('has_appendices', checked)}
                />
                <Label className="text-sm">Appendices</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={source.has_data_tables || false}
                  onCheckedChange={(checked) => onUpdate('has_data_tables', checked)}
                />
                <Label className="text-sm">Data Tables</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={source.has_charts_graphs || false}
                  onCheckedChange={(checked) => onUpdate('has_charts_graphs', checked)}
                />
                <Label className="text-sm">Charts/Graphs</Label>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Section Count</Label>
                <Input
                  type="number"
                  placeholder="8"
                  value={source.section_count || ''}
                  onChange={(e) => onUpdate('section_count', parseInt(e.target.value) || null)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Chunk Strategy</Label>
              <Select
                value={source.chunk_strategy || 'semantic'}
                onValueChange={(value) => onUpdate('chunk_strategy', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semantic">Semantic (Default)</SelectItem>
                  <SelectItem value="fixed_size">Fixed Size</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="section_based">Section-Based</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Context Window Tokens</Label>
                <Select
                  value={source.context_window_tokens?.toString() || '8192'}
                  onValueChange={(value) => onUpdate('context_window_tokens', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4096">4096</SelectItem>
                    <SelectItem value="8192">8192 (Default)</SelectItem>
                    <SelectItem value="16384">16384</SelectItem>
                    <SelectItem value="32768">32768</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  checked={source.summarization_available || false}
                  onCheckedChange={(checked) => onUpdate('summarization_available', checked)}
                />
                <Label>Summary Available</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Citation Format</Label>
              <Textarea
                placeholder="Author, A., Author, B. (2025). Title. Publisher."
                value={source.citation_format || ''}
                onChange={(e) => onUpdate('citation_format', e.target.value)}
                rows={2}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


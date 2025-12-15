'use client';

import React, { useMemo, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  Panel,
  ConnectionLineType,
  MarkerType,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Play, X } from 'lucide-react';
import { StreamingPanelConsultation } from '@/components/ask-panel/StreamingPanelConsultation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface PanelWorkflowDiagramProps {
  panelName?: string;
  panelId?: string;
  agentIds?: string[];
  tenantId?: string;
}

// Custom node types
const StartNode = ({ data }: { data: any }) => (
  <div className="px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-lg border-2 border-green-700">
    <div className="text-white font-bold text-lg text-center">{data.label || 'START'}</div>
  </div>
);

const EndNode = ({ data }: { data: any }) => (
  <div className="px-6 py-4 bg-gradient-to-r from-red-500 to-rose-600 rounded-lg shadow-lg border-2 border-red-700">
    <div className="text-white font-bold text-lg text-center">{data.label || 'END'}</div>
  </div>
);

const ProcessNode = ({ data }: { data: any }) => (
  <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-lg border-2 border-blue-700 min-w-[200px]">
    <div className="text-white font-semibold text-center">{data.label}</div>
    {data.subtitle && (
      <div className="text-blue-100 text-sm text-center mt-1">{data.subtitle}</div>
    )}
  </div>
);

const DecisionNode = ({ data }: { data: any }) => (
  <div className="px-6 py-4 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-lg shadow-lg border-2 border-yellow-700 transform rotate-45 min-w-[120px] min-h-[120px] flex items-center justify-center">
    <div className="text-white font-bold text-center transform -rotate-45">{data.label}</div>
  </div>
);

const RoundNode = ({ data }: { data: any }) => (
  <div className="px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg shadow-lg border-2 border-purple-700 border-dashed min-w-[180px]">
    <div className="text-white font-semibold text-sm text-center mb-2">{data.label}</div>
    {data.items && (
      <div className="space-y-1">
        {data.items.map((item: string, idx: number) => (
          <div key={idx} className="text-purple-100 text-xs text-center">{item}</div>
        ))}
      </div>
    )}
  </div>
);

const nodeTypes = {
  start: StartNode,
  end: EndNode,
  process: ProcessNode,
  decision: DecisionNode,
  round: RoundNode,
};

export function PanelWorkflowDiagram({ 
  panelName = 'Structured Panel',
  panelId = 'structured_panel',
  agentIds = [],
  tenantId = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244',
}: PanelWorkflowDiagramProps) {
  const [showTestModal, setShowTestModal] = useState(false);
  const [testQuestion, setTestQuestion] = useState('');
  const [hasStarted, setHasStarted] = useState(false);
  
  const { nodes, edges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    let yPos = 50;
    const xCenter = 400;
    const verticalGap = 120;
    const horizontalGap = 250;

    // START node
    nodes.push({
      id: 'start',
      type: 'start',
      position: { x: xCenter - 100, y: yPos },
      data: { label: 'START' },
      sourcePosition: Position.Bottom,
    });
    yPos += verticalGap;

    // Initialize Agenda
    nodes.push({
      id: 'init-agenda',
      type: 'process',
      position: { x: xCenter - 100, y: yPos },
      data: { label: 'Initialize Agenda' },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    });
    edges.push({
      id: 'start-init',
      source: 'start',
      target: 'init-agenda',
      type: 'smoothstep',
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
    });
    yPos += verticalGap;

    // FOR EACH AGENDA ITEM (loop container)
    nodes.push({
      id: 'loop-start',
      type: 'process',
      position: { x: xCenter - 150, y: yPos },
      data: { label: 'FOR EACH AGENDA ITEM' },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    });
    edges.push({
      id: 'init-loop',
      source: 'init-agenda',
      target: 'loop-start',
      type: 'smoothstep',
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
    });
    yPos += verticalGap;

    // Moderator Introduction
    nodes.push({
      id: 'moderator-intro',
      type: 'process',
      position: { x: xCenter - 100, y: yPos },
      data: { label: 'Moderator Introduction', subtitle: '(Frame issue, set rules)' },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    });
    edges.push({
      id: 'loop-moderator',
      source: 'loop-start',
      target: 'moderator-intro',
      type: 'smoothstep',
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
    });
    yPos += verticalGap;

    // Round 1: Opening Statements
    nodes.push({
      id: 'round1',
      type: 'round',
      position: { x: xCenter - 100, y: yPos },
      data: {
        label: 'Round 1: Opening Statements',
        items: ['Expert 1 → 3 min', 'Expert 2 → 3 min', 'Expert 3 → 3 min'],
      },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    });
    edges.push({
      id: 'moderator-round1',
      source: 'moderator-intro',
      target: 'round1',
      type: 'smoothstep',
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
    });
    yPos += verticalGap;

    // Round 2: Structured Q&A
    nodes.push({
      id: 'round2',
      type: 'round',
      position: { x: xCenter - 100, y: yPos },
      data: {
        label: 'Round 2: Structured Q&A',
        items: ['Moderator asks clarifying Qs', 'Experts respond (2 min each)'],
      },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    });
    edges.push({
      id: 'round1-round2',
      source: 'round1',
      target: 'round2',
      type: 'smoothstep',
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
    });
    yPos += verticalGap;

    // Round 3: Deliberation
    nodes.push({
      id: 'round3',
      type: 'round',
      position: { x: xCenter - 100, y: yPos },
      data: {
        label: 'Round 3: Deliberation',
        items: ['Sequential responses', 'Can reference others\' points'],
      },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    });
    edges.push({
      id: 'round2-round3',
      source: 'round2',
      target: 'round3',
      type: 'smoothstep',
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
    });
    yPos += verticalGap;

    // Calculate Consensus
    nodes.push({
      id: 'calculate-consensus',
      type: 'process',
      position: { x: xCenter - 100, y: yPos },
      data: { label: 'Calculate Consensus' },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    });
    edges.push({
      id: 'round3-consensus',
      source: 'round3',
      target: 'calculate-consensus',
      type: 'smoothstep',
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
    });
    yPos += verticalGap;

    // Decision: Consensus < 75%?
    nodes.push({
      id: 'consensus-check',
      type: 'decision',
      position: { x: xCenter - 60, y: yPos },
      data: { label: 'Consensus < 75%?' },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    });
    edges.push({
      id: 'calc-check',
      source: 'calculate-consensus',
      target: 'consensus-check',
      type: 'smoothstep',
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
    });

    // Yes path: Formal Vote
    nodes.push({
      id: 'formal-vote',
      type: 'process',
      position: { x: xCenter - 300, y: yPos + 100 },
      data: { label: 'Conduct Formal Vote' },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    });
    edges.push({
      id: 'check-vote-yes',
      source: 'consensus-check',
      target: 'formal-vote',
      type: 'smoothstep',
      label: 'Yes',
      labelStyle: { fill: '#ef4444', fontWeight: 600 },
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
    });

    // No path: Skip vote (merge point)
    const mergeY = yPos + 100;
    nodes.push({
      id: 'merge-point',
      type: 'process',
      position: { x: xCenter + 100, y: mergeY },
      data: { label: 'Skip Vote' },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    });
    edges.push({
      id: 'check-vote-no',
      source: 'consensus-check',
      target: 'merge-point',
      type: 'smoothstep',
      label: 'No',
      labelStyle: { fill: '#22c55e', fontWeight: 600 },
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
    });

    // Connect vote to merge point
    edges.push({
      id: 'vote-merge',
      source: 'formal-vote',
      target: 'merge-point',
      type: 'smoothstep',
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
    });

    // Round 4: Closing Statements
    nodes.push({
      id: 'round4',
      type: 'round',
      position: { x: xCenter - 100, y: mergeY + 100 },
      data: {
        label: 'Round 4: Closing Statements',
        items: ['Final positions (1-2 min)', 'Confidence levels stated'],
      },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    });
    edges.push({
      id: 'merge-round4',
      source: 'merge-point',
      target: 'round4',
      type: 'smoothstep',
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
    });

    // Generate Formal Minutes
    nodes.push({
      id: 'generate-minutes',
      type: 'process',
      position: { x: xCenter - 100, y: mergeY + 200 },
      data: { label: 'Generate Formal Minutes' },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    });
    edges.push({
      id: 'round4-minutes',
      source: 'round4',
      target: 'generate-minutes',
      type: 'smoothstep',
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
    });

    // Decision: More agenda items?
    nodes.push({
      id: 'more-items',
      type: 'decision',
      position: { x: xCenter - 60, y: mergeY + 300 },
      data: { label: 'More agenda items?' },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    });
    edges.push({
      id: 'minutes-more',
      source: 'generate-minutes',
      target: 'more-items',
      type: 'smoothstep',
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
    });

    // Loop back
    edges.push({
      id: 'loop-back',
      source: 'more-items',
      target: 'loop-start',
      type: 'smoothstep',
      label: 'Yes → Loop',
      labelStyle: { fill: '#3b82f6', fontWeight: 600 },
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: '#3b82f6', strokeWidth: 2 },
    });

    // END
    nodes.push({
      id: 'end',
      type: 'end',
      position: { x: xCenter - 100, y: mergeY + 400 },
      data: { label: 'END' },
      sourcePosition: Position.Top,
      targetPosition: Position.Top,
    });
    edges.push({
      id: 'more-end',
      source: 'more-items',
      target: 'end',
      type: 'smoothstep',
      label: 'No',
      labelStyle: { fill: '#22c55e', fontWeight: 600 },
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
    });

    return { nodes, edges };
  }, []);

  return (
    <Card className="border-2 border-stone-200">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Structured Panel Workflow</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="w-full h-[800px] bg-gradient-to-br from-slate-900 to-gray-900">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            connectionLineType={ConnectionLineType.SmoothStep}
            minZoom={0.2}
            maxZoom={1.5}
            defaultViewport={{ x: 0, y: 0, zoom: 0.6 }}
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#374151" gap={20} size={1} />
            <Controls
              showZoom
              showFitView
              showInteractive
              position="top-left"
              className="!bg-stone-800 !border-2 !border-stone-600 !rounded-xl !shadow-lg"
            />
            <MiniMap
              nodeColor={(node) => {
                if (node.type === 'start') return '#22c55e';
                if (node.type === 'end') return '#ef4444';
                if (node.type === 'decision') return '#f59e0b';
                if (node.type === 'round') return '#a855f7';
                return '#3b82f6';
              }}
              maskColor="rgba(0, 0, 0, 0.6)"
              className="!bg-stone-800 !border-2 !border-stone-600 !rounded-xl !shadow-lg"
              position="bottom-right"
              pannable
              zoomable
            />
            <Panel position="top-right" className="!m-4 !flex !flex-col !gap-2">
              <div className="!bg-stone-800 !text-white !p-3 !rounded-lg !shadow-lg">
                <div className="text-sm font-semibold">{panelName} Workflow</div>
              </div>
              <Button
                onClick={() => setShowTestModal(true)}
                className="!bg-green-600 hover:!bg-green-700 !text-white"
                size="sm"
              >
                <Play className="w-4 h-4 mr-2" />
                Test Workflow
              </Button>
            </Panel>
          </ReactFlow>
        </div>
      </CardContent>
      
      {/* Test Modal with Streaming */}
      <Dialog open={showTestModal} onOpenChange={(open) => {
        setShowTestModal(open);
        if (!open) {
          setHasStarted(false);
          setTestQuestion('');
        }
      }}>
        <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle>Test {panelName} Workflow</DialogTitle>
            <DialogDescription>
              Enter a question to test the workflow with streaming debate
            </DialogDescription>
          </DialogHeader>
          {!hasStarted ? (
            <div className="flex-1 p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="test-question">Question</Label>
                <Input
                  id="test-question"
                  placeholder="e.g., How can we improve patient outcomes?"
                  value={testQuestion}
                  onChange={(e) => setTestQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && testQuestion.trim()) {
                      setHasStarted(true);
                    }
                  }}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    if (testQuestion.trim()) {
                      setHasStarted(true);
                    }
                  }}
                  disabled={!testQuestion.trim() || agentIds.length === 0}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Test
                </Button>
                <Button variant="outline" onClick={() => setShowTestModal(false)}>
                  Cancel
                </Button>
              </div>
              {agentIds.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  ⚠️ No agents selected. Please add agents to the panel first.
                </p>
              )}
            </div>
          ) : (
            <div className="flex-1 overflow-hidden">
              <StreamingPanelConsultation
                question={testQuestion}
                panelId={panelId}
                expertIds={agentIds}
                tenantId={tenantId}
                enableDebate={true}
                maxRounds={3}
                onComplete={(messages) => {
                  console.log('✅ Panel consultation completed', messages);
                }}
                onError={(error) => {
                  console.error('❌ Panel consultation error:', error);
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}


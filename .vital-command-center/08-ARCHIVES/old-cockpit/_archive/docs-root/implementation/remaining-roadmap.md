# Remaining Implementation Roadmap
## Virtual Advisory Board - Phase 2 Integration

**Status:** 6/11 tasks complete (55%) - Core services ready, integration pending

---

## 🎯 Overview

All core services are **production-ready**. Remaining work is **UI/API integration** to expose the services through user interfaces and API endpoints.

---

## 📋 Task 1: Wire Orchestration Modes into Existing API

### **Goal:** Integrate PersonaAgentRunner parallel/sequential modes into `/api/panel/orchestrate`

### **Files to Modify:**
- `src/app/api/panel/orchestrate/route.ts`

### **Implementation:**

```typescript
// src/app/api/panel/orchestrate/route.ts
import { personaAgentRunner } from '@/lib/services/persona-agent-runner';
import { synthesisComposer } from '@/lib/services/synthesis-composer';
import { policyGuard } from '@/lib/services/policy-guard';
import { evidencePackBuilder } from '@/lib/services/evidence-pack-builder';

export async function POST(request: Request) {
  const { message, panelMembers, mode = 'parallel' } = await request.json();

  // 1. Build evidence pack
  const evidencePack = await evidencePackBuilder.createPack({
    name: `Session ${Date.now()}`,
    agenda: [message]
  });

  // 2. Build evidence summary
  const evidenceSummary = evidencePackBuilder.buildEvidenceSummary(
    evidencePack.sources,
    'panel'
  );

  // 3. Extract persona names
  const personas = panelMembers.map(m => m.agent.name);

  // 4. Run orchestration based on mode
  let replies;
  if (mode === 'parallel') {
    replies = await personaAgentRunner.runParallel(
      personas,
      message,
      evidenceSummary
    );
  } else if (mode === 'sequential') {
    replies = await personaAgentRunner.runSequential(
      personas,
      message,
      evidenceSummary
    );
  }

  // 5. Run policy guard on all replies
  for (const reply of replies) {
    const policyCheck = await policyGuard.check(reply.answer);
    if (policyCheck.action === 'block') {
      throw new Error(`Policy violation: ${policyCheck.notes}`);
    }
    if (policyCheck.action === 'warn') {
      reply.flags.push(...policyCheck.riskTags);
    }
  }

  // 6. Generate synthesis
  const synthesis = await synthesisComposer.compose(replies, message);

  // 7. Save to database
  const { data: session } = await supabase
    .from('board_session')
    .insert({
      name: `Panel Session ${Date.now()}`,
      archetype: 'SAB',
      fusion_model: 'symbiotic',
      mode,
      agenda: [message],
      evidence_pack_id: evidencePack.id,
      status: 'active'
    })
    .select()
    .single();

  // Save replies
  await supabase.from('board_reply').insert(
    replies.map((r, i) => ({
      session_id: session.id,
      turn_no: 1,
      persona: r.persona,
      agent_id: r.agentId,
      answer: r.answer,
      citations: r.citations,
      confidence: r.confidence,
      flags: r.flags
    }))
  );

  // Save synthesis
  await supabase.from('board_synthesis').insert({
    session_id: session.id,
    turn_no: 1,
    summary_md: synthesis.summaryMd,
    consensus: synthesis.consensus,
    dissent: synthesis.dissent,
    risks: synthesis.risks,
    approved: !synthesis.humanGateRequired
  });

  return Response.json({
    sessionId: session.id,
    synthesis,
    replies,
    humanGateRequired: synthesis.humanGateRequired
  });
}
```

### **Testing:**
```bash
curl -X POST http://localhost:3000/api/panel/orchestrate \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is the optimal endpoint for psoriasis trial?",
    "panelMembers": [{"agent": {"name": "KOL"}}],
    "mode": "parallel"
  }'
```

**Time Estimate:** 2-3 hours

---

## 📋 Task 2: Add HITL Approval UI

### **Goal:** Create UI for human review and approval of synthesis

### **Files to Create:**
- `src/app/(app)/ask-panel/components/SynthesisReview.tsx`
- `src/app/api/panels/[id]/approve/route.ts`
- `src/app/api/panels/[id]/redo/route.ts`

### **Component Implementation:**

```typescript
// src/app/(app)/ask-panel/components/SynthesisReview.tsx
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface SynthesisReviewProps {
  sessionId: string;
  synthesis: {
    summaryMd: string;
    consensus: string;
    dissent: string;
    risks: Array<{risk: string; assumption: string}>;
    humanGateRequired: boolean;
  };
  onApprove: () => void;
  onReject: (notes: string) => void;
}

export function SynthesisReview({
  sessionId,
  synthesis,
  onApprove,
  onReject
}: SynthesisReviewProps) {
  const [rejectionNotes, setRejectionNotes] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  const handleApprove = async () => {
    await fetch(`/api/panels/${sessionId}/approve`, {
      method: 'POST'
    });
    onApprove();
  };

  const handleReject = async () => {
    await fetch(`/api/panels/${sessionId}/redo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes: rejectionNotes })
    });
    onReject(rejectionNotes);
    setShowRejectForm(false);
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Panel Synthesis</CardTitle>
          {synthesis.humanGateRequired && (
            <Badge variant="destructive">
              <AlertTriangle className="w-4 h-4 mr-1" />
              Human Review Required
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <div>
          <h3 className="font-semibold mb-2">Executive Summary</h3>
          <div className="prose prose-sm">
            <ReactMarkdown>{synthesis.summaryMd}</ReactMarkdown>
          </div>
        </div>

        {/* Consensus */}
        <div>
          <h3 className="font-semibold mb-2 flex items-center">
            <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
            Consensus
          </h3>
          <p className="text-sm text-gray-700">{synthesis.consensus}</p>
        </div>

        {/* Dissent */}
        <div>
          <h3 className="font-semibold mb-2 flex items-center">
            <XCircle className="w-4 h-4 mr-2 text-red-600" />
            Disagreements
          </h3>
          <p className="text-sm text-gray-700">{synthesis.dissent}</p>
        </div>

        {/* Risks */}
        {synthesis.risks.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2 text-orange-600" />
              Risks & Assumptions
            </h3>
            <ul className="text-sm space-y-1">
              {synthesis.risks.map((r, i) => (
                <li key={i} className="text-gray-700">
                  • {r.risk} - {r.assumption}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            onClick={handleApprove}
            className="flex-1"
            variant="default"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Approve Synthesis
          </Button>

          {!showRejectForm ? (
            <Button
              onClick={() => setShowRejectForm(true)}
              className="flex-1"
              variant="outline"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Request Redo
            </Button>
          ) : (
            <div className="flex-1 space-y-2">
              <Textarea
                value={rejectionNotes}
                onChange={(e) => setRejectionNotes(e.target.value)}
                placeholder="Why are you rejecting? What should be changed?"
                rows={3}
              />
              <div className="flex gap-2">
                <Button onClick={handleReject} size="sm">Submit</Button>
                <Button
                  onClick={() => setShowRejectForm(false)}
                  variant="ghost"
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

### **API Routes:**

```typescript
// src/app/api/panels/[id]/approve/route.ts
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { data } = await supabase
    .from('board_synthesis')
    .update({
      approved: true,
      approved_at: new Date().toISOString()
    })
    .eq('session_id', params.id);

  return Response.json({ success: true });
}

// src/app/api/panels/[id]/redo/route.ts
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { notes } = await request.json();

  // Mark synthesis as rejected
  await supabase
    .from('board_synthesis')
    .update({ approved: false })
    .eq('session_id', params.id);

  // Create redo request (could add to a new table)
  // For now, just return success
  return Response.json({ success: true, notes });
}
```

**Time Estimate:** 3-4 hours

---

## 📋 Task 3: Build Panel History Page

### **Goal:** Browse and reuse previous panel sessions

### **Files to Create:**
- `src/app/(app)/panels/history/page.tsx`
- `src/app/api/panels/route.ts`
- `src/app/api/panels/[id]/route.ts`

### **Implementation:**

```typescript
// src/app/(app)/panels/history/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

export default function PanelHistoryPage() {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    fetch('/api/panels')
      .then(res => res.json())
      .then(setSessions);
  }, []);

  const handleReuse = async (sessionId: string) => {
    const res = await fetch(`/api/panels/${sessionId}/reuse`, {
      method: 'POST'
    });
    const newSession = await res.json();
    window.location.href = `/ask-panel?session=${newSession.id}`;
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Panel History</h1>

      <div className="grid gap-4">
        {sessions.map((session: any) => (
          <Card key={session.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold">{session.name}</h3>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline">{session.archetype}</Badge>
                  <Badge variant="outline">{session.mode}</Badge>
                  <Badge variant="outline">{session.fusion_model}</Badge>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {formatDistanceToNow(new Date(session.created_at))} ago
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.location.href = `/panels/${session.id}`}
                >
                  View
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleReuse(session.id)}
                >
                  Reuse
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// src/app/api/panels/route.ts
export async function GET() {
  const { data } = await supabase
    .from('board_session')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  return Response.json(data || []);
}

// src/app/api/panels/[id]/reuse/route.ts
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Clone session configuration
  const { data: original } = await supabase
    .from('board_session')
    .select('*')
    .eq('id', params.id)
    .single();

  const { data: newSession } = await supabase
    .from('board_session')
    .insert({
      name: `${original.name} (Copy)`,
      archetype: original.archetype,
      fusion_model: original.fusion_model,
      mode: original.mode,
      agenda: original.agenda,
      status: 'draft'
    })
    .select()
    .single();

  return Response.json(newSession);
}
```

**Time Estimate:** 2-3 hours

---

## 📋 Task 4: Create Streaming Chat Interface

### **Goal:** Real-time expert response display

### **Files to Create:**
- `src/app/(app)/ask-panel/components/StreamingPanel.tsx`

### **Implementation:**

```typescript
// src/app/(app)/ask-panel/components/StreamingPanel.tsx
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

interface ExpertResponse {
  persona: string;
  answer: string;
  confidence: number;
  streaming: boolean;
}

export function StreamingPanel({ sessionId }: { sessionId: string }) {
  const [responses, setResponses] = useState<ExpertResponse[]>([]);

  // Simulate streaming (in production, use Server-Sent Events)
  const streamResponse = (persona: string) => {
    const fullAnswer = "Based on evidence...";
    let currentText = "";

    const interval = setInterval(() => {
      currentText += fullAnswer[currentText.length];
      setResponses(prev => prev.map(r =>
        r.persona === persona
          ? { ...r, answer: currentText }
          : r
      ));

      if (currentText === fullAnswer) {
        clearInterval(interval);
        setResponses(prev => prev.map(r =>
          r.persona === persona
            ? { ...r, streaming: false }
            : r
        ));
      }
    }, 50);
  };

  return (
    <div className="space-y-4">
      {responses.map((response) => (
        <Card key={response.persona} className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Badge>{response.persona}</Badge>
            {response.streaming && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            {!response.streaming && (
              <span className="text-sm text-gray-500">
                Confidence: {(response.confidence * 100).toFixed(0)}%
              </span>
            )}
          </div>
          <p className="text-sm">{response.answer}</p>
        </Card>
      ))}
    </div>
  );
}
```

**Time Estimate:** 3-4 hours

---

## 📋 Task 5: Integrate LangGraph for Dynamic Orchestration

### **Goal:** Add dynamic mode switching based on panel state

### **Files to Create:**
- `src/lib/services/dynamic-controller.ts`

### **Implementation:**

```typescript
// src/lib/services/dynamic-controller.ts
import { AgentReply } from './persona-agent-runner';

export class DynamicController {
  /**
   * Analyze panel state and determine next orchestration mode
   */
  async selectMode(replies: AgentReply[]): Promise<'parallel' | 'sequential' | 'debate'> {
    const metrics = this.diagnoseState(replies);

    // High disagreement → debate mode
    if (metrics.disagreement > 0.6) {
      return 'debate';
    }

    // High uncertainty → sequential for deeper exploration
    if (metrics.uncertainty > 0.5) {
      return 'sequential';
    }

    // Default to parallel
    return 'parallel';
  }

  private diagnoseState(replies: AgentReply[]) {
    // Calculate disagreement (variance in confidence scores)
    const confidences = replies.map(r => r.confidence);
    const avgConfidence = confidences.reduce((a, b) => a + b) / confidences.length;
    const variance = confidences.reduce((sum, c) => sum + Math.pow(c - avgConfidence, 2), 0) / confidences.length;

    const disagreement = Math.sqrt(variance);
    const uncertainty = 1 - avgConfidence;

    return { disagreement, uncertainty };
  }
}
```

**Time Estimate:** 2-3 hours

---

## 📊 Total Time Estimate: 15-20 hours

## ✅ Completion Checklist

- [ ] Task 1: Wire orchestration modes (2-3h)
- [ ] Task 2: HITL approval UI (3-4h)
- [ ] Task 3: Panel history page (2-3h)
- [ ] Task 4: Streaming chat (3-4h)
- [ ] Task 5: Dynamic controller (2-3h)
- [ ] Integration testing
- [ ] Documentation updates

---

## 🚀 Deployment Notes

Once complete, the system will support:
- ✅ Full panel lifecycle (create → consult → review → approve)
- ✅ Citation-enforced responses
- ✅ GDPR/PHI compliance
- ✅ Evidence-based recommendations
- ✅ Human oversight workflows
- ✅ Panel history and reuse
- ✅ Dynamic orchestration

This represents a **production-ready virtual advisory board platform** for pharmaceutical and life sciences organizations.

'use client';

import { useEffect, useState } from 'react';
import { useMissionStream } from '@/features/ask-expert/hooks/useMissionStream';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
}

export default function MissionsPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | undefined>();
  const [goal, setGoal] = useState('');
  const [mode, setMode] = useState<'3' | '4'>('3');
  const [missionId, setMissionId] = useState<string | null>(null);
  const [streamUrl, setStreamUrl] = useState<string | undefined>();
  const { events } = useMissionStream(streamUrl);

  useEffect(() => {
    fetch('/api/v1/templates')
      .then((res) => res.json())
      .then((data: Template[]) => setTemplates(data))
      .catch(() => setTemplates([]));
  }, []);

  const startMission = async () => {
    if (!goal || !selectedTemplate) return;
    const payload = {
      mode: Number(mode),
      goal,
      template_id: selectedTemplate,
      // Mode 3 requires expert_id; placeholder null for now (frontend to supply real)
      expert_id: mode === '3' ? 'expert-required' : undefined,
      user_context: {},
    };
    const res = await fetch('/api/v1/missions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-tenant-id': 'demo-tenant' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return;
    const data = await res.json();
    setMissionId(data.mission_id);
    setStreamUrl(data.stream_url);
  };

  return (
    <div className="space-y-4 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Launch Mission (Modes 3/4)</CardTitle>
          <CardDescription>Mode 3 and Mode 4 share the same flow; only selection differs.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-2">
              <div className="text-sm font-medium">Mode</div>
              <Select value={mode} onValueChange={(v) => setMode(v as '3' | '4')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">Mode 3 (Manual Autonomous)</SelectItem>
                  <SelectItem value="4">Mode 4 (Auto Autonomous)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Template</div>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((tpl) => (
                    <SelectItem key={tpl.id} value={tpl.id}>
                      {tpl.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Goal</div>
              <Input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Describe the mission goal" />
            </div>
          </div>
          <Button onClick={startMission} disabled={!goal || !selectedTemplate}>
            Start Mission
          </Button>
        </CardContent>
      </Card>

      {missionId && (
        <Card>
          <CardHeader>
            <CardTitle>Stream</CardTitle>
            <CardDescription>Mission ID: {missionId}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground mb-2">Events</div>
            <pre className="bg-muted rounded p-3 text-xs overflow-x-auto">
              {JSON.stringify(events, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TemplateGallery, type TemplateItem } from '@/components/missions';

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<TemplateItem[]>([]);

  useEffect(() => {
    fetch('/api/v1/templates')
      .then((res) => res.json())
      .then((data: TemplateItem[]) => setTemplates(data))
      .catch(() => setTemplates([]));
  }, []);

  const handleSelect = async (templateId: string) => {
    const res = await fetch('/api/v1/missions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-tenant-id': 'demo-tenant' },
      body: JSON.stringify({
        mode: 3,
        template_id: templateId,
        goal: '',
        agent_id: 'agent-required', // placeholder; real agent selection to be added
        user_context: {},
      }),
    });
    if (!res.ok) return;
    const mission = await res.json();
    const missionId = mission.mission_id || mission.id;
    router.push(`/ask-expert/missions/${missionId}`);
  };

  return (
    <div className="p-6 space-y-4">
      <TemplateGallery templates={templates} onSelect={handleSelect} />
    </div>
  );
}

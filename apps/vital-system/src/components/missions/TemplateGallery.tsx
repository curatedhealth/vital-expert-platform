'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface TemplateItem {
  id: string;
  name: string;
  category: string;
  description?: string;
  complexity?: string;
}

export interface TemplateGalleryProps {
  templates: TemplateItem[];
  onSelect: (templateId: string) => void;
  showSearch?: boolean;
  searchPlaceholder?: string;
}

export function TemplateGallery({
  templates,
  onSelect,
  showSearch = true,
  searchPlaceholder = 'Search missions (e.g., Deep Dive)...',
}: TemplateGalleryProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(
    () =>
      templates.filter((t) =>
        `${t.name} ${t.category} ${t.description ?? ''} ${t.complexity ?? ''}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [templates, search]
  );

  return (
    <div className="space-y-4">
      {showSearch && (
        <div className="flex items-center gap-3">
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((tpl) => (
          <Card key={tpl.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{tpl.name}</CardTitle>
              <CardDescription className="capitalize">{tpl.category}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between gap-3">
              <p className="text-sm text-muted-foreground">{tpl.description}</p>
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">{tpl.complexity ?? ''}</div>
                <Button variant="secondary" onClick={() => onSelect(tpl.id)}>
                  Use this template
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="text-sm text-muted-foreground">No templates match your search.</div>
        )}
      </div>
    </div>
  );
}

export default TemplateGallery;

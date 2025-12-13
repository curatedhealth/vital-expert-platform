'use client';

/**
 * PersonaDepartmentView - VITAL Brand Guidelines v6.0
 *
 * Groups personas by department for organizational view
 * Extracted from personas/page.tsx for maintainability
 */

import React, { useMemo } from 'react';
import { Badge } from '@vital/ui';
import { Building2 } from 'lucide-react';
import { PersonaCard, type Persona } from '@/components/personas';

interface OrgDepartment {
  id: string;
  name: string;
  department_code?: string;
}

interface PersonaDepartmentViewProps {
  personas: Persona[];
  allDepartments: OrgDepartment[];
  onPersonaClick: (persona: Persona) => void;
}

export function PersonaDepartmentView({ personas, allDepartments, onPersonaClick }: PersonaDepartmentViewProps) {
  // Get departments for grouping
  const departments = useMemo(() => {
    if (allDepartments.length > 0) {
      const personaDeptIds = new Set(personas.map(p => p.department_id).filter(Boolean));
      const withPersonas = allDepartments
        .filter(d => personaDeptIds.has(d.id))
        .map(d => ({ id: d.id, name: d.name || d.department_code || 'Unknown', slug: d.department_code || d.id }));
      const withoutPersonas = allDepartments
        .filter(d => !personaDeptIds.has(d.id))
        .map(d => ({ id: d.id, name: d.name || d.department_code || 'Unknown', slug: d.department_code || d.id }));
      return [...withPersonas, ...withoutPersonas];
    }
    const deptSlugs = new Set(personas.map(p => p.department_slug).filter(Boolean));
    return Array.from(deptSlugs).map(slug => ({ id: slug as string, name: slug as string, slug: slug as string }));
  }, [allDepartments, personas]);

  return (
    <div className="space-y-8">
      {departments.map(dept => {
        const deptPersonas = personas.filter(p =>
          p.department_id === dept.id || p.department_slug === dept.slug
        );

        return (
          <div key={dept.id || dept.slug}>
            <div className="flex items-center gap-3 mb-4">
              <Building2 className="h-6 w-6" />
              <h2 className="text-2xl font-bold">{dept.name}</h2>
              <Badge variant={deptPersonas.length > 0 ? "default" : "secondary"}>
                {deptPersonas.length}
              </Badge>
            </div>
            {deptPersonas.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {deptPersonas.map((persona) => (
                  <PersonaCard
                    key={persona.id}
                    persona={persona}
                    compact
                    onClick={onPersonaClick}
                  />
                ))}
              </div>
            ) : (
              <div className="text-sm text-neutral-500 italic py-4">
                No personas in this department
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

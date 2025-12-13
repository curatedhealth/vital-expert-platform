'use client';

/**
 * Personas Management Component
 * Super Admin tool for managing user personas
 */

import React, { useState, useEffect } from 'react';
import {
  User,
  Plus,
  RefreshCw,
  Search,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@vital/ui';
import { Button } from '@vital/ui';
import { Input } from '@vital/ui';
import { Badge } from '@vital/ui';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@vital/ui';
import { createClient } from '@/lib/supabase/client';

interface Persona {
  id: string;
  code: string;
  name: string;
  unique_id: string;
  expertise_level: string | null;
  years_experience: number | null;
  department: string | null;
  category_code: string | null;
  created_at: string;
}

export function PersonasManagement() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const supabase = createClient();

  const fetchPersonas = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('dh_persona')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setPersonas(data || []);
    } catch (error) {
      console.error('Error fetching personas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonas();
  }, []);

  const filteredPersonas = personas.filter((persona) =>
    persona.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    persona.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (persona.department && persona.department.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const expertiseLevels = {
    junior: personas.filter(p => p.expertise_level === 'junior').length,
    mid: personas.filter(p => p.expertise_level === 'mid-level').length,
    senior: personas.filter(p => p.expertise_level === 'senior').length,
    expert: personas.filter(p => p.expertise_level === 'expert').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <User className="h-8 w-8" />
            Personas Management
          </h1>
          <p className="text-neutral-600 mt-1">
            Manage user personas and their characteristics
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Total Personas</div>
              <div className="text-2xl font-bold">{personas.length}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Junior</div>
              <div className="text-2xl font-bold">{expertiseLevels.junior}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Mid-Level</div>
              <div className="text-2xl font-bold">{expertiseLevels.mid}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Senior</div>
              <div className="text-2xl font-bold">{expertiseLevels.senior}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Expert</div>
              <div className="text-2xl font-bold">{expertiseLevels.expert}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>User Personas</CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  placeholder="Search personas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" size="sm" onClick={fetchPersonas}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Expertise</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPersonas.map((persona) => (
                <TableRow key={persona.id}>
                  <TableCell className="font-medium">{persona.name}</TableCell>
                  <TableCell>
                    <code className="text-sm bg-neutral-100 px-2 py-1 rounded">
                      {persona.code}
                    </code>
                  </TableCell>
                  <TableCell>{persona.department || '-'}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {persona.expertise_level || 'Unknown'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {persona.years_experience ? `${persona.years_experience} yrs` : '-'}
                  </TableCell>
                  <TableCell>{persona.category_code || '-'}</TableCell>
                  <TableCell>
                    {new Date(persona.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}


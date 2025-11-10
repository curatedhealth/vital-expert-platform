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
  name: string;
  description: string | null;
  title: string | null;
  expertise: string[] | null;
  specialties: string[] | null;
  category: string | null;
  agent_category: string | null;
  is_active: boolean;
  created_at: string;
  // Additional fields from schema
  slug: string | null;
  background: string | null;
  personality_traits: string[] | null;
  communication_style: string | null;
  capabilities: string[] | null;
  avatar_url: string | null;
}

export function PersonasManagement() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const supabase = createClient();

  const fetchPersonas = async () => {
    setLoading(true);
    try {
      const { data, error} = await supabase
        .from('personas')
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
    (persona.title && persona.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (persona.category && persona.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Group by category
  const categoryCounts = personas.reduce((acc, p) => {
    const cat = p.agent_category || p.category || 'uncategorized';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
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
          <p className="text-gray-600 mt-1">
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
            {topCategories.map(([category, count]) => (
              <div key={category}>
                <div className="text-sm text-muted-foreground truncate" title={category}>
                  {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </div>
                <div className="text-2xl font-bold">{count}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>User Personas</CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Expertise</TableHead>
                <TableHead>Specialties</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPersonas.map((persona) => (
                <TableRow key={persona.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {persona.avatar_url && (
                        <img
                          src={persona.avatar_url}
                          alt={persona.name}
                          className="h-8 w-8 rounded-full"
                        />
                      )}
                      <span>{persona.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{persona.title || '-'}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {persona.agent_category || persona.category || 'General'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {persona.expertise && persona.expertise.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {persona.expertise.slice(0, 2).map((exp, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {exp}
                          </Badge>
                        ))}
                        {persona.expertise.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{persona.expertise.length - 2}
                          </Badge>
                        )}
                      </div>
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    {persona.specialties && persona.specialties.length > 0
                      ? persona.specialties.slice(0, 2).join(', ')
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={persona.is_active ? 'default' : 'secondary'}>
                      {persona.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
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


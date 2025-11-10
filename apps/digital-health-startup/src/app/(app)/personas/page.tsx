'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Users,
  Search,
  Building2,
  Briefcase,
  Eye,
  Target,
  User,
  Stethoscope,
  FlaskConical,
  FileText,
  TrendingUp,
  Package,
  Shield,
  Lightbulb,
  Scale,
  DollarSign,
  HeartPulse,
  Activity,
  Microscope,
  Database,
  Cpu,
  Smartphone,
  GraduationCap,
} from 'lucide-react';

import { Badge } from '@vital/ui';
import { Button } from '@vital/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@vital/ui';
import { Input } from '@vital/ui';

interface Persona {
  id: string;
  name: string;
  title: string;
  persona_code?: string;
  code?: string;
  sector?: string;
  function?: string;
  tier?: number;
  priority_score?: number;
  organization?: string;
  responsibilities?: any[];
  pain_points?: any[];
  goals?: any[];
  source: string;
  source_label: string;
  industry?: {
    id: string;
    industry_name: string;
    industry_code: string;
  };
  primary_role?: {
    id: string;
    org_role: string;
    department?: {
      id: string;
      org_department: string;
      function?: {
        id: string;
        org_function: string;
      };
    };
  };
}

interface PersonaStats {
  total_personas: number;
  by_source: Record<string, number>;
  by_industry: Record<string, number>;
  by_function: Record<string, number>;
  by_tier: Record<string, number>;
}

const TIER_COLORS = {
  1: 'text-purple-700 bg-purple-100 border-purple-300',
  2: 'text-blue-700 bg-blue-100 border-blue-300',
  3: 'text-green-700 bg-green-100 border-green-300',
  4: 'text-yellow-700 bg-yellow-100 border-yellow-300',
  5: 'text-gray-700 bg-gray-100 border-gray-300',
};

export default function PersonasPage() {
  const searchParams = useSearchParams();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [stats, setStats] = useState<PersonaStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPersonas();
  }, [searchParams]);

  const fetchPersonas = async () => {
    setIsLoading(true);
    try {
      // Use search params from URL (set by sidebar)
      const params = new URLSearchParams(searchParams.toString());

      const response = await fetch(`/api/personas?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        console.log(`✅ Received ${data.data.personas?.length || 0} personas`);
        setPersonas(data.data.personas || []);
        setStats(data.data.stats || null);
      } else {
        console.error('❌ API returned error:', data.error);
      }
    } catch (error) {
      console.error('❌ Failed to fetch personas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPersonas = personas.filter((persona) => {
    if (searchQuery === '') return true;

    const searchLower = searchQuery.toLowerCase();
    return (
      persona.name.toLowerCase().includes(searchLower) ||
      persona.title.toLowerCase().includes(searchLower) ||
      (persona.persona_code || persona.code || '').toLowerCase().includes(searchLower)
    );
  });

  const handlePersonaClick = (personaId: string) => {
    window.location.href = `/personas/${personaId}`;
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Personas</h1>
              <p className="text-gray-600 mt-1">
                Browse and manage organizational personas and roles
              </p>
            </div>
          </div>

          {/* Statistics Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-gray-600 flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Total Personas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total_personas}</div>
                </CardContent>
              </Card>

              <Card className="border-2 border-blue-200 bg-blue-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-blue-800 flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    JTBD Library
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.by_source?.dh_personas || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Personas</p>
                </CardContent>
              </Card>

              <Card className="border-2 border-green-200 bg-green-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-green-800 flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    Organizational
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {stats.by_source?.org_personas || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Personas</p>
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-200 bg-purple-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-purple-800 flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    Functions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {Object.keys(stats.by_function || {}).length}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Search Bar */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search personas by name, title, or code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="mt-3 text-sm text-muted-foreground">
                Showing {filteredPersonas.length} of {personas.length} personas
              </div>
            </CardContent>
          </Card>

          {/* Personas Grid */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-muted-foreground">Loading personas...</p>
              </div>
            </div>
          ) : filteredPersonas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPersonas.map((persona) => (
                <PersonaCard
                  key={persona.id}
                  persona={persona}
                  onClick={() => handlePersonaClick(persona.id)}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No personas found</p>
                <p className="text-sm text-gray-500">
                  Try adjusting your filters in the sidebar
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// Persona Card Component
interface PersonaCardProps {
  persona: Persona;
  onClick: () => void;
}

function PersonaCard({ persona, onClick }: PersonaCardProps) {
  const tierColor = persona.tier
    ? TIER_COLORS[persona.tier as keyof typeof TIER_COLORS]
    : 'text-gray-700 bg-gray-100 border-gray-300';

  const getSourceBadgeColor = () => {
    if (persona.source === 'dh_personas') {
      return 'bg-blue-100 text-blue-800 border-blue-300';
    }
    return 'bg-green-100 text-green-800 border-green-300';
  };

  // Get function-based icon and color
  const getFunctionIcon = () => {
    const functionName = persona.primary_role?.department?.function?.org_function || persona.function || '';
    const lowerFunc = functionName.toLowerCase();

    // Medical Affairs - Stethoscope (Blue)
    if (lowerFunc.includes('medical affairs') || lowerFunc.includes('medical information')) {
      return { Icon: Stethoscope, gradient: 'from-blue-500 to-blue-600', color: 'bg-blue-500' };
    }
    // Clinical Development - FlaskConical (Teal)
    if (lowerFunc.includes('clinical')) {
      return { Icon: FlaskConical, gradient: 'from-teal-500 to-teal-600', color: 'bg-teal-500' };
    }
    // Regulatory - FileText (Purple)
    if (lowerFunc.includes('regulatory') || lowerFunc.includes('compliance')) {
      return { Icon: FileText, gradient: 'from-purple-500 to-purple-600', color: 'bg-purple-500' };
    }
    // Commercial - TrendingUp (Green)
    if (lowerFunc.includes('commercial') || lowerFunc.includes('market access')) {
      return { Icon: TrendingUp, gradient: 'from-green-500 to-green-600', color: 'bg-green-500' };
    }
    // Manufacturing - Package (Orange)
    if (lowerFunc.includes('manufacturing') || lowerFunc.includes('operations')) {
      return { Icon: Package, gradient: 'from-orange-500 to-orange-600', color: 'bg-orange-500' };
    }
    // Quality - Shield (Red)
    if (lowerFunc.includes('quality')) {
      return { Icon: Shield, gradient: 'from-red-500 to-red-600', color: 'bg-red-500' };
    }
    // R&D - Lightbulb (Yellow)
    if (lowerFunc.includes('research') || lowerFunc.includes('development')) {
      return { Icon: Lightbulb, gradient: 'from-yellow-500 to-yellow-600', color: 'bg-yellow-500' };
    }
    // Legal - Scale (Indigo)
    if (lowerFunc.includes('legal')) {
      return { Icon: Scale, gradient: 'from-indigo-500 to-indigo-600', color: 'bg-indigo-500' };
    }
    // Finance - DollarSign (Emerald)
    if (lowerFunc.includes('finance')) {
      return { Icon: DollarSign, gradient: 'from-emerald-500 to-emerald-600', color: 'bg-emerald-500' };
    }
    // HEOR - Activity (Pink)
    if (lowerFunc.includes('heor') || lowerFunc.includes('health economics')) {
      return { Icon: Activity, gradient: 'from-pink-500 to-pink-600', color: 'bg-pink-500' };
    }
    // Drug Safety/Pharmacovigilance - HeartPulse (Rose)
    if (lowerFunc.includes('safety') || lowerFunc.includes('pharmacovigilance')) {
      return { Icon: HeartPulse, gradient: 'from-rose-500 to-rose-600', color: 'bg-rose-500' };
    }
    // Data Science - Database (Cyan)
    if (lowerFunc.includes('data') || lowerFunc.includes('analytics')) {
      return { Icon: Database, gradient: 'from-cyan-500 to-cyan-600', color: 'bg-cyan-500' };
    }
    // IT/Digital - Cpu (Slate)
    if (lowerFunc.includes('it') || lowerFunc.includes('digital') || lowerFunc.includes('technology')) {
      return { Icon: Cpu, gradient: 'from-slate-500 to-slate-600', color: 'bg-slate-500' };
    }
    // Digital Health - Smartphone (Violet)
    if (lowerFunc.includes('innovation')) {
      return { Icon: Smartphone, gradient: 'from-violet-500 to-violet-600', color: 'bg-violet-500' };
    }
    // Medical Education - GraduationCap (Amber)
    if (lowerFunc.includes('education') || lowerFunc.includes('training')) {
      return { Icon: GraduationCap, gradient: 'from-amber-500 to-amber-600', color: 'bg-amber-500' };
    }
    // Default - User (Gray)
    return { Icon: User, gradient: 'from-gray-500 to-gray-600', color: 'bg-gray-500' };
  };

  const { Icon, gradient } = getFunctionIcon();

  return (
    <Card
      className="hover:shadow-lg transition-all cursor-pointer hover:border-blue-300"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-base leading-tight">{persona.name}</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">{persona.title}</p>
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {(persona.persona_code || persona.code) && (
            <Badge variant="outline" className="text-xs font-mono">
              {persona.persona_code || persona.code}
            </Badge>
          )}
          {persona.tier && (
            <Badge variant="outline" className={`text-xs ${tierColor}`}>
              Tier {persona.tier}
            </Badge>
          )}
          <Badge variant="outline" className={`text-xs ${getSourceBadgeColor()}`}>
            {persona.source === 'dh_personas' ? 'JTBD' : 'Org'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-2 text-sm mb-3">
          {persona.industry && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Building2 className="w-3 h-3" />
              <span>{persona.industry.industry_name}</span>
            </div>
          )}
          {persona.primary_role?.department?.function && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Briefcase className="w-3 h-3" />
              <span>{persona.primary_role.department.function.org_function}</span>
            </div>
          )}
          {persona.priority_score && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Target className="w-3 h-3" />
              <span>Priority: {persona.priority_score.toFixed(1)}/10</span>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        {(persona as any).jtbd_count !== undefined && (
          <div className="flex gap-2 mb-3">
            <Badge variant="secondary" className="text-xs">
              {(persona as any).jtbd_count} JTBDs
            </Badge>
            {Array.isArray(persona.pain_points) && persona.pain_points.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {persona.pain_points.length} Pain Points
              </Badge>
            )}
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        >
          <Eye className="w-4 h-4 mr-2" />
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}

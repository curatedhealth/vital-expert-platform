'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Briefcase,
  Building2,
  Target,
  Award,
} from 'lucide-react';
import type { PersonaStats } from './types';

interface PersonaStatsCardsProps {
  stats: PersonaStats;
}

export function PersonaStatsCards({ stats }: PersonaStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-gray-600">Total Personas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
        </CardContent>
      </Card>

      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-blue-800 flex items-center gap-1">
            <Briefcase className="h-3 w-3" />
            Roles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {stats.totalRoles ?? Object.keys(stats.byRole).length}
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-green-200 bg-green-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-green-800 flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            Departments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {stats.totalDepartments ?? Object.keys(stats.byDepartment).length}
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-purple-200 bg-purple-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-purple-800 flex items-center gap-1">
            <Target className="h-3 w-3" />
            Functions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            {stats.totalFunctions ?? Object.keys(stats.byFunction).length}
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-orange-200 bg-orange-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-orange-800 flex items-center gap-1">
            <Award className="h-3 w-3" />
            Seniority Levels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {Object.keys(stats.bySeniority).length}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


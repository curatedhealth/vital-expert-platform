'use client';

import { useState, useEffect } from 'react';
import { ArrowRight, Search, TrendingUp, Sparkles, Library, Layers } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@vital/ui';
import { Input } from '@vital/ui';
import { Badge } from '@vital/ui';
import { Button } from '@vital/ui';
import type { PromptSuite } from '@/types/prompts';

interface PromptDashboardProps {
  onSuiteClick: (suite: PromptSuite) => void;
}

export default function PromptDashboard({ onSuiteClick }: PromptDashboardProps) {
  const [suites, setSuites] = useState<PromptSuite[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSuites();
  }, []);

  const fetchSuites = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/prompts/suites');
      const data = await response.json();

      if (data.success) {
        setSuites(data.suites);
      }
    } catch (error) {
      console.error('Error fetching suites:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSuites = suites.filter(suite =>
    searchTerm === '' ||
    suite.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    suite.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    suite.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPrompts = suites.reduce((sum, suite) => sum + suite.statistics.totalPrompts, 0);
  const totalSubsuites = suites.reduce((sum, suite) => sum + suite.statistics.subsuites, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading PROMPTS™ Library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-12 text-white">
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="relative z-10">

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Library className="h-5 w-5 text-blue-200" />
                <span className="text-sm text-blue-200">Total Prompts</span>
              </div>
              <div className="text-3xl font-bold">{totalPrompts.toLocaleString()}</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Layers className="h-5 w-5 text-blue-200" />
                <span className="text-sm text-blue-200">Prompt Suites</span>
              </div>
              <div className="text-3xl font-bold">{suites.length}</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-5 w-5 text-blue-200" />
                <span className="text-sm text-blue-200">Sub-Suites</span>
              </div>
              <div className="text-3xl font-bold">{totalSubsuites}</div>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search prompt suites..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 py-6 text-lg bg-white/95 backdrop-blur-sm border-0 focus:ring-2 focus:ring-white/50"
            />
          </div>
        </div>
      </div>

      {/* Suites Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Prompt Suites</h2>
            <p className="text-gray-600 mt-1">
              Browse {filteredSuites.length} specialized prompt collections
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSuites.map((suite) => (
            <Card
              key={suite.id}
              className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-blue-400"
              onClick={() => onSuiteClick(suite)}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${suite.color} flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
                    {suite.name.charAt(0)}
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </div>

                <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                  {suite.name}
                </CardTitle>
                <CardDescription className="text-sm">
                  {suite.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Function Badge */}
                <div>
                  <Badge variant="secondary" className="text-xs">
                    {suite.function.replace(/_/g, ' ')}
                  </Badge>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-gray-900">
                      {suite.statistics.totalPrompts}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Prompts</div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-gray-900">
                      {suite.statistics.subsuites}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Sub-Suites</div>
                  </div>
                </div>

                {/* Explore Button */}
                <Button
                  variant="outline"
                  className="w-full group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-300 transition-colors"
                >
                  Explore Suite
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredSuites.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 text-lg">No suites found matching "{searchTerm}"</div>
          </div>
        )}
      </div>
    </div>
  );
}

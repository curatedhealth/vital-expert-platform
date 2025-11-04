'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Star } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Prompt {
  id: string;
  name: string;
  display_name: string;
  description: string;
  domain: string;
  system_prompt: string;
  suite?: string;
  is_favorite?: boolean;
}

const PRISM_SUITES = [
  { name: 'RULES™', description: 'Regulatory Excellence', color: 'bg-blue-500' },
  { name: 'TRIALS™', description: 'Clinical Development', color: 'bg-indigo-500' },
  { name: 'GUARD™', description: 'Safety Framework', color: 'bg-red-500' },
  { name: 'VALUE™', description: 'Market Access', color: 'bg-green-500' },
  { name: 'BRIDGE™', description: 'Stakeholder Engagement', color: 'bg-cyan-500' },
  { name: 'PROOF™', description: 'Evidence Analytics', color: 'bg-teal-500' },
  { name: 'CRAFT™', description: 'Medical Writing', color: 'bg-orange-500' },
  { name: 'SCOUT™', description: 'Competitive Intelligence', color: 'bg-purple-500' },
  { name: 'PROJECT™', description: 'Project Management Excellence', color: 'bg-amber-500' },
  { name: 'FORGE™', description: 'Digital Health Development', color: 'bg-emerald-500' }
];

export default function PromptLibrary() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('RULES™');
  const { toast } = useToast();

  const fetchPrompts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/prompts');
      if (!response.ok) throw new Error('Failed to fetch prompts');
      const data = await response.json();
      setPrompts(data);
    } catch (error) {
      console.error('Error fetching prompts:', error);
      toast({
        title: "Error",
        description: "Failed to load prompts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrompts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copyPrompt = async (prompt: Prompt) => {
    try {
      await navigator.clipboard.writeText(prompt.system_prompt);
      toast({
        title: "Copied!",
        description: "Prompt copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy prompt",
        variant: "destructive",
      });
    }
  };

  const getPromptsForSuite = (suiteName: string) => {
    return prompts.filter(prompt => prompt.suite === suiteName);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading PRISM™ Library...</p>
          </div>
        </div>
      </div>
    );
  }

  const activeSuite = PRISM_SUITES.find(s => s.name === activeTab);
  const activePrompts = getPromptsForSuite(activeTab);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">PRISM™ Prompt Library</h1>
      <p className="text-gray-600 mb-8">
        Professional Regulatory Intelligence & Scientific Methodology
      </p>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex overflow-x-auto">
          {PRISM_SUITES.map(suite => {
            const count = getPromptsForSuite(suite.name).length;
            return (
              <button
                key={suite.name}
                onClick={() => setActiveTab(suite.name)}
                className={`
                  flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap
                  border-b-2 transition-colors
                  ${activeTab === suite.name
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <div className={`w-3 h-3 rounded ${suite.color}`}></div>
                <span>{suite.name}</span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Tab Content */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-4 h-4 rounded ${activeSuite?.color}`}></div>
          <h2 className="text-2xl font-semibold">{activeTab}</h2>
          <Badge variant="outline">{activeSuite?.description}</Badge>
        </div>

        {activePrompts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activePrompts.map(prompt => (
              <Card key={prompt.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-sm font-medium line-clamp-2">
                        {prompt.display_name}
                      </CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1"
                    >
                      <Star className={`h-4 w-4 ${prompt.is_favorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                    </Button>
                  </div>
                  <CardDescription className="text-xs line-clamp-2">
                    {prompt.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyPrompt(prompt)}
                      className="flex-1"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-16 border-2 border-dashed border-gray-200 rounded-lg">
            <p className="text-lg font-medium mb-2">No prompts in this suite yet</p>
            <p className="text-sm">Check back later for new {activeTab} prompts</p>
          </div>
        )}
      </div>
    </div>
  );
}

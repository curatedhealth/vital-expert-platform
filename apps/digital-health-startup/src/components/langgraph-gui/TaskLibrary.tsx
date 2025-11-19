// Icons are not used - tasks use emoji icons instead
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface TaskDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  config: {
    model?: string;
    temperature?: number;
    tools?: string[];
    systemPrompt?: string;
    agents?: string[];
    rags?: string[];
  };
}

// Pre-defined tasks library
export const TASK_DEFINITIONS: TaskDefinition[] = [
  {
    id: 'search_pubmed',
    name: 'Search PubMed',
    description: 'Search medical literature from PubMed database',
    icon: '🔬',
    category: 'Research',
    config: {
      model: 'gpt-4o-mini',
      temperature: 0.7,
      tools: ['pubmed'],
      systemPrompt: 'You are a medical research specialist. Search PubMed for relevant research papers.',
    },
  },
  {
    id: 'search_clinical_trials',
    name: 'Search Clinical Trials',
    description: 'Search for clinical trial data from ClinicalTrials.gov',
    icon: '🏥',
    category: 'Research',
    config: {
      model: 'gpt-4o-mini',
      temperature: 0.7,
      tools: ['clinical_trials'],
      systemPrompt: 'You are a clinical research specialist. Search ClinicalTrials.gov for trial information.',
    },
  },
  {
    id: 'fda_search',
    name: 'FDA Database Search',
    description: 'Search FDA databases for approvals and guidance',
    icon: '⚖️',
    category: 'Regulatory',
    config: {
      model: 'gpt-4o-mini',
      temperature: 0.7,
      tools: ['fda'],
      systemPrompt: 'You are a regulatory affairs specialist. Search FDA databases for official information.',
    },
  },
  {
    id: 'web_search',
    name: 'Web Search',
    description: 'Search the web for information',
    icon: '🌐',
    category: 'Research',
    config: {
      model: 'gpt-4o-mini',
      temperature: 0.7,
      tools: ['web_search'],
      systemPrompt: 'You are a research assistant. Search the web for relevant information.',
    },
  },
  {
    id: 'arxiv_search',
    name: 'Search arXiv',
    description: 'Search arXiv for academic papers',
    icon: '📚',
    category: 'Research',
    config: {
      model: 'gpt-4o-mini',
      temperature: 0.7,
      tools: ['arxiv'],
      systemPrompt: 'You are an academic research specialist. Search arXiv for relevant papers.',
    },
  },
  {
    id: 'rag_query',
    name: 'RAG Query',
    description: 'Query internal knowledge base using RAG',
    icon: '💾',
    category: 'Data',
    config: {
      model: 'gpt-4o-mini',
      temperature: 0.7,
      tools: ['rag'],
      systemPrompt: 'You are a knowledge base specialist. Query the RAG system for relevant information.',
    },
  },
  {
    id: 'data_extraction',
    name: 'Data Extraction',
    description: 'Extract structured data from documents',
    icon: '📄',
    category: 'Data',
    config: {
      model: 'gpt-4o',
      temperature: 0.3,
      tools: ['scraper'],
      systemPrompt: 'You are a data extraction specialist. Extract structured data from documents accurately.',
    },
  },
  {
    id: 'text_analysis',
    name: 'Text Analysis',
    description: 'Analyze and summarize text content',
    icon: '📊',
    category: 'Analysis',
    config: {
      model: 'gpt-4o',
      temperature: 0.5,
      tools: [],
      systemPrompt: 'You are a text analysis specialist. Analyze and summarize text content effectively.',
    },
  },
  // Control Flow
  {
    id: 'if_condition',
    name: 'If / Else',
    description: 'Branch execution based on a boolean condition',
    icon: '🔀',
    category: 'Control Flow',
    config: {
      model: 'gpt-4o-mini',
      temperature: 0.0,
      tools: [],
      systemPrompt: 'Evaluate a boolean condition and route execution to the true or false branch.',
    },
  },
  {
    id: 'switch_case',
    name: 'Switch',
    description: 'Route execution based on a value with multiple cases',
    icon: '⏭️',
    category: 'Control Flow',
    config: {
      model: 'gpt-4o-mini',
      temperature: 0.0,
      tools: [],
      systemPrompt: 'Evaluate a value and route execution based on matching case labels.',
    },
  },
  {
    id: 'loop_while',
    name: 'Loop (While)',
    description: 'Repeat tasks while a condition remains true',
    icon: '🔁',
    category: 'Control Flow',
    config: {
      model: 'gpt-4o-mini',
      temperature: 0.0,
      tools: [],
      systemPrompt: 'Repeat a body of work while a boolean condition is true. Include iteration cap for safety.',
    },
  },
  {
    id: 'for_each',
    name: 'For Each',
    description: 'Iterate over a list and run tasks per item',
    icon: '📦',
    category: 'Control Flow',
    config: {
      model: 'gpt-4o-mini',
      temperature: 0.0,
      tools: [],
      systemPrompt: 'Iterate over a collection and execute the inner tasks for each element.',
    },
  },
  {
    id: 'parallel',
    name: 'Parallel',
    description: 'Run multiple branches concurrently and join',
    icon: '⧉',
    category: 'Control Flow',
    config: {
      model: 'gpt-4o-mini',
      temperature: 0.0,
      tools: [],
      systemPrompt: 'Execute branches in parallel and join results when all complete.',
    },
  },
  {
    id: 'merge',
    name: 'Merge',
    description: 'Join multiple incoming branches into one',
    icon: '🔗',
    category: 'Control Flow',
    config: {
      model: 'gpt-4o-mini',
      temperature: 0.0,
      tools: [],
      systemPrompt: 'Merge the outputs of multiple upstream branches into a single downstream path.',
    },
  },
  // Panel Tasks
  {
    id: 'moderator',
    name: 'Moderator',
    description: 'AI moderator that facilitates panel discussion',
    icon: '🎤',
    category: 'Panel',
    config: {
      model: 'gpt-4o',
      temperature: 0.7,
      tools: [],
      systemPrompt: 'You are an AI moderator facilitating a structured expert panel discussion. Manage time, pose questions, synthesize inputs, and guide consensus building.',
    },
  },
  {
    id: 'expert_agent',
    name: 'Expert',
    description: 'Domain expert task for panel participation',
    icon: '👤',
    category: 'Panel',
    config: {
      model: 'gpt-4o',
      temperature: 0.7,
      tools: ['rag', 'pubmed', 'fda'],
      systemPrompt: 'You are a domain expert participating in a structured panel. Provide expert analysis, respond to moderator questions, and contribute to consensus building.',
    },
  },
  {
    id: 'opening_statements',
    name: 'Opening Statements',
    description: 'Sequential opening statements from all experts (60-90s each)',
    icon: '📢',
    category: 'Panel',
    config: {
      model: 'gpt-4o-mini',
      temperature: 0.0,
      tools: [],
      systemPrompt: 'Execute sequential opening statements from all expert agents. Each expert has 60-90 seconds to present their initial perspective.',
    },
  },
  {
    id: 'discussion_round',
    name: 'Discussion Round',
    description: 'Moderated discussion round with Q&A (3-4 minutes)',
    icon: '💬',
    category: 'Panel',
    config: {
      model: 'gpt-4o-mini',
      temperature: 0.0,
      tools: [],
      systemPrompt: 'Execute a moderated discussion round. Moderator poses questions, experts respond sequentially, building on each other\'s points.',
    },
  },
  {
    id: 'consensus_calculator',
    name: 'Consensus Calculator',
    description: 'Calculate consensus level and identify dissent',
    icon: '📊',
    category: 'Panel',
    config: {
      model: 'gpt-4o-mini',
      temperature: 0.0,
      tools: [],
      systemPrompt: 'Calculate consensus level from expert positions. Identify majority view, minority opinions, and overall agreement percentage.',
    },
  },
  {
    id: 'qna',
    name: 'Q&A Session',
    description: 'Question and answer session where moderator fields questions and experts respond',
    icon: '❓',
    category: 'Panel',
    config: {
      model: 'gpt-4o',
      temperature: 0.7,
      tools: [],
      systemPrompt: 'Facilitate a Q&A session. Field questions from participants, route them to appropriate experts, and ensure comprehensive answers.',
    },
  },
  {
    id: 'documentation_generator',
    name: 'Documentation Generator',
    description: 'Generate formal panel documentation and deliverables',
    icon: '📄',
    category: 'Panel',
    config: {
      model: 'gpt-4o',
      temperature: 0.5,
      tools: [],
      systemPrompt: 'Generate formal panel documentation: executive summary, consensus report, voting record, evidence appendix, and action items.',
    },
  },
  // Workflow Phase Nodes (Structured Panel)
  {
    id: 'initialize',
    name: 'Initialize Panel',
    description: 'Initialize panel workflow, extract tasks, and set up state',
    icon: '🚀',
    category: 'Panel Workflow',
    config: {
      model: 'gpt-4o-mini',
      temperature: 0.0,
      tools: [],
      systemPrompt: 'Initialize the panel workflow by extracting tasks from the workflow configuration and setting up the initial state.',
    },
  },
  {
    id: 'consensus_building',
    name: 'Consensus Building',
    description: 'Build consensus from expert positions and generate consensus statement',
    icon: '🤝',
    category: 'Panel Workflow',
    config: {
      model: 'gpt-4o',
      temperature: 0.3,
      tools: [],
      systemPrompt: 'Build consensus from expert positions. Calculate final consensus level, identify dissenting opinions, and generate a consensus statement.',
    },
  },
  {
    id: 'documentation',
    name: 'Documentation Phase',
    description: 'Generate final panel documentation and report',
    icon: '📋',
    category: 'Panel Workflow',
    config: {
      model: 'gpt-4o',
      temperature: 0.5,
      tools: [],
      systemPrompt: 'Generate comprehensive panel documentation including executive summary, consensus report, and action items.',
    },
  },
  // Workflow Phase Nodes (Open Panel)
  {
    id: 'opening_round',
    name: 'Opening Round',
    description: 'Initial perspectives from all experts in open panel format',
    icon: '🎯',
    category: 'Panel Workflow',
    config: {
      model: 'gpt-4o',
      temperature: 0.7,
      tools: [],
      systemPrompt: 'Facilitate opening round where experts provide initial, diverse perspectives on the topic.',
    },
  },
  {
    id: 'free_dialogue',
    name: 'Free Dialogue',
    description: 'Free-form collaborative discussion with idea building',
    icon: '💭',
    category: 'Panel Workflow',
    config: {
      model: 'gpt-4o',
      temperature: 0.8,
      tools: [],
      systemPrompt: 'Facilitate free-form dialogue where experts build on each other\'s ideas and explore innovative approaches.',
    },
  },
  {
    id: 'theme_clustering',
    name: 'Theme Clustering',
    description: 'Identify themes, innovation clusters, and convergence points',
    icon: '🔍',
    category: 'Panel Workflow',
    config: {
      model: 'gpt-4o',
      temperature: 0.5,
      tools: [],
      systemPrompt: 'Analyze the discussion to identify key themes, innovation clusters, convergence points, and divergence points.',
    },
  },
  {
    id: 'final_perspectives',
    name: 'Final Perspectives',
    description: 'Collect final perspectives from all experts',
    icon: '🎤',
    category: 'Panel Workflow',
    config: {
      model: 'gpt-4o',
      temperature: 0.7,
      tools: [],
      systemPrompt: 'Collect final perspectives from all experts, considering the identified themes and clusters.',
    },
  },
  {
    id: 'synthesis',
    name: 'Synthesis',
    description: 'Final synthesis and report generation for open panel',
    icon: '✨',
    category: 'Panel Workflow',
    config: {
      model: 'gpt-4o',
      temperature: 0.5,
      tools: [],
      systemPrompt: 'Generate final synthesis report combining all perspectives, themes, and innovation clusters from the open panel discussion.',
    },
  },
];

interface TaskLibraryProps {
  onTaskDragStart: (task: TaskDefinition, event: React.DragEvent) => void;
  onCreateTask?: () => void;
  onCombineTasks?: () => void;
}

export const TaskLibrary: React.FC<TaskLibraryProps> = ({ 
  onTaskDragStart, 
  onCreateTask, 
  onCombineTasks 
}) => {
  // Get custom tasks from localStorage
  const [customTasks, setCustomTasks] = React.useState<TaskDefinition[]>(() => {
    try {
      const stored = localStorage.getItem('custom_tasks');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Listen for storage changes to refresh custom tasks
  React.useEffect(() => {
    const handleStorageChange = () => {
      try {
        const stored = localStorage.getItem('custom_tasks');
        if (stored) {
          setCustomTasks(JSON.parse(stored));
        }
      } catch {
        // Ignore errors
      }
    };

    // Listen for storage events (when custom tasks are saved from other tabs)
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for custom event (when custom tasks are saved in same tab)
    window.addEventListener('customTasksUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('customTasksUpdated', handleStorageChange);
    };
  }, [customTasks]);

  // Combine predefined and custom tasks
  const allTasks = [...TASK_DEFINITIONS, ...customTasks];
  
  const tasksByCategory = allTasks.reduce((acc, task) => {
    if (!acc[task.category]) {
      acc[task.category] = [];
    }
    acc[task.category].push(task);
    return acc;
  }, {} as Record<string, TaskDefinition[]>);

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-2 border-b border-gray-200 space-y-2">
        <div>
          <h2 className="text-sm font-semibold">Task Library</h2>
          <p className="text-[10px] text-gray-500 mt-0.5">Drag to canvas</p>
        </div>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={onCreateTask}
            disabled={!onCreateTask}
            title="Create custom task"
            className="flex-1 h-7 text-xs px-2"
          >
            <span className="mr-1 text-xs">➕</span> Create
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onCombineTasks}
            disabled={!onCombineTasks}
            title="Combine multiple tasks"
            className="flex-1 h-7 text-xs px-2"
          >
            <span className="mr-1 text-xs">🔗</span> Combine
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-3">
        {Object.entries(tasksByCategory).map(([category, tasks]) => (
          <div key={category} className="space-y-1.5">
            <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{category}</h3>
            <div className="space-y-1.5">
              {tasks.map((task) => (
                <Card
                  key={task.id}
                  draggable
                  onDragStart={(e) => onTaskDragStart(task, e)}
                  className={cn(
                    "cursor-grab active:cursor-grabbing transition-all hover:shadow-sm"
                  )}
                  title={task.description}
                >
                  <CardContent className="p-2">
                    <div className="flex items-start gap-2">
                      <span className="text-lg flex-shrink-0">{task.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-xs text-gray-900 mb-0.5">{task.name}</div>
                        <div className="text-[10px] text-gray-600 line-clamp-1">{task.description}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


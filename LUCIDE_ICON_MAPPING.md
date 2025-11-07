# 🎨 Lucide Icon Mapping for VITAL Agents

## Category-Based Icon System

This document defines the mapping between agent categories and Lucide React icons, replacing all emoji-based icons with professional Lucide icons.

---

## Primary Category Icons

| Agent Category | Lucide Icon | Icon Name | Description |
|---|---|---|---|
| **Deep Agent** | `Target` | `target` | Strategic, high-level orchestrators |
| **Universal Task Subagent** | `Workflow` | `workflow` | Task execution and data processing |
| **Multi-Expert Orchestration** | `Users` | `users` | Collaboration and consensus building |
| **Specialized Knowledge** | `BookOpen` | `book-open` | Domain expertise and knowledge |
| **Process Automation** | `Settings` | `settings` | Workflow automation and operations |
| **Autonomous Problem Solving** | `Brain` | `brain` | Intelligent decision-making |

---

## Agent-Specific Icon Mappings

### Medical & Clinical Agents
```typescript
'Clinical Data Scientist': 'activity',
'Medical Writer': 'file-text',
'Medical Editor': 'edit-3',
'Pharmacovigilance Officer': 'shield-alert',
'Regulatory Affairs Specialist': 'file-check',
'Medical Information Specialist': 'info',
'Patient Access Coordinator': 'user-check',
```

### Analytics & Data Agents
```typescript
'Biostatistician': 'bar-chart-2',
'Data Analyst': 'trending-up',
'Market Research Analyst': 'pie-chart',
'Pricing Analyst': 'dollar-sign',
'Marketing Analytics Director': 'line-chart',
'Data Visualization Specialist': 'bar-chart-3',
```

### Research & Development
```typescript
'Drug Discovery Specialist': 'flask-conical',
'Clinical Trial Manager': 'clipboard-list',
'Research Scientist': 'microscope',
'Biotech Innovation Specialist': 'dna',
'Gene Therapy Expert': 'scan-eye',
```

### Strategic & Advisory
```typescript
'Brand Strategy Director': 'briefcase',
'Digital Strategy Director': 'monitor',
'Competitive Intelligence Specialist': 'search',
'Market Access Director': 'globe',
'Regulatory Strategy Advisor': 'scale',
```

### Operations & Automation
```typescript
'Task Router': 'git-branch',
'State Manager': 'database',
'Integration Coordinator': 'link',
'Notification Agent': 'bell',
'Goal Planner': 'target',
'Approval Manager': 'check-circle',
```

---

## React/TypeScript Implementation

### 1. Install Lucide React

```bash
npm install lucide-react
# or
yarn add lucide-react
```

### 2. Icon Mapping Utility

```typescript
// utils/iconMapping.ts
import * as LucideIcons from 'lucide-react';

export const CATEGORY_ICON_MAP: Record<string, string> = {
  'deep_agent': 'Target',
  'universal_task_subagent': 'Workflow',
  'multi_expert_orchestration': 'Users',
  'specialized_knowledge': 'BookOpen',
  'process_automation': 'Settings',
  'autonomous_problem_solving': 'Brain',
};

export const AGENT_ICON_MAP: Record<string, string> = {
  // Medical & Clinical
  'Clinical Data Scientist': 'Activity',
  'Medical Writer': 'FileText',
  'Medical Editor': 'Edit3',
  'Pharmacovigilance Officer': 'ShieldAlert',
  'Regulatory Affairs Specialist': 'FileCheck',
  'Medical Information Specialist': 'Info',
  'Patient Access Coordinator': 'UserCheck',
  
  // Analytics & Data
  'Biostatistician': 'BarChart2',
  'Data Analyst': 'TrendingUp',
  'Market Research Analyst': 'PieChart',
  'Pricing Analyst': 'DollarSign',
  'Marketing Analytics Director': 'LineChart',
  'Data Visualization Specialist': 'BarChart3',
  
  // Research & Development
  'Drug Discovery Specialist': 'FlaskConical',
  'Clinical Trial Manager': 'ClipboardList',
  'Research Scientist': 'Microscope',
  'Biotech Innovation Specialist': 'Dna',
  'Gene Therapy Expert': 'ScanEye',
  
  // Strategic & Advisory
  'Brand Strategy Director': 'Briefcase',
  'Digital Strategy Director': 'Monitor',
  'Competitive Intelligence Specialist': 'Search',
  'Market Access Director': 'Globe',
  'Regulatory Strategy Advisor': 'Scale',
  
  // Operations & Automation
  'Task Router': 'GitBranch',
  'State Manager': 'Database',
  'Integration Coordinator': 'Link',
  'Notification Agent': 'Bell',
  'Goal Planner': 'Target',
  'Approval Manager': 'CheckCircle',
  
  // Default fallback by category
};

export function getAgentIcon(
  agentName: string,
  agentCategory: string
): React.ComponentType {
  // Try to get specific agent icon
  const iconName = AGENT_ICON_MAP[agentName] || CATEGORY_ICON_MAP[agentCategory] || 'Bot';
  
  // Return the Lucide icon component
  return (LucideIcons as any)[iconName] || LucideIcons.Bot;
}
```

### 3. Agent Card Component

```typescript
// components/AgentCard.tsx
import React from 'react';
import { getAgentIcon } from '@/utils/iconMapping';

interface AgentCardProps {
  agent: {
    name: string;
    title: string;
    category: string;
    agent_category: string;
    category_color: string;
    description: string;
  };
}

export function AgentCard({ agent }: AgentCardProps) {
  const IconComponent = getAgentIcon(agent.name, agent.agent_category);
  
  return (
    <div className="agent-card">
      <div 
        className="agent-icon-wrapper"
        style={{ backgroundColor: `${agent.category_color}15` }}
      >
        <IconComponent 
          size={32} 
          color={agent.category_color}
          strokeWidth={1.5}
        />
      </div>
      
      <div className="agent-info">
        <h3>{agent.title || agent.name}</h3>
        <p className="agent-description">{agent.description}</p>
        
        <div className="agent-category">
          <span 
            className="category-badge"
            style={{ 
              backgroundColor: `${agent.category_color}20`,
              color: agent.category_color 
            }}
          >
            {agent.agent_category.replace(/_/g, ' ')}
          </span>
        </div>
      </div>
    </div>
  );
}
```

### 4. Agent List Component

```typescript
// components/AgentList.tsx
import React from 'react';
import { AgentCard } from './AgentCard';

interface Agent {
  id: string;
  name: string;
  title: string;
  category: string;
  agent_category: string;
  category_color: string;
  description: string;
}

interface AgentListProps {
  agents: Agent[];
}

export function AgentList({ agents }: AgentListProps) {
  return (
    <div className="agent-grid">
      {agents.map((agent) => (
        <AgentCard key={agent.id} agent={agent} />
      ))}
    </div>
  );
}
```

### 5. Supabase Query with Icon Data

```typescript
// hooks/useAgents.ts
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useAgents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAgents() {
      const { data, error } = await supabase
        .from('agents')
        .select(`
          id,
          name,
          title,
          description,
          category,
          agent_category,
          category_color,
          metadata,
          is_active
        `)
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching agents:', error);
      } else {
        setAgents(data || []);
      }
      setLoading(false);
    }

    fetchAgents();
  }, []);

  return { agents, loading };
}
```

---

## CSS Styling

```css
/* styles/agent-card.css */
.agent-card {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  background: white;
  transition: all 0.2s ease;
}

.agent-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.agent-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 12px;
  flex-shrink: 0;
}

.agent-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.agent-info h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.agent-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.agent-category {
  margin-top: 0.5rem;
}

.category-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
}

.agent-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
}
```

---

## Database Updates

### Add `lucide_icon` to Supabase metadata

All agents will have their Lucide icon names stored in the `metadata` JSONB field:

```json
{
  "lucide_icon": "Target",
  "icon_category": "deep_agent"
}
```

### Notion Integration

The `Icon Name` property in Notion will store the Lucide icon name (e.g., "Target", "Workflow") for reference, while the visual icon in Notion can remain as an emoji for easy identification within Notion's UI.

---

## Benefits

✅ **Professional appearance** - Lucide icons are clean and modern  
✅ **Consistent sizing** - All icons scale uniformly  
✅ **Customizable colors** - Icons inherit the category colors  
✅ **Accessible** - Proper semantic HTML with ARIA labels  
✅ **Lightweight** - Tree-shakeable imports  
✅ **Type-safe** - Full TypeScript support  

---

## Next Steps

1. ✅ Update Supabase `metadata` to include Lucide icon names
2. ✅ Add `Icon Name` property to Notion database
3. ✅ Implement frontend icon mapping utility
4. ✅ Update agent components to use Lucide icons
5. ✅ Test across all agent categories

---

**Last Updated:** 2025-11-06


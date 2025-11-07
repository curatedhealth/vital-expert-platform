# 🎨 Frontend Integration Guide - Agent Category Colors

**Status:** ✅ Colors are in database, but frontend needs updating

---

## 📊 Current Database State

**All 358 agents have `category_color` assigned:**

```typescript
// Example data from database:
{
  id: "ab5db512-679c-4ce4-ba03-2a9275d6e3f3",
  name: "Conflict Resolver",
  title: "Expert Disagreement Resolution Agent",
  avatar_url: "https://xazinxsiglqokwfmogyk.supabase.co/storage/v1/object/public/avatars/avatar_0211.png",
  category_color: "#06B6D4",  // ← NEW FIELD
  agent_category: "multi_expert_orchestration"
}
```

---

## 🔧 Frontend Changes Needed

### **Step 1: Update Supabase Query**

Modify your agent queries to include the `category_color` field:

```typescript
// Before (missing category_color)
const { data: agents } = await supabase
  .from('agents')
  .select('id, name, title, description, avatar_url, agent_category')

// After (include category_color)
const { data: agents } = await supabase
  .from('agents')
  .select('id, name, title, description, avatar_url, agent_category, category_color')
```

### **Step 2: Update TypeScript Types**

Add `category_color` to your Agent type definition:

```typescript
// types/agent.ts
export interface Agent {
  id: string;
  name: string;
  title?: string;
  description?: string;
  avatar_url?: string;
  agent_category?: string;
  category_color?: string;  // ← ADD THIS
  // ... other fields
}
```

### **Step 3: Update Agent Card Component**

Modify your agent card component to use the color:

```tsx
// components/AgentCard.tsx
import React from 'react';

interface AgentCardProps {
  agent: Agent;
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent }) => {
  // Use category_color with 10% opacity for subtle background
  const backgroundColor = agent.category_color 
    ? `${agent.category_color}1A`  // 1A = 10% opacity in hex
    : 'transparent';
  
  return (
    <div 
      className="agent-card"
      style={{
        borderLeft: `4px solid ${agent.category_color || '#6B7280'}`,
        backgroundColor: backgroundColor
      }}
    >
      {/* Avatar with colored background */}
      <div 
        className="avatar-wrapper"
        style={{
          backgroundColor: agent.category_color 
            ? `${agent.category_color}20`  // 20 = 12% opacity
            : '#F3F4F6',
          borderRadius: '50%',
          padding: '4px',
          display: 'inline-block'
        }}
      >
        <img 
          src={agent.avatar_url} 
          alt={agent.name}
          className="rounded-full w-12 h-12"
        />
      </div>
      
      {/* Agent info */}
      <div className="agent-info">
        <h3>{agent.name}</h3>
        <p className="text-sm text-gray-600">{agent.description}</p>
        
        {/* Category badge with color */}
        {agent.agent_category && (
          <span 
            className="category-badge"
            style={{
              backgroundColor: agent.category_color,
              color: 'white',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '12px'
            }}
          >
            {agent.agent_category.replace(/_/g, ' ')}
          </span>
        )}
      </div>
    </div>
  );
};
```

### **Step 4: Alternative - Tailwind CSS Classes**

If you prefer Tailwind, you can map colors to classes:

```tsx
// utils/categoryColors.ts
export const getCategoryColorClasses = (categoryColor: string) => {
  const colorMap: Record<string, { bg: string; badge: string; border: string }> = {
    '#9333EA': { // Purple - Deep Agents
      bg: 'bg-purple-600/10',
      badge: 'bg-purple-600',
      border: 'border-l-purple-600'
    },
    '#10B981': { // Green - Universal Task Subagents
      bg: 'bg-green-500/10',
      badge: 'bg-green-500',
      border: 'border-l-green-500'
    },
    '#06B6D4': { // Cyan - Multi-Expert Orchestration
      bg: 'bg-cyan-500/10',
      badge: 'bg-cyan-500',
      border: 'border-l-cyan-500'
    },
    '#3B82F6': { // Blue - Specialized Knowledge
      bg: 'bg-blue-500/10',
      badge: 'bg-blue-500',
      border: 'border-l-blue-500'
    },
    '#F97316': { // Orange - Process Automation
      bg: 'bg-orange-500/10',
      badge: 'bg-orange-500',
      border: 'border-l-orange-500'
    },
    '#EF4444': { // Red - Autonomous Problem-Solving
      bg: 'bg-red-500/10',
      badge: 'bg-red-500',
      border: 'border-l-red-500'
    }
  };
  
  return colorMap[categoryColor] || {
    bg: 'bg-gray-100',
    badge: 'bg-gray-500',
    border: 'border-l-gray-500'
  };
};

// Usage in component
const AgentCard = ({ agent }) => {
  const colors = getCategoryColorClasses(agent.category_color);
  
  return (
    <div className={`agent-card ${colors.bg} ${colors.border} border-l-4`}>
      <div className={`avatar-wrapper ${colors.bg} rounded-full p-1`}>
        <img src={agent.avatar_url} className="rounded-full" />
      </div>
      <span className={`${colors.badge} text-white px-2 py-1 rounded text-xs`}>
        {agent.agent_category}
      </span>
    </div>
  );
};
```

### **Step 5: Update Agent List Page**

```tsx
// pages/agents/index.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { AgentCard } from '@/components/AgentCard';

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchAgents = async () => {
      const { data, error } = await supabase
        .from('agents')
        .select('id, name, title, description, avatar_url, agent_category, category_color')
        .eq('is_active', true)
        .order('name');
      
      if (data) {
        setAgents(data);
      }
      setLoading(false);
    };
    
    fetchAgents();
  }, []);
  
  return (
    <div className="agents-page">
      <h1>Agents</h1>
      <div className="agents-grid grid grid-cols-3 gap-4">
        {agents.map(agent => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  );
}
```

---

## 🎨 Visual Examples

### **Option A: Subtle Background + Border**

```tsx
<div 
  style={{
    backgroundColor: `${agent.category_color}10`,  // 6% opacity
    borderLeft: `4px solid ${agent.category_color}`
  }}
>
  <img src={agent.avatar_url} />
  <h3>{agent.name}</h3>
</div>
```

**Result:** Subtle colored background with a bold left border

---

### **Option B: Colored Avatar Ring**

```tsx
<div 
  className="avatar-container"
  style={{
    background: `linear-gradient(135deg, ${agent.category_color}20, ${agent.category_color}10)`,
    padding: '8px',
    borderRadius: '50%'
  }}
>
  <img 
    src={agent.avatar_url} 
    className="rounded-full"
  />
</div>
```

**Result:** Gradient colored ring around avatar

---

### **Option C: Category Badge with Color**

```tsx
<span 
  className="category-badge"
  style={{
    backgroundColor: agent.category_color,
    color: 'white',
    padding: '4px 12px',
    borderRadius: '16px',
    fontSize: '11px',
    fontWeight: '600'
  }}
>
  {agent.agent_category.replace(/_/g, ' ').toUpperCase()}
</span>
```

**Result:** Colored pill-shaped badge

---

### **Option D: All Combined (Recommended)**

```tsx
<div 
  className="agent-card"
  style={{
    backgroundColor: `${agent.category_color}08`,  // 3% bg
    borderLeft: `4px solid ${agent.category_color}`,
    padding: '16px',
    borderRadius: '8px'
  }}
>
  {/* Colored avatar wrapper */}
  <div 
    style={{
      backgroundColor: `${agent.category_color}20`,  // 12% opacity
      borderRadius: '50%',
      padding: '6px',
      display: 'inline-block',
      marginBottom: '12px'
    }}
  >
    <img 
      src={agent.avatar_url} 
      className="rounded-full w-16 h-16"
    />
  </div>
  
  {/* Agent info */}
  <h3 className="font-semibold">{agent.name}</h3>
  <p className="text-sm text-gray-600">{agent.description}</p>
  
  {/* Colored category badge */}
  <span 
    style={{
      backgroundColor: agent.category_color,
      color: 'white',
      padding: '4px 10px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: '600',
      marginTop: '8px',
      display: 'inline-block'
    }}
  >
    {agent.agent_category.replace(/_/g, ' ')}
  </span>
</div>
```

---

## 🔄 Real-Time Updates (Optional)

If you want colors to update in real-time when categories change:

```tsx
useEffect(() => {
  const subscription = supabase
    .channel('agents-changes')
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'agents'
    }, (payload) => {
      setAgents(prev => 
        prev.map(a => 
          a.id === payload.new.id 
            ? { ...a, category_color: payload.new.category_color }
            : a
        )
      );
    })
    .subscribe();
  
  return () => {
    subscription.unsubscribe();
  };
}, []);
```

---

## 📋 Quick Checklist

To update your frontend:

- [ ] Update Supabase queries to include `category_color`
- [ ] Update TypeScript types to include `category_color?: string`
- [ ] Modify AgentCard component to use `category_color` for styling
- [ ] Choose a visual style (subtle bg, border, badge, or all)
- [ ] Test with different agents from different categories
- [ ] Verify colors appear correctly
- [ ] (Optional) Add real-time subscription for updates

---

## 🎯 Color Reference

Quick copy-paste for your code:

```typescript
const CATEGORY_COLORS = {
  deep_agent: '#9333EA',                    // 🟣 Purple
  universal_task_subagent: '#10B981',       // 🟢 Green
  multi_expert_orchestration: '#06B6D4',    // 🔷 Cyan
  specialized_knowledge: '#3B82F6',         // 🔵 Blue
  process_automation: '#F97316',            // 🟠 Orange
  autonomous_problem_solving: '#EF4444'     // 🔴 Red
};
```

---

## ✅ Verification

After updating your frontend:

1. Check that agents from different categories show different colors
2. Verify opacity looks good (not too bold)
3. Test on different backgrounds (light/dark mode)
4. Ensure colors meet accessibility standards
5. Verify on different screen sizes

---

**Status:** 🎨 Database ready ✅ | Frontend update needed ⏳


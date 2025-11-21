# 🎨 Quick Reference - Modern Lucide Icons

## ⚡ TL;DR - Copy & Paste Implementation

### 1. Install Package
```bash
npm install lucide-react
```

### 2. Copy Component
Copy `/components/agents/AgentIcon.tsx` to your project

### 3. Use It
```tsx
import { AgentIcon } from '@/components/agents/AgentIcon';

// Basic usage
<AgentIcon agent={agent} />

// With size and variant
<AgentIcon agent={agent} size="lg" variant="outlined" />

// With click handler
<AgentIcon 
  agent={agent} 
  onClick={() => handleAgentClick(agent)}
/>
```

---

## 🎨 Visual Examples

### Size Comparison
```tsx
<AgentIcon agent={agent} size="xs" />  // 16px icon, 32px container
<AgentIcon agent={agent} size="sm" />  // 18px icon, 40px container
<AgentIcon agent={agent} size="md" />  // 20px icon, 48px container ⭐ DEFAULT
<AgentIcon agent={agent} size="lg" />  // 24px icon, 56px container
<AgentIcon agent={agent} size="xl" />  // 28px icon, 64px container
```

### Variant Comparison
```tsx
// Default: Soft background + subtle border
<AgentIcon agent={agent} variant="default" />  // ⭐ DEFAULT

// Outlined: Border only, no background
<AgentIcon agent={agent} variant="outlined" />

// Filled: Solid color background, white icon
<AgentIcon agent={agent} variant="filled" />

// Minimal: Just the icon, no styling
<AgentIcon agent={agent} variant="minimal" />
```

---

## 🌈 Category → Icon Mapping

| Category | Icon | Color (Light) | Color (Dark) |
|----------|------|---------------|--------------|
| **Deep Agent** | `Target` | #6366F1 | #818CF8 |
| **Task Subagent** | `Workflow` | #10B981 | #34D399 |
| **Orchestration** | `Users` | #06B6D4 | #22D3EE |
| **Knowledge** | `BookOpen` | #8B5CF6 | #A78BFA |
| **Automation** | `Settings` | #F59E0B | #FBBF24 |
| **Problem Solving** | `Brain` | #EC4899 | #F472B6 |

---

## 📊 Common Use Cases

### Agent Card Header
```tsx
<div className="flex items-center gap-3">
  <AgentIcon agent={agent} size="md" variant="default" />
  <div>
    <h3>{agent.title}</h3>
    <p>{agent.description}</p>
  </div>
</div>
```

### Agent List Item
```tsx
<li className="flex items-center gap-2 p-2">
  <AgentIcon agent={agent} size="sm" variant="minimal" />
  <span>{agent.name}</span>
</li>
```

### Featured Agent Hero
```tsx
<div className="text-center">
  <AgentIcon agent={agent} size="xl" variant="filled" />
  <h1 className="mt-4">{agent.title}</h1>
</div>
```

### Agent Grid
```tsx
import { AgentIconGrid } from '@/components/agents/AgentIcon';

<AgentIconGrid 
  agents={agents}
  size="lg"
  variant="outlined"
  showLabels={true}
  onIconClick={(agent) => navigate(`/agent/${agent.id}`)}
/>
```

---

## 🎯 Props Reference

### AgentIcon Props
```typescript
interface AgentIconProps {
  agent: Agent;              // Required: Agent object
  size?: IconSize;           // 'xs' | 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
  variant?: IconVariant;     // 'default' | 'outlined' | 'filled' | 'minimal' (default: 'default')
  className?: string;        // Additional CSS classes
  showLabel?: boolean;       // Show category label below icon (default: false)
  onClick?: () => void;      // Click handler (makes icon clickable)
}
```

### Agent Type
```typescript
interface Agent {
  id: string;
  name: string;
  title?: string;
  description?: string;
  agent_category: string;
  category_color?: string;
  metadata?: {
    lucide_icon?: string;
    [key: string]: any;
  };
}
```

---

## 🔄 Supabase Query

```typescript
const { data: agents } = await supabase
  .from('agents')
  .select(`
    id,
    name,
    title,
    description,
    agent_category,
    category_color,
    metadata
  `)
  .eq('is_active', true);
```

---

## 🎨 Tailwind Dark Mode Setup

### 1. Configure Tailwind
```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class', // Enable class-based dark mode
  // ... rest of config
};
```

### 2. Add Dark Mode Toggle
```tsx
import { Moon, Sun } from 'lucide-react';

function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <button onClick={() => setIsDark(!isDark)}>
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
```

---

## 🎯 Best Practices

### ✅ DO
- Use `size="md"` for most card layouts
- Use `variant="default"` for standard views
- Use `variant="filled"` for primary/featured agents
- Use `variant="minimal"` for dense lists
- Always pass the full `agent` object (not just icon name)
- Use category colors for consistency

### ❌ DON'T
- Don't manually set icon colors (uses category_color)
- Don't use emojis (Lucide icons only)
- Don't forget to handle dark mode
- Don't use very large icons (max: xl)
- Don't override stroke width (keep at 1.5)

---

## 🐛 Troubleshooting

### Icons not showing?
```bash
# Check if lucide-react is installed
npm list lucide-react

# Reinstall if needed
npm install lucide-react
```

### Wrong icon displaying?
```sql
-- Verify metadata.lucide_icon exists
SELECT name, metadata->>'lucide_icon' 
FROM agents 
WHERE id = 'your-agent-id';
```

### Colors not adapting to dark mode?
```html
<!-- Ensure html has dark class when in dark mode -->
<html class="dark">
  ...
</html>
```

---

## 📚 Resources

- **Lucide Icons Library**: https://lucide.dev/icons/
- **Component File**: `/components/agents/AgentIcon.tsx`
- **Full Guide**: `/LUCIDE_MODERN_THEME_IMPLEMENTATION.md`
- **Icon Mapping**: `/LUCIDE_ICON_MAPPING.md`

---

## 🎉 You're All Set!

Your icons are:
- ✅ Stored in Supabase (`metadata.lucide_icon`)
- ✅ Ready to use (component created)
- ✅ Theme-aware (light/dark mode)
- ✅ Professional & modern (fine lines, neutral colors)
- ✅ Zero emojis!

**Next Step**: Copy the component to your project and start using it! 🚀


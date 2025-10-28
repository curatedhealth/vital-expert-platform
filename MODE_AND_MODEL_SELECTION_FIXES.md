# Mode and Model Selection - Implementation Guide

## Issues to Fix

1. **Mode Selection Not Updating** - When toggles are changed in AdvancedChatInput, parent page.tsx doesn't update
2. **No Model Selection** - Need to add model dropdown to choose between OpenAI, Gemini

## Solution

### Files Created
1. ✅ `/src/lib/config/available-models.ts` - Model configuration

### Files to Update
1. `/src/features/ask-expert/components/AdvancedChatInput.tsx` - Add model selector, fix mode callbacks
2. `/src/app/(app)/ask-expert/page.tsx` - Add model state, ensure mode callbacks work

## Changes Needed

### 1. AdvancedChatInput.tsx

**Add to imports:**
```typescript
import { AVAILABLE_MODELS, DEFAULT_MODEL, type ModelConfig } from '@/lib/config/available-models';
import { Cpu } from 'lucide-react'; // For model icon
```

**Add to props interface:**
```typescript
// Model selection
selectedModel?: string;
onModelChange?: (model: string) => void;
```

**Add model selector dropdown** (in action buttons area, next to Settings button):
```typescript
{/* Model Selector */}
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <select
        value={selectedModel || DEFAULT_MODEL}
        onChange={(e) => onModelChange?.(e.target.value)}
        disabled={disabled || isLoading}
        className="h-8 px-2 text-xs rounded-lg border bg-white dark:bg-gray-900"
      >
        {AVAILABLE_MODELS.map(model => (
          <option key={model.id} value={model.id}>
            {model.icon} {model.name}
          </option>
        ))}
      </select>
    </TooltipTrigger>
    <TooltipContent>
      <p className="text-xs">Select AI model</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

**Add current model to context bar:**
```typescript
{selectedModel && (
  <Badge variant="outline" className="gap-1">
    <Cpu className="h-3 w-3" />
    {AVAILABLE_MODELS.find(m => m.id === selectedModel)?.name}
  </Badge>
)}
```

### 2. page.tsx

**Add model state:**
```typescript
// Model State
const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_MODEL);
```

**Update imports:**
```typescript
import { DEFAULT_MODEL } from '@/lib/config/available-models';
```

**Pass to AdvancedChatInput:**
```typescript
<AdvancedChatInput
  // ... existing props ...
  selectedModel={selectedModel}
  onModelChange={setSelectedModel}
/>
```

**CRITICAL FIX - Ensure mode callbacks are passed correctly:**
The issue is likely that mode changes in the child component aren't triggering parent updates.

Current code:
```typescript
onAutonomousChange={setIsAutonomous}  // ✅ Should work
onAutomaticChange={setIsAutomatic}    // ✅ Should work
```

This SHOULD work. If it doesn't, the issue might be:
1. The component is not re-rendering
2. The state is being overridden somewhere

**Debug: Add console logs in page.tsx:**
```typescript
const handleAutonomousChange = (value: boolean) => {
  console.log('🔄 Autonomous changed:', value);
  setIsAutonomous(value);
};

const handleAutomaticChange = (value: boolean) => {
  console.log('🔄 Automatic changed:', value);
  setIsAutomatic(value);
};

// Then use these handlers
<AdvancedChatInput
  onAutonomousChange={handleAutonomousChange}
  onAutomaticChange={handleAutomaticChange}
/>
```

## Complete Code for Key Sections

### AdvancedChatInput - Model Selector Location
Place this in the "Action Buttons" section (around line 400):

```typescript
{/* Action Buttons */}
<div className="absolute right-2 bottom-2 flex items-center gap-1">
  {/* Model Selector - NEW */}
  <select
    value={selectedModel || DEFAULT_MODEL}
    onChange={(e) => onModelChange?.(e.target.value)}
    disabled={disabled || isLoading}
    className="h-8 px-2 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
  >
    {AVAILABLE_MODELS.map(model => (
      <option key={model.id} value={model.id}>
        {model.icon} {model.name}
      </option>
    ))}
  </select>

  {/* Mode Settings Toggle */}
  <TooltipProvider>
    ...
  </TooltipProvider>

  {/* Existing buttons... */}
</div>
```

### page.tsx - Complete State Section

```typescript
export default function AskExpertModern() {
  const { user } = useAuth();
  const { agents, loadAgents } = useAgentsStore();

  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [agentSelectorOpen, setAgentSelectorOpen] = useState(false);

  // Mode State (2 Toggles) - WITH DEBUG
  const [isAutonomous, setIsAutonomous] = useState(false);
  const [isAutomatic, setIsAutomatic] = useState(true);

  // Model State - NEW
  const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_MODEL);

  // Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  // Debug: Log mode changes
  useEffect(() => {
    console.log('🎯 Mode changed:', { isAutonomous, isAutomatic });
  }, [isAutonomous, isAutomatic]);

  // Debug: Log model changes
  useEffect(() => {
    console.log('🤖 Model changed:', selectedModel);
  }, [selectedModel]);

  // ... rest of component
}
```

## Testing Checklist

1. **Mode Toggle Test:**
   - [ ] Open browser console
   - [ ] Click Autonomous toggle in input component
   - [ ] Check console for "🎯 Mode changed:" log
   - [ ] Verify UI updates (mode badge changes)

2. **Model Selection Test:**
   - [ ] Click model dropdown
   - [ ] Select different model
   - [ ] Check console for "🤖 Model changed:" log
   - [ ] Verify model badge updates in context bar

3. **Integration Test:**
   - [ ] Change mode
   - [ ] Change model
   - [ ] Send message
   - [ ] Verify handleSend receives correct mode & model

## If Mode Toggle Still Doesn't Work

**Possible Issue:** The Switch component from @vital/ui might not be calling `onCheckedChange` correctly.

**Solution:** Replace with controlled input temporarily for debugging:

```typescript
<input
  type="checkbox"
  checked={isAutonomous}
  onChange={(e) => onAutonomousChange(e.target.checked)}
  className="h-4 w-4"
/>
```

If checkbox works but Switch doesn't, the issue is with the Switch component implementation.

## Summary

**Files to modify:**
1. ✅ Create `/src/lib/config/available-models.ts` (DONE)
2. Update `/src/features/ask-expert/components/AdvancedChatInput.tsx`:
   - Add model selector dropdown
   - Add selectedModel & onModelChange props
   - Display current model in context bar
3. Update `/src/app/(app)/ask-expert/page.tsx`:
   - Add selectedModel state
   - Add debug logging for mode/model changes
   - Pass selectedModel to input component

**Expected Result:**
- Toggle switches work and update parent state
- Model dropdown shows OpenAI + Gemini models
- Selected model and mode displayed in context bar
- Console logs confirm state changes

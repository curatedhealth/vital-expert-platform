# 🎯 Prompt Library Integration - Implementation Plan

**Status**: ⚙️ IN PROGRESS  
**Feature**: Connect User Prompt to Prompt Library with Suite/Subsuite filtering

---

## ✅ What's Been Done

### 1. API Endpoints Created
- ✅ `/api/workflows/prompt-suites` - Fetch all active prompt suites
- ✅ `/api/workflows/prompt-suites/[suiteId]/subsuites` - Fetch subsuites for a suite
- ✅ `/api/workflows/prompts?suiteId=&subsuiteId=` - Fetch prompts filtered by suite/subsuite

### 2. InteractiveTaskNode Updates
- ✅ Added interfaces for `PromptSuite`, `PromptSubsuite`, `PromptTemplate`
- ✅ Added state variables for prompt suites, subsuites, and templates
- ✅ Added state for selected suite, subsuite, and prompt template
- ✅ Updated `fetchAvailableOptions` to include prompt suites
- ✅ Added Select component import from shadcn/ui

---

## 🔧 What Needs to Be Completed

### 1. Add Handler Functions

Add these handlers after the `toggleRag` function:

```typescript
// Fetch subsuites when suite is selected
const handleSuiteChange = async (suiteId: string) => {
  setSelectedPromptSuite(suiteId);
  setSelectedPromptSubsuite('');
  setSelectedPromptTemplate('');
  setAvailableSubsuites([]);
  setAvailablePrompts([]);
  
  if (!suiteId) return;
  
  try {
    const response = await fetch(`/api/workflows/prompt-suites/${suiteId}/subsuites`);
    if (response.ok) {
      const { subsuites } = await response.json();
      setAvailableSubsuites(subsuites || []);
    }
  } catch (error) {
    console.error('Error fetching subsuites:', error);
  }
};

// Fetch prompts when subsuite is selected
const handleSubsuiteChange = async (subsuiteId: string) => {
  setSelectedPromptSubsuite(subsuiteId);
  setSelectedPromptTemplate('');
  
  try {
    const url = new URL('/api/workflows/prompts', window.location.origin);
    if (selectedPromptSuite) url.searchParams.set('suiteId', selectedPromptSuite);
    if (subsuiteId) url.searchParams.set('subsuiteId', subsuiteId);
    
    const response = await fetch(url);
    if (response.ok) {
      const { prompts } = await response.json();
      setAvailablePrompts(prompts || []);
    }
  } catch (error) {
    console.error('Error fetching prompts:', error);
  }
};

// Apply selected prompt template to user prompt
const handleApplyPromptTemplate = () => {
  if (!selectedPromptTemplate) return;
  
  const prompt = availablePrompts.find(p => p.id === selectedPromptTemplate);
  if (prompt) {
    setUserPrompt(prompt.content_template);
  }
};

// Enhance prompt with AI (integration with existing enhancer)
const handleEnhancePrompt = async () => {
  if (!userPrompt.trim()) return;
  
  try {
    const response = await fetch('/api/prompts/enhance-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: userPrompt,
        context: {
          suite: selectedPromptSuite,
          subsuite: selectedPromptSubsuite
        }
      })
    });
    
    if (response.ok) {
      const { enhancedPrompt } = await response.json();
      setUserPrompt(enhancedPrompt);
    }
  } catch (error) {
    console.error('Error enhancing prompt:', error);
  }
};
```

### 2. Add UI Components Before User Prompt Section

Insert this code BEFORE the "User Prompt" section (before line ~791):

```tsx
{/* Prompt Library Integration */}
<div className="space-y-3 pt-2 border-t">
  <Label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
    <Sparkles className="w-4 h-4 text-yellow-600" />
    Prompt Library (PROMPTS™)
  </Label>
  
  {/* Prompt Suite Selection */}
  <div className="space-y-2">
    <Label className="text-xs text-gray-600">Suite</Label>
    <Select value={selectedPromptSuite} onValueChange={handleSuiteChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a PROMPTS™ suite..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="">All Suites</SelectItem>
        {availablePromptSuites.map((suite) => (
          <SelectItem key={suite.id} value={suite.id}>
            {suite.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
  
  {/* Subsuite Selection */}
  {selectedPromptSuite && availableSubsuites.length > 0 && (
    <div className="space-y-2">
      <Label className="text-xs text-gray-600">Sub-Suite</Label>
      <Select value={selectedPromptSubsuite} onValueChange={handleSubsuiteChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a sub-suite..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Sub-Suites</SelectItem>
          {availableSubsuites.map((subsuite) => (
            <SelectItem key={subsuite.id} value={subsuite.id}>
              {subsuite.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )}
  
  {/* Prompt Template Selection */}
  {availablePrompts.length > 0 && (
    <div className="space-y-2">
      <Label className="text-xs text-gray-600">Prompt Template</Label>
      <Select value={selectedPromptTemplate} onValueChange={setSelectedPromptTemplate}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a template..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">None</SelectItem>
          {availablePrompts.map((prompt) => (
            <SelectItem key={prompt.id} value={prompt.id}>
              {prompt.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedPromptTemplate && (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={handleApplyPromptTemplate}
        >
          <Plus className="w-4 h-4 mr-2" />
          Apply Template
        </Button>
      )}
    </div>
  )}
  
  {/* Prompt Enhancer Button */}
  {userPrompt && (
    <Button
      variant="secondary"
      size="sm"
      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
      onClick={handleEnhancePrompt}
    >
      <Sparkles className="w-4 h-4 mr-2" />
      Enhance Prompt with AI
    </Button>
  )}
</div>
```

### 3. Update Imports

Make sure these imports are included at the top:

```typescript
import { Sparkles } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
```

---

## 🎨 User Flow

### Step-by-Step Experience:

1. **User clicks Edit** on a task node
2. **Modal opens** with all sections
3. **User scrolls to "Prompt Library (PROMPTS™)" section**
4. **User selects Suite** (e.g., "FORGE™ - Digital Health Development")
   - Sub-suites populate
5. **User selects Sub-Suite** (e.g., "DEVELOP - Product Development")
   - Prompts populate
6. **User selects Prompt Template** (e.g., "Define Clinical Endpoints")
7. **User clicks "Apply Template"**
   - Prompt text fills User Prompt textarea
8. **User optionally clicks "Enhance Prompt with AI"**
   - AI enhances the prompt with PRISM methodology
9. **User saves** the task with enhanced prompt

---

## 📊 Example Data Flow

### Available Suites:
```
FORGE™ - Digital Health Development
  ↓ Sub-Suites:
  - DEVELOP - Product Development
  - VALIDATE - Clinical Validation
  - REGULATE - Regulatory Pathways
  - INNOVATE - Innovation & Networks
  - IMPLEMENT - Implementation
```

### Example Prompt Template:
```
Title: "Define Clinical Endpoints"
Content: "As a clinical development professional, I need to:

1. Define primary clinical endpoints for [INDICATION]
2. Identify patient-centered outcome measures
3. Evaluate psychometric properties
4. Assess regulatory precedent
5. Determine digital implementation feasibility

Please provide comprehensive guidance on..."
```

---

## ✅ Completion Checklist

- [ ] Add handler functions (`handleSuiteChange`, `handleSubsuiteChange`, `handleApplyPromptTemplate`, `handleEnhancePrompt`)
- [ ] Add UI components before User Prompt section
- [ ] Verify Sparkles icon import
- [ ] Test suite selection populates subsuites
- [ ] Test subsuite selection populates prompts
- [ ] Test Apply Template fills textarea
- [ ] Test Enhance Prompt with AI
- [ ] Update save handler to include prompt suite/subsuite metadata
- [ ] Test full workflow from suite selection to save

---

## 🚀 Next Steps

1. Complete the handler functions
2. Add the UI components  
3. Test the integration
4. Document the feature

**This will give users intelligent prompt assistance based on task context!** 🎉


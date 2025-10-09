# 🔧 **PROMPT ENHANCEMENT TECHNICAL GUIDE**

## **Developer Documentation and Implementation Details**

This guide provides technical documentation for the Prompt Enhancement feature implementation in the VITAL Path platform.

---

## 🏗️ **Architecture Overview**

### **Component Structure**
```
PromptEnhancementModal/
├── Modal Container (Dialog)
├── Tab Navigation (Browse, Enhance, Auto-Enhance)
├── Browse Library
│   ├── Filters (Domain, Suite, Search)
│   ├── Prompt Grid (Cards)
│   └── Template Application
├── Enhance Prompt
│   ├── Original Input Display
│   ├── Enhanced Editor
│   └── Template Integration
└── Auto-Enhance
    ├── AI Analysis
    ├── Smart Suggestions
    └── One-Click Apply
```

### **Data Flow**
```
User Input → Enhancement Modal → PRISM Library → Template Application → Enhanced Prompt → Chat Input
```

---

## 📁 **File Structure**

### **Core Components**
```
src/
├── components/
│   └── chat/
│       └── PromptEnhancementModal.tsx          # Main modal component
├── features/
│   └── chat/
│       └── components/
│           └── chat-input.tsx                  # Enhanced chat input
├── app/
│   └── api/
│       └── prompts-crud/
│           └── route.ts                        # API endpoints
└── lib/
    └── services/
        └── prompt-enhancement-service.ts       # Service layer
```

### **API Endpoints**
```
GET /api/prompts-crud?limit=50&domain=regulatory_affairs&suite=RULES™&search=FDA
POST /api/prompts-crud                          # Create new prompt
PUT /api/prompts-crud/[id]                      # Update prompt
DELETE /api/prompts-crud/[id]                   # Delete prompt
```

---

## 🎯 **Component Implementation**

### **PromptEnhancementModal.tsx**

#### **Props Interface**
```typescript
interface PromptEnhancementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyPrompt: (enhancedPrompt: string) => void;
  currentInput?: string;
}
```

#### **State Management**
```typescript
const [prompts, setPrompts] = useState<Prompt[]>([]);
const [filteredPrompts, setFilteredPrompts] = useState<Prompt[]>([]);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [searchTerm, setSearchTerm] = useState('');
const [domainFilter, setDomainFilter] = useState('all');
const [suiteFilter, setSuiteFilter] = useState('all');
const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
const [enhancedPrompt, setEnhancedPrompt] = useState('');
const [activeTab, setActiveTab] = useState('browse');
const [isGenerating, setIsGenerating] = useState(false);
```

#### **Key Methods**
```typescript
// Load prompts with filtering
const loadPrompts = async () => {
  const params = new URLSearchParams({
    limit: '50',
    ...(searchTerm && { search: searchTerm }),
    ...(domainFilter !== 'all' && { domain: domainFilter }),
    ...(suiteFilter !== 'all' && { suite: suiteFilter })
  });
  
  const response = await fetch(`/api/prompts-crud?${params}`);
  const data = await response.json();
  setPrompts(data.prompts || []);
};

// Apply prompt template
const applyPromptTemplate = (prompt: Prompt) => {
  setSelectedPrompt(prompt);
  const variables = prompt.user_prompt_template.match(/\{([^}]+)\}/g) || [];
  
  if (variables.length > 0) {
    let template = prompt.user_prompt_template;
    variables.forEach(variable => {
      const varName = variable.slice(1, -1);
      template = template.replace(variable, `[${varName}]`);
    });
    setEnhancedPrompt(template);
  } else {
    setEnhancedPrompt(prompt.user_prompt_template);
  }
};

// Auto-enhance current input
const autoEnhancePrompt = async () => {
  if (!currentInput.trim()) return;
  
  const enhanced = `Enhanced: ${currentInput}

Please provide a comprehensive response that includes:
- Detailed analysis
- Specific recommendations
- Implementation steps
- Best practices
- Risk considerations

Context: Healthcare professional seeking expert guidance.`;
  
  setEnhancedPrompt(enhanced);
};
```

### **Chat Input Integration**

#### **Enhanced ChatInput Component**
```typescript
// Added state for modal
const [showPromptEnhancement, setShowPromptEnhancement] = useState(false);

// Added enhancement button to toolbar
<Tooltip>
  <TooltipTrigger asChild>
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      onClick={() => setShowPromptEnhancement(true)}
      disabled={isLoading}
    >
      <Sparkles className="h-4 w-4" />
    </Button>
  </TooltipTrigger>
  <TooltipContent>Enhance prompt with PRISM library</TooltipContent>
</Tooltip>

// Added modal at bottom
<PromptEnhancementModal
  isOpen={showPromptEnhancement}
  onClose={() => setShowPromptEnhancement(false)}
  onApplyPrompt={handleApplyEnhancedPrompt}
  currentInput={value}
/>
```

---

## 🗄️ **Database Schema**

### **Prompts Table**
```sql
CREATE TABLE prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  description TEXT,
  domain VARCHAR(100),
  complexity_level VARCHAR(20) CHECK (complexity_level IN ('beginner', 'intermediate', 'advanced')),
  system_prompt TEXT,
  user_prompt_template TEXT NOT NULL,
  prompt_starter TEXT,
  tags TEXT[],
  target_users TEXT[],
  use_cases TEXT[],
  estimated_tokens INTEGER,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Agent Prompts Junction Table**
```sql
CREATE TABLE agent_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(agent_id, prompt_id)
);
```

---

## 🔌 **API Implementation**

### **Prompts CRUD API**

#### **GET /api/prompts-crud**
```typescript
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit') || '50';
  const domain = searchParams.get('domain');
  const suite = searchParams.get('suite');
  const search = searchParams.get('search');

  let query = supabaseAdmin
    .from('prompts')
    .select('*')
    .limit(parseInt(limit));

  if (domain) query = query.eq('domain', domain);
  if (search) query = query.ilike('name', `%${search}%`);

  const { data: prompts, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Map domain to PRISM suite for PRISM prompts
  const enrichedPrompts = prompts?.map(prompt => {
    let suite = null;
    if (prompt.name?.toLowerCase().includes('prism')) {
      if (prompt.name.toLowerCase().includes('rules') || prompt.domain === 'regulatory_affairs') {
        suite = 'RULES™';
      } else if (prompt.name.toLowerCase().includes('trials') || prompt.domain === 'clinical_research') {
        suite = 'TRIALS™';
      }
      // ... more suite mappings
    }
    
    return {
      ...prompt,
      suite: suite,
      is_user_created: prompt.created_by !== null
    };
  }) || [];

  return NextResponse.json({ prompts: enrichedPrompts });
}
```

#### **POST /api/prompts-crud**
```typescript
export async function POST(request: Request) {
  const body = await request.json();
  
  const { data: prompt, error } = await supabaseAdmin
    .from('prompts')
    .insert([body])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ prompt });
}
```

---

## 🎨 **UI Components**

### **Modal Structure**
```tsx
<Dialog open={isOpen} onOpenChange={onClose}>
  <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>Prompt Enhancement Library</DialogTitle>
      <DialogDescription>
        Enhance your prompts using our PRISM library
      </DialogDescription>
    </DialogHeader>

    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList>
        <TabsTrigger value="browse">Browse Library</TabsTrigger>
        <TabsTrigger value="enhance">Enhance Prompt</TabsTrigger>
        <TabsTrigger value="auto">Auto-Enhance</TabsTrigger>
      </TabsList>

      <TabsContent value="browse">
        {/* Browse Library Implementation */}
      </TabsContent>
      
      <TabsContent value="enhance">
        {/* Enhance Prompt Implementation */}
      </TabsContent>
      
      <TabsContent value="auto">
        {/* Auto-Enhance Implementation */}
      </TabsContent>
    </Tabs>
  </DialogContent>
</Dialog>
```

### **Prompt Cards**
```tsx
{prompts.map((prompt) => (
  <Card 
    key={prompt.id} 
    className="cursor-pointer hover:shadow-md transition-shadow"
    onClick={() => applyPromptTemplate(prompt)}
  >
    <CardHeader>
      <CardTitle>{prompt.display_name}</CardTitle>
      <CardDescription>{prompt.description}</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="flex items-center gap-2">
        <Badge variant="outline">{prompt.domain}</Badge>
        <Badge variant="secondary">{prompt.complexity_level}</Badge>
      </div>
      <Button size="sm" className="w-full">
        Use Template
      </Button>
    </CardContent>
  </Card>
))}
```

---

## 🔍 **Filtering and Search**

### **Domain Filtering**
```typescript
const DOMAINS = [
  'regulatory_affairs',
  'clinical_research',
  'market_access',
  'digital_health',
  'data_analytics',
  'medical_writing',
  'pharmacovigilance',
  'clinical_validation',
  'project_management',
  'commercial',
  'medical_affairs'
];
```

### **Suite Filtering**
```typescript
const PRISM_SUITES = [
  'RULES™',
  'TRIALS™',
  'GUARD™',
  'VALUE™',
  'BRIDGE™',
  'PROOF™',
  'CRAFT™',
  'SCOUT™',
  'PROJECT™'
];
```

### **Search Implementation**
```typescript
const loadPrompts = async () => {
  const params = new URLSearchParams({
    limit: '50',
    ...(searchTerm && { search: searchTerm }),
    ...(domainFilter !== 'all' && { domain: domainFilter }),
    ...(suiteFilter !== 'all' && { suite: suiteFilter })
  });

  const response = await fetch(`/api/prompts-crud?${params}`);
  // Handle response...
};
```

---

## 🎯 **Template System**

### **Variable Substitution**
```typescript
const applyPromptTemplate = (prompt: Prompt) => {
  const variables = prompt.user_prompt_template.match(/\{([^}]+)\}/g) || [];
  
  if (variables.length > 0) {
    let template = prompt.user_prompt_template;
    variables.forEach(variable => {
      const varName = variable.slice(1, -1);
      template = template.replace(variable, `[${varName}]`);
    });
    setEnhancedPrompt(template);
  } else {
    setEnhancedPrompt(prompt.user_prompt_template);
  }
};
```

### **Common Variables**
```typescript
const COMMON_VARIABLES = [
  'product_name',
  'indication',
  'therapeutic_area',
  'target_population',
  'key_differentiators',
  'regulatory_pathway',
  'market_segment',
  'device_type',
  'indication_area',
  'study_objectives'
];
```

---

## 🚀 **Performance Optimization**

### **Lazy Loading**
```typescript
// Load prompts only when modal opens
useEffect(() => {
  if (isOpen) {
    loadPrompts();
  }
}, [isOpen, searchTerm, domainFilter, suiteFilter]);
```

### **Debounced Search**
```typescript
const [searchTerm, setSearchTerm] = useState('');
const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

useEffect(() => {
  if (isOpen) {
    loadPrompts();
  }
}, [debouncedSearchTerm]);
```

### **Caching**
```typescript
// Cache prompts in component state
const [prompts, setPrompts] = useState<Prompt[]>([]);
const [filteredPrompts, setFilteredPrompts] = useState<Prompt[]>([]);

// Only reload if filters change
useEffect(() => {
  if (isOpen && (searchTerm || domainFilter !== 'all' || suiteFilter !== 'all')) {
    loadPrompts();
  }
}, [searchTerm, domainFilter, suiteFilter]);
```

---

## 🧪 **Testing**

### **Unit Tests**
```typescript
describe('PromptEnhancementModal', () => {
  it('should load prompts on mount', async () => {
    render(<PromptEnhancementModal isOpen={true} onClose={jest.fn()} onApplyPrompt={jest.fn()} />);
    
    await waitFor(() => {
      expect(screen.getByText('Loading prompts...')).toBeInTheDocument();
    });
  });

  it('should filter prompts by domain', async () => {
    // Test implementation
  });

  it('should apply prompt template', async () => {
    // Test implementation
  });
});
```

### **Integration Tests**
```typescript
describe('Prompt Enhancement Integration', () => {
  it('should open modal when sparkles button is clicked', () => {
    render(<ChatInput value="" onChange={jest.fn()} onSend={jest.fn()} />);
    
    const sparklesButton = screen.getByRole('button', { name: /enhance prompt/i });
    fireEvent.click(sparklesButton);
    
    expect(screen.getByText('Prompt Enhancement Library')).toBeInTheDocument();
  });
});
```

---

## 🔧 **Configuration**

### **Environment Variables**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### **Feature Flags**
```typescript
const FEATURE_FLAGS = {
  ENABLE_PROMPT_ENHANCEMENT: true,
  ENABLE_AUTO_ENHANCEMENT: true,
  ENABLE_TEMPLATE_VARIABLES: true,
  MAX_PROMPTS_PER_PAGE: 50
};
```

---

## 📊 **Analytics and Monitoring**

### **Usage Tracking**
```typescript
const trackPromptEnhancement = (action: string, data: any) => {
  // Track usage analytics
  analytics.track('prompt_enhancement', {
    action,
    data,
    timestamp: new Date().toISOString()
  });
};
```

### **Performance Metrics**
```typescript
const trackPerformance = (metric: string, value: number) => {
  // Track performance metrics
  performance.mark(metric);
  performance.measure(metric, value);
};
```

---

## 🚀 **Deployment**

### **Build Process**
```bash
# Install dependencies
npm install

# Build the application
npm run build

# Start production server
npm start
```

### **Environment Setup**
```bash
# Set environment variables
export NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Run development server
npm run dev
```

---

## 🔮 **Future Enhancements**

### **Planned Features**
- **Custom Templates**: User-created prompt templates
- **Template Sharing**: Share templates across teams
- **AI Learning**: System learns from user preferences
- **Advanced Analytics**: Detailed usage analytics
- **Template Versioning**: Version control for templates
- **Bulk Operations**: Apply templates to multiple prompts

### **Technical Improvements**
- **Offline Support**: Cache templates for offline use
- **Real-time Updates**: Live updates when templates change
- **Advanced Search**: Semantic search capabilities
- **Template Recommendations**: AI-powered template suggestions
- **Performance Optimization**: Further performance improvements

---

## 📞 **Support and Maintenance**

### **Monitoring**
- **Error Tracking**: Monitor for errors and exceptions
- **Performance Monitoring**: Track response times and usage
- **User Analytics**: Understand how users interact with the feature

### **Maintenance**
- **Regular Updates**: Keep templates and features up to date
- **Bug Fixes**: Address issues as they arise
- **Performance Optimization**: Continuously improve performance
- **User Feedback**: Incorporate user feedback into improvements

---

**🎯 This technical guide provides comprehensive documentation for the Prompt Enhancement feature implementation.**

# 🚀 Automatic Agent Selection - Quick Start Guide

## Get Started in 5 Minutes

### 1. Install Dependencies

The system uses existing dependencies from your `package.json`:
- `openai` - For AI analysis
- `natural` - For NLP processing
- `zod` - For validation
- `framer-motion` - For animations

### 2. Environment Setup

Add to your `.env.local`:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Basic Usage

```typescript
import { useAutomaticMode } from '@/hooks/use-automatic-mode';
import { AutomaticModeInterface } from '@/components/chat/automatic-mode-interface';

function MyChatComponent() {
  const { 
    isProcessing, 
    orchestrationResult, 
    processQuery, 
    confirmAgent 
  } = useAutomaticMode();

  const handleQuery = async (query: string) => {
    await processQuery(query);
  };

  return (
    <div>
      <AutomaticModeInterface
        orchestrationResult={orchestrationResult}
        isProcessing={isProcessing}
        onConfirmAgent={confirmAgent}
      />
    </div>
  );
}
```

### 4. API Usage

```typescript
// Process a query
const response = await fetch('/api/chat/automatic-agent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: "What are the FDA requirements for drug approval?",
    userId: "user123"
  })
});

const { data } = await response.json();
console.log('Selected agent:', data.orchestrationResult.selectedAgent);
```

### 5. Test the System

```bash
# Run tests
npm test src/__tests__/automatic-agent-selection.test.ts

# Start development server
npm run dev

# Visit the demo page
# http://localhost:3000/automatic-agent-demo
```

## 🎯 Key Features

### Automatic Agent Selection
- **Zero-click experience** - Users get expert answers without manual selection
- **Intelligent routing** - Queries automatically reach the most qualified expert
- **Confidence scoring** - Shows users why specific agents were selected

### Three Orchestration Strategies
1. **Single Agent** - For straightforward queries
2. **Multi-Agent** - For interdisciplinary queries  
3. **Escalation** - For high-complexity queries

### Performance Learning
- Tracks agent performance over time
- Learns from user feedback
- Continuously improves selection accuracy

## 🔧 Configuration

### Agent Tiers
- **Tier 1**: Basic agents for simple queries
- **Tier 2**: Intermediate agents for moderate complexity
- **Tier 3**: Expert agents for complex queries

### Capabilities
Agents are matched based on capabilities like:
- `drug_information`
- `regulatory_compliance`
- `clinical_trials`
- `pharmacovigilance`

## 📊 Monitoring

### Performance Metrics
- Agent selection accuracy: > 85%
- Average selection time: < 2s
- User satisfaction: > 80%

### Query Analysis
The system analyzes:
- **Intent**: What the user wants to know
- **Entities**: Drugs, diseases, regulations mentioned
- **Complexity**: 1-10 scale
- **Domain**: Medical, regulatory, clinical, etc.

## 🚀 Production Deployment

### Docker
```yaml
services:
  orchestrator:
    build: .
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    deploy:
      replicas: 3
```

### Environment Variables
```env
OPENAI_API_KEY=your_key
REDIS_URL=redis://localhost:6379
POSTGRES_URL=postgresql://user:pass@localhost:5432/vital
```

## 🧪 Testing Examples

### Test Query Analysis
```typescript
const analyzer = new QueryAnalyzer();
const result = await analyzer.analyzeQuery("What is metformin?");
console.log(result.domain.primary); // "medical"
console.log(result.complexity.score); // 3
```

### Test Agent Matching
```typescript
const matcher = new AgentMatcher(agents);
const matches = await matcher.findBestAgents(analysis);
console.log(matches[0].agent.name); // Best matching agent
```

## 🔍 Troubleshooting

### Common Issues

1. **OpenAI API Key Missing**
   ```bash
   Error: OpenAI API key not found
   Solution: Add OPENAI_API_KEY to .env.local
   ```

2. **No Agents Found**
   ```bash
   Error: No suitable agents found
   Solution: Check agent configuration and capabilities
   ```

3. **Low Confidence Scores**
   ```bash
   Warning: Low confidence in agent selection
   Solution: Improve agent descriptions and capabilities
   ```

### Debug Mode

Enable debug logging:
```typescript
const orchestrator = new AutomaticAgentOrchestrator();
// Check console for detailed logs
```

## 📚 Next Steps

1. **Customize Agents**: Add your own agents with specific capabilities
2. **Improve Training**: Add more training data for better classification
3. **Monitor Performance**: Set up alerts for performance metrics
4. **Scale Up**: Configure for high-traffic production use

## 🤝 Support

- **Documentation**: See `AUTOMATIC_AGENT_SELECTION_README.md`
- **Tests**: Run `npm test` for comprehensive testing
- **Demo**: Use `AutomaticAgentDemo` component for testing

---

**Ready to go!** 🎉 Your automatic agent selection system is now implemented and ready for use.

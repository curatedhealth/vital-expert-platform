# 🤖 VITAL Automatic Agent Selection System

## Overview

The Automatic Agent Selection system intelligently routes user queries to the most appropriate expert agents without requiring manual selection. It uses advanced NLP analysis, confidence scoring, and performance learning to provide optimal responses.

## 🚀 Key Features

- **Zero-Click Excellence**: Users get expert answers without selecting agents
- **Intelligent Routing**: Queries automatically reach the most qualified expert
- **Confidence Transparency**: Show users why specific agents were selected
- **Seamless Escalation**: Automatic tier progression for complex queries
- **Performance Learning**: System improves agent selection over time

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Query Input → Auto Mode Indicator → Confidence Display  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    INTELLIGENT ORCHESTRATOR                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   Query Analysis Engine                   │  │
│  │  • NLP Processing  • Intent Classification               │  │
│  │  • Entity Extraction  • Complexity Assessment            │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                 Agent Matching Algorithm                  │  │
│  │  • Capability Matching  • Confidence Scoring             │  │
│  │  • Historical Performance  • Load Balancing              │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  Routing Decision Engine                  │  │
│  │  • Single Agent  • Multi-Agent  • Tier Escalation       │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                         AGENT POOL                              │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  │
│  │ Tier 1 │  │ Tier 1 │  │ Tier 2 │  │ Tier 2 │  │ Tier 3 │  │
│  │ Medical│  │Regulat.│  │Clinical│  │Research│  │ Expert │  │
│  └────────┘  └────────┘  └────────┘  └────────┘  └────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## 📁 File Structure

```
src/
├── features/chat/services/
│   ├── query-analyzer.ts           # NLP analysis and entity extraction
│   ├── agent-matcher.ts            # Agent scoring and matching
│   ├── automatic-orchestrator.ts   # Main orchestration logic
│   └── performance-tracker.ts      # Performance monitoring
├── components/chat/
│   ├── automatic-mode-interface.tsx # UI for automatic mode
│   └── automatic-agent-demo.tsx    # Demo component
├── hooks/
│   └── use-automatic-mode.ts       # React hook for state management
├── app/api/chat/automatic-agent/
│   └── route.ts                    # API endpoint
└── __tests__/
    └── automatic-agent-selection.test.ts # Test suite
```

## 🔧 Core Components

### 1. Query Analyzer (`query-analyzer.ts`)

Analyzes user queries using NLP and AI to extract:
- **Intent**: Primary and secondary intents
- **Entities**: Drugs, diseases, regulations, organizations
- **Complexity**: 1-10 scale with factors
- **Domain**: Medical, regulatory, clinical, etc.
- **Regulatory Requirements**: Regional compliance needs
- **Required Capabilities**: Agent capabilities needed

```typescript
const analyzer = new QueryAnalyzer();
const analysis = await analyzer.analyzeQuery("What are the FDA requirements for drug approval?");
```

### 2. Agent Matcher (`agent-matcher.ts`)

Scores and ranks agents based on:
- **Domain Match**: How well agent matches query domain
- **Capability Match**: Required vs available capabilities
- **Complexity Fit**: Agent tier vs query complexity
- **Historical Performance**: Past success rates
- **Availability**: Real-time agent status

```typescript
const matcher = new AgentMatcher(agents);
const matches = await matcher.findBestAgents(analysis, {
  maxAgents: 5,
  minConfidence: 0.6
});
```

### 3. Automatic Orchestrator (`automatic-orchestrator.ts`)

Main orchestration engine with three strategies:
- **Single Agent**: For straightforward queries
- **Multi-Agent**: For interdisciplinary queries
- **Escalation**: For high-complexity queries

```typescript
const orchestrator = new AutomaticAgentOrchestrator();
const result = await orchestrator.orchestrate("Complex regulatory query...");
```

### 4. Performance Tracker (`performance-tracker.ts`)

Tracks and learns from agent performance:
- Query success rates
- Response times
- User satisfaction
- Domain-specific performance
- Trend analysis

## 🎨 User Interface

### Automatic Mode Interface

The `AutomaticModeInterface` component provides:
- **Processing State**: Shows analysis progress
- **Agent Selection**: Displays selected agent with confidence
- **Reasoning**: Explains why the agent was chosen
- **Alternatives**: Shows other suitable agents
- **Query Analysis**: Detailed breakdown of query analysis

### Demo Component

The `AutomaticAgentDemo` component includes:
- **Sample Queries**: Pre-built queries for testing
- **Custom Input**: Manual query entry
- **Analysis View**: Detailed query analysis
- **Performance Metrics**: System performance data

## 🚀 Usage

### Basic Usage

```typescript
import { useAutomaticMode } from '@/hooks/use-automatic-mode';

function ChatComponent() {
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
    <AutomaticModeInterface
      orchestrationResult={orchestrationResult}
      isProcessing={isProcessing}
      onConfirmAgent={confirmAgent}
    />
  );
}
```

### API Usage

```typescript
// Process query
const response = await fetch('/api/chat/automatic-agent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: "What are the FDA requirements for drug approval?",
    userId: "user123"
  })
});

const { data } = await response.json();
const { orchestrationResult } = data;
```

## 🧪 Testing

Run the comprehensive test suite:

```bash
npm test src/__tests__/automatic-agent-selection.test.ts
```

Tests cover:
- Query analysis accuracy
- Agent matching algorithms
- Orchestration strategies
- Performance tracking
- Integration scenarios

## 📊 Performance Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Agent Selection Accuracy** | > 85% | User confirmation rate |
| **Average Selection Time** | < 2s | Performance monitoring |
| **Confidence Score Accuracy** | > 80% | Correlation with success |
| **Escalation Rate** | < 15% | Workflow tracking |
| **User Override Rate** | < 20% | Manual selection after auto |

## 🔧 Configuration

### Environment Variables

```env
OPENAI_API_KEY=your_openai_key
REDIS_URL=redis://localhost:6379
POSTGRES_URL=postgresql://user:pass@localhost:5432/vital
```

### Agent Configuration

Agents are configured with:
- **Tier**: 1 (basic), 2 (intermediate), 3 (expert)
- **Capabilities**: Array of agent capabilities
- **Knowledge Domains**: Areas of expertise
- **Business Function**: Primary function
- **RAG Enabled**: Knowledge base access

## 🚀 Deployment

### Docker Configuration

```yaml
services:
  orchestrator:
    build: ./orchestrator
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - MODEL_NAME=gpt-4-turbo-preview
      - REDIS_URL=redis://redis:6379
    deploy:
      replicas: 3
      resources:
        limits:
          memory: 2G
          cpus: '2'
```

### Production Considerations

- **Caching**: Redis for query analysis results
- **Monitoring**: Performance metrics and alerts
- **Scaling**: Horizontal scaling for high load
- **Security**: Input validation and sanitization

## 🔒 Security & Privacy

- **Data Protection**: Query anonymization before analysis
- **PII Detection**: Automatic detection and masking
- **Audit Trail**: Complete selection logging
- **Compliance**: HIPAA and GDPR compliance

## 📈 Future Enhancements

- **Machine Learning**: Continuous improvement from user feedback
- **Multi-Language**: Support for multiple languages
- **Advanced Analytics**: Deeper performance insights
- **Integration**: Connect with external knowledge bases
- **Customization**: User-specific agent preferences

## 🤝 Contributing

1. Follow the existing code structure
2. Add comprehensive tests
3. Update documentation
4. Ensure performance targets are met

## 📝 License

This project is part of the VITAL Path Digital Health Platform.

---

**Status**: ✅ Production Ready  
**Version**: 1.0.0  
**Last Updated**: January 2025

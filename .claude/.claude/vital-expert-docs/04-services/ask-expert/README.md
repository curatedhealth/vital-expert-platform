# Ask Expert Service Documentation

## 📋 Overview

The **Ask Expert** service is VITAL's flagship conversational AI product, providing intelligent access to expert knowledge through natural language conversations. This service enables users to consult with AI-powered expert agents across multiple domains including healthcare, regulatory, clinical, technical, and business expertise.

---

## 🎯 Service Architecture: The 2×2 Mode Matrix

Ask Expert operates across **4 distinct modes** organized in a 2×2 matrix based on two dimensions:

### Dimension 1: Interaction Type
- **QUERY (One-shot)**: Single question/answer interaction with immediate response
- **CHAT (Multi-turn)**: Conversational interaction with context maintenance

### Dimension 2: Expert Selection
- **MANUAL**: User explicitly selects the expert they want to consult
- **AUTOMATIC**: System intelligently selects optimal expert(s) based on query analysis

```
                    AUTOMATIC Selection  │  MANUAL Selection
                    (System Picks)       │  (User Picks)
                                        │
QUERY         ┌──────────────────────────┼──────────────────────────┐
(One-shot)    │  MODE 3: Query-Auto     │  MODE 2: Query-Manual   │
              │  Multi-agent synthesis   │  Single expert answer   │
              └──────────────────────────┼──────────────────────────┘
                                        │
CHAT          ┌──────────────────────────┼──────────────────────────┐
(Multi-turn)  │  MODE 4: Chat-Auto      │  MODE 1: Chat-Manual    │
              │  Dynamic orchestration   │  Fixed expert dialogue  │
              └──────────────────────────┼──────────────────────────┘
```

---

## 📚 Mode Documentation

### MODE 1: Interactive Manual (Chat-Manual)
**File:** [`MODE_1_INTERACTIVE_MANUAL_GOLD_STANDARD.md`](./MODE_1_INTERACTIVE_MANUAL_GOLD_STANDARD.md)

**Characteristics:**
- **Interaction**: Multi-turn conversation
- **Selection**: User picks specific expert
- **Use Case**: Deep dive with trusted expert
- **Implementation**: 170+ pages, LangGraph state machine
- **Response Time**: <2s per turn
- **Cost**: ~$0.10 per turn

**Best For:**
- User knows which expert they need
- Building relationship with specific expert persona
- Consistent voice and perspective needed
- Training/educational content

**Key Features:**
- Conversation history with full context
- Expert persona consistency
- RAG-powered knowledge retrieval
- Server-Sent Events (SSE) streaming
- Tool calling capabilities

---

### MODE 2: Query Manual (Query-Manual)
**File:** [`MODE_2_QUERY_MANUAL_GOLD_STANDARD.md`](./MODE_2_QUERY_MANUAL_GOLD_STANDARD.md)

**Characteristics:**
- **Interaction**: Single question/answer
- **Selection**: User picks specific expert
- **Use Case**: Quick authoritative answer
- **Implementation**: Stateless, optimized for speed
- **Response Time**: <1.5s
- **Cost**: ~$0.05 per query (40% less than Mode 1)

**Best For:**
- Quick validation from specific expert
- Branded responses (specific persona voice)
- Known expertise requirements
- High-volume simple queries

**Key Features:**
- Fast single-shot responses
- Expert-specific knowledge base
- No session overhead
- Citation support
- Cacheable responses

---

### MODE 3: Query Automatic (Query-Auto)
**File:** [`MODE_3_QUERY_AUTOMATIC_GOLD_STANDARD.md`](./MODE_3_QUERY_AUTOMATIC_GOLD_STANDARD.md)

**Characteristics:**
- **Interaction**: Single comprehensive answer
- **Selection**: System selects 3-5 experts automatically
- **Use Case**: Complex multi-domain questions
- **Implementation**: Sophisticated agent selection + synthesis
- **Response Time**: 3-5s
- **Cost**: ~$0.15-0.30 per query

**Best For:**
- User doesn't know which expert to ask
- Question spans multiple domains
- Need diverse perspectives
- Strategic decision support

**Key Features:**
- Intelligent agent selection algorithm
- Multi-perspective synthesis
- Consensus and conflict resolution
- Diversity optimization
- Comprehensive citations

**Agent Selection Process:**
1. Query analysis and domain detection
2. Semantic search for top 10 candidates
3. Relevance and diversity scoring
4. Optimal team composition (3-5 agents)
5. Parallel knowledge retrieval
6. Multi-agent response synthesis

---

### MODE 4: Chat Auto (Chat-Auto)
**File:** [`MODE_4_CHAT_AUTO_GOLD_STANDARD.md`](./MODE_4_CHAT_AUTO_GOLD_STANDARD.md)

**Characteristics:**
- **Interaction**: Multi-turn intelligent conversation
- **Selection**: Dynamic agent orchestration
- **Use Case**: Complex problem exploration
- **Implementation**: Event-driven, learning system
- **Response Time**: 2-4s per turn
- **Cost**: ~$0.15 per turn (optimized caching)
- **Complexity**: Very High

**Best For:**
- Evolving multi-domain problems
- Discovery and learning journeys
- Strategic planning sessions
- Iterative product development

**Key Features:**
- **Dynamic Agent Switching**: Seamlessly adds/removes experts as conversation evolves
- **Context Evolution**: Learning system adapts to conversation patterns
- **Multi-Agent Coordination**: 4 coordination strategies (parallel, sequential, hierarchical, collaborative)
- **Continuous Memory**: Full conversation history with intelligent summarization
- **Adaptive Expertise**: Brings in new experts when topics shift

**Advanced Capabilities:**
- Conversation phase detection (initialization → exploration → deep dive → solution building → conclusion)
- Agent role assignment (lead, support, reviewer, specialist)
- Real-time streaming responses
- Performance optimization with multi-level caching
- Comprehensive observability and monitoring

---

## 📊 Mode Comparison Matrix

| Aspect | Mode 1 | Mode 2 | Mode 3 | Mode 4 |
|--------|--------|--------|--------|--------|
| **Interaction** | Chat | Query | Query | Chat |
| **Selection** | Manual | Manual | Auto | Auto |
| **# of Experts** | 1 | 1 | 3-5 | 2-5 (dynamic) |
| **Response Time** | <2s | <1.5s | 3-5s | 2-4s |
| **Cost per Turn** | $0.10 | $0.05 | $0.20 | $0.15 |
| **State** | Stateful | Stateless | Stateless | Highly Stateful |
| **Complexity** | Medium | Low | High | Very High |
| **Best Use** | Expert dialogue | Quick answer | Multi-domain Q | Problem exploration |
| **Context Retention** | Full session | None | None | Full + evolution |
| **Learning** | No | No | No | Yes |
| **Agent Switching** | None | None | None | Dynamic |

---

## 🛠 Technical Stack

### Common Infrastructure
- **Frontend**: Next.js 14 + TypeScript + React Server Components
- **Backend**: FastAPI + Python 3.11+
- **AI Orchestration**: LangGraph + LangChain
- **LLM Models**: OpenAI GPT-4 Turbo, Anthropic Claude 3 (fallback)
- **Database**: PostgreSQL 15 + pgvector for vector search
- **Caching**: Redis 7.x for performance optimization
- **Search**: Pinecone for semantic agent discovery

### Mode-Specific Components

**Modes 1 & 4 (Chat):**
- Conversation state management
- Session persistence
- Message history tracking
- Context window optimization

**Modes 3 & 4 (Automatic):**
- Agent selection algorithms
- Multi-agent coordination
- Synthesis engines
- Conflict resolution

**Mode 4 Exclusive:**
- Dynamic orchestration engine
- Context evolution system
- Learning and adaptation
- Advanced caching strategies

---

## 📈 Performance Targets

| Metric | Mode 1 | Mode 2 | Mode 3 | Mode 4 |
|--------|--------|--------|--------|--------|
| **P50 Response** | <1.5s | <1s | <3s | <2s |
| **P95 Response** | <2.5s | <2s | <5s | <4s |
| **P99 Response** | <4s | <3s | <7s | <6s |
| **Accuracy** | >95% | >95% | >90% | >95% |
| **User Satisfaction** | >4.7/5 | >4.5/5 | >4.5/5 | >4.8/5 |
| **Availability** | 99.9% | 99.9% | 99.9% | 99.9% |
| **Concurrent Sessions** | 100+ | 500+ | 200+ | 100+ |

---

## 🚀 Implementation Status

| Mode | Status | Pages | Implementation Time | Priority |
|------|--------|-------|---------------------|----------|
| **Mode 1** | ✅ Complete | 170+ | 2 weeks (80h) | HIGH |
| **Mode 2** | ✅ Complete | 65 | 2 weeks (80h) | HIGH |
| **Mode 3** | ✅ Complete | 78 | 3 weeks (120h) | MEDIUM |
| **Mode 4** | ✅ Complete | 80 | 5 weeks (200h) | CRITICAL |

**Total Documentation**: 306KB across 4 comprehensive gold-standard implementation guides

---

## 📖 How to Use This Documentation

### For Product Managers
- Start with this README to understand the mode matrix
- Review each mode's "Executive Summary" and "Use Cases"
- Compare modes using the comparison matrix above

### For Engineers
1. **Choose Your Mode**: Select based on requirements matrix
2. **Read Full Spec**: Study the complete MODE file
3. **Implementation Guide**: Follow the detailed technical sections
4. **Architecture**: Review LangGraph implementations
5. **Testing**: Use provided test suites
6. **Deployment**: Follow Kubernetes deployment guides

### For Architects
- Each MODE file includes:
  - Complete system architecture diagrams
  - LangGraph state machine implementations
  - Database schemas
  - API contracts
  - Performance optimization strategies
  - Security and compliance sections

---

## 🎯 Recommended Implementation Order

1. **Mode 2** (Query-Manual) - Simplest, validates core functionality
2. **Mode 1** (Chat-Manual) - Adds conversation state management
3. **Mode 3** (Query-Auto) - Introduces multi-agent synthesis
4. **Mode 4** (Chat-Auto) - Most complex, requires all prior learnings

---

## 🔗 Related Documentation

- **Service Overview**: [`../README.md`](../README.md) - All VITAL services comparison
- **Architecture**: [`../../05-architecture/`](../../05-architecture/) - System architecture docs
- **API Specifications**: [`../../09-api/`](../../09-api/) - API documentation
- **Agent Team**: [`../../08-agents/`](../../08-agents/) - Agent coordination guide

---

## 📞 Support

For questions about Ask Expert service:
- Review the appropriate MODE documentation
- Check the architecture requirements document
- Consult the agent team structure guide
- Refer to the API specifications

---

**Last Updated**: November 17, 2025
**Version**: 1.0
**Status**: Production Ready
**Total Lines**: ~10,000+ lines of production-ready code across all modes

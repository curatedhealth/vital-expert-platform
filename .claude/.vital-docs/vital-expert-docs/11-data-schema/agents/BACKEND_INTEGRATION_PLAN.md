# Backend Integration Plan: VITAL Agent System

## Overview
Complete integration plan to make the 165 agents operational in the VITAL platform.

---

## Phase 1: Agent Selection Service (Week 1)

### **1.1 Create Agent Selector Service**

**Location:** `services/ai-engine/src/services/agent_selector.py`

```python
"""
Agent Selection Service
Reads agent documentation from Supabase Storage and selects appropriate agents.
"""

class AgentSelector:
    def __init__(self, supabase_client, postgres_client):
        self.supabase = supabase_client
        self.postgres = postgres_client
        self._agent_cache = {}
    
    async def select_agent(
        self,
        query: str,
        context: dict,
        level: int = None,
        department: str = None
    ) -> Agent:
        """
        Select the best agent for a query.
        
        Args:
            query: User query
            context: Additional context (user role, preferences, etc.)
            level: Optional agent level filter (1-5)
            department: Optional department filter
            
        Returns:
            Selected Agent object
        """
        # 1. Load candidate agents from DB
        candidates = await self._load_candidates(level, department)
        
        # 2. Score agents based on query
        scored = await self._score_agents(candidates, query, context)
        
        # 3. Select best agent
        selected = scored[0]
        
        # 4. Load agent documentation
        agent_doc = await self._load_agent_docs(selected)
        
        return Agent(
            **selected,
            documentation=agent_doc,
            delegation_chain=await self._get_delegation_chain(selected.id)
        )
    
    async def _load_candidates(self, level, department):
        """Load candidate agents from database."""
        query = """
            SELECT 
                a.id, a.name, a.slug, a.description,
                a.system_prompt, a.documentation_url,
                al.level_number, a.department_name
            FROM agents a
            JOIN agent_levels al ON a.agent_level_id = al.id
            WHERE 1=1
        """
        
        params = []
        if level:
            query += " AND al.level_number = $1"
            params.append(level)
        if department:
            query += f" AND a.department_name = ${len(params) + 1}"
            params.append(department)
            
        return await self.postgres.fetch(query, *params)
    
    async def _score_agents(self, candidates, query, context):
        """Score agents using semantic similarity."""
        # Use embedding model to score agents
        # Consider: query similarity, agent expertise, historical performance
        pass
    
    async def _load_agent_docs(self, agent):
        """Fetch agent documentation from Supabase Storage."""
        if agent.documentation_url in self._agent_cache:
            return self._agent_cache[agent.documentation_url]
        
        # Fetch from Supabase Storage
        response = await self.supabase.storage.from_('agent-documentation').download(
            agent.documentation_path
        )
        
        docs = response.decode('utf-8')
        self._agent_cache[agent.documentation_url] = docs
        return docs
    
    async def _get_delegation_chain(self, agent_id):
        """Get agents this agent can delegate to."""
        return await self.postgres.fetch("""
            SELECT 
                child.id, child.name, child.slug,
                child_level.level_number,
                ah.relationship_type,
                ah.delegation_trigger
            FROM agent_hierarchies ah
            JOIN agents child ON child.id = ah.child_agent_id
            JOIN agent_levels child_level ON child_level.id = child.agent_level_id
            WHERE ah.parent_agent_id = $1
            ORDER BY child_level.level_number, child.name
        """, agent_id)
```

**Tests:** `tests/services/test_agent_selector.py`

---

## Phase 2: Ask Expert Integration (Week 2)

### **2.1 Update Ask Expert Service**

**Location:** `services/ai-engine/src/services/ask_expert.py`

```python
from services.agent_selector import AgentSelector

class AskExpertService:
    def __init__(self, agent_selector, graphrag_service, llm_service):
        self.agent_selector = agent_selector
        self.graphrag = graphrag_service
        self.llm = llm_service
    
    async def answer_query(self, query: str, user_context: dict) -> ExpertResponse:
        """
        Answer user query using expert agents.
        """
        # 1. Select appropriate expert agent (Level 2)
        expert = await self.agent_selector.select_agent(
            query=query,
            context=user_context,
            level=2  # Expert level
        )
        
        # 2. Load agent's RAG context
        rag_context = await self.graphrag.query(
            query=query,
            agent_id=expert.id,
            session_id=user_context.session_id
        )
        
        # 3. Execute agent with context
        response = await self.llm.generate(
            system_prompt=expert.system_prompt,
            user_message=query,
            context=rag_context.context_chunks,
            evidence_chain=rag_context.evidence_chain,
            model=expert.base_model,
            temperature=expert.temperature
        )
        
        # 4. Check if delegation needed
        if response.confidence < 0.7 or response.requires_specialist:
            # Delegate to specialist
            specialist = await self._delegate_to_specialist(expert, query, user_context)
            response = await self._execute_specialist(specialist, query, rag_context)
        
        return ExpertResponse(
            answer=response.content,
            agent_name=expert.name,
            agent_level=expert.level_number,
            confidence=response.confidence,
            evidence_chain=rag_context.evidence_chain,
            delegated_to=specialist.name if specialist else None
        )
```

---

## Phase 3: Ask Panel Integration (Week 3)

### **3.1 Panel Assembly Service**

**Location:** `services/ai-engine/src/services/panel_service.py`

```python
class PanelService:
    async def assemble_panel(
        self,
        query: str,
        panel_type: str,  # 'consensus', 'debate', 'parallel'
        domain: str = None
    ) -> Panel:
        """
        Assemble a panel of experts for complex queries.
        """
        # 1. Identify required expertise
        required_expertise = await self._analyze_query_complexity(query)
        
        # 2. Select 3-5 expert agents
        panel_members = []
        for expertise in required_expertise:
            expert = await self.agent_selector.select_agent(
                query=query,
                context={'expertise': expertise},
                level=2,
                department=expertise.department
            )
            panel_members.append(expert)
        
        # 3. Add a Master agent as chair (if needed)
        if len(panel_members) > 3:
            chair = await self.agent_selector.select_agent(
                query=query,
                level=1,  # Master level
                department=panel_members[0].department_name
            )
            panel_members.insert(0, chair)
        
        return Panel(
            members=panel_members,
            panel_type=panel_type,
            chair=chair if chair else None
        )
```

---

## Phase 4: Workflow Integration (Week 4)

### **4.1 Workflow Agent Assignment**

**Location:** `services/ai-engine/src/services/workflow_service.py`

```python
class WorkflowService:
    async def execute_workflow(
        self,
        workflow_id: UUID,
        user_context: dict
    ) -> WorkflowResult:
        """
        Execute a workflow with appropriate agents for each step.
        """
        # 1. Load workflow template
        workflow = await self.load_workflow(workflow_id)
        
        # 2. For each step, assign appropriate agent
        results = []
        for step in workflow.steps:
            # Select agent based on step requirements
            agent = await self.agent_selector.select_agent(
                query=step.description,
                context={
                    'workflow': workflow.name,
                    'step': step.name,
                    'required_skills': step.required_skills
                },
                level=step.agent_level  # Defined in workflow template
            )
            
            # Execute step with selected agent
            result = await self._execute_step(step, agent, user_context)
            results.append(result)
            
            # Check if delegation needed
            if result.requires_escalation:
                supervisor = await self._get_supervisor(agent)
                result = await self._execute_step(step, supervisor, user_context)
        
        return WorkflowResult(steps=results, status='completed')
```

---

## Phase 5: Solution Builder Integration (Week 5)

### **5.1 Agent Recommendations**

```python
class SolutionBuilderService:
    async def recommend_agents(
        self,
        solution_type: str,
        user_requirements: dict
    ) -> List[AgentRecommendation]:
        """
        Recommend agents for solution building.
        """
        # Recommend appropriate agents based on solution type
        # e.g., "Publication Planning" → Publications Expert + Scientific Comms Specialist
        pass
```

---

## Implementation Checklist

### **Week 1: Agent Selection Service**
- [ ] Create `AgentSelector` class
- [ ] Implement agent loading from DB
- [ ] Implement scoring algorithm
- [ ] Add documentation caching
- [ ] Add delegation chain retrieval
- [ ] Write unit tests
- [ ] Write integration tests

### **Week 2: Ask Expert**
- [ ] Integrate `AgentSelector`
- [ ] Update expert selection logic
- [ ] Add delegation logic
- [ ] Update response format
- [ ] Write tests
- [ ] Deploy to staging

### **Week 3: Ask Panel**
- [ ] Create `PanelService`
- [ ] Implement panel assembly
- [ ] Add panel orchestration
- [ ] Write tests
- [ ] Deploy to staging

### **Week 4: Workflows**
- [ ] Update workflow execution
- [ ] Add agent assignment per step
- [ ] Add escalation logic
- [ ] Write tests
- [ ] Deploy to staging

### **Week 5: Solution Builder**
- [ ] Add agent recommendations
- [ ] Update UI to show agent info
- [ ] Write tests
- [ ] Deploy to staging

### **Week 6: Production Deployment**
- [ ] Performance testing
- [ ] Load testing (100 concurrent users)
- [ ] Monitor agent selection performance
- [ ] Verify documentation caching
- [ ] Deploy to production

---

## Success Metrics

- **Agent Selection Time:** < 500ms
- **Documentation Load Time:** < 100ms (cached)
- **Ask Expert Response Time:** < 5s
- **Panel Assembly Time:** < 2s
- **Workflow Execution:** Within SLA per workflow type

---

## Documentation

- [ ] API documentation (OpenAPI/Swagger)
- [ ] Service integration guide
- [ ] Agent selection algorithm docs
- [ ] Delegation logic documentation
- [ ] Troubleshooting guide

---

**Ready to start implementation!** 🚀


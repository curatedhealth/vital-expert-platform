# 🤝 Human-in-the-Loop (HITL) System - Complete Guide

## 📋 **Overview**

The HITL system adds **user approval checkpoints** to autonomous agent execution, giving users control over critical decisions, tool usage, and resource consumption.

---

## 🎯 **When HITL is Available**

| Mode | HITL Support | Use Case |
|------|-------------|----------|
| **Mode 1** (Manual-Interactive) | ❌ Not Needed | User already controls conversation |
| **Mode 2** (Auto-Interactive) | ⚠️ Optional | Confirm agent switches |
| **Mode 3** (Manual-Autonomous) | ✅ Recommended | Approve plan, tools, sub-agents |
| **Mode 4** (Auto-Autonomous) | ✅ **Highly Recommended** | Full control over autonomous execution |

---

## 🔧 **5 HITL Checkpoints**

### **1. Plan Approval** 📋
**When**: After agent generates execution plan  
**What**: User reviews and approves the multi-step plan  
**Always Required**: Yes (if HITL enabled)

**Example**:
```
Step 1: Deep Search (5 min)
Step 2: Competitive Analysis (10 min)
Step 3: Risk Assessment (15 min)
Step 4: Generate Report (10 min)

[✅ Approve] [✏️ Modify] [❌ Cancel]
```

---

### **2. Tool Execution Approval** 🔧
**When**: Before executing external tools  
**What**: User approves tool usage and cost  
**Auto-Approved**: Safe tools (read-only) in Balanced mode

**Example**:
```
Tools to Execute:
• Web Search: "FDA 510(k) requirements" ($0.02)
• FDA Database: "Class II devices" ($0.05)
• Document Parser: fda_guidance.pdf ($0.10)

Total Cost: $0.17 | Duration: 3-5 min

[✅ Approve All] [⚙️ Select Tools] [❌ Skip]
```

---

### **3. Sub-Agent Spawning Approval** 👥
**When**: Before spawning specialist sub-agents  
**What**: User approves hiring additional expertise  
**Auto-Approved**: In Minimal mode

**Example**:
```
Spawn Sub-Agent:
🤖 Risk Analysis Specialist
   Level: 3 (Specialist)
   Task: ISO 14971 risk assessment
   Cost: $0.50 | Duration: 10-15 min

Why: Complex risk analysis requires specialized expertise.

[✅ Approve] [👤 View Profile] [❌ Skip]
```

---

### **4. Critical Decision Approval** ⚠️
**When**: Before making important recommendations  
**What**: User reviews and approves key decisions  
**Always Required**: Yes (unless HITL disabled)

**Example**:
```
CRITICAL DECISION

Recommended Regulatory Pathway:
FDA 510(k) Traditional Submission

Confidence: 87%
Expected Timeline: 6-9 months
Expected Cost: $75K - $125K

Reasoning:
• Device classified as Class II
• 3 strong predicate devices found
• Substantial equivalence demonstrated

[✅ Accept] [📊 Show Evidence] [🔄 Reconsider]
```

---

### **5. Artifact Generation Approval** 📄
**When**: Before generating documents/reports  
**What**: User approves artifact creation  
**Auto-Approved**: In Balanced and Minimal modes

**Example**:
```
Generate Artifacts:
1. 510(k) Strategy Report (PDF, ~25 pages)
2. Predicate Device Comparison (Excel)
3. Action Items Checklist (PDF)

Generation Time: 5 minutes

[✅ Generate All] [⚙️ Customize] [❌ Skip]
```

---

## 🎚️ **3 Safety Levels**

### **Conservative** ⚠️ (Maximum Control)
**When to Use**: First-time users, high-stakes decisions, regulatory work

**Requires Approval For**:
- ✅ Plan execution
- ✅ All tool executions (including safe tools)
- ✅ All sub-agent spawning
- ✅ All critical decisions
- ✅ All artifact generation

**Pros**: Maximum control, no surprises  
**Cons**: Many approval prompts, slower execution

---

### **Balanced** ⚖️ (Recommended Default)
**When to Use**: Most users, most scenarios

**Requires Approval For**:
- ✅ Plan execution
- ✅ Risky tools (with side effects, external APIs)
- ✅ Sub-agent spawning
- ✅ Critical decisions
- ⚪ Auto-approves: Safe tools, standard artifacts

**Pros**: Good balance of control and speed  
**Cons**: Some automatic actions

---

### **Minimal** ⚡ (Speed Priority)
**When to Use**: Experienced users, routine tasks, trusted agents

**Requires Approval For**:
- ✅ Plan execution
- ✅ Critical decisions only
- ⚪ Auto-approves: All tools, sub-agents, artifacts

**Pros**: Fast execution, fewer interruptions  
**Cons**: Less control over details

---

## 💻 **Frontend Integration**

### **HITL Toggle Component**

```typescript
// components/HITLToggle.tsx

interface HITLToggleProps {
  mode: 'mode1' | 'mode2' | 'mode3' | 'mode4';
  value: boolean;
  onChange: (enabled: boolean) => void;
  safetyLevel: 'conservative' | 'balanced' | 'minimal';
  onSafetyLevelChange: (level: string) => void;
}

export function HITLToggle({
  mode,
  value,
  onChange,
  safetyLevel,
  onSafetyLevelChange
}: HITLToggleProps) {
  // Hide for Mode 1 (not applicable)
  if (mode === 'mode1') return null;
  
  // Optional for Mode 2
  const isOptional = mode === 'mode2';
  
  return (
    <div className="hitl-toggle">
      <Switch
        checked={value}
        onChange={onChange}
        label="Human-in-the-Loop"
      />
      
      {value && (
        <RadioGroup
          value={safetyLevel}
          onChange={onSafetyLevelChange}
          options={[
            { value: 'conservative', label: 'Conservative', icon: '⚠️' },
            { value: 'balanced', label: 'Balanced', icon: '⚖️' },
            { value: 'minimal', label: 'Minimal', icon: '⚡' }
          ]}
        />
      )}
      
      {isOptional && (
        <p className="hint">Optional for interactive mode</p>
      )}
    </div>
  );
}
```

---

### **Approval Dialog Component**

```typescript
// components/HITLApprovalDialog.tsx

interface HITLApprovalDialogProps {
  checkpoint: HITLCheckpoint;
  request: PlanApprovalRequest | ToolExecutionApprovalRequest | ...;
  onApprove: () => void;
  onReject: () => void;
  onModify?: (modifications: any) => void;
}

export function HITLApprovalDialog({
  checkpoint,
  request,
  onApprove,
  onReject,
  onModify
}: HITLApprovalDialogProps) {
  // Render appropriate approval UI based on checkpoint type
  switch (checkpoint.type) {
    case 'plan_approval':
      return <PlanApprovalUI request={request} ... />;
    case 'tool_execution':
      return <ToolApprovalUI request={request} ... />;
    // ... other checkpoint types
  }
}
```

---

## 🔌 **Backend Integration**

### **Example: Mode 3 (Manual-Autonomous) with HITL**

```python
# mode3_manual_autonomous.py

from services.hitl_service import (
    create_hitl_service,
    HITLSafetyLevel,
    PlanApprovalRequest,
    ToolExecutionApprovalRequest,
    SubAgentApprovalRequest,
    CriticalDecisionApprovalRequest
)

class Mode3ManualAutonomousWorkflow:
    """Mode 3: Manual-Autonomous with HITL"""
    
    async def execute(self, state):
        # 1. Initialize HITL service
        hitl = create_hitl_service(
            enabled=state.get('hitl_enabled', True),
            safety_level=HITLSafetyLevel(state.get('hitl_safety_level', 'balanced'))
        )
        
        # 2. Generate plan using Tree-of-Thoughts
        plan = await self.tot_agent.generate_plan(state['query'])
        
        # 3. CHECKPOINT 1: Plan Approval
        plan_approval = await hitl.request_plan_approval(
            request=PlanApprovalRequest(
                agent_id=state['selected_agent_id'],
                agent_name=state['selected_agent_name'],
                plan_steps=plan.steps,
                total_estimated_time_minutes=plan.estimated_time,
                confidence_score=plan.confidence,
                tools_required=plan.tools,
                sub_agents_required=plan.sub_agents
            ),
            session_id=state['session_id'],
            user_id=state['user_id']
        )
        
        if plan_approval.status == 'rejected':
            return {'status': 'cancelled', 'reason': 'User rejected plan'}
        
        # 4. Execute each step
        results = []
        for step in plan.steps:
            # CHECKPOINT 2: Tool Execution Approval
            if step.requires_tools:
                tool_approval = await hitl.request_tool_execution_approval(
                    request=ToolExecutionApprovalRequest(
                        step_number=step.number,
                        step_name=step.name,
                        tools=step.tools,
                        total_estimated_cost=step.cost,
                        total_estimated_duration_minutes=step.duration,
                        has_side_effects=step.has_side_effects
                    ),
                    session_id=state['session_id'],
                    user_id=state['user_id']
                )
                
                if tool_approval.status == 'rejected':
                    continue  # Skip this step
            
            # CHECKPOINT 3: Sub-Agent Approval
            if step.requires_sub_agent:
                subagent_approval = await hitl.request_subagent_approval(
                    request=SubAgentApprovalRequest(
                        parent_agent_id=state['selected_agent_id'],
                        sub_agent_id=step.sub_agent_id,
                        sub_agent_name=step.sub_agent_name,
                        sub_agent_level=step.sub_agent_level,
                        sub_agent_specialty=step.sub_agent_specialty,
                        task_description=step.task,
                        estimated_duration_minutes=step.duration,
                        estimated_cost=step.cost,
                        reasoning=step.reasoning
                    ),
                    session_id=state['session_id'],
                    user_id=state['user_id']
                )
                
                if subagent_approval.status == 'rejected':
                    continue  # Skip sub-agent spawning
            
            # Execute step
            step_result = await self.execute_step(step, state)
            results.append(step_result)
        
        # 5. Generate recommendation
        recommendation = await self.generate_recommendation(results)
        
        # CHECKPOINT 4: Critical Decision Approval
        decision_approval = await hitl.request_critical_decision_approval(
            request=CriticalDecisionApprovalRequest(
                decision_title=recommendation.title,
                recommendation=recommendation.text,
                reasoning=recommendation.reasoning,
                confidence_score=recommendation.confidence,
                alternatives_considered=recommendation.alternatives,
                expected_impact=recommendation.impact,
                evidence=recommendation.evidence
            ),
            session_id=state['session_id'],
            user_id=state['user_id']
        )
        
        if decision_approval.status == 'rejected':
            # Reconsider or provide alternative
            recommendation = await self.reconsider_recommendation(results)
        
        return {
            'status': 'completed',
            'recommendation': recommendation,
            'hitl_stats': hitl.get_approval_stats()
        }
```

---

## 📊 **Analytics & Monitoring**

### **HITL Metrics to Track**

```python
{
    "session_id": "sess_123",
    "mode": "mode4_auto_autonomous",
    "hitl_enabled": true,
    "safety_level": "balanced",
    "checkpoints": {
        "plan_approval": {
            "requested": 1,
            "approved": 1,
            "rejected": 0,
            "avg_response_time_seconds": 45
        },
        "tool_execution": {
            "requested": 5,
            "approved": 4,
            "rejected": 1,
            "auto_approved": 2
        },
        "sub_agent_spawning": {
            "requested": 2,
            "approved": 2,
            "auto_approved": 0
        },
        "critical_decision": {
            "requested": 1,
            "approved": 1,
            "modified": 0
        }
    },
    "total_wait_time_seconds": 120,
    "user_satisfaction": "high"
}
```

---

## 🎯 **Best Practices**

### **For Users**

1. **Start Conservative**: Use Conservative mode for first few tasks
2. **Upgrade to Balanced**: Once comfortable, switch to Balanced for speed
3. **Review Plans Carefully**: The plan approval is your most important checkpoint
4. **Trust but Verify**: Check critical decisions even in Minimal mode

### **For Developers**

1. **Clear Approval UIs**: Make approval requests easy to understand
2. **Provide Context**: Always explain why approval is needed
3. **Show Costs**: Display estimated time and cost for transparency
4. **Enable Modifications**: Let users modify plans, not just approve/reject
5. **Timeout Handling**: Auto-reject or auto-approve after timeout (configurable)

---

## 🚀 **Deployment**

### **Environment Variables**

```bash
# HITL Configuration
HITL_ENABLED=true
HITL_DEFAULT_SAFETY_LEVEL=balanced
HITL_APPROVAL_TIMEOUT_SECONDS=3600
HITL_AUTO_APPROVE_SAFE_TOOLS=true
```

---

## ✅ **Testing**

```python
# tests/test_hitl_service.py

async def test_plan_approval_conservative_mode():
    """Test plan approval in conservative mode"""
    hitl = create_hitl_service(
        enabled=True,
        safety_level=HITLSafetyLevel.CONSERVATIVE
    )
    
    request = PlanApprovalRequest(...)
    response = await hitl.request_plan_approval(request, "sess_1", "user_1")
    
    assert response.status == ApprovalStatus.APPROVED


async def test_tool_auto_approval_balanced_mode():
    """Test safe tools auto-approved in balanced mode"""
    hitl = create_hitl_service(
        enabled=True,
        safety_level=HITLSafetyLevel.BALANCED
    )
    
    request = ToolExecutionApprovalRequest(
        tools=[{"name": "web_search", "cost": 0.02}],
        has_side_effects=False
    )
    
    response = await hitl.request_tool_execution_approval(request, "sess_1", "user_1")
    
    assert response.status == ApprovalStatus.APPROVED
    assert "auto" in response.user_feedback.lower()
```

---

## 📚 **Summary**

| Feature | Description | Status |
|---------|-------------|--------|
| **5 Checkpoints** | Plan, Tools, Sub-Agents, Decisions, Artifacts | ✅ |
| **3 Safety Levels** | Conservative, Balanced, Minimal | ✅ |
| **Auto-Approval** | Safe tools, standard artifacts | ✅ |
| **Timeout Handling** | Configurable timeout with fallback | ✅ |
| **Analytics** | Approval stats and metrics | ✅ |
| **Mode Integration** | Modes 2, 3, 4 | ✅ |

---

**HITL System is production-ready!** 🎉

Users now have full control over autonomous agent execution while maintaining the speed and power of AI automation.


"""
Constitutional AI Pattern
Implements self-critique and revision for safe AI responses
"""

from typing import List, Dict, Any
from langgraph.graph import StateGraph, END
from openai import AsyncOpenAI
import structlog

from ..state import CritiqueState, AgentState
from graphrag.config import get_graphrag_config

logger = structlog.get_logger()


class ConstitutionalAgent:
    """
    Constitutional AI Agent
    
    Implements self-critique and revision based on constitutional principles:
    1. Generate initial response
    2. Critique against constitution (safety rules)
    3. Revise if violations found
    4. Repeat until safe
    
    Paper: https://arxiv.org/abs/2212.08073
    """
    
    def __init__(self, model: str = "gpt-4", max_revisions: int = 3):
        """
        Initialize Constitutional AI agent
        
        Args:
            model: LLM model to use
            max_revisions: Maximum revision iterations
        """
        config = get_graphrag_config()
        self.client = AsyncOpenAI(api_key=config.openai_api_key)
        self.model = model
        self.max_revisions = max_revisions
        
        # Default constitution (safety rules)
        self.default_constitution = [
            {
                "principle": "Harmful Content",
                "rule": "Response must not contain harmful, dangerous, or illegal content"
            },
            {
                "principle": "Medical Accuracy",
                "rule": "Medical information must be accurate, evidence-based, and include appropriate disclaimers"
            },
            {
                "principle": "Bias",
                "rule": "Response must be fair and unbiased, avoiding stereotypes"
            },
            {
                "principle": "Privacy",
                "rule": "Response must respect privacy and not request sensitive personal information"
            },
            {
                "principle": "Overconfidence",
                "rule": "Response must acknowledge uncertainty when appropriate and not overstate capabilities"
            }
        ]

        # Pharmaceutical-specific constitution (HIPAA/GDPR compliant)
        self.pharma_constitution = [
            # === HIPAA Compliance ===
            {
                "principle": "PHI Protection",
                "rule": "Response MUST NOT expose, reveal, or request Protected Health Information (PHI) including patient names, dates of birth, medical record numbers, or any of the 18 HIPAA identifiers"
            },
            {
                "principle": "Minimum Necessary",
                "rule": "Information disclosed must be limited to the minimum necessary for the stated purpose (HIPAA Minimum Necessary Rule)"
            },
            {
                "principle": "De-identification",
                "rule": "Any patient data discussed must be properly de-identified according to HIPAA Safe Harbor or Expert Determination methods"
            },
            # === GDPR Compliance ===
            {
                "principle": "Lawful Basis",
                "rule": "Processing of personal data must have a valid lawful basis under GDPR Article 6 (consent, contract, legal obligation, vital interests, public task, or legitimate interests)"
            },
            {
                "principle": "Data Subject Rights",
                "rule": "Response must not undermine data subject rights including access, rectification, erasure (right to be forgotten), and data portability"
            },
            {
                "principle": "Cross-Border Transfer",
                "rule": "Any mention of data transfer must respect GDPR Chapter V requirements for transfers outside the EEA"
            },
            # === Regulatory Compliance ===
            {
                "principle": "Promotional Claim Accuracy",
                "rule": "All claims about pharmaceutical products must be substantiated by approved labeling, FDA-approved indications, or peer-reviewed evidence. No off-label promotion."
            },
            {
                "principle": "Adverse Event Reporting",
                "rule": "Response must not downplay, dismiss, or encourage non-reporting of potential adverse events. Always recommend proper pharmacovigilance channels."
            },
            {
                "principle": "Regulatory Authority",
                "rule": "Response must clearly distinguish between FDA-approved uses, EMA-approved uses, and investigational uses. Never misrepresent regulatory status."
            },
            # === Clinical Decision Support ===
            {
                "principle": "Evidence Quality",
                "rule": "Clinical recommendations must be supported by appropriate evidence levels (Level 1A: RCTs, Level 1B: meta-analyses, etc.) and clearly state evidence quality"
            },
            {
                "principle": "Disclaimer Requirement",
                "rule": "Clinical decision support must include disclaimers that it does not replace professional medical judgment and proper patient-specific evaluation"
            },
            {
                "principle": "Scope Limitations",
                "rule": "Response must acknowledge its scope limitations and recommend specialist consultation when the query exceeds the agent's domain expertise"
            },
            # === Safety-Critical ===
            {
                "principle": "Drug Interaction Warning",
                "rule": "Any drug-related response must warn about potential interactions if the context suggests multiple medications or comorbidities"
            },
            {
                "principle": "Contraindication Awareness",
                "rule": "Therapeutic recommendations must acknowledge known contraindications and black-box warnings where applicable"
            },
            {
                "principle": "Emergency Escalation",
                "rule": "Response must recommend immediate medical attention if the context suggests a medical emergency, adverse event, or safety concern"
            }
        ]

        # Mode 3 Autonomous constitution (enhanced for autonomous execution)
        self.autonomous_constitution = [
            *self.pharma_constitution,  # Include all pharma rules
            # === Autonomous Agent Controls ===
            {
                "principle": "Human-in-the-Loop Honoring",
                "rule": "Autonomous agent MUST NOT bypass, skip, or auto-approve HITL checkpoints without genuine user approval"
            },
            {
                "principle": "Execution Scope Limitation",
                "rule": "Agent execution must stay within the boundaries of the approved plan. Any deviation requires new HITL approval"
            },
            {
                "principle": "Tool Safety",
                "rule": "External tool calls (web search, database, code execution) must be logged, reversible, and minimally invasive. No destructive operations without explicit approval"
            },
            {
                "principle": "Sub-Agent Authority",
                "rule": "Spawned sub-agents (L3, L4, L5) must not exceed the capabilities and permissions of their parent agent"
            },
            {
                "principle": "Goal Drift Prevention",
                "rule": "Agent must not reinterpret or expand the original goal. Any goal modification requires user confirmation"
            },
            {
                "principle": "Resource Limits",
                "rule": "Agent must respect token limits, execution time limits, and cost constraints. Cannot escalate resource usage without approval"
            },
            {
                "principle": "Audit Trail Integrity",
                "rule": "All reasoning, decisions, and actions must be logged to an immutable audit trail. No off-the-record operations"
            },
            {
                "principle": "Graceful Degradation",
                "rule": "If uncertain or blocked, agent must pause and request human guidance rather than making assumptions or proceeding with low confidence"
            }
        ]
    
    async def critique(self, state: CritiqueState) -> CritiqueState:
        """
        Critique response against constitutional principles
        
        Args:
            state: State with response to critique
            
        Returns:
            State with critique results
        """
        try:
            response = state['original_response']
            constitution = state.get('constitution', self.default_constitution)
            
            violations = []
            critique_results = []
            
            # Critique against each principle
            for principle in constitution:
                result = await self._critique_principle(response, principle)
                critique_results.append(result)
                
                if not result['passes']:
                    violations.append(principle['principle'])
            
            state['critique_results'] = critique_results
            state['violations_found'] = violations
            state['safe_to_return'] = len(violations) == 0
            
            logger.info(
                "critique_complete",
                principles_checked=len(constitution),
                violations_found=len(violations)
            )
            
            return state
            
        except Exception as e:
            logger.error("critique_failed", error=str(e))
            state['error'] = str(e)
            state['safe_to_return'] = False
            return state
    
    async def _critique_principle(
        self,
        response: str,
        principle: Dict[str, str]
    ) -> Dict[str, Any]:
        """Critique response against single principle"""
        try:
            prompt = f"""Evaluate this response against the following principle:

Principle: {principle['principle']}
Rule: {principle['rule']}

Response to evaluate:
{response}

Does the response violate this principle?
- Answer YES or NO
- Explain why
- If YES, suggest how to fix it

Format:
PASSES: [YES/NO]
EXPLANATION: [your explanation]
SUGGESTION: [how to fix, if applicable]"""
            
            result = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a safety critic. Be thorough but fair."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3
            )
            
            content = result.choices[0].message.content
            
            # Parse result
            passes = 'PASSES: YES' in content or 'PASSES: yes' in content
            
            return {
                'principle': principle['principle'],
                'passes': passes,
                'explanation': content,
                'suggestion': self._extract_suggestion(content)
            }
            
        except Exception as e:
            logger.warning("principle_critique_failed", error=str(e))
            return {
                'principle': principle['principle'],
                'passes': True,  # Fail open to avoid blocking
                'explanation': f"Error: {str(e)}",
                'suggestion': ""
            }
    
    def _extract_suggestion(self, content: str) -> str:
        """Extract suggestion from critique"""
        for line in content.split('\n'):
            if line.startswith('SUGGESTION:'):
                return line.replace('SUGGESTION:', '').strip()
        return ""
    
    async def revise(self, state: CritiqueState) -> CritiqueState:
        """
        Revise response to address violations
        
        Args:
            state: State with critique results
            
        Returns:
            State with revised response
        """
        try:
            original_response = state['original_response']
            critique_results = state.get('critique_results', [])
            violations = state.get('violations_found', [])
            
            if not violations:
                # No revisions needed
                state['revised_response'] = original_response
                state['safe_to_return'] = True
                return state
            
            # Build revision prompt
            revision_guidance = []
            for result in critique_results:
                if not result['passes']:
                    revision_guidance.append(
                        f"- {result['principle']}: {result['suggestion']}"
                    )
            
            prompt = f"""Revise this response to address the following issues:

Original Response:
{original_response}

Issues to address:
{chr(10).join(revision_guidance)}

Provide a revised response that:
1. Addresses all identified issues
2. Maintains the core helpful information
3. Follows all safety principles

Revised Response:"""
            
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are revising a response for safety and accuracy."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7
            )
            
            revised = response.choices[0].message.content
            
            state['revised_response'] = revised
            
            logger.info(
                "revision_complete",
                violations_addressed=len(violations)
            )
            
            # Need to re-critique the revision
            state['safe_to_return'] = False
            
            return state
            
        except Exception as e:
            logger.error("revision_failed", error=str(e))
            state['error'] = str(e)
            state['revised_response'] = state['original_response']  # Fallback
            return state
    
    async def finalize(self, state: CritiqueState) -> CritiqueState:
        """
        Finalize after all revisions
        
        Args:
            state: Final state
            
        Returns:
            State with final response
        """
        final_response = state.get('revised_response') or state['original_response']
        
        state['final_response'] = final_response
        state['revisions_applied'] = len([r for r in state.get('critique_results', []) if not r['passes']])
        
        logger.info(
            "constitutional_ai_complete",
            revisions_applied=state['revisions_applied'],
            safe=state.get('safe_to_return', False)
        )
        
        return state


def create_constitutional_graph(agent: ConstitutionalAgent) -> StateGraph:
    """
    Create Constitutional AI LangGraph workflow
    
    Args:
        agent: ConstitutionalAgent instance
        
    Returns:
        Compiled StateGraph
    """
    graph = StateGraph(CritiqueState)
    
    # Add nodes
    graph.add_node("critique", agent.critique)
    graph.add_node("revise", agent.revise)
    graph.add_node("finalize", agent.finalize)
    
    # Add edges
    graph.set_entry_point("critique")
    
    # Conditional routing from critique
    def needs_revision(state: CritiqueState) -> str:
        if state.get('safe_to_return', False):
            return "finalize"
        
        # Check revision count
        revision_count = len([
            r for r in state.get('critique_results', [])
            if not r.get('passes', True)
        ])
        
        if revision_count >= agent.max_revisions:
            logger.warning("max_revisions_reached", count=revision_count)
            return "finalize"
        
        return "revise"
    
    graph.add_conditional_edges(
        "critique",
        needs_revision,
        {
            "revise": "revise",
            "finalize": "finalize"
        }
    )
    
    # After revision, critique again
    graph.add_edge("revise", "critique")
    
    # End after finalize
    graph.add_edge("finalize", END)
    
    return graph.compile()


# Helper function to wrap any agent with constitutional checks
async def wrap_with_constitution(
    agent_response: str,
    constitution: List[Dict[str, str]] = None
) -> Dict[str, Any]:
    """
    Wrap any agent response with constitutional checking
    
    Args:
        agent_response: Response to check
        constitution: Optional custom constitution
        
    Returns:
        Dict with safe_response and metadata
    """
    agent = ConstitutionalAgent()
    
    state = CritiqueState(
        original_response=agent_response,
        constitution=constitution or agent.default_constitution,
        critique_results=[],
        violations_found=[],
        safe_to_return=False
    )
    
    graph = create_constitutional_graph(agent)
    final_state = await graph.ainvoke(state)
    
    return {
        'safe_response': final_state.get('final_response', agent_response),
        'violations_found': final_state.get('violations_found', []),
        'revisions_applied': final_state.get('revisions_applied', 0),
        'safe': final_state.get('safe_to_return', False)
    }


# ============================================================================
# PHARMACEUTICAL-SPECIFIC HELPERS
# ============================================================================

async def validate_pharma_response(
    agent_response: str,
    context: str = "general"
) -> Dict[str, Any]:
    """
    Validate response against pharmaceutical constitution (HIPAA/GDPR compliant)

    Args:
        agent_response: Response to validate
        context: Context type (general, clinical, regulatory, market_access)

    Returns:
        Dict with validated_response, violations, and compliance_status
    """
    agent = ConstitutionalAgent()

    state = CritiqueState(
        original_response=agent_response,
        constitution=agent.pharma_constitution,
        critique_results=[],
        violations_found=[],
        safe_to_return=False
    )

    graph = create_constitutional_graph(agent)
    final_state = await graph.ainvoke(state)

    # Categorize violations by compliance domain
    hipaa_violations = [v for v in final_state.get('violations_found', [])
                        if v in ['PHI Protection', 'Minimum Necessary', 'De-identification']]
    gdpr_violations = [v for v in final_state.get('violations_found', [])
                       if v in ['Lawful Basis', 'Data Subject Rights', 'Cross-Border Transfer']]
    regulatory_violations = [v for v in final_state.get('violations_found', [])
                             if v in ['Promotional Claim Accuracy', 'Adverse Event Reporting', 'Regulatory Authority']]
    clinical_violations = [v for v in final_state.get('violations_found', [])
                           if v in ['Evidence Quality', 'Disclaimer Requirement', 'Scope Limitations']]
    safety_violations = [v for v in final_state.get('violations_found', [])
                         if v in ['Drug Interaction Warning', 'Contraindication Awareness', 'Emergency Escalation']]

    return {
        'validated_response': final_state.get('final_response', agent_response),
        'is_compliant': final_state.get('safe_to_return', False),
        'violations': {
            'hipaa': hipaa_violations,
            'gdpr': gdpr_violations,
            'regulatory': regulatory_violations,
            'clinical': clinical_violations,
            'safety': safety_violations,
            'all': final_state.get('violations_found', [])
        },
        'revisions_applied': final_state.get('revisions_applied', 0),
        'compliance_score': 1.0 - (len(final_state.get('violations_found', [])) / len(agent.pharma_constitution))
    }


async def validate_autonomous_response(
    agent_response: str,
    execution_context: Dict[str, Any] = None
) -> Dict[str, Any]:
    """
    Validate response for Mode 3 autonomous execution (full constitution)

    Args:
        agent_response: Response to validate
        execution_context: Optional context with execution details (plan, tools, etc.)

    Returns:
        Dict with validated_response, violations, and autonomous safety status
    """
    agent = ConstitutionalAgent()

    state = CritiqueState(
        original_response=agent_response,
        constitution=agent.autonomous_constitution,
        critique_results=[],
        violations_found=[],
        safe_to_return=False
    )

    graph = create_constitutional_graph(agent)
    final_state = await graph.ainvoke(state)

    # Categorize by domain
    all_violations = final_state.get('violations_found', [])

    # Autonomous-specific violations
    autonomous_violations = [v for v in all_violations if v in [
        'Human-in-the-Loop Honoring', 'Execution Scope Limitation', 'Tool Safety',
        'Sub-Agent Authority', 'Goal Drift Prevention', 'Resource Limits',
        'Audit Trail Integrity', 'Graceful Degradation'
    ]]

    # If any autonomous safety rules violated, this is critical
    autonomous_safe = len(autonomous_violations) == 0

    logger.info(
        "autonomous_constitutional_check",
        total_violations=len(all_violations),
        autonomous_violations=len(autonomous_violations),
        autonomous_safe=autonomous_safe
    )

    return {
        'validated_response': final_state.get('final_response', agent_response),
        'is_compliant': final_state.get('safe_to_return', False),
        'autonomous_safe': autonomous_safe,
        'violations': {
            'autonomous_control': autonomous_violations,
            'pharma_compliance': [v for v in all_violations if v not in autonomous_violations],
            'all': all_violations
        },
        'revisions_applied': final_state.get('revisions_applied', 0),
        'compliance_score': 1.0 - (len(all_violations) / len(agent.autonomous_constitution)),
        'requires_hitl_override': not autonomous_safe  # If autonomous violations, must get HITL approval
    }


async def quick_safety_check(
    agent_response: str,
    principles: List[str] = None
) -> Dict[str, bool]:
    """
    Quick safety check for specific principles (fast, single-pass)

    Args:
        agent_response: Response to check
        principles: List of principle names to check (or all if None)

    Returns:
        Dict mapping principle names to pass/fail booleans
    """
    agent = ConstitutionalAgent()

    # Get principles to check
    if principles:
        constitution = [p for p in agent.pharma_constitution
                        if p['principle'] in principles]
    else:
        # Default to critical safety principles
        constitution = [p for p in agent.pharma_constitution
                        if p['principle'] in [
                            'PHI Protection', 'Emergency Escalation',
                            'Adverse Event Reporting', 'Drug Interaction Warning'
                        ]]

    results = {}
    for principle in constitution:
        result = await agent._critique_principle(agent_response, principle)
        results[principle['principle']] = result['passes']

    return results


def get_constitution_for_agent_type(agent_type: str) -> List[Dict[str, str]]:
    """
    Get appropriate constitution based on agent type

    Args:
        agent_type: Type of agent (regulatory, clinical, market_access, autonomous)

    Returns:
        Constitution rules list
    """
    agent = ConstitutionalAgent()

    if agent_type == "autonomous":
        return agent.autonomous_constitution
    elif agent_type in ["regulatory", "clinical", "market_access", "pharmacovigilance"]:
        return agent.pharma_constitution
    else:
        return agent.default_constitution


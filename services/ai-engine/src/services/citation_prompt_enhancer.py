"""
Citation Prompt Enhancer Service

Enhances agent system prompts with citation formatting instructions
when the agent has citation/research skills assigned.

This service follows the "skill-as-middleware" pattern from the
LangChain/Anthropic best practices for Claude skills with deep agents.

Key Features:
- Checks agent_skill_assignments for citation skills
- Appends structured citation formatting instructions
- Enables inline citations like [1], [2] that link to sources
- Works with the ask-expert-v2 frontend citation carousel

Usage:
    enhancer = CitationPromptEnhancer(supabase_client)
    enhanced_prompt = await enhancer.enhance_prompt(agent_id, system_prompt)
"""

from typing import Optional, List, Set
import structlog
from supabase import Client as SupabaseClient

logger = structlog.get_logger()

# Citation skill IDs (from migration 014_assign_citation_skills_to_agents.sql)
CITATION_SKILL_IDS: Set[str] = {
    "76bd9aa4-6e95-4524-9840-22100c45cad9",  # Literature Search Strategy
    "83309532-7eb8-41a9-b592-8110a1f23e92",  # Evidence Table Generation
    "9577963e-86bd-47a1-aa8f-4e4bfb2d675b",  # PubMed Literature Search
    "afc3be21-05a2-468d-b4eb-b3aa6179ebc6",  # Scientific Databases Access
    "81093ab4-8aa6-4e16-8ddb-b586ae5b1348",  # Systematic Review Protocol Writing
    "6e5b3f4d-6b17-40b4-ae0d-a07d46a96397",  # Real-World Evidence
}

# Citation formatting instructions to append to system prompts
CITATION_INSTRUCTIONS = """

---

## CITATION REQUIREMENTS (MANDATORY)

You MUST include inline citations for ALL factual claims, statistics, and evidence-based statements.

### Citation Format
- Use numbered citations in square brackets: [1], [2], [3], etc.
- Place citations immediately after the relevant statement
- Each citation number corresponds to a source in your Sources section

### Response Structure
1. **Main Content**: Include inline citations [1] throughout your response
2. **Sources Section**: At the end, list all cited sources with full references

### Citation Rules
- Every factual claim MUST have a citation
- Use authoritative sources: peer-reviewed journals, FDA guidance, regulatory documents
- Include DOI, PMID, or URL when available
- For clinical data: cite the original study/trial
- For regulatory info: cite the specific guidance document

### Example Format
```
The FDA 510(k) pathway requires demonstration of substantial equivalence [1].
Studies show that approximately 99% of devices are cleared through this pathway [2].

**Sources:**
[1] FDA Guidance: "The 510(k) Program: Evaluating Substantial Equivalence in Premarket Notifications" (2014)
[2] GAO Report: "Medical Devices: FDA Should Take Steps to Ensure That High-Risk Device Types Are Approved through the Most Stringent Premarket Review Process" (2009)
```

### Source Quality Hierarchy
1. **Level 1A**: Systematic reviews, meta-analyses (Cochrane, AHRQ)
2. **Level 1B**: Randomized controlled trials
3. **Level 2A**: Well-designed controlled studies
4. **Level 2B**: Well-designed cohort/case-control studies
5. **Level 3**: Expert opinion, FDA guidance, regulatory documents

IMPORTANT: If you cannot cite a source for a claim, clearly state it as your professional opinion.
"""


class CitationPromptEnhancer:
    """
    Enhances agent prompts with citation formatting instructions
    when the agent has citation/research skills assigned.
    """

    def __init__(self, supabase: SupabaseClient):
        """
        Initialize the citation prompt enhancer.

        Args:
            supabase: Supabase client for database queries
        """
        self.supabase = supabase
        self._agent_skill_cache: dict = {}

    async def has_citation_skills(self, agent_id: str) -> bool:
        """
        Check if an agent has citation skills assigned.

        Args:
            agent_id: Agent UUID

        Returns:
            True if agent has at least one citation skill assigned
        """
        # Check cache first
        if agent_id in self._agent_skill_cache:
            return self._agent_skill_cache[agent_id]

        try:
            # Query agent_skill_assignments for citation skills
            result = self.supabase.table("agent_skill_assignments").select(
                "skill_id"
            ).eq(
                "agent_id", agent_id
            ).in_(
                "skill_id", list(CITATION_SKILL_IDS)
            ).execute()

            has_skills = len(result.data) > 0

            # Cache the result
            self._agent_skill_cache[agent_id] = has_skills

            logger.debug(
                "Checked citation skills for agent",
                agent_id=agent_id,
                has_citation_skills=has_skills,
                skill_count=len(result.data)
            )

            return has_skills

        except Exception as e:
            logger.error(
                "Failed to check citation skills",
                agent_id=agent_id,
                error=str(e)
            )
            return False

    async def enhance_prompt(
        self,
        agent_id: str,
        system_prompt: str,
        force_citations: bool = False
    ) -> str:
        """
        Enhance agent system prompt with citation instructions if applicable.

        Args:
            agent_id: Agent UUID
            system_prompt: Original system prompt
            force_citations: Force citation instructions regardless of skills

        Returns:
            Enhanced system prompt with citation instructions (if applicable)
        """
        if not system_prompt:
            return system_prompt

        # Check if agent has citation skills or force is enabled
        should_add_citations = force_citations or await self.has_citation_skills(agent_id)

        if not should_add_citations:
            return system_prompt

        # Check if citations are already in the prompt
        if "CITATION REQUIREMENTS" in system_prompt or "[1]" in system_prompt:
            logger.debug(
                "Citation instructions already present in prompt",
                agent_id=agent_id
            )
            return system_prompt

        # Append citation instructions
        enhanced_prompt = system_prompt.rstrip() + CITATION_INSTRUCTIONS

        logger.info(
            "Enhanced prompt with citation instructions",
            agent_id=agent_id,
            original_length=len(system_prompt),
            enhanced_length=len(enhanced_prompt)
        )

        return enhanced_prompt

    def clear_cache(self):
        """Clear the agent skill cache."""
        self._agent_skill_cache.clear()


# Singleton instance
_citation_enhancer: Optional[CitationPromptEnhancer] = None


def get_citation_enhancer(supabase: SupabaseClient) -> CitationPromptEnhancer:
    """
    Get or create the citation prompt enhancer instance.

    Args:
        supabase: Supabase client

    Returns:
        CitationPromptEnhancer instance
    """
    global _citation_enhancer
    if _citation_enhancer is None:
        _citation_enhancer = CitationPromptEnhancer(supabase)
    return _citation_enhancer


async def enhance_agent_prompt_with_citations(
    supabase: SupabaseClient,
    agent_id: str,
    system_prompt: str,
    force: bool = False
) -> str:
    """
    Convenience function to enhance an agent prompt with citation instructions.

    Args:
        supabase: Supabase client
        agent_id: Agent UUID
        system_prompt: Original system prompt
        force: Force citation instructions regardless of skills

    Returns:
        Enhanced system prompt
    """
    enhancer = get_citation_enhancer(supabase)
    return await enhancer.enhance_prompt(agent_id, system_prompt, force)

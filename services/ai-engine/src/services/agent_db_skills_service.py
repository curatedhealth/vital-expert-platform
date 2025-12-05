"""
Agent Database Skills Service

Loads agent skills from the agent_skill_assignments database table
and integrates them into LangGraph workflows.

This complements the SkillsLoaderService (MD files) by loading
agent-specific skill assignments from the database.

Key Features:
- Load skills assigned to a specific agent via agent_skill_assignments
- Integrate with citation_prompt_enhancer for citation skills
- Provide skill context for agent system prompts
- Cache skills for performance

Usage:
    service = AgentDBSkillsService(supabase_client)
    skills = await service.get_agent_skills(agent_id)
    context = service.build_skills_context(skills)
"""

from typing import Dict, List, Optional, Any, Set
from dataclasses import dataclass, field
from datetime import datetime
import structlog
from supabase import Client as SupabaseClient

# Import citation enhancer
from services.citation_prompt_enhancer import (
    CitationPromptEnhancer,
    CITATION_SKILL_IDS,
    CITATION_INSTRUCTIONS,
    get_citation_enhancer
)

logger = structlog.get_logger()


@dataclass
class AgentSkillAssignment:
    """Represents a skill assigned to an agent"""
    skill_id: str
    skill_name: str
    skill_slug: str
    skill_category: str
    skill_description: str
    skill_type: str
    proficiency_level: str = "intermediate"
    is_primary: bool = False
    is_enabled: bool = True

    # Metadata
    loaded_at: datetime = field(default_factory=datetime.utcnow)

    @property
    def is_citation_skill(self) -> bool:
        """Check if this is a citation/research skill"""
        return self.skill_id in CITATION_SKILL_IDS

    def to_dict(self) -> Dict[str, Any]:
        return {
            "skill_id": self.skill_id,
            "skill_name": self.skill_name,
            "skill_slug": self.skill_slug,
            "skill_category": self.skill_category,
            "skill_description": self.skill_description,
            "skill_type": self.skill_type,
            "proficiency_level": self.proficiency_level,
            "is_primary": self.is_primary,
            "is_enabled": self.is_enabled,
            "is_citation_skill": self.is_citation_skill
        }


class AgentDBSkillsService:
    """
    Service for loading agent skills from the database.

    Provides:
    - Skill lookup by agent ID
    - Citation skill detection
    - Skill context generation for system prompts
    - Integration with citation prompt enhancer
    """

    def __init__(self, supabase: SupabaseClient):
        """
        Initialize the agent skills service.

        Args:
            supabase: Supabase client for database queries
        """
        self.supabase = supabase
        self._skills_cache: Dict[str, List[AgentSkillAssignment]] = {}
        self._citation_enhancer = get_citation_enhancer(supabase)

        logger.info("AgentDBSkillsService initialized")

    async def get_agent_skills(
        self,
        agent_id: str,
        use_cache: bool = True
    ) -> List[AgentSkillAssignment]:
        """
        Get all skills assigned to an agent from the database.

        Args:
            agent_id: Agent UUID
            use_cache: Whether to use cached results

        Returns:
            List of skill assignments for this agent
        """
        # Check cache first
        if use_cache and agent_id in self._skills_cache:
            return self._skills_cache[agent_id]

        try:
            # Query agent_skill_assignments with skills join
            result = self.supabase.table("agent_skill_assignments").select(
                "skill_id, proficiency_level, is_primary, is_enabled, "
                "skills(id, name, slug, category, description, skill_type)"
            ).eq(
                "agent_id", agent_id
            ).eq(
                "is_enabled", True
            ).execute()

            skills = []
            for row in result.data or []:
                skill_data = row.get("skills", {})
                if not skill_data:
                    continue

                assignment = AgentSkillAssignment(
                    skill_id=row["skill_id"],
                    skill_name=skill_data.get("name", ""),
                    skill_slug=skill_data.get("slug", ""),
                    skill_category=skill_data.get("category", ""),
                    skill_description=skill_data.get("description", ""),
                    skill_type=skill_data.get("skill_type", "knowledge"),
                    proficiency_level=row.get("proficiency_level", "intermediate"),
                    is_primary=row.get("is_primary", False),
                    is_enabled=row.get("is_enabled", True)
                )
                skills.append(assignment)

            # Cache results
            self._skills_cache[agent_id] = skills

            logger.debug(
                "Loaded agent skills from database",
                agent_id=agent_id,
                skill_count=len(skills),
                citation_skill_count=sum(1 for s in skills if s.is_citation_skill)
            )

            return skills

        except Exception as e:
            logger.error(
                "Failed to load agent skills",
                agent_id=agent_id,
                error=str(e)
            )
            return []

    def has_citation_skills(self, skills: List[AgentSkillAssignment]) -> bool:
        """Check if any skills in the list are citation skills"""
        return any(skill.is_citation_skill for skill in skills)

    def get_citation_skills(
        self,
        skills: List[AgentSkillAssignment]
    ) -> List[AgentSkillAssignment]:
        """Get only citation skills from the list"""
        return [skill for skill in skills if skill.is_citation_skill]

    def get_skills_by_category(
        self,
        skills: List[AgentSkillAssignment],
        category: str
    ) -> List[AgentSkillAssignment]:
        """Get skills filtered by category"""
        return [
            skill for skill in skills
            if skill.skill_category.lower() == category.lower()
        ]

    def build_skills_context(
        self,
        skills: List[AgentSkillAssignment],
        include_descriptions: bool = True
    ) -> str:
        """
        Build skill context string for agent system prompt.

        Args:
            skills: List of agent skill assignments
            include_descriptions: Whether to include skill descriptions

        Returns:
            Formatted skill context for system prompt
        """
        if not skills:
            return ""

        # Group by category
        by_category: Dict[str, List[AgentSkillAssignment]] = {}
        for skill in skills:
            cat = skill.skill_category or "General"
            if cat not in by_category:
                by_category[cat] = []
            by_category[cat].append(skill)

        # Build context string
        lines = ["\n---\n\n## Your Assigned Skills\n"]

        for category, cat_skills in sorted(by_category.items()):
            lines.append(f"\n### {category}")
            for skill in cat_skills:
                if include_descriptions and skill.skill_description:
                    lines.append(f"- **{skill.skill_name}**: {skill.skill_description}")
                else:
                    lines.append(f"- **{skill.skill_name}** ({skill.proficiency_level})")

        lines.append("\n\nLeverage these skills to provide the best possible response.")

        return "\n".join(lines)

    async def enhance_prompt_with_skills(
        self,
        agent_id: str,
        system_prompt: str,
        force_citations: bool = False
    ) -> str:
        """
        Enhance agent system prompt with skills context and citation instructions.

        This is the main integration point for LangGraph workflows.

        Args:
            agent_id: Agent UUID
            system_prompt: Original system prompt
            force_citations: Force citation instructions regardless of skills

        Returns:
            Enhanced system prompt with skills context and citation instructions
        """
        if not system_prompt:
            return system_prompt

        # Load agent skills from database
        skills = await self.get_agent_skills(agent_id)

        enhanced_prompt = system_prompt

        # Add skills context if agent has skills
        if skills:
            skills_context = self.build_skills_context(skills)
            enhanced_prompt = enhanced_prompt.rstrip() + skills_context

        # Add citation instructions if agent has citation skills
        if force_citations or self.has_citation_skills(skills):
            # Use the citation enhancer for consistent formatting
            enhanced_prompt = await self._citation_enhancer.enhance_prompt(
                agent_id,
                enhanced_prompt,
                force_citations=force_citations
            )

        logger.info(
            "Enhanced prompt with skills",
            agent_id=agent_id,
            skills_count=len(skills),
            has_citations=self.has_citation_skills(skills),
            original_length=len(system_prompt),
            enhanced_length=len(enhanced_prompt)
        )

        return enhanced_prompt

    def clear_cache(self, agent_id: Optional[str] = None):
        """
        Clear skills cache.

        Args:
            agent_id: Optional specific agent to clear. If None, clears all.
        """
        if agent_id:
            self._skills_cache.pop(agent_id, None)
        else:
            self._skills_cache.clear()

        # Also clear citation enhancer cache
        self._citation_enhancer.clear_cache()


# Singleton instance
_agent_skills_service: Optional[AgentDBSkillsService] = None


def get_agent_skills_service(supabase: SupabaseClient) -> AgentDBSkillsService:
    """
    Get or create the agent skills service instance.

    Args:
        supabase: Supabase client

    Returns:
        AgentDBSkillsService instance
    """
    global _agent_skills_service
    if _agent_skills_service is None:
        _agent_skills_service = AgentDBSkillsService(supabase)
    return _agent_skills_service


async def enhance_agent_prompt_with_db_skills(
    supabase: SupabaseClient,
    agent_id: str,
    system_prompt: str,
    force_citations: bool = False
) -> str:
    """
    Convenience function to enhance an agent prompt with database skills.

    Args:
        supabase: Supabase client
        agent_id: Agent UUID
        system_prompt: Original system prompt
        force_citations: Force citation instructions

    Returns:
        Enhanced system prompt
    """
    service = get_agent_skills_service(supabase)
    return await service.enhance_prompt_with_skills(
        agent_id,
        system_prompt,
        force_citations
    )

"""
Skills Loader Service - MD File Integration for LangGraph

Loads skills from markdown files and integrates them into LangGraph workflows.

Key Features:
- Load skills from MD files in docs/skills/
- Parse skill metadata (ID, type, category, complexity)
- Create LangGraph-compatible skill nodes
- Map skills to agent hierarchy levels
- Cache skills for performance

Skill File Structure:
```markdown
# Skill Category Name

## Skill Name
**ID**: `skill_id`
**Type**: `built_in|custom`
**Category**: `analysis|search|etc`
**Complexity**: `basic|intermediate|advanced|expert`

**Description**: What the skill does...

**Usage Example**:
```python
code example
```
```

PRD v1.2.1 Integration:
- Skills are distributed across 5 agent levels
- Level 1 (Master): Planning, delegation
- Level 2 (Expert): Analysis, generation, validation
- Level 3 (Specialist): Domain-specific execution
- Level 4 (Worker): Routine execution, file operations
- Level 5 (Tool): Atomic operations
"""

import os
import re
import json
from typing import Dict, List, Optional, Any, Callable
from pathlib import Path
from dataclasses import dataclass, field
from enum import Enum
import structlog
import hashlib
from datetime import datetime

logger = structlog.get_logger()


# ============================================================================
# Enums and Constants
# ============================================================================

class SkillComplexity(str, Enum):
    """Skill complexity levels"""
    BASIC = "basic"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"


class SkillType(str, Enum):
    """Skill execution types"""
    BUILT_IN = "built_in"
    CUSTOM = "custom"
    EXTERNAL = "external"


class SkillCategory(str, Enum):
    """Skill categories"""
    PLANNING = "planning"
    DELEGATION = "delegation"
    SEARCH = "search"
    ANALYSIS = "analysis"
    GENERATION = "generation"
    VALIDATION = "validation"
    COMMUNICATION = "communication"
    DATA_RETRIEVAL = "data_retrieval"
    EXECUTION = "execution"
    FILE_OPERATIONS = "file_operations"


# Map complexity to agent levels (PRD v1.2.1)
COMPLEXITY_TO_LEVEL = {
    SkillComplexity.EXPERT: [1, 2],        # Master, Expert
    SkillComplexity.ADVANCED: [2, 3],      # Expert, Specialist
    SkillComplexity.INTERMEDIATE: [3, 4],  # Specialist, Worker
    SkillComplexity.BASIC: [4, 5],         # Worker, Tool
}

# Map categories to agent levels
CATEGORY_TO_LEVEL = {
    SkillCategory.PLANNING: [1, 2],        # Master, Expert
    SkillCategory.DELEGATION: [1, 2],      # Master, Expert
    SkillCategory.ANALYSIS: [2, 3],        # Expert, Specialist
    SkillCategory.GENERATION: [2, 3],      # Expert, Specialist
    SkillCategory.VALIDATION: [2, 3],      # Expert, Specialist
    SkillCategory.SEARCH: [3, 4],          # Specialist, Worker
    SkillCategory.COMMUNICATION: [2, 3],   # Expert, Specialist
    SkillCategory.DATA_RETRIEVAL: [3, 4],  # Specialist, Worker
    SkillCategory.EXECUTION: [4, 5],       # Worker, Tool
    SkillCategory.FILE_OPERATIONS: [4, 5], # Worker, Tool
}


# ============================================================================
# Data Models
# ============================================================================

@dataclass
class SkillDefinition:
    """Definition of a skill parsed from MD file"""
    id: str
    name: str
    description: str
    skill_type: SkillType = SkillType.BUILT_IN
    category: SkillCategory = SkillCategory.ANALYSIS
    complexity: SkillComplexity = SkillComplexity.INTERMEDIATE

    # Metadata
    source_file: str = ""
    usage_example: str = ""
    best_practices: List[str] = field(default_factory=list)
    related_skills: List[str] = field(default_factory=list)

    # Execution
    python_module: Optional[str] = None
    callable_name: Optional[str] = None
    is_executable: bool = False

    # Agent level mapping
    applicable_levels: List[int] = field(default_factory=list)

    # Caching
    _hash: str = ""
    loaded_at: datetime = field(default_factory=datetime.utcnow)

    def __post_init__(self):
        """Calculate applicable levels and hash after initialization"""
        if not self.applicable_levels:
            self.applicable_levels = self._calculate_applicable_levels()
        if not self._hash:
            self._hash = self._calculate_hash()

    def _calculate_applicable_levels(self) -> List[int]:
        """Determine which agent levels can use this skill"""
        levels = set()

        # Add levels based on complexity
        if self.complexity in COMPLEXITY_TO_LEVEL:
            levels.update(COMPLEXITY_TO_LEVEL[self.complexity])

        # Add levels based on category
        if self.category in CATEGORY_TO_LEVEL:
            levels.update(CATEGORY_TO_LEVEL[self.category])

        return sorted(list(levels))

    def _calculate_hash(self) -> str:
        """Calculate content hash for caching"""
        content = f"{self.id}:{self.name}:{self.description}:{self.skill_type}:{self.category}"
        return hashlib.md5(content.encode()).hexdigest()[:8]

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "skill_type": self.skill_type.value if isinstance(self.skill_type, SkillType) else self.skill_type,
            "category": self.category.value if isinstance(self.category, SkillCategory) else self.category,
            "complexity": self.complexity.value if isinstance(self.complexity, SkillComplexity) else self.complexity,
            "source_file": self.source_file,
            "usage_example": self.usage_example,
            "best_practices": self.best_practices,
            "related_skills": self.related_skills,
            "applicable_levels": self.applicable_levels,
            "is_executable": self.is_executable
        }


# ============================================================================
# MD File Parser
# ============================================================================

class SkillMDParser:
    """Parser for skill markdown files"""

    # Regex patterns for parsing MD files
    SKILL_HEADER_PATTERN = re.compile(r'^###?\s+(.+)$', re.MULTILINE)
    ID_PATTERN = re.compile(r'\*\*ID\*\*:\s*`([^`]+)`')
    TYPE_PATTERN = re.compile(r'\*\*Type\*\*:\s*`([^`]+)`')
    CATEGORY_PATTERN = re.compile(r'\*\*Category\*\*:\s*`([^`]+)`')
    COMPLEXITY_PATTERN = re.compile(r'\*\*Complexity\*\*:\s*`([^`]+)`')
    DESCRIPTION_PATTERN = re.compile(r'\*\*Description\*\*:\s*(.+?)(?=\n\n|\*\*|$)', re.DOTALL)

    @classmethod
    def parse_file(cls, file_path: str) -> List[SkillDefinition]:
        """
        Parse a skill MD file and extract skill definitions.

        Args:
            file_path: Path to the MD file

        Returns:
            List of parsed skill definitions
        """
        skills = []

        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()

            # Split by skill headers (### Skill Name)
            sections = re.split(r'(?=^###\s+)', content, flags=re.MULTILINE)

            for section in sections:
                if not section.strip():
                    continue

                skill = cls._parse_section(section, file_path)
                if skill:
                    skills.append(skill)

            logger.debug(
                "Parsed skill file",
                file=file_path,
                skills_found=len(skills)
            )

        except Exception as e:
            logger.error(
                "Failed to parse skill file",
                file=file_path,
                error=str(e)
            )

        return skills

    @classmethod
    def _parse_section(cls, section: str, source_file: str) -> Optional[SkillDefinition]:
        """Parse a single skill section"""
        try:
            # Extract skill name from header
            header_match = cls.SKILL_HEADER_PATTERN.search(section)
            if not header_match:
                return None

            name = header_match.group(1).strip()

            # Skip section headers like "## Overview", "## Skills", etc.
            skip_names = ["Overview", "Skills", "See Also", "Best Practices"]
            if name in skip_names:
                return None

            # Extract metadata
            id_match = cls.ID_PATTERN.search(section)
            type_match = cls.TYPE_PATTERN.search(section)
            category_match = cls.CATEGORY_PATTERN.search(section)
            complexity_match = cls.COMPLEXITY_PATTERN.search(section)
            desc_match = cls.DESCRIPTION_PATTERN.search(section)

            # Skip if no ID found (not a skill definition)
            if not id_match:
                return None

            skill_id = id_match.group(1)

            # Parse enums with fallbacks
            skill_type = SkillType.BUILT_IN
            if type_match:
                type_str = type_match.group(1).lower()
                if type_str in [e.value for e in SkillType]:
                    skill_type = SkillType(type_str)

            category = SkillCategory.ANALYSIS
            if category_match:
                cat_str = category_match.group(1).lower()
                if cat_str in [e.value for e in SkillCategory]:
                    category = SkillCategory(cat_str)

            complexity = SkillComplexity.INTERMEDIATE
            if complexity_match:
                comp_str = complexity_match.group(1).lower()
                if comp_str in [e.value for e in SkillComplexity]:
                    complexity = SkillComplexity(comp_str)

            description = ""
            if desc_match:
                description = desc_match.group(1).strip()

            # Extract usage example (code block after "Usage Example")
            usage_example = ""
            usage_match = re.search(r'\*\*Usage Example\*\*:\s*```python(.+?)```', section, re.DOTALL)
            if usage_match:
                usage_example = usage_match.group(1).strip()

            # Extract best practices (bullet list)
            best_practices = []
            bp_match = re.search(r'\*\*Best Practices\*\*:\s*((?:- .+\n?)+)', section)
            if bp_match:
                best_practices = [
                    line.strip()[2:] for line in bp_match.group(1).split('\n')
                    if line.strip().startswith('-')
                ]

            return SkillDefinition(
                id=skill_id,
                name=name,
                description=description,
                skill_type=skill_type,
                category=category,
                complexity=complexity,
                source_file=source_file,
                usage_example=usage_example,
                best_practices=best_practices
            )

        except Exception as e:
            logger.warning(
                "Failed to parse skill section",
                section_preview=section[:100],
                error=str(e)
            )
            return None


# ============================================================================
# Skills Loader Service
# ============================================================================

class SkillsLoaderService:
    """
    Service for loading and managing skills from MD files.

    Integrates with LangGraph workflows by:
    1. Loading skill definitions from MD files
    2. Caching parsed skills
    3. Providing skill lookup by ID, category, or agent level
    4. Creating LangGraph-compatible skill nodes
    """

    def __init__(
        self,
        skills_docs_path: Optional[str] = None,
        additional_skills_paths: Optional[List[str]] = None
    ):
        """
        Initialize skills loader.

        Args:
            skills_docs_path: Path to skills docs directory
            additional_skills_paths: Additional paths to load skills from
        """
        # Default to ai-engine/docs/skills/
        if skills_docs_path is None:
            base_path = Path(__file__).parent.parent.parent  # ai-engine/src/services -> ai-engine
            skills_docs_path = str(base_path / "docs" / "skills")

        self.skills_docs_path = skills_docs_path
        self.additional_paths = additional_skills_paths or []

        # Skills registry
        self._skills: Dict[str, SkillDefinition] = {}
        self._skills_by_category: Dict[str, List[str]] = {}
        self._skills_by_level: Dict[int, List[str]] = {i: [] for i in range(1, 6)}

        # Cache
        self._loaded = False
        self._loaded_at: Optional[datetime] = None

        logger.info(
            "SkillsLoaderService initialized",
            docs_path=skills_docs_path,
            additional_paths=self.additional_paths
        )

    async def load_skills(self, force_reload: bool = False) -> int:
        """
        Load all skills from MD files.

        Args:
            force_reload: Force reload even if already loaded

        Returns:
            Number of skills loaded
        """
        if self._loaded and not force_reload:
            return len(self._skills)

        # Clear existing
        self._skills.clear()
        self._skills_by_category.clear()
        self._skills_by_level = {i: [] for i in range(1, 6)}

        # Load from primary path
        await self._load_from_directory(self.skills_docs_path)

        # Load from additional paths
        for path in self.additional_paths:
            await self._load_from_directory(path)

        self._loaded = True
        self._loaded_at = datetime.utcnow()

        logger.info(
            "Skills loaded",
            total_skills=len(self._skills),
            categories=list(self._skills_by_category.keys()),
            by_level={k: len(v) for k, v in self._skills_by_level.items()}
        )

        return len(self._skills)

    async def _load_from_directory(self, directory: str):
        """Load skills from all MD files in a directory"""
        dir_path = Path(directory)

        if not dir_path.exists():
            logger.warning(f"Skills directory not found: {directory}")
            return

        # Find all MD files
        md_files = list(dir_path.glob("*.md"))

        for md_file in md_files:
            # Skip README
            if md_file.name.lower() == "readme.md":
                continue

            skills = SkillMDParser.parse_file(str(md_file))

            for skill in skills:
                self._register_skill(skill)

    def _register_skill(self, skill: SkillDefinition):
        """Register a skill in the registry"""
        # Add to main registry
        self._skills[skill.id] = skill

        # Index by category
        cat_key = skill.category.value if isinstance(skill.category, SkillCategory) else skill.category
        if cat_key not in self._skills_by_category:
            self._skills_by_category[cat_key] = []
        self._skills_by_category[cat_key].append(skill.id)

        # Index by agent level
        for level in skill.applicable_levels:
            if level in self._skills_by_level:
                self._skills_by_level[level].append(skill.id)

    # ========================================================================
    # Skill Lookup Methods
    # ========================================================================

    def get_skill(self, skill_id: str) -> Optional[SkillDefinition]:
        """Get a skill by ID"""
        return self._skills.get(skill_id)

    def get_skills_by_category(self, category: str) -> List[SkillDefinition]:
        """Get all skills in a category"""
        skill_ids = self._skills_by_category.get(category, [])
        return [self._skills[sid] for sid in skill_ids if sid in self._skills]

    def get_skills_for_level(self, level: int) -> List[SkillDefinition]:
        """Get all skills applicable to an agent level"""
        skill_ids = self._skills_by_level.get(level, [])
        return [self._skills[sid] for sid in skill_ids if sid in self._skills]

    def get_all_skills(self) -> List[SkillDefinition]:
        """Get all loaded skills"""
        return list(self._skills.values())

    def search_skills(
        self,
        query: str,
        category: Optional[str] = None,
        level: Optional[int] = None,
        complexity: Optional[str] = None
    ) -> List[SkillDefinition]:
        """
        Search for skills matching criteria.

        Args:
            query: Search query (matches name or description)
            category: Filter by category
            level: Filter by applicable agent level
            complexity: Filter by complexity

        Returns:
            List of matching skills
        """
        results = []
        query_lower = query.lower()

        for skill in self._skills.values():
            # Text search
            if query_lower not in skill.name.lower() and query_lower not in skill.description.lower():
                continue

            # Category filter
            if category:
                cat_value = skill.category.value if isinstance(skill.category, SkillCategory) else skill.category
                if cat_value != category:
                    continue

            # Level filter
            if level and level not in skill.applicable_levels:
                continue

            # Complexity filter
            if complexity:
                comp_value = skill.complexity.value if isinstance(skill.complexity, SkillComplexity) else skill.complexity
                if comp_value != complexity:
                    continue

            results.append(skill)

        return results

    # ========================================================================
    # LangGraph Integration
    # ========================================================================

    def get_skill_context_for_agent(
        self,
        agent_level: int,
        task_context: Dict[str, Any]
    ) -> str:
        """
        Generate skill context string for agent system prompt.

        This provides the agent with information about available skills.

        Args:
            agent_level: Agent's hierarchy level (1-5)
            task_context: Current task context

        Returns:
            Formatted skill context for system prompt
        """
        skills = self.get_skills_for_level(agent_level)

        if not skills:
            return ""

        # Group by category
        by_category: Dict[str, List[SkillDefinition]] = {}
        for skill in skills:
            cat = skill.category.value if isinstance(skill.category, SkillCategory) else skill.category
            if cat not in by_category:
                by_category[cat] = []
            by_category[cat].append(skill)

        # Build context string
        lines = ["## Available Skills\n"]

        for category, cat_skills in by_category.items():
            lines.append(f"\n### {category.replace('_', ' ').title()}")
            for skill in cat_skills:
                lines.append(f"- **{skill.name}** (`{skill.id}`): {skill.description}")

        lines.append("\n\nUse these skills to accomplish your tasks efficiently.")

        return "\n".join(lines)

    def create_langgraph_skill_node(
        self,
        skill_id: str
    ) -> Optional[Callable]:
        """
        Create a LangGraph-compatible node function for a skill.

        This wraps the skill execution in a function that can be
        used as a LangGraph node.

        Args:
            skill_id: Skill ID to wrap

        Returns:
            Async function suitable for LangGraph node, or None
        """
        skill = self.get_skill(skill_id)
        if not skill:
            logger.warning(f"Skill not found: {skill_id}")
            return None

        async def skill_node(state: Dict[str, Any]) -> Dict[str, Any]:
            """
            LangGraph node function for skill execution.

            This function is dynamically created for each skill.
            """
            logger.info(
                "Executing skill node",
                skill_id=skill_id,
                skill_name=skill.name
            )

            try:
                # Execute skill based on type
                if skill.is_executable and skill.callable_name:
                    # Dynamic execution via python module
                    result = await _execute_dynamic_skill(skill, state)
                else:
                    # Built-in execution based on category
                    result = await _execute_builtin_skill(skill, state)

                # Update state with result
                return {
                    **state,
                    f"skill_{skill_id}_result": result,
                    "last_skill_executed": skill_id
                }

            except Exception as e:
                logger.error(
                    "Skill execution failed",
                    skill_id=skill_id,
                    error=str(e)
                )
                return {
                    **state,
                    "error": f"Skill {skill_id} failed: {str(e)}"
                }

        # Set function name for debugging
        skill_node.__name__ = f"skill_{skill_id}"

        return skill_node

    # ========================================================================
    # Export Methods
    # ========================================================================

    def export_skills_json(self, output_path: Optional[str] = None) -> str:
        """
        Export all skills to JSON.

        Args:
            output_path: Optional file path to write JSON

        Returns:
            JSON string of all skills
        """
        skills_data = {
            "skills": [skill.to_dict() for skill in self._skills.values()],
            "metadata": {
                "total_skills": len(self._skills),
                "categories": list(self._skills_by_category.keys()),
                "loaded_at": self._loaded_at.isoformat() if self._loaded_at else None
            }
        }

        json_str = json.dumps(skills_data, indent=2)

        if output_path:
            with open(output_path, 'w') as f:
                f.write(json_str)
            logger.info(f"Exported skills to {output_path}")

        return json_str

    def get_statistics(self) -> Dict[str, Any]:
        """Get loader statistics"""
        return {
            "loaded": self._loaded,
            "loaded_at": self._loaded_at.isoformat() if self._loaded_at else None,
            "total_skills": len(self._skills),
            "by_category": {k: len(v) for k, v in self._skills_by_category.items()},
            "by_level": {k: len(v) for k, v in self._skills_by_level.items()},
            "docs_path": self.skills_docs_path
        }


# ============================================================================
# Skill Execution Helpers
# ============================================================================

async def _execute_dynamic_skill(skill: SkillDefinition, state: Dict) -> Dict:
    """Execute a skill with dynamic Python module"""
    import importlib

    try:
        module = importlib.import_module(skill.python_module)
        func = getattr(module, skill.callable_name)
        return await func(state)
    except Exception as e:
        logger.error(f"Dynamic skill execution failed: {e}")
        return {"error": str(e)}


async def _execute_builtin_skill(skill: SkillDefinition, state: Dict) -> Dict:
    """Execute a built-in skill based on category"""
    # Placeholder - in production, route to specific implementations
    category = skill.category.value if isinstance(skill.category, SkillCategory) else skill.category

    logger.info(f"Executing built-in skill: {skill.id} (category: {category})")

    return {
        "skill_id": skill.id,
        "category": category,
        "status": "executed",
        "message": f"Built-in skill '{skill.name}' executed"
    }


# ============================================================================
# Singleton Instance
# ============================================================================

_skills_loader: Optional[SkillsLoaderService] = None


def get_skills_loader() -> SkillsLoaderService:
    """Get skills loader instance"""
    global _skills_loader
    if _skills_loader is None:
        _skills_loader = SkillsLoaderService()
    return _skills_loader


async def initialize_skills_loader(
    skills_docs_path: Optional[str] = None,
    additional_paths: Optional[List[str]] = None
) -> SkillsLoaderService:
    """Initialize and load skills"""
    global _skills_loader
    _skills_loader = SkillsLoaderService(
        skills_docs_path=skills_docs_path,
        additional_skills_paths=additional_paths
    )
    await _skills_loader.load_skills()
    return _skills_loader

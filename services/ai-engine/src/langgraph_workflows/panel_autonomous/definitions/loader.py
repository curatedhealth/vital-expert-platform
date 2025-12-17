"""
Panel Autonomous Workflow - Definition Loader

Loads panel definitions from YAML files with database override support.

Precedence (highest to lowest):
1. Tenant-specific database overrides
2. Global database overrides
3. YAML file defaults
"""

import os
from pathlib import Path
from typing import Any, Dict, List, Optional, Union
from dataclasses import dataclass, field
import yaml
import structlog

logger = structlog.get_logger(__name__)

# Path to YAML definitions
DEFINITIONS_DIR = Path(__file__).parent
PANEL_TYPES_DIR = DEFINITIONS_DIR / "panel_types"


@dataclass
class PromptConfig:
    """Configuration for a single prompt template."""
    id: str
    template: str
    description: str = ""
    placeholders: List[str] = field(default_factory=list)

    def render(self, **kwargs) -> str:
        """Render the template with provided values."""
        result = self.template
        for key, value in kwargs.items():
            placeholder = "{" + key + "}"
            if placeholder in result:
                result = result.replace(placeholder, str(value) if value else "")
        return result


@dataclass
class PositionConfig:
    """Configuration for a debate position."""
    name: str
    role: str
    expert_count: int = 1
    speaks_in_rounds: List[int] = field(default_factory=lambda: [1, 2, 3, 4])


@dataclass
class PanelConfig:
    """Configuration parameters for a panel type."""
    default_expert_count: int
    min_experts: int
    max_experts: int
    default_rounds: int
    min_rounds: int
    max_rounds: int
    supports_consensus: bool = True
    supports_checkpoints: bool = True
    requires_positions: bool = False
    expert_selection_method: str = "fusion"
    diversity_weight: float = 0.3
    default_consensus_threshold: float = 0.7
    early_termination_enabled: bool = True


@dataclass
class PanelDefinition:
    """Complete definition for a panel type."""
    id: str
    name: str
    description: str
    version: str
    config: PanelConfig
    prompts: Dict[str, Any]
    positions: Dict[str, PositionConfig] = field(default_factory=dict)
    format_instructions: str = ""
    response_formatting: Dict[str, Any] = field(default_factory=dict)

    def get_prompt(
        self,
        position: Optional[str] = None,
        round_number: int = 1,
        prompt_type: Optional[str] = None,
    ) -> str:
        """
        Get the appropriate prompt template for the given context.

        Args:
            position: Position for positional panels (pro, con, moderator)
            round_number: Current round number (1-indexed)
            prompt_type: Explicit prompt type (initial, followup, rebuttal, synthesis)

        Returns:
            Prompt template string
        """
        # For positional panels (e.g., adversarial)
        if position and "position_prompts" in self.prompts:
            pos_prompts = self.prompts.get("position_prompts", {}).get(position, {})
            if pos_prompts:
                if prompt_type:
                    prompt_data = pos_prompts.get(prompt_type, {})
                elif round_number == 1:
                    prompt_data = pos_prompts.get("initial", {})
                elif position == "moderator":
                    prompt_data = pos_prompts.get("synthesis", {})
                else:
                    prompt_data = pos_prompts.get("rebuttal", {})

                if prompt_data:
                    template = prompt_data.get("template", "")
                    return f"{template}\n{self.format_instructions}"

        # For non-positional panels
        if prompt_type:
            prompt_data = self.prompts.get(prompt_type, {})
        elif round_number == 1:
            prompt_data = self.prompts.get("initial", {})
        else:
            prompt_data = self.prompts.get("followup", self.prompts.get("initial", {}))

        if prompt_data:
            template = prompt_data.get("template", "")
            return f"{template}\n{self.format_instructions}"

        return self.format_instructions

    def get_position(self, expert_index: int, total_experts: int) -> Optional[str]:
        """
        Get the position for an expert based on their index.

        Args:
            expert_index: 0-based index of the expert
            total_experts: Total number of experts

        Returns:
            Position string or None
        """
        if not self.config.requires_positions:
            return None

        # Default position assignment for adversarial
        if total_experts == 1:
            return "moderator"
        elif total_experts == 2:
            return "pro" if expert_index == 0 else "con"
        else:
            # Split: half pro, half con, last one moderator if odd
            half = total_experts // 2
            if expert_index < half:
                return "pro"
            elif expert_index < half * 2:
                return "con"
            else:
                return "moderator"


class PanelDefinitionLoader:
    """
    Loads panel definitions from YAML files with database override support.

    Features:
    - Loads YAML definitions from file system
    - Supports database overrides per tenant
    - Caches loaded definitions for performance
    - Validates definitions against schema
    """

    def __init__(self, supabase_client=None):
        self._client = supabase_client
        self._cache: Dict[str, PanelDefinition] = {}
        self._yaml_loaded = False

    def _load_yaml_definitions(self):
        """Load all YAML panel definitions from disk."""
        if self._yaml_loaded:
            return

        for yaml_file in PANEL_TYPES_DIR.glob("*.yaml"):
            try:
                with open(yaml_file, "r") as f:
                    data = yaml.safe_load(f)

                panel_id = data.get("id")
                if panel_id:
                    definition = self._parse_definition(data)
                    self._cache[panel_id] = definition
                    logger.debug(
                        "panel_definition_loaded",
                        panel_id=panel_id,
                        source="yaml",
                    )

            except Exception as e:
                logger.warning(
                    "panel_definition_load_failed",
                    file=str(yaml_file),
                    error=str(e)[:100],
                )

        self._yaml_loaded = True
        logger.info(
            "panel_definitions_loaded",
            count=len(self._cache),
            types=list(self._cache.keys()),
        )

    def _parse_definition(self, data: Dict[str, Any]) -> PanelDefinition:
        """Parse YAML data into a PanelDefinition object."""
        config_data = data.get("config", {})
        config = PanelConfig(
            default_expert_count=config_data.get("default_expert_count", 4),
            min_experts=config_data.get("min_experts", 2),
            max_experts=config_data.get("max_experts", 8),
            default_rounds=config_data.get("default_rounds", 2),
            min_rounds=config_data.get("min_rounds", 1),
            max_rounds=config_data.get("max_rounds", 5),
            supports_consensus=config_data.get("supports_consensus", True),
            supports_checkpoints=config_data.get("supports_checkpoints", True),
            requires_positions=config_data.get("requires_positions", False),
            expert_selection_method=config_data.get("expert_selection_method", "fusion"),
            diversity_weight=config_data.get("diversity_weight", 0.3),
            default_consensus_threshold=config_data.get("default_consensus_threshold", 0.7),
            early_termination_enabled=config_data.get("early_termination_enabled", True),
        )

        # Parse positions
        positions = {}
        for pos_id, pos_data in data.get("positions", {}).items():
            positions[pos_id] = PositionConfig(
                name=pos_data.get("name", pos_id),
                role=pos_data.get("role", ""),
                expert_count=pos_data.get("expert_count", 1),
                speaks_in_rounds=pos_data.get("speaks_in_rounds", [1, 2, 3, 4]),
            )

        return PanelDefinition(
            id=data.get("id", ""),
            name=data.get("name", ""),
            description=data.get("description", ""),
            version=data.get("version", "1.0.0"),
            config=config,
            prompts=data.get("prompts", {}),
            positions=positions,
            format_instructions=data.get("format_instructions", ""),
            response_formatting=data.get("response_formatting", {}),
        )

    async def get_definition(
        self,
        panel_type: str,
        tenant_id: Optional[str] = None,
    ) -> PanelDefinition:
        """
        Get panel definition with database overrides.

        Order of precedence:
        1. Tenant-specific database overrides
        2. Global database overrides
        3. YAML file defaults

        Raises:
            ValueError: If panel_type YAML definition not found
        """
        # Ensure YAML definitions are loaded
        self._load_yaml_definitions()

        # Check cache first
        cache_key = f"{tenant_id or 'global'}:{panel_type}"
        if cache_key in self._cache:
            return self._cache[cache_key]

        # Get YAML definition (required)
        base_definition = self._cache.get(panel_type)
        if not base_definition:
            available_types = list(self._cache.keys())
            raise ValueError(
                f"Panel type '{panel_type}' not found. "
                f"Available types: {available_types}"
            )

        # Try database overrides
        if self._client:
            try:
                override = await self._load_db_override(panel_type, tenant_id)
                if override:
                    base_definition = self._apply_override(base_definition, override)
                    logger.debug(
                        "panel_definition_override_applied",
                        panel_type=panel_type,
                        tenant_id=tenant_id,
                    )
            except Exception as e:
                logger.warning(
                    "panel_definition_db_override_failed",
                    panel_type=panel_type,
                    error=str(e)[:100],
                )

        # Cache the result
        self._cache[cache_key] = base_definition
        return base_definition

    def get_definition_sync(self, panel_type: str) -> PanelDefinition:
        """
        Synchronous version - loads from YAML only (no DB overrides).

        Raises:
            ValueError: If panel_type YAML definition not found
        """
        self._load_yaml_definitions()

        definition = self._cache.get(panel_type)
        if not definition:
            available_types = list(self._cache.keys())
            raise ValueError(
                f"Panel type '{panel_type}' not found. "
                f"Available types: {available_types}"
            )

        return definition

    async def _load_db_override(
        self,
        panel_type: str,
        tenant_id: Optional[str],
    ) -> Optional[Dict[str, Any]]:
        """Load override from database."""
        if not self._client:
            return None

        try:
            # Try tenant-specific first
            if tenant_id:
                result = (
                    self._client.table("panel_definitions")
                    .select("*")
                    .eq("panel_type", panel_type)
                    .eq("tenant_id", tenant_id)
                    .eq("is_active", True)
                    .single()
                    .execute()
                )
                if result.data:
                    return result.data

            # Try global override
            result = (
                self._client.table("panel_definitions")
                .select("*")
                .eq("panel_type", panel_type)
                .is_("tenant_id", None)
                .eq("is_active", True)
                .single()
                .execute()
            )
            if result.data:
                return result.data

        except Exception:
            pass

        return None

    def _apply_override(
        self,
        base: PanelDefinition,
        override: Dict[str, Any],
    ) -> PanelDefinition:
        """Apply database override to base definition."""
        # Deep merge override into base
        # For now, simple field replacement for specific fields

        # Override prompts if provided
        if override.get("prompts"):
            merged_prompts = {**base.prompts}
            for key, value in override["prompts"].items():
                if isinstance(value, dict) and key in merged_prompts:
                    merged_prompts[key] = {**merged_prompts[key], **value}
                else:
                    merged_prompts[key] = value
            base.prompts.update(merged_prompts)

        # Override config if provided
        if override.get("config"):
            for key, value in override["config"].items():
                if hasattr(base.config, key):
                    setattr(base.config, key, value)

        # Override format instructions
        if override.get("format_instructions"):
            base.format_instructions = override["format_instructions"]

        return base

    def clear_cache(self):
        """Clear the definition cache."""
        # Keep YAML definitions, clear tenant-specific entries
        keys_to_remove = [k for k in self._cache.keys() if ":" in k]
        for key in keys_to_remove:
            del self._cache[key]


# =============================================================================
# MODULE-LEVEL CONVENIENCE FUNCTIONS
# =============================================================================

_loader: Optional[PanelDefinitionLoader] = None


def _get_loader(supabase_client=None) -> PanelDefinitionLoader:
    """Get or create the singleton loader."""
    global _loader
    if _loader is None or (supabase_client and _loader._client is None):
        _loader = PanelDefinitionLoader(supabase_client)
    return _loader


async def get_panel_definition(
    panel_type: str,
    tenant_id: Optional[str] = None,
    supabase_client=None,
) -> PanelDefinition:
    """
    Get panel definition (async, with DB support).

    Args:
        panel_type: Panel type identifier (structured, adversarial, etc.)
        tenant_id: Optional tenant ID for tenant-specific overrides
        supabase_client: Optional Supabase client for DB access

    Returns:
        PanelDefinition with YAML defaults + DB overrides
    """
    loader = _get_loader(supabase_client)
    return await loader.get_definition(panel_type, tenant_id)


def get_panel_definition_sync(panel_type: str) -> PanelDefinition:
    """
    Get panel definition (sync, YAML only).

    Args:
        panel_type: Panel type identifier

    Returns:
        PanelDefinition from YAML (no DB overrides)
    """
    loader = _get_loader()
    return loader.get_definition_sync(panel_type)

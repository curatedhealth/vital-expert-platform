"""
Default workflow templates defined in code
These replace the JSON template files
"""

from datetime import datetime
from typing import Dict, Any
from ..nodes.base import Workflow, NodeConfig, Connection, NodeType


def get_structured_panel_workflow() -> Workflow:
    """Get default structured panel workflow"""
    nodes = [
        NodeConfig(
            id="input-1",
            type=NodeType.INPUT,
            label="Panel Query",
            position={"x": 100, "y": 50},
            parameters={
                "default_value": "Should we pursue 510(k) or De Novo pathway for our continuous glucose monitoring device?"
            },
            data={}
        ),
        NodeConfig(
            id="moderator-1",
            type=NodeType.INPUT,  # task type converted to INPUT
            label="Moderator",
            position={"x": 100, "y": 150},
            parameters={},
            data={
                "_original_type": "task",
                "task": {
                    "id": "moderator",
                    "name": "Moderator",
                    "config": {
                        "model": "gpt-4o",
                        "temperature": 0.7,
                        "tools": [],
                        "systemPrompt": "You are an AI moderator facilitating a structured expert panel discussion. Manage time, pose questions, synthesize inputs, and guide consensus building."
                    }
                }
            }
        ),
        NodeConfig(
            id="expert-1",
            type=NodeType.INPUT,
            label="Expert Agent 1",
            position={"x": 300, "y": 150},
            parameters={},
            data={
                "_original_type": "task",
                "task": {
                    "id": "expert_agent",
                    "name": "Expert Agent",
                    "config": {
                        "model": "gpt-4o",
                        "temperature": 0.7,
                        "tools": ["rag", "pubmed", "fda"],
                        "systemPrompt": "You are a domain expert participating in a structured panel. Provide expert analysis, respond to moderator questions, and contribute to consensus building."
                    }
                },
                "expertType": "regulatory_expert",
                "context": {
                    "expertise": ["510k", "denovo", "medical_devices"]
                }
            }
        ),
        NodeConfig(
            id="expert-2",
            type=NodeType.INPUT,
            label="Expert Agent 2",
            position={"x": 500, "y": 150},
            parameters={},
            data={
                "_original_type": "task",
                "task": {
                    "id": "expert_agent",
                    "name": "Expert Agent",
                    "config": {
                        "model": "gpt-4o",
                        "temperature": 0.7,
                        "tools": ["rag", "pubmed", "fda"],
                        "systemPrompt": "You are a domain expert participating in a structured panel. Provide expert analysis, respond to moderator questions, and contribute to consensus building."
                    }
                },
                "expertType": "clinical_expert",
                "context": {
                    "expertise": ["clinical_trials", "cgm_devices"]
                }
            }
        ),
        NodeConfig(
            id="opening-statements-1",
            type=NodeType.INPUT,
            label="Opening Statements",
            position={"x": 100, "y": 300},
            parameters={},
            data={
                "_original_type": "task",
                "task": {
                    "id": "opening_statements",
                    "name": "Opening Statements",
                    "config": {
                        "model": "gpt-4o-mini",
                        "temperature": 0.0,
                        "tools": [],
                        "systemPrompt": "Execute sequential opening statements from all expert agents. Each expert has 60-90 seconds to present their initial perspective."
                    }
                }
            }
        ),
        NodeConfig(
            id="discussion-round-1",
            type=NodeType.INPUT,
            label="Discussion Round 1",
            position={"x": 300, "y": 300},
            parameters={},
            data={
                "_original_type": "task",
                "task": {
                    "id": "discussion_round",
                    "name": "Discussion Round",
                    "config": {
                        "model": "gpt-4o-mini",
                        "temperature": 0.0,
                        "tools": [],
                        "systemPrompt": "Execute a moderated discussion round. Moderator poses questions, experts respond sequentially, building on each other's points."
                    }
                }
            }
        ),
        NodeConfig(
            id="consensus-calculator-1",
            type=NodeType.INPUT,
            label="Consensus Calculator",
            position={"x": 500, "y": 300},
            parameters={},
            data={
                "_original_type": "task",
                "task": {
                    "id": "consensus_calculator",
                    "name": "Consensus Calculator",
                    "config": {
                        "model": "gpt-4o-mini",
                        "temperature": 0.0,
                        "tools": [],
                        "systemPrompt": "Calculate consensus level from expert positions. Identify majority view, minority opinions, and overall agreement percentage."
                    }
                }
            }
        ),
        NodeConfig(
            id="qna-1",
            type=NodeType.INPUT,
            label="Q&A Session",
            position={"x": 400, "y": 400},
            parameters={},
            data={
                "_original_type": "task",
                "task": {
                    "id": "qna",
                    "name": "Q&A Session",
                    "config": {
                        "model": "gpt-4o",
                        "temperature": 0.7,
                        "tools": [],
                        "systemPrompt": "Facilitate a Q&A session. Field questions from participants, route them to appropriate experts, and ensure comprehensive answers."
                    }
                }
            }
        ),
        NodeConfig(
            id="documentation-1",
            type=NodeType.INPUT,
            label="Documentation Generator",
            position={"x": 300, "y": 500},
            parameters={},
            data={
                "_original_type": "task",
                "task": {
                    "id": "documentation_generator",
                    "name": "Documentation Generator",
                    "config": {
                        "model": "gpt-4o",
                        "temperature": 0.5,
                        "tools": [],
                        "systemPrompt": "Generate formal panel documentation: executive summary, consensus report, voting record, evidence appendix, and action items."
                    }
                }
            }
        ),
        NodeConfig(
            id="output-1",
            type=NodeType.OUTPUT,
            label="Panel Report",
            position={"x": 300, "y": 600},
            parameters={"format": "markdown"},
            data={}
        )
    ]
    
    edges = [
        Connection(id="edge-1", source="input-1", target="moderator-1"),
        Connection(id="edge-2", source="input-1", target="expert-1"),
        Connection(id="edge-3", source="input-1", target="expert-2"),
        Connection(id="edge-4", source="moderator-1", target="opening-statements-1"),
        Connection(id="edge-5", source="expert-1", target="opening-statements-1"),
        Connection(id="edge-6", source="expert-2", target="opening-statements-1"),
        Connection(id="edge-7", source="opening-statements-1", target="discussion-round-1"),
        Connection(id="edge-8", source="expert-1", target="discussion-round-1"),
        Connection(id="edge-9", source="expert-2", target="discussion-round-1"),
        Connection(id="edge-10", source="discussion-round-1", target="consensus-calculator-1"),
        Connection(id="edge-11", source="consensus-calculator-1", target="qna-1"),
        Connection(id="edge-12", source="qna-1", target="documentation-1"),
        Connection(id="edge-13", source="expert-1", target="qna-1"),
        Connection(id="edge-14", source="expert-2", target="qna-1"),
        Connection(id="edge-15", source="documentation-1", target="output-1")
    ]
    
    return Workflow(
        id="template-structured-panel",
        name="Structured Panel Workflow",
        description="Sequential, moderated discussion for formal decisions. Uses tasks (moderator, expert_agent, opening_statements, discussion_round, consensus_calculator, documentation_generator)",
        nodes=nodes,
        edges=edges,
        created_at="2025-01-20T00:00:00",
        updated_at="2025-01-20T00:00:00",
        metadata={
            "template": True,
            "category": "panel",
            "panel_type": "structured",
            "system_prompt": "You are facilitating a structured expert panel discussion for regulatory decision-making. Guide experts through sequential rounds, build consensus, and generate formal documentation.",
            "rounds": 3,
            "consensus_threshold": 0.75,
            "time_budget": 600,
            "intervention_mode": "ai_simulated",
            "workflow_nodes": [
                {"id": "initialize", "type": "initialize", "config": {}},
                {"id": "opening_statements_node", "type": "opening_statements", "config": {}},
                {"id": "discussion_round_1", "type": "discussion_round", "config": {"round": 1}},
                {"id": "consensus_assessment_1", "type": "consensus_assessment", "config": {"round": 1}},
                {"id": "discussion_round_2", "type": "discussion_round", "config": {"round": 2}},
                {"id": "consensus_assessment_2", "type": "consensus_assessment", "config": {"round": 2}},
                {"id": "discussion_round_3", "type": "discussion_round", "config": {"round": 3}},
                {"id": "qna", "type": "qna", "config": {"num_questions": 3}},
                {"id": "consensus_building", "type": "consensus_building", "config": {}},
                {"id": "documentation", "type": "documentation", "config": {}}
            ],
            "workflow_edges": [
                {"source": "initialize", "target": "opening_statements_node"},
                {"source": "opening_statements_node", "target": "discussion_round_1"},
                {"source": "discussion_round_1", "target": "consensus_assessment_1"},
                {"source": "consensus_assessment_1", "target": "discussion_round_2"},
                {"source": "discussion_round_2", "target": "consensus_assessment_2"},
                {"source": "consensus_assessment_2", "target": "discussion_round_3"},
                {"source": "discussion_round_3", "target": "qna"},
                {"source": "qna", "target": "consensus_building"},
                {"source": "consensus_building", "target": "documentation"},
                {"source": "documentation", "target": "END"}
            ]
        }
    )


def get_open_panel_workflow() -> Workflow:
    """Get default open panel workflow"""
    nodes = [
        NodeConfig(
            id="input-1",
            type=NodeType.INPUT,
            label="Innovation Query",
            position={"x": 100, "y": 50},
            parameters={
                "default_value": "What are innovative approaches to improve patient adherence in chronic disease management?"
            },
            data={}
        ),
        NodeConfig(
            id="moderator-1",
            type=NodeType.INPUT,
            label="Moderator",
            position={"x": 100, "y": 150},
            parameters={},
            data={
                "_original_type": "task",
                "task": {
                    "id": "moderator",
                    "name": "Moderator",
                    "config": {
                        "model": "gpt-4o",
                        "temperature": 0.7,
                        "tools": [],
                        "systemPrompt": "You are an AI moderator facilitating an open panel discussion for innovation ideation. Encourage free-form dialogue, cross-pollination of ideas, and theme identification."
                    }
                }
            }
        ),
        NodeConfig(
            id="expert-1",
            type=NodeType.INPUT,
            label="Expert Agent 1",
            position={"x": 300, "y": 150},
            parameters={},
            data={
                "_original_type": "task",
                "task": {
                    "id": "expert_agent",
                    "name": "Expert Agent",
                    "config": {
                        "model": "gpt-4o",
                        "temperature": 0.8,
                        "tools": ["rag", "pubmed", "web_search"],
                        "systemPrompt": "You are a creative domain expert participating in an open panel for innovation. Generate novel ideas, build on others' contributions, and explore diverse perspectives."
                    }
                },
                "expertType": "digital_health_expert",
                "context": {
                    "expertise": ["digital_health", "patient_engagement", "mobile_health"]
                }
            }
        ),
        NodeConfig(
            id="expert-2",
            type=NodeType.INPUT,
            label="Expert Agent 2",
            position={"x": 500, "y": 150},
            parameters={},
            data={
                "_original_type": "task",
                "task": {
                    "id": "expert_agent",
                    "name": "Expert Agent",
                    "config": {
                        "model": "gpt-4o",
                        "temperature": 0.8,
                        "tools": ["rag", "pubmed", "web_search"],
                        "systemPrompt": "You are a creative domain expert participating in an open panel for innovation. Generate novel ideas, build on others' contributions, and explore diverse perspectives."
                    }
                },
                "expertType": "behavioral_expert",
                "context": {
                    "expertise": ["behavioral_psychology", "adherence", "patient_motivation"]
                }
            }
        ),
        NodeConfig(
            id="expert-3",
            type=NodeType.INPUT,
            label="Expert Agent 3",
            position={"x": 700, "y": 150},
            parameters={},
            data={
                "_original_type": "task",
                "task": {
                    "id": "expert_agent",
                    "name": "Expert Agent",
                    "config": {
                        "model": "gpt-4o",
                        "temperature": 0.8,
                        "tools": ["rag", "pubmed", "web_search"],
                        "systemPrompt": "You are a creative domain expert participating in an open panel for innovation. Generate novel ideas, build on others' contributions, and explore diverse perspectives."
                    }
                },
                "expertType": "technology_expert",
                "context": {
                    "expertise": ["ai_ml", "wearables", "iot", "health_tech"]
                }
            }
        ),
        NodeConfig(
            id="documentation-1",
            type=NodeType.INPUT,
            label="Synthesis Generator",
            position={"x": 400, "y": 350},
            parameters={},
            data={
                "_original_type": "task",
                "task": {
                    "id": "documentation_generator",
                    "name": "Documentation Generator",
                    "config": {
                        "model": "gpt-4o",
                        "temperature": 0.6,
                        "tools": [],
                        "systemPrompt": "Synthesize the open panel discussion into innovation clusters, themes, and actionable insights. Identify novel ideas and cross-pollination patterns."
                    }
                }
            }
        ),
        NodeConfig(
            id="output-1",
            type=NodeType.OUTPUT,
            label="Innovation Report",
            position={"x": 400, "y": 450},
            parameters={"format": "markdown"},
            data={}
        )
    ]
    
    edges = [
        Connection(id="edge-1", source="input-1", target="moderator-1"),
        Connection(id="edge-2", source="moderator-1", target="expert-1"),
        Connection(id="edge-3", source="moderator-1", target="expert-2"),
        Connection(id="edge-4", source="moderator-1", target="expert-3"),
        Connection(id="edge-5", source="expert-1", target="documentation-1"),
        Connection(id="edge-6", source="expert-2", target="documentation-1"),
        Connection(id="edge-7", source="expert-3", target="documentation-1"),
        Connection(id="edge-8", source="documentation-1", target="output-1")
    ]
    
    return Workflow(
        id="template-open-panel",
        name="Open Panel Workflow",
        description="Parallel collaborative exploration for innovation and brainstorming. Uses tasks (moderator, expert_agent) for free-form dialogue and theme identification",
        nodes=nodes,
        edges=edges,
        created_at="2025-01-20T00:00:00",
        updated_at="2025-01-20T00:00:00",
        metadata={
            "template": True,
            "category": "panel",
            "panel_type": "open",
            "system_prompt": "You are facilitating an open panel discussion for innovation ideation. Encourage free-form dialogue, cross-pollination of ideas, and creative exploration. Focus on generating novel concepts and identifying innovation clusters.",
            "time_budget": 480,
            "intervention_mode": "ai_simulated",
            "workflow_nodes": [
                {"id": "initialize", "type": "initialize", "config": {}},
                {"id": "opening_round", "type": "opening_round", "config": {}},
                {"id": "free_dialogue", "type": "free_dialogue", "config": {"num_turns": 3}},
                {"id": "theme_clustering", "type": "theme_clustering", "config": {}},
                {"id": "final_perspectives", "type": "final_perspectives", "config": {}},
                {"id": "synthesis", "type": "synthesis", "config": {}}
            ],
            "workflow_edges": [
                {"source": "initialize", "target": "opening_round"},
                {"source": "opening_round", "target": "free_dialogue"},
                {"source": "free_dialogue", "target": "theme_clustering"},
                {"source": "theme_clustering", "target": "final_perspectives"},
                {"source": "final_perspectives", "target": "synthesis"},
                {"source": "synthesis", "target": "END"}
            ]
        }
    )


def get_default_workflow(workflow_id: str) -> Workflow:
    """
    Get default workflow by ID
    
    Args:
        workflow_id: Workflow ID (e.g., "template-structured-panel", "template-open-panel")
        
    Returns:
        Workflow object or None if not found
    """
    defaults = {
        "template-structured-panel": get_structured_panel_workflow,
        "template-open-panel": get_open_panel_workflow,
    }
    
    if workflow_id in defaults:
        return defaults[workflow_id]()
    
    return None


"""
Unit Tests for TreeOfThoughtsAgent
Tests the generate_plan() method and ToT workflow components
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
import json


class TestTreeOfThoughtsAgentGeneratePlan:
    """Tests for TreeOfThoughtsAgent.generate_plan() method"""

    @pytest.fixture
    def tot_agent(self):
        """Create TreeOfThoughtsAgent instance with mocked dependencies"""
        with patch('langgraph_compilation.patterns.tree_of_thoughts.get_graphrag_config') as mock_config, \
             patch('langgraph_compilation.patterns.tree_of_thoughts.AsyncOpenAI') as mock_openai:
            
            config = MagicMock()
            config.openai_api_key = "test-api-key"
            mock_config.return_value = config
            
            from langgraph_compilation.patterns.tree_of_thoughts import TreeOfThoughtsAgent
            agent = TreeOfThoughtsAgent(model="gpt-4")
            agent.client = AsyncMock()
            
            return agent

    @pytest.mark.asyncio
    async def test_generate_plan_returns_expected_structure(self, tot_agent, sample_query, sample_context):
        """Test that generate_plan() returns dict with required keys"""
        # Mock thought generation
        thoughts_json = json.dumps({
            "thoughts": [
                {"reasoning": "Approach 1: Start with Phase 1", "why": "Foundation", "challenges": "Time"},
                {"reasoning": "Approach 2: Parallel development", "why": "Efficiency", "challenges": "Coordination"},
                {"reasoning": "Approach 3: Iterative approach", "why": "Flexibility", "challenges": "Scope creep"}
            ]
        })
        
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = thoughts_json
        
        # Create different responses for different calls
        evaluate_response = MagicMock()
        evaluate_response.choices = [MagicMock()]
        evaluate_response.choices[0].message.content = "0.85"
        
        final_response = MagicMock()
        final_response.choices = [MagicMock()]
        final_response.choices[0].message.content = "The plan is to proceed with Phase 1"
        
        tot_agent.client.chat.completions.create = AsyncMock(
            side_effect=[mock_response, evaluate_response, evaluate_response, evaluate_response, final_response]
        )
        
        result = await tot_agent.generate_plan(
            query=sample_query,
            context=sample_context,
            max_steps=3,
            model="gpt-4"
        )
        
        # Verify structure matches what Mode 3/4 expects
        assert isinstance(result, dict)
        assert 'steps' in result  # Mode 3/4 expects 'steps' key
        assert 'best_path' in result
        assert 'thought_tree' in result
        assert 'confidence' in result
        assert 'execution_results' in result
        assert 'evaluated_thoughts' in result

    @pytest.mark.asyncio
    async def test_generate_plan_handles_empty_query(self, tot_agent):
        """Test that generate_plan() handles empty query gracefully"""
        thoughts_json = json.dumps({"thoughts": []})
        
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = thoughts_json
        
        tot_agent.client.chat.completions.create = AsyncMock(return_value=mock_response)
        
        result = await tot_agent.generate_plan(
            query="",
            context="",
            max_steps=3,
            model="gpt-4"
        )
        
        assert isinstance(result, dict)
        # Should return valid structure even with empty inputs
        assert 'steps' in result

    @pytest.mark.asyncio
    async def test_generate_plan_respects_max_steps(self, tot_agent, sample_query):
        """Test that generate_plan() respects max_steps parameter"""
        thoughts_json = json.dumps({
            "thoughts": [
                {"reasoning": "Step 1", "why": "Start", "challenges": "None"},
                {"reasoning": "Step 2", "why": "Continue", "challenges": "None"}
            ]
        })
        
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = thoughts_json
        
        evaluate_response = MagicMock()
        evaluate_response.choices = [MagicMock()]
        evaluate_response.choices[0].message.content = "0.9"
        
        tot_agent.client.chat.completions.create = AsyncMock(
            side_effect=[mock_response, evaluate_response, evaluate_response]
        )
        
        result = await tot_agent.generate_plan(
            query=sample_query,
            context="",
            max_steps=2,  # Limited steps
            model="gpt-4"
        )
        
        # Should have modified max_depth based on max_steps
        assert tot_agent.max_depth == 2

    @pytest.mark.asyncio
    async def test_generate_plan_error_handling(self, tot_agent, sample_query):
        """Test that generate_plan() handles errors gracefully"""
        tot_agent.client.chat.completions.create = AsyncMock(
            side_effect=Exception("API Error")
        )
        
        result = await tot_agent.generate_plan(
            query=sample_query,
            context="",
            max_steps=3,
            model="gpt-4"
        )
        
        assert isinstance(result, dict)
        assert 'error' in result
        assert result['confidence'] == 0.0
        assert result['steps'] == []

    @pytest.mark.asyncio
    async def test_generate_plan_with_context(self, tot_agent, sample_query, sample_context):
        """Test that generate_plan() uses provided context"""
        thoughts_json = json.dumps({
            "thoughts": [
                {"reasoning": "Using context about FDA", "why": "Relevant info", "challenges": "None"}
            ]
        })
        
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = thoughts_json
        
        evaluate_response = MagicMock()
        evaluate_response.choices = [MagicMock()]
        evaluate_response.choices[0].message.content = "0.95"
        
        tot_agent.client.chat.completions.create = AsyncMock(
            side_effect=[mock_response, evaluate_response]
        )
        
        result = await tot_agent.generate_plan(
            query=sample_query,
            context=sample_context,
            max_steps=3,
            model="gpt-4"
        )
        
        assert isinstance(result, dict)
        # Context should be stored in metadata during execution


class TestTreeOfThoughtsGenerateThoughts:
    """Tests for TreeOfThoughtsAgent.generate_thoughts() method"""

    @pytest.fixture
    def tot_agent(self):
        """Create TreeOfThoughtsAgent instance with mocked dependencies"""
        with patch('langgraph_compilation.patterns.tree_of_thoughts.get_graphrag_config') as mock_config, \
             patch('langgraph_compilation.patterns.tree_of_thoughts.AsyncOpenAI') as mock_openai:
            
            config = MagicMock()
            config.openai_api_key = "test-api-key"
            mock_config.return_value = config
            
            from langgraph_compilation.patterns.tree_of_thoughts import TreeOfThoughtsAgent
            agent = TreeOfThoughtsAgent(model="gpt-4")
            agent.client = AsyncMock()
            
            return agent

    @pytest.mark.asyncio
    async def test_generate_thoughts_creates_tree(self, tot_agent, plan_state_template, sample_query):
        """Test that generate_thoughts() populates thought tree"""
        state = plan_state_template.copy()
        state['original_query'] = sample_query
        
        thoughts_json = json.dumps({
            "thoughts": [
                {"reasoning": "Path A", "why": "Reason A", "challenges": "Challenge A"},
                {"reasoning": "Path B", "why": "Reason B", "challenges": "Challenge B"},
                {"reasoning": "Path C", "why": "Reason C", "challenges": "Challenge C"}
            ]
        })
        
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = thoughts_json
        
        tot_agent.client.chat.completions.create = AsyncMock(return_value=mock_response)
        
        result_state = await tot_agent.generate_thoughts(state)
        
        assert 'thought_tree' in result_state
        assert len(result_state['thought_tree']) > 0

    @pytest.mark.asyncio
    async def test_generate_thoughts_respects_max_thoughts(self, tot_agent, plan_state_template, sample_query):
        """Test that generate_thoughts() respects max_thoughts limit"""
        state = plan_state_template.copy()
        state['original_query'] = sample_query
        
        # More thoughts than max_thoughts (default 3)
        thoughts_json = json.dumps({
            "thoughts": [
                {"reasoning": f"Path {i}", "why": f"Reason {i}", "challenges": f"Challenge {i}"}
                for i in range(10)  # 10 thoughts
            ]
        })
        
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = thoughts_json
        
        tot_agent.client.chat.completions.create = AsyncMock(return_value=mock_response)
        
        result_state = await tot_agent.generate_thoughts(state)
        
        # Should be limited to max_thoughts (3 by default)
        generated = result_state['metadata'].get('generated_thoughts', [])
        assert len(generated) <= tot_agent.max_thoughts


class TestTreeOfThoughtsEvaluate:
    """Tests for TreeOfThoughtsAgent.evaluate_thoughts() method"""

    @pytest.fixture
    def tot_agent(self):
        """Create TreeOfThoughtsAgent instance with mocked dependencies"""
        with patch('langgraph_compilation.patterns.tree_of_thoughts.get_graphrag_config') as mock_config, \
             patch('langgraph_compilation.patterns.tree_of_thoughts.AsyncOpenAI') as mock_openai:
            
            config = MagicMock()
            config.openai_api_key = "test-api-key"
            mock_config.return_value = config
            
            from langgraph_compilation.patterns.tree_of_thoughts import TreeOfThoughtsAgent
            agent = TreeOfThoughtsAgent(model="gpt-4")
            agent.client = AsyncMock()
            
            return agent

    @pytest.mark.asyncio
    async def test_evaluate_thoughts_scores_correctly(self, tot_agent, plan_state_template, sample_query):
        """Test that evaluate_thoughts() assigns scores"""
        state = plan_state_template.copy()
        state['original_query'] = sample_query
        state['thought_tree'] = {
            'root_t0': {'id': 'root_t0', 'content': 'Thought 1', 'score': None},
            'root_t1': {'id': 'root_t1', 'content': 'Thought 2', 'score': None}
        }
        state['metadata'] = {
            'generated_thoughts': [
                {'id': 'root_t0', 'content': 'Thought 1', 'rationale': '', 'challenges': '', 'parent': 'root', 'score': None},
                {'id': 'root_t1', 'content': 'Thought 2', 'rationale': '', 'challenges': '', 'parent': 'root', 'score': None}
            ]
        }
        
        # Return different scores for different evaluations
        mock_response_1 = MagicMock()
        mock_response_1.choices = [MagicMock()]
        mock_response_1.choices[0].message.content = "0.9"
        
        mock_response_2 = MagicMock()
        mock_response_2.choices = [MagicMock()]
        mock_response_2.choices[0].message.content = "0.7"
        
        tot_agent.client.chat.completions.create = AsyncMock(
            side_effect=[mock_response_1, mock_response_2]
        )
        
        result_state = await tot_agent.evaluate_thoughts(state)
        
        assert 'evaluated_thoughts' in result_state
        evaluated = result_state['evaluated_thoughts']
        assert len(evaluated) == 2
        # Should be sorted by score (highest first)
        assert evaluated[0]['score'] >= evaluated[1]['score']


class TestTreeOfThoughtsSelectPath:
    """Tests for TreeOfThoughtsAgent.select_best_path() method"""

    @pytest.fixture
    def tot_agent(self):
        """Create TreeOfThoughtsAgent instance with mocked dependencies"""
        with patch('langgraph_compilation.patterns.tree_of_thoughts.get_graphrag_config') as mock_config, \
             patch('langgraph_compilation.patterns.tree_of_thoughts.AsyncOpenAI') as mock_openai:
            
            config = MagicMock()
            config.openai_api_key = "test-api-key"
            mock_config.return_value = config
            
            from langgraph_compilation.patterns.tree_of_thoughts import TreeOfThoughtsAgent
            agent = TreeOfThoughtsAgent(model="gpt-4")
            agent.client = AsyncMock()
            
            return agent

    @pytest.mark.asyncio
    async def test_select_best_path_chooses_highest_score(self, tot_agent, plan_state_template):
        """Test that select_best_path() selects highest scored thought"""
        state = plan_state_template.copy()
        state['evaluated_thoughts'] = [
            {'id': 'thought_1', 'score': 0.95, 'content': 'Best', 'parent': 'root'},
            {'id': 'thought_2', 'score': 0.75, 'content': 'Good', 'parent': 'root'},
            {'id': 'thought_3', 'score': 0.60, 'content': 'OK', 'parent': 'root'}
        ]
        state['thought_tree'] = {
            'thought_1': {'id': 'thought_1', 'score': 0.95, 'parent': 'root'},
            'thought_2': {'id': 'thought_2', 'score': 0.75, 'parent': 'root'},
            'thought_3': {'id': 'thought_3', 'score': 0.60, 'parent': 'root'}
        }
        
        result_state = await tot_agent.select_best_path(state)
        
        assert 'best_path' in result_state
        assert 'thought_1' in result_state['best_path']

    @pytest.mark.asyncio
    async def test_select_best_path_handles_empty(self, tot_agent, plan_state_template):
        """Test that select_best_path() handles empty evaluated_thoughts"""
        state = plan_state_template.copy()
        state['evaluated_thoughts'] = []
        
        result_state = await tot_agent.select_best_path(state)
        
        assert result_state['best_path'] == []

"""
Calculator Tool - Shared AI Service

TAG: SHARED_AI_SERVICES_LIBRARY

Simple calculator for mathematical expressions.

Usage:
    from vital_ai_services.tools import CalculatorTool
    from vital_ai_services.core.models import ToolInput, ToolOutput
    
    tool = CalculatorTool()
    
    tool_input = ToolInput(
        tool_name="calculator",
        data="(100 + 50) * 0.15"
    )
    
    output = await tool.execute(tool_input)
    # output.data = {"result": 22.5, "expression": "(100 + 50) * 0.15"}
"""

import re
import structlog

from vital_ai_services.tools.base import BaseTool
from vital_ai_services.core.models import ToolInput, ToolOutput

logger = structlog.get_logger()


class CalculatorTool(BaseTool):
    """
    Simple calculator for mathematical expressions.
    
    TAG: CALCULATOR_TOOL
    
    Features:
    - Basic arithmetic operations (+, -, *, /, **, %)
    - Parentheses support
    - Safe evaluation (no code execution)
    """
    
    @property
    def name(self) -> str:
        return "calculator"
    
    @property
    def description(self) -> str:
        return (
            "Perform mathematical calculations. Supports basic arithmetic operations "
            "(+, -, *, /, **, %) and parentheses. Use this tool when you need to "
            "calculate numbers, percentages, or perform mathematical operations."
        )
    
    @property
    def category(self) -> str:
        return "analysis"
    
    @property
    def requires_tenant_access(self) -> bool:
        return False  # Calculator doesn't need tenant access
    
    async def execute(self, tool_input: ToolInput) -> ToolOutput:
        """
        Execute calculation.
        
        Args:
            tool_input: Tool input with mathematical expression
            
        Returns:
            ToolOutput with calculation result
        """
        try:
            expression = tool_input.data if isinstance(tool_input.data, str) else str(tool_input.data)
            result = self.calculate(expression)
            
            return ToolOutput(
                success=True,
                tool_name=self.name,
                data={
                    "result": result,
                    "expression": expression
                },
                metadata={
                    "tool": self.name,
                    "expression": expression
                },
                cost_usd=0.0
            )
        
        except Exception as e:
            logger.error(f"Calculator execution failed", error=str(e))
            return ToolOutput(
                success=False,
                tool_name=self.name,
                data={},
                error_message=str(e),
                metadata={"tool": self.name}
            )
    
    def calculate(self, expression: str) -> float:
        """
        Safely evaluate mathematical expression.
        
        Args:
            expression: Mathematical expression string
            
        Returns:
            Calculation result
            
        Raises:
            ValueError: If expression is invalid or unsafe
        """
        # Remove whitespace
        expression = expression.strip()
        
        # Validate expression (only allow numbers, operators, parentheses, decimal points)
        if not re.match(r'^[\d\s+\-*/()\.,\%\*\*]+$', expression):
            raise ValueError(
                f"Invalid expression: contains unsafe characters. "
                f"Only numbers, operators (+,-,*,/,**,%), and parentheses are allowed."
            )
        
        # Replace common separators
        expression = expression.replace(',', '')
        
        try:
            # Use eval with restricted globals/locals for safety
            result = eval(expression, {"__builtins__": {}}, {})
            
            # Ensure result is a number
            if not isinstance(result, (int, float)):
                raise ValueError(f"Expression did not evaluate to a number: {type(result)}")
            
            return float(result)
        
        except SyntaxError as e:
            raise ValueError(f"Invalid mathematical expression: {str(e)}")
        except ZeroDivisionError:
            raise ValueError("Division by zero")
        except Exception as e:
            raise ValueError(f"Calculation error: {str(e)}")


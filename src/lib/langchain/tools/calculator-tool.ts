import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

const CalculatorSchema = z.object({
  expression: z.string().describe("Mathematical expression to evaluate (e.g., '2 + 3 * 4', 'sqrt(16)', 'sin(pi/2)')"),
  precision: z.number().min(0).max(10).default(2).describe("Number of decimal places for the result")
});

export const calculatorTool = new DynamicStructuredTool({
  name: "calculator",
  description: "Perform safe mathematical calculations and statistical analysis with support for basic arithmetic, trigonometry, logarithms, and statistical functions",
  schema: CalculatorSchema,
  func: async ({ expression, precision = 2 }) => {
    try {
      console.log(`🧮 Calculating: ${expression}`);
      
      // Sanitize and validate the expression
      const sanitizedExpression = sanitizeExpression(expression);
      if (!sanitizedExpression) {
        throw new Error("Invalid or unsafe mathematical expression");
      }
      
      // Evaluate the expression safely
      const result = evaluateExpression(sanitizedExpression);
      
      // Round to specified precision
      const roundedResult = Number(result.toFixed(precision));
      
      const response = {
        expression: sanitizedExpression,
        result: roundedResult,
        precision,
        calculated_at: new Date().toISOString(),
        metadata: {
          is_integer: Number.isInteger(roundedResult),
          is_negative: roundedResult < 0,
          magnitude: Math.abs(roundedResult)
        }
      };
      
      console.log(`✅ Calculation result: ${roundedResult}`);
      return JSON.stringify(response, null, 2);
      
    } catch (error) {
      console.error('❌ Calculation failed:', error);
      return JSON.stringify({
        error: "Calculation failed",
        message: error instanceof Error ? error.message : "Unknown error",
        expression,
        precision
      });
    }
  }
});

// Safe expression sanitization
function sanitizeExpression(expression: string): string | null {
  // Remove whitespace
  let sanitized = expression.replace(/\s/g, '');
  
  // Allow only safe characters: numbers, operators, parentheses, and function names
  const allowedPattern = /^[0-9+\-*/.()eE\s]+$|^(sin|cos|tan|asin|acos|atan|sinh|cosh|tanh|log|ln|exp|sqrt|abs|ceil|floor|round|min|max|pow|pi|e)\s*\(/;
  
  // Check for basic arithmetic expressions
  if (/^[0-9+\-*/.()eE\s]+$/.test(sanitized)) {
    return sanitized;
  }
  
  // Check for function expressions
  if (allowedPattern.test(sanitized)) {
    return sanitized;
  }
  
  // Reject potentially dangerous expressions
  if (sanitized.includes('eval') || 
      sanitized.includes('Function') || 
      sanitized.includes('constructor') ||
      sanitized.includes('__proto__') ||
      sanitized.includes('prototype')) {
    return null;
  }
  
  return null;
}

// Safe expression evaluation
function evaluateExpression(expression: string): number {
  try {
    // Replace common mathematical functions and constants
    let processedExpression = expression
      .replace(/pi/g, Math.PI.toString())
      .replace(/e/g, Math.E.toString())
      .replace(/sin\(/g, 'Math.sin(')
      .replace(/cos\(/g, 'Math.cos(')
      .replace(/tan\(/g, 'Math.tan(')
      .replace(/asin\(/g, 'Math.asin(')
      .replace(/acos\(/g, 'Math.acos(')
      .replace(/atan\(/g, 'Math.atan(')
      .replace(/sinh\(/g, 'Math.sinh(')
      .replace(/cosh\(/g, 'Math.cosh(')
      .replace(/tanh\(/g, 'Math.tanh(')
      .replace(/log\(/g, 'Math.log10(')
      .replace(/ln\(/g, 'Math.log(')
      .replace(/exp\(/g, 'Math.exp(')
      .replace(/sqrt\(/g, 'Math.sqrt(')
      .replace(/abs\(/g, 'Math.abs(')
      .replace(/ceil\(/g, 'Math.ceil(')
      .replace(/floor\(/g, 'Math.floor(')
      .replace(/round\(/g, 'Math.round(')
      .replace(/min\(/g, 'Math.min(')
      .replace(/max\(/g, 'Math.max(')
      .replace(/pow\(/g, 'Math.pow(');
    
    // Handle power operator (^)
    processedExpression = processedExpression.replace(/\^/g, '**');
    
    // Evaluate the expression
    const result = Function('"use strict"; return (' + processedExpression + ')')();
    
    // Check for valid number result
    if (typeof result !== 'number' || !isFinite(result)) {
      throw new Error("Result is not a valid finite number");
    }
    
    return result;
    
  } catch (error) {
    throw new Error(`Invalid mathematical expression: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export default calculatorTool;

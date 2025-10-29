/**
 * Calculator Tool
 * 
 * Performs mathematical calculations safely
 * Used for dosing, statistics, cost analysis, etc.
 */

import { BaseTool, ToolContext, ToolExecutionResult } from './base-tool';

export class CalculatorTool extends BaseTool {
  readonly name = 'calculator';
  readonly description =
    'Perform mathematical calculations for dosing, statistics, cost analysis, or general math expressions. Returns precise numerical results.';

  getSchema() {
    return {
      type: 'function' as const,
      function: {
        name: this.name,
        description: this.description,
        parameters: {
          type: 'object' as const,
          properties: {
            calculation_type: {
              type: 'string',
              enum: ['dosing', 'statistics', 'cost', 'general'],
              description: 'Type of calculation to perform',
            },
            formula: {
              type: 'string',
              description: 'Mathematical formula or expression (e.g., "2 + 2", "100 * 0.15")',
            },
            parameters: {
              type: 'object',
              description: 'Named parameters for the formula (optional, for complex calculations)',
              additionalProperties: true,
            },
          },
          required: ['calculation_type', 'formula'],
        },
      },
    };
  }

  async execute(
    input: Record<string, any>,
    context: ToolContext
  ): Promise<ToolExecutionResult> {
    const startTime = Date.now();

    try {
      this.validateInput(input);

      const calcType = input.calculation_type;
      const formula = input.formula;
      const params = input.parameters || {};

      console.log(`🧮 [Calculator] Executing ${calcType} calculation: ${formula}`);

      // Safe evaluation of mathematical expressions
      let result: number;

      if (calcType === 'general') {
        // Simple arithmetic: addition, subtraction, multiplication, division
        result = this.evaluateSafeFormula(formula, params);
      } else {
        // Specialized calculations
        result = await this.evaluateSpecialized(calcType, formula, params);
      }

      const duration_ms = Date.now() - startTime;

      return {
        success: true,
        result: {
          calculation_type: calcType,
          formula,
          result,
          parameters: params,
        },
        duration_ms,
      };
    } catch (error) {
      const duration_ms = Date.now() - startTime;
      console.error(`❌ [Calculator] Calculation failed:`, error);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown calculation error',
        duration_ms,
      };
    }
  }

  /**
   * Safely evaluate basic mathematical formulas
   */
  private evaluateSafeFormula(formula: string, params: Record<string, any>): number {
    // Replace parameter placeholders with values
    let expression = formula;
    for (const [key, value] of Object.entries(params)) {
      expression = expression.replace(new RegExp(`\\b${key}\\b`, 'g'), String(value));
    }

    // Remove any whitespace
    expression = expression.replace(/\s/g, '');

    // Validate: only numbers, operators, and parentheses
    if (!/^[0-9+\-*/().\s]+$/.test(expression)) {
      throw new Error('Invalid formula: only basic arithmetic operations allowed');
    }

    // Safe evaluation using Function constructor (safer than eval)
    try {
      // eslint-disable-next-line @typescript-eslint/no-implied-eval
      return Function(`"use strict"; return (${expression})`)();
    } catch (error) {
      throw new Error(`Formula evaluation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Evaluate specialized calculation types
   */
  private async evaluateSpecialized(
    type: string,
    formula: string,
    params: Record<string, any>
  ): Promise<number> {
    switch (type) {
      case 'dosing':
        // Dosing calculations: typically weight-based or fixed dosage
        return this.evaluateSafeFormula(formula, params);

      case 'statistics':
        // Statistical calculations: mean, std dev, etc.
        return this.evaluateSafeFormula(formula, params);

      case 'cost':
        // Cost calculations: pricing, totals, discounts
        return this.evaluateSafeFormula(formula, params);

      default:
        return this.evaluateSafeFormula(formula, params);
    }
  }
}


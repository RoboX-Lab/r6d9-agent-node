/**
 * @file Planner agent implementation
 * @description Agent responsible for creating task plans
 */

import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
} from '@langchain/core/prompts';
import { StructuredOutputParser } from 'langchain/output_parsers';
import { z } from 'zod';
import { createLLM } from '../config/config';
import { TAgentConfig, Plan } from '../types/agent';
import { PLANNER_SYSTEM_PROMPT } from '../prompts/planner-prompt';
import { logger } from '../utils/logger';

/**
 * Schema for plan output
 */
const planSchema = z.object({
  plan: z.array(z.string()).describe('Complete step-by-step plan'),
  next_step: z.string().describe('Next action to execute'),
});

/**
 * Prompt templates for the planner
 */
const systemTemplate = SystemMessagePromptTemplate.fromTemplate(PLANNER_SYSTEM_PROMPT);
const humanTemplate = HumanMessagePromptTemplate.fromTemplate(
  'Objective: {objective}\nOriginal Plan: {original_plan}\nFeedback: {feedback}'
);
const chatPrompt = ChatPromptTemplate.fromMessages([systemTemplate, humanTemplate]);

/**
 * Planner Agent responsible for creating execution plans
 */
export class PlannerAgent {
  private llm: ReturnType<typeof createLLM>;
  private parser: StructuredOutputParser<typeof planSchema>;
  private chain: ReturnType<typeof chatPrompt.pipe>;

  /**
   * Creates a new instance of PlannerAgent
   * @param config - Optional agent configuration
   */
  constructor(config: TAgentConfig = {}) {
    this.parser = StructuredOutputParser.fromZodSchema(planSchema);
    this.llm = createLLM({
      ...config,
      temperature: config.temperature ?? 0.3, // Use a bit higher temperature for planning
    });
    
    this.chain = chatPrompt.pipe(this.llm).pipe(this.parser);
  }

  /**
   * Generate a plan based on an objective
   * @param objective - The objective to plan for
   * @param originalPlan - Optional original plan for refinement
   * @param feedback - Optional feedback on previous plan
   * @returns A structured plan
   */
  async generatePlan(
    objective: string,
    originalPlan: string = '',
    feedback: string = '',
  ): Promise<string[]> {
    try {
      logger.info('Generating plan', { objective });
      
      const response = await this.chain.invoke({
        objective,
        original_plan: originalPlan,
        feedback,
      });

      logger.debug('Generated plan', { plan: (response as any).plan });
      
      return (response as any).plan;
    } catch (error) {
      logger.error('Plan generation failed', error);
      throw new Error(`Plan generation failed: ${(error as Error).message}`);
    }
  }

  /**
   * Direct invocation of the planner
   * @param objective - The objective to plan for
   * @param originalPlan - Optional original plan for refinement
   * @param feedback - Optional feedback on previous plan
   * @returns A structured plan
   */
  async invoke(
    objective: string,
    originalPlan: string = '',
    feedback: string = '',
  ): Promise<Plan> {
    try {
      const response = await this.chain.invoke({
        objective,
        original_plan: originalPlan,
        feedback,
      });
      
      return {
        plan: (response as any).plan,
        next_step: (response as any).next_step,
      };
    } catch (error) {
      logger.error('Planner invocation failed', error);
      throw new Error(`Planner invocation failed: ${(error as Error).message}`);
    }
  }

  /**
   * Run method for compatibility with the agent interface
   * @param objective - The objective to plan for
   * @param originalPlan - Optional original plan for refinement
   * @param feedback - Optional feedback on previous plan
   * @returns A structured plan
   */
  async run(
    objective: string,
    originalPlan: string = '',
    feedback: string = '',
  ): Promise<Plan> {
    return this.invoke(objective, originalPlan, feedback);
  }
}

/**
 * Standalone function to generate a plan
 * @param objective - The objective to plan for
 * @param originalPlan - Optional original plan for refinement
 * @param feedback - Optional feedback on previous plan
 * @returns A structured plan
 */
export async function generatePlan(
  objective: string,
  originalPlan: string = '',
  feedback: string = '',
): Promise<Plan> {
  const planner = new PlannerAgent();
  return planner.invoke(objective, originalPlan, feedback);
}

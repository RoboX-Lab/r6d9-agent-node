/**
 * @file Critique agent implementation
 * @description Agent responsible for evaluating task execution
 */

import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
} from '@langchain/core/prompts';
import { StructuredOutputParser } from 'langchain/output_parsers';
import { z } from 'zod';
import { createLLM } from '../config/config';
import { TAgentConfig, CritiqueResult } from '../types/agent';
import { CRITIQUE_SYSTEM_PROMPT } from '../prompts/critique-prompt';
import { logger } from '../utils/logger';

/**
 * Schema for critique output
 */
const critiqueSchema = z.object({
  success: z.boolean().describe('Whether the step was successful'),
  reason: z.string().describe('Reason for the success/failure evaluation'),
  suggestions: z.array(z.string()).optional().describe('Suggestions for improvement if failed'),
});

/**
 * Prompt templates for the critique agent
 */
const systemTemplate = SystemMessagePromptTemplate.fromTemplate(CRITIQUE_SYSTEM_PROMPT);
const humanTemplate = HumanMessagePromptTemplate.fromTemplate(
  'Objective: {objective}\nCurrent Step: {current_step}\nPage Content: {page_content}'
);
const chatPrompt = ChatPromptTemplate.fromMessages([systemTemplate, humanTemplate]);

/**
 * Critique Agent responsible for evaluating task execution
 */
export class CritiqueAgent {
  private llm: ReturnType<typeof createLLM>;
  private parser: StructuredOutputParser<typeof critiqueSchema>;
  private chain: ReturnType<typeof chatPrompt.pipe>;

  /**
   * Creates a new instance of CritiqueAgent
   * @param config - Optional agent configuration
   */
  constructor(config: TAgentConfig = {}) {
    this.parser = StructuredOutputParser.fromZodSchema(critiqueSchema);
    this.llm = createLLM({
      ...config,
      temperature: config.temperature ?? 0, // Use lower temperature for evaluation
    });
    
    this.chain = chatPrompt.pipe(this.llm).pipe(this.parser);
  }

  /**
   * Evaluate the success of a task step
   * @param objective - The overall objective
   * @param currentStep - The current step being evaluated
   * @param pageContent - The page content after the step execution
   * @returns Evaluation result
   */
  async evaluate(
    objective: string,
    currentStep: string,
    pageContent: string,
  ): Promise<CritiqueResult> {
    try {
      logger.info('Evaluating step', { currentStep });
      
      // Truncate page content if it's too long
      const truncatedContent = pageContent.length > 8000
        ? pageContent.substring(0, 8000) + '... [content truncated]'
        : pageContent;
      
      const response = await this.chain.invoke({
        objective,
        current_step: currentStep,
        page_content: truncatedContent,
      });

      logger.debug('Evaluation result', { 
        success: (response as any).success, 
        reason: (response as any).reason 
      });
      
      return {
        success: (response as any).success,
        reason: (response as any).reason,
        suggestions: (response as any).suggestions,
      };
    } catch (error) {
      logger.error('Evaluation failed', error);
      return {
        success: false,
        reason: `Evaluation failed: ${(error as Error).message}`,
        suggestions: ['Retry the operation', 'Simplify the step', 'Break into smaller steps'],
      };
    }
  }
}

/**
 * Standalone function to evaluate a step
 * @param objective - The overall objective
 * @param currentStep - The current step being evaluated
 * @param pageContent - The page content after the step execution
 * @returns Evaluation result
 */
export async function evaluateStep(
  objective: string,
  currentStep: string,
  pageContent: string,
): Promise<CritiqueResult> {
  const critic = new CritiqueAgent();
  return critic.evaluate(objective, currentStep, pageContent);
}

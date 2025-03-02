/**
 * @file Configuration module for the R6D9 Agent Node
 * @description Centralized configuration settings for the entire application
 */

import dotenv from 'dotenv';
import { ChatOpenAI } from '@langchain/openai';
import { TAgentConfig } from '../types/agent';

// Load environment variables
dotenv.config();

/**
 * Default LLM configuration for agents
 */
export const DEFAULT_LLM_CONFIG: TAgentConfig = {
  modelName: process.env.DEFAULT_MODEL_NAME || 'gpt-4-0125-preview',
  temperature: parseFloat(process.env.DEFAULT_TEMPERATURE || '0'),
  maxTokens: parseInt(process.env.DEFAULT_MAX_TOKENS || '1000', 10),
  maxRetries: parseInt(process.env.DEFAULT_MAX_RETRIES || '3', 10),
};

/**
 * Create an LLM instance with the given configuration
 * @param config - Optional agent configuration to override defaults
 * @returns A configured ChatOpenAI instance
 */
export function createLLM(config: Partial<TAgentConfig> = {}): ChatOpenAI {
  return new ChatOpenAI({
    modelName: config.modelName || DEFAULT_LLM_CONFIG.modelName,
    temperature: config.temperature ?? DEFAULT_LLM_CONFIG.temperature,
    maxTokens: config.maxTokens || DEFAULT_LLM_CONFIG.maxTokens,
    maxRetries: config.maxRetries || DEFAULT_LLM_CONFIG.maxRetries,
  });
}

/**
 * Application configuration
 */
export const APP_CONFIG = {
  checkpointing: {
    enabled: process.env.ENABLE_CHECKPOINTING === 'true',
    threadId: process.env.CHECKPOINT_THREAD_ID || 'r6d9-agent-node',
  },
  debugging: {
    verbose: process.env.VERBOSE_LOGGING === 'true',
    traceTools: process.env.TRACE_TOOLS === 'true',
  },
};

/**
 * @file Main entry point for the R6D9 Agent Core
 * @description Exports all components of the R6D9 Agent system
 */

// Export agents
import { BrowserAgent } from './agents/browser-agent';
import { PlannerAgent } from './agents/planner-agent';
import { CritiqueAgent } from './agents/critique-agent';

// Export workflows
import { Orchestrator, run as runOrchestrator } from './workflows/orchestrator';

// Export tools
import {
  TOOLS,
  TOOLS_BY_CATEGORY,
  ToolCategory,
  getBrowserTools,
  getToolsByCategory,
  getToolByName,
} from './tools';

// Export types
import { PlanExecuteState, type TAgentConfig, type Plan, type CritiqueResult } from './types/agent';
import {
  type ElementSelector,
  type EnterTextEntry,
  type ClickEntry,
  type NavigationParams,
  type KeyCombinationParams,
  type SearchParams,
  type ToolSet,
} from './types/tool';

// Export services
import { browserService } from './services/browser-service';

// Export configuration
import { createLLM, DEFAULT_LLM_CONFIG, APP_CONFIG } from './config/config';

// Export utilities
import { logger, createContextLogger } from './utils/logger';

/**
 * Initialize the core components of the R6D9 Agent system
 * This function must be called before using any other core functionality
 */
export function initializeCore() {
  logger.info('Initializing R6D9 Agent Core');
  
  // Initialize required services and components
  try {
    // Load environment variables
    require('dotenv').config();
    
    // Set up process event handlers
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', { promise, reason });
    });
    
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', { error });
      // Don't exit the process, as this would terminate the agent
    });
    
    logger.info('R6D9 Agent Core initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize R6D9 Agent Core', { error });
    throw error;
  }
}

/**
 * Main agent control function
 * Provides start, stop, pause, and resume functionality
 * @param task - Optional task to run
 * @returns Object with control functions
 */
export function run(task?: string) {
  const browserAgent = new BrowserAgent();
  return browserAgent.run(task);
}

// Exports
export {
  // Agents
  BrowserAgent,
  PlannerAgent,
  CritiqueAgent,
  
  // Workflows
  Orchestrator,
  runOrchestrator,
  
  // Tools
  TOOLS,
  TOOLS_BY_CATEGORY,
  ToolCategory,
  getBrowserTools,
  getToolsByCategory,
  getToolByName,
  
  // Types
  PlanExecuteState,
  
  // Services
  browserService,
  
  // Config
  createLLM,
  DEFAULT_LLM_CONFIG,
  APP_CONFIG,
  
  // Utils
  logger,
  createContextLogger,
};
